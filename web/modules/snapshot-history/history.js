// The values of every snapshot of one place, as far as the browser has them.
// It reads the local database first and the server for what is missing, and
// can fill in the whole history of the place in the background ("backfill").
// See docs/client-storage-design.md.
//
// It holds only snapshots at or before the latest snapshot the page got from
// the server. Those can never change (SPEC.md, "What may be cached"). It never
// decides what the latest snapshot is.

import {
  addMonths,
  concatColumns,
  fromColumns,
  monthEnd,
  monthOf,
  monthStart,
  pickColumns,
  snapshotValuesUrl,
  VALUES_VERSION,
} from 'core/snapshot-values';

// Background requests at a time. Few, so a tap on an arrow is not stuck
// behind them.
const BACKFILL_PARALLEL = 2;

// The backfill gives up on a month after this many failures, and stops after
// this many failures in a row, for example with no network.
const MAX_MONTH_FAILURES = 2;
const MAX_FAILURES_IN_A_ROW = 3;

// Requests for one month. More than one is needed only when the server's row
// limit cut the answer.
const MAX_PARTS = 5;

// A place that has not been opened for this long is removed.
const KEEP_PLACE_FOR = 365 * 24 * 60 * 60 * 1000;

const monthNumber = (month) => {
  const [year, number] = month.split('-').map(Number);

  return year * 12 + number;
};

/**
 * The months to load in the background, most important first: the month the
 * user looks at, the newest month, and then outwards from both.
 *
 * @param {object} options
 * @param {string} options.first the month of the place's first snapshot
 * @param {string} options.latest the month of its latest snapshot
 * @param {string} options.focus the month of the snapshot on screen
 * @param {(month: string) => boolean} [options.skip] true for a month that
 * needs no loading
 */
export function backfillOrder({ first, latest, focus, skip = () => false }) {
  const months = [];

  for (let month = latest; month >= first; month = addMonths(month, -1)) {
    if (!skip(month)) {
      months.push(month);
    }
  }

  const distance = (month, other) =>
    Math.abs(monthNumber(month) - monthNumber(other));
  const rank = (month) =>
    Math.min(distance(month, focus), distance(month, latest));

  return months.sort(
    (a, b) =>
      rank(a) - rank(b) ||
      distance(a, focus) - distance(b, focus) ||
      monthNumber(b) - monthNumber(a)
  );
}

export async function fetchValues(url) {
  const response = await fetch(url);

  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }

  // Only values the server calls final may be kept. Others could still get a
  // snapshot (see services/snapshot-values.js).
  if (!(response.headers.get('cache-control') ?? '').includes('immutable')) {
    throw new Error('Values are not final');
  }

  return response.json();
}

/**
 * @param {object} options
 * @param {object} options.place with name, firstSnapshot and lastSnapshot
 * @param {object} options.db from month-db.js
 * @param {(url: string) => Promise<object>} [options.fetchJson]
 * @param {object} [options.locks] the browser's navigator.locks, so only one
 * tab runs the backfill
 * @param {() => number} [options.now]
 */
