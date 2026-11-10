import React, { useEffect, useMemo, useState } from 'react';
import { useSyncExternalStore } from 'react';

import styles from './graph.module.css';
import Chart, { COLORS } from './chart';
import { chartPanels, earlierYears, PERIODS, VALUES } from './series';

// The panels shown the first time. The choice is kept in the browser.
const DEFAULT_VALUES = ['temperature', 'humidity', 'wind'];
const STORAGE_KEY = 'graph-values';

// Months that load at a time when the chart needs them.
const LOAD_PARALLEL = 3;

const time = (snapshot) => new Date(snapshot.date).getTime();

function readChoice() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (Array.isArray(saved) && saved.length) {
      return saved;
    }
  } catch {
    // Storage can be blocked, for example in a private window.
  }

  return DEFAULT_VALUES;
}

function saveChoice(keys) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  } catch {
    // The choice is then only kept while the chart is open.
  }
}

/**
 * Loads months in order, a few at a time.
 *
 * @returns {{ done: Promise<void>, stop: () => void }} done: when every month
 * has loaded or failed. stop: leaves the rest.
 */
function loadMonths(history, months) {
  const queue = [...months];
  let stopped = false;

  async function work() {
    while (!stopped && queue.length) {
      // A month that fails is left out. The chart draws what it has.
      await history.load(queue.shift()).catch(() => {});
    }
  }

  return {
    done: Promise.all(Array.from({ length: LOAD_PARALLEL }, work)).then(
      () => {}
    ),
    stop() {
      stopped = true;
    },
  };
}

/**
 * A chart of the values around the snapshot on screen. It reads the browser's
 * local database through the history (modules/snapshot-history), and draws
 * what is there while the rest loads.
 */
export default function SnapshotGraph({
  store,
  place,
  currentSnapshot,
  compare,
}) {
  const { history } = store;
  const [period, setPeriod] = useState(PERIODS[0]);
  const [choice, setChoice] = useState(readChoice);
  // What the months were last loaded for. The spinner shows until it is the
  // same as what is on screen.
  const [loadedFor, setLoadedFor] = useState(null);
  const version = useSyncExternalStore(
    history.subscribe,
    history.getVersion,
    history.getVersion
  );

  // A place without yr.no weather has only the values its box measures.
  const hasYr = Boolean(place.lastSnapshot?.yrWeather);
  const available = useMemo(
    () => VALUES.filter((value) => hasYr || !value.yr),
    [hasYr]
  );
  const values = useMemo(() => {
    const chosen = available.filter((value) => choice.includes(value.key));

    return chosen.length ? chosen : available.slice(0, 1);
  }, [available, choice]);

  const current = time(currentSnapshot);
  const first = place.firstSnapshot ? time(place.firstSnapshot) : current;
  const latest = time(place.lastSnapshot);

  const loadKey = `${period.key} ${compare} ${current}`;
  const loading = loadedFor !== loadKey;

  // Loads the months the chart needs: the period first, then the same period
  // in earlier years.
  useEffect(() => {
    const range = period.days
      ? { from: current - period.days * 24 * 60 * 60 * 1000, to: current }
      : { from: first, to: latest };
    const ranges =
      compare && period.days ? [range, ...earlierYears(range, first)] : [range];
    // Newest first, so the chart fills in from the snapshot on screen.
    const months = ranges.flatMap(({ from, to }) =>
      history.monthsBetween(from, to).reverse()
    );
    let active = true;

    const { done, stop } = loadMonths(history, months);

    // Shows the spinner until every month has loaded or failed.
    done.then(() => {
      if (active) {
        setLoadedFor(loadKey);
      }
    });

    return () => {
      active = false;
      stop();
    };
  }, [history, period, compare, current, first, latest, loadKey]);

  const data = useMemo(
    () =>
      chartPanels({
        records: history.getRecords(),
        period,
        values,
        times: { current, first, latest },
        compare,
      }),
    // `version` changes when the history has more to give.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [history, version, period, values, compare, current, first, latest]
  );

  const shownKeys = new Set(values.map(({ key }) => key));

  function toggle({ key }) {
    // At least one value is always shown.
    if (shownKeys.has(key) && shownKeys.size === 1) {
      return;
    }

    // In the order of VALUES, so the panels keep their places.
    const keys = available
      .map((value) => value.key)
      .filter((other) => (other === key) !== shownKeys.has(other));

    setChoice(keys);
    saveChoice(keys);
  }

  return (
    <div className={styles.outer}>
      <div className={styles.periods} role="group" aria-label="Periode">
        {PERIODS.map((option) => (
          <button
            key={option.key}
            type="button"
            className={styles.period}
            aria-pressed={option.key === period.key}
            onClick={() => setPeriod(option)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className={styles.choices} role="group" aria-label="Verdier">
        {available.map((value) => (
          <button
            key={value.key}
            type="button"
            className={styles.choice}
            aria-pressed={shownKeys.has(value.key)}
            onClick={() => toggle(value)}
          >
            <span
              className={styles.dot}
              style={{ background: COLORS[value.key] ?? COLORS.warm }}
            />
            {value.label}
          </button>
        ))}
      </div>
      <Chart
        // A new period or compare starts without a chosen time.
        key={`${period.key} ${compare}`}
        data={data}
        period={period}
        compare={compare}
        loading={loading}
      />
    </div>
  );
}
