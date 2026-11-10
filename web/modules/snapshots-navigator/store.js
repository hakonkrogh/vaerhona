import { snapshotListUrl, WEEK_OF_SNAPSHOTS } from 'core/snapshot-list';

import { addList, createTimeline } from './timeline';

// The server allows up to 500. A window of six days has about 150.
const WINDOW_LIMIT = 500;

/**
 * The first list the page needs: the week up to the latest snapshot. The page
 * starts loading it with the HTML, before the scripts run.
 */
export function initialListUrl(place) {
  return snapshotListUrl({
    place: place.name,
    to: place.lastSnapshot.date,
    limit: WEEK_OF_SNAPSHOTS,
  });
}

/**
 * Every list ends at or before the latest snapshot the page has. Nobody can
 * browse past it (rule P4), and it makes every list final, so the browser and
 * the Worker can keep it (see services/snapshot-list.js).
 *
 * @returns {string|null} null if there is nothing to load
 */
function listUrl(place, { from, to }) {
  const latest = new Date(place.lastSnapshot.date).getTime();

  if (from == null) {
    return snapshotListUrl({
      place: place.name,
      to: Math.min(to, latest),
      limit: WEEK_OF_SNAPSHOTS,
    });
  }

  if (from >= latest) {
    return null;
  }

  return snapshotListUrl({
    place: place.name,
    from,
    to: Math.min(to ?? latest, latest),
    limit: to == null ? WEEK_OF_SNAPSHOTS : WINDOW_LIMIT,
  });
}

const WEEK = 7 * 24 * 60 * 60 * 1000;

const iso = (time) => new Date(time).toISOString();

/**
 * The same part of time from the history (modules/snapshot-history), which
 * reads the browser's local database before the server. It loads whole
 * months, so it gives more than the part asks for.
 *
 * @returns {Promise<object[]|null>} lists as the snapshot list API gives
 * them, or null if the list API must be asked
 */
async function loadFromHistory(history, part) {
  const months = history.monthsBetween(
    part.from ?? part.to - WEEK,
    part.to ?? part.from + WEEK
  );

  if (!months.length) {
    return null;
  }

  await Promise.all(months.map((month) => history.load(month)));

  const lists = months.map((month) => {
    const { from, to } = history.getCoverage(month);

    return {
      from: iso(from),
      to: iso(to),
      snapshots: history.getSnapshots(month),
    };
  });

  // An open part asks for the snapshots before or after a time, however far
  // away they are. If the box was off, these months have none, and the list
  // API finds the next ones in one request.
  const times = lists.flatMap((list) =>
    list.snapshots.map((snapshot) => new Date(snapshot.date).getTime())
  );
  const found =
    part.from == null
      ? times.some((time) => time < part.to)
      : part.to != null || times.some((time) => time > part.from);

  return found ? lists : null;
}

async function fetchList(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Holds the snapshots of one place that the page has loaded. React reads it
 * with useSyncExternalStore.
 *
 * @param {object} place
 * @param {object} [history] from modules/snapshot-history. With it, every
 * list but the first comes from the browser's local database when it is
 * there.
 */
export function createSnapshotStore(place, history) {
  let timeline = createTimeline(place);
  // The page starts loading this one with the HTML, so it comes from the list
  // API as before.
  const initialUrl = initialListUrl(place);

  async function loadLists(part, url) {
    if (history && url !== initialUrl) {
      try {
        const lists = await loadFromHistory(history, part);

        if (lists) {
          return lists;
        }
      } catch (err) {
        console.warn('[snapshots] history failed, asking for a list', err);
      }
    }

    return [await fetchList(url)];
  }

  const listeners = new Set();
  // Requests by URL, so the same list is never asked for twice at once.
  const requests = new Map();

  return {
    history,

    getTimeline: () => timeline,

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    /**
     * @param {{ from?: number, to?: number }} part what timeline.js asked for
     * @returns {Promise<void>} never rejects. A failed list is left out, and
     * the next call tries again.
     */
    load(part) {
      const url = listUrl(place, part);

      if (!url) {
        return Promise.resolve();
      }

      if (!requests.has(url)) {
        const request = loadLists(part, url).then(
          (lists) => {
            timeline = lists.reduce(addList, timeline);
            listeners.forEach((listener) => listener());
          },
          (err) => {
            requests.delete(url);
            console.error(`[snapshots] ${url} failed`, err);
          }
        );

        requests.set(url, request);
      }

      return requests.get(url);
    },
  };
}

// Rounds of loading before a search takes what it has. Two are enough to
// cross a gap: the days around a date, then the weeks on each side of them.
const MAX_ROUNDS = 3;

/**
 * Loads what `findTarget` asks for until it finds its snapshot.
 *
 * @param {object} store
 * @param {(timeline: object, settle: boolean) => object} findTarget a target
 * from timeline.js. settle is true in the last round.
 * @param {() => boolean} [isStale] true stops the search
 * @returns {Promise<object|undefined>} the snapshot, or undefined if there is
 * none, it could not be loaded, or the search was stopped
 */
export async function findSnapshot(store, findTarget, isStale = () => false) {
  let target = findTarget(store.getTimeline(), false);

  for (let round = 1; target.load && round <= MAX_ROUNDS; round++) {
    await Promise.all(target.load.map((part) => store.load(part)));

    if (isStale()) {
      return undefined;
    }

    target = findTarget(store.getTimeline(), round === MAX_ROUNDS);
  }

  return target.snapshot;
}