export function createHistory({
  place,
  db,
  fetchJson = fetchValues,
  locks,
  now = Date.now,
}) {
  const latest = new Date(place.lastSnapshot.date).getTime();
  const latestMonth = monthOf(latest);
  const firstMonth = place.firstSnapshot
    ? monthOf(new Date(place.firstSnapshot.date).getTime())
    : latestMonth;

  // Month to record, for the months that have been read or loaded.
  const records = new Map();
  // Month to snapshots, made from a record when someone asks for them.
  const decoded = new Map();
  // Month to the promise of its load, so no month loads twice at once.
  const loading = new Map();
  const listeners = new Set();
  let version = 0;
  let ready;

  // Backfill state.
  let focusMonth = latestMonth;
  let started = false;
  let paused = false;
  let running = 0;
  let failuresInARow = 0;
  let releaseLock;
  // Counts starts and stops, so a start that waits for the lock can see that
  // it was stopped in the meantime.
  let backfillRun = 0;
  let waitingForLock = false;
  const failures = new Map();

  function changed() {
    version++;
    listeners.forEach((listener) => listener());
  }

  // The time a month must be complete up to. The newest month ends at the
  // latest snapshot, not at the end of the month.
  const wantedTo = (month) => Math.min(monthEnd(month), latest);

  const inHistory = (month) => month >= firstMonth && month <= latestMonth;

  function isComplete(month) {
    const record = records.get(month);

    return Boolean(record) && record.coveredTo >= wantedTo(month);
  }

  function setRecord(record) {
    records.set(record.month, record);
    decoded.delete(record.month);
  }

  async function removeOldPlaces() {
    for (const meta of await db.listMeta()) {
      if (meta.place !== place.name && now() - meta.usedAt > KEEP_PLACE_FOR) {
        await db.clearPlace(meta.place);
      }
    }
  }

  async function init() {
    const meta = await db.getMeta(place.name);

    if (meta && meta.v !== VALUES_VERSION) {
      await db.clearPlace(place.name);
    }

    await db.putMeta({ place: place.name, v: VALUES_VERSION, usedAt: now() });

    for (const record of await db.list(place.name)) {
      if (!records.has(record.month)) {
        setRecord(record);
      }
    }

    changed();
    removeOldPlaces();
  }

  /** Reads what the local database has. Safe to call many times. */
  function open() {
    ready ??= init();

    return ready;
  }

  async function loadMonth(month) {
    await open();

    let record = records.get(month);

    // Another tab may have stored the month since this one read the database.
    const stored = await db.get(place.name, month);

    if (stored && (!record || stored.coveredTo > record.coveredTo)) {
      record = stored;
      setRecord(record);
    }

    const to = wantedTo(month);

    for (let part = 0; part < MAX_PARTS && !isComplete(month); part++) {
      // A month stored on an earlier visit is complete up to the latest
      // snapshot of that time. Only the part after it is asked for.
      const from = record ? record.coveredTo + 1 : monthStart(month);
      let answer;

      try {
        answer = await fetchJson(
          snapshotValuesUrl({ place: place.name, from, to })
        );
      } catch (err) {
        if (err.status === 404) {
          // The place is gone or renamed.
          records.clear();
          decoded.clear();
          await db.clearPlace(place.name);
          changed();
        }
        throw err;
      }

      const coveredTo = new Date(answer.to).getTime();

      if (answer.v !== VALUES_VERSION || !(coveredTo >= from)) {
        throw new Error('Unexpected values answer');
      }

      const columns = pickColumns(answer);

      record = {
        place: place.name,
        month,
        coveredTo,
        imageBase: answer.imageBase,
        columns: record ? concatColumns(record.columns, columns) : columns,
      };
      setRecord(record);
      await db.put(record);
    }

    if (!isComplete(month)) {
      throw new Error(`Could not load all of ${month}`);
    }

    changed();

    return record;
  }

  /**
   * Makes a month complete, from the local database or the server.
   *
   * @returns {Promise<void>} rejects if the month could not be loaded
   */
  function load(month) {
    if (!inHistory(month) || isComplete(month)) {
      return Promise.resolve();
    }

    if (!loading.has(month)) {
      loading.set(
        month,
        loadMonth(month)
          .then(() => {})
          .finally(() => loading.delete(month))
      );
    }

    return loading.get(month);
  }

  function nextBackfillMonth() {
    return backfillOrder({
      first: firstMonth,
      latest: latestMonth,
      focus: focusMonth,
      skip: (month) =>
        isComplete(month) ||
        loading.has(month) ||
        (failures.get(month) ?? 0) >= MAX_MONTH_FAILURES,
    })[0];
  }

  function pump() {
    while (
      started &&
      !paused &&
      running < BACKFILL_PARALLEL &&
      failuresInARow < MAX_FAILURES_IN_A_ROW
    ) {
      const month = nextBackfillMonth();

      if (!month) {
        return;
      }

      running++;
      load(month)
        .then(
          () => {
            failuresInARow = 0;
          },
          () => {
            failuresInARow++;
            failures.set(month, (failures.get(month) ?? 0) + 1);
          }
        )
        .finally(() => {
          running--;
          pump();
        });
    }
  }

  return {
    open,
    load,
    isComplete,

    /** The months that hold the time from `from` to `to`, oldest first. */
    monthsBetween(from, to) {
      const months = [];
      const last = monthOf(Math.min(to, latest));

      for (
        let month = monthOf(from) < firstMonth ? firstMonth : monthOf(from);
        month <= last;
        month = addMonths(month, 1)
      ) {
        months.push(month);
      }

      return months;
    },

    /**
     * The snapshots of a month, oldest first, in the same shape as the
     * snapshot list API gives, or null if the month is not complete.
     */
    getSnapshots(month) {
      if (!isComplete(month)) {
        return null;
      }

      if (!decoded.has(month)) {
        const record = records.get(month);

        decoded.set(
          month,
          // Never anything after the latest snapshot of the page (rule P4).
          fromColumns(record.columns, record.imageBase).filter(
            (snapshot) => new Date(snapshot.date).getTime() <= latest
          )
        );
      }

      return decoded.get(month);
    },

    /** The time a complete month covers, in milliseconds. */
    getCoverage(month) {
      return { from: monthStart(month), to: wantedTo(month) };
    },

    /**
     * The columns of every month that is read or loaded, oldest first. A
     * month that is not complete is included with what it has. For charts.
     */
    getRecords() {
      return [...records.values()].sort((a, b) => (a.month < b.month ? -1 : 1));
    },

    /** How far the local copy has come: months complete, and months in all. */
    getProgress() {
      const total = monthNumber(latestMonth) - monthNumber(firstMonth) + 1;
      let complete = 0;

      for (const month of records.keys()) {
        if (inHistory(month) && isComplete(month)) {
          complete++;
        }
      }

      return { complete, total };
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    /** Changes every time a month is read or loaded. */
    getVersion: () => version,

    /** The backfill works outwards from this time and from now. */
    setFocus(time) {
      focusMonth = monthOf(
        Math.min(Math.max(time, monthStart(firstMonth)), latest)
      );
    },

    /** Starts filling in the whole history, unless another tab already is. */
    startBackfill() {
      if (started || waitingForLock) {
        return;
      }

      const thisRun = ++backfillRun;
      const run = () => {
        started = true;
        failuresInARow = 0;
        pump();
      };

      if (!locks) {
        run();
        return;
      }

      waitingForLock = true;

      locks
        .request(
          `vaerhona-backfill:${place.name}`,
          { ifAvailable: true },
          (lock) => {
            if (thisRun === backfillRun) {
              waitingForLock = false;
            }

            if (!lock || thisRun !== backfillRun) {
              return undefined;
            }

            run();

            // The lock is held until this resolves.
            return new Promise((resolve) => {
              releaseLock = resolve;
            });
          }
        )
        .catch(() => {
          if (thisRun === backfillRun) {
            waitingForLock = false;
            run();
          }
        });
    },

    /** Pauses the backfill, for example while the page is hidden. */
    setPaused(value) {
      paused = value;

      if (!paused) {
        failuresInARow = 0;
        pump();
      }
    },

    stopBackfill() {
      backfillRun++;
      waitingForLock = false;
      started = false;
      releaseLock?.();
      releaseLock = undefined;
    },
  };
}
