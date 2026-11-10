import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSyncExternalStore } from 'react';

import { prettyDate, prettyDateTime, prettyYearMonth } from 'core/date';
import { Spinner } from 'ui';

import Icon from '../icon';
import styles from './graph.module.css';
import { chartLines, earlierYears, PERIODS, PROPERTIES } from './series';

// Chart.js is only loaded in the browser, and only when a graph is shown.
// Only the parts a line chart needs are registered, to keep the download small.
let chartPromise;
function loadChartJs() {
  if (!chartPromise) {
    chartPromise = import('chart.js').then(
      ({
        Chart,
        LineController,
        LineElement,
        PointElement,
        LinearScale,
        Filler,
        Legend,
        Tooltip,
      }) => {
        Chart.register(
          LineController,
          LineElement,
          PointElement,
          LinearScale,
          Filler,
          Legend,
          Tooltip
        );
        return Chart;
      }
    );
  }
  return chartPromise;
}

// The period on screen, and the band from the lowest to the highest value of
// each day.
const MAIN_COLOR = '#2f6fd6';
const BAND_COLOR = 'rgba(47, 111, 214, 0.16)';
// Earlier years, the newest first. Older years are lighter. After the last
// colour, the rest share it.
const EARLIER_COLORS = ['#3d7f63', '#6fa58b', '#9cc2ae', '#bfd6ca'];

const TEXT_COLOR = '#444';
const GRID_COLOR = 'rgba(0, 0, 0, 0.08)';

// Months that load at a time when the chart needs them.
const LOAD_PARALLEL = 3;

const time = (snapshot) => new Date(snapshot.date).getTime();

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

function toDatasets({ lines }, period) {
  const [main, ...earlier] = lines;
  const line = (points, color, options) => ({
    data: points,
    borderColor: color,
    backgroundColor: color,
    borderWidth: 2,
    pointRadius: 0,
    pointHitRadius: 12,
    pointHoverRadius: 4,
    tension: 0.3,
    // A long gap, when the box was off, is not drawn as a line.
    spanGaps: (period.daily ? 3 : 0.5) * 24 * 60 * 60 * 1000,
    ...options,
  });

  const datasets = [
    line(main.points, MAIN_COLOR, {
      label: String(main.year),
      from: main.from,
    }),
    ...earlier.map(({ points, year, from }, i) =>
      line(points, EARLIER_COLORS[Math.min(i, EARLIER_COLORS.length - 1)], {
        label: String(year),
        from,
        borderWidth: 1.5,
      })
    ),
  ];

  // The band is drawn only for the period itself. One for every year would
  // hide the lines.
  if (period.daily && !earlier.length) {
    const edge = (key) =>
      line(
        main.points.map((point) => ({ x: point.x, y: point[key] })),
        'transparent',
        { band: true, borderWidth: 0, pointHitRadius: 0, pointHoverRadius: 0 }
      );

    datasets.push(edge('min'), {
      ...edge('max'),
      backgroundColor: BAND_COLOR,
      // Fills down to the dataset before it, the lowest values.
      fill: '-1',
    });
  }

  return datasets;
}

function chartOptions({ range, period, property, hasLegend }) {
  const dateAt = (from, x) => new Date(from + x);

  return {
    maintainAspectRatio: false,
    animation: false,
    parsing: false,
    normalized: true,
    interaction: { mode: 'nearest', axis: 'x', intersect: false },
    scales: {
      x: {
        type: 'linear',
        min: 0,
        max: range.to - range.from,
        grid: { display: false },
        ticks: {
          color: TEXT_COLOR,
          maxTicksLimit: 5,
          maxRotation: 0,
          callback: (x) =>
            period.daily
              ? prettyYearMonth(dateAt(range.from, x))
              : prettyDate(dateAt(range.from, x), { year: false }),
        },
      },
      y: {
        grid: { color: GRID_COLOR },
        border: { display: false },
        ticks: {
          color: TEXT_COLOR,
          maxTicksLimit: 6,
          callback: (y) => `${y} ${property.unit}`,
        },
      },
    },
    plugins: {
      legend: {
        display: hasLegend,
        position: 'bottom',
        labels: {
          color: TEXT_COLOR,
          boxWidth: 16,
          boxHeight: 2,
          filter: (item, data) => !data.datasets[item.datasetIndex].band,
        },
      },
      tooltip: {
        filter: (item) => !item.dataset.band,
        callbacks: {
          title: ([item]) => {
            if (!item) {
              return '';
            }

            const date = dateAt(item.dataset.from, item.raw.x);

            return period.daily ? prettyDate(date) : prettyDateTime(date);
          },
          label: ({ raw }) =>
            raw.min == null || raw.min === raw.max
              ? `${raw.y} ${property.unit}`
              : `${raw.y} ${property.unit} (${raw.min} til ${raw.max})`,
        },
      },
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
  const canvas = useRef(null);
  const chart = useRef(null);
  const [period, setPeriod] = useState(PERIODS[0]);
  const [property, setProperty] = useState(PROPERTIES[0]);
  // What the months were last loaded for. The spinner shows until it is the
  // same as what is on screen.
  const [loadedFor, setLoadedFor] = useState(null);
  const version = useSyncExternalStore(
    history.subscribe,
    history.getVersion,
    history.getVersion
  );

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
      chartLines({
        records: history.getRecords(),
        period,
        property,
        times: { current, first, latest },
        compare,
      }),
    // `version` changes when the history has more to give.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [history, version, period, property, compare, current, first, latest]
  );

  useEffect(() => {
    let active = true;

    loadChartJs().then((Chart) => {
      // The graph can be closed while Chart.js loads.
      if (!active || !canvas.current) {
        return;
      }

      const datasets = toDatasets(data, period);
      const options = chartOptions({
        range: data.range,
        period,
        property,
        hasLegend: data.lines.length > 1,
      });

      if (chart.current) {
        chart.current.data.datasets = datasets;
        chart.current.options = options;
        chart.current.update();
      } else {
        chart.current = new Chart(canvas.current, {
          type: 'line',
          data: { datasets },
          options,
        });
      }
    });

    return () => {
      active = false;
    };
  }, [data, period, property]);

  useEffect(
    () => () => {
      chart.current?.destroy();
      chart.current = null;
    },
    []
  );

  const isEmpty = data.lines.every((line) => !line.points.length);

  return (
    <div className={styles.outer}>
      <div className={styles.periods} role="group" aria-label="Periode">
        {PERIODS.map((option) => (
          <button
            key={option.key}
            type="button"
            className={styles.period}
            aria-pressed={option === period}
            onClick={() => setPeriod(option)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className={styles.inner}>
        <canvas
          className={styles.canvas}
          ref={canvas}
          role="img"
          aria-label={`${property.label}, ${period.label.toLowerCase()}`}
        />
        {loading && (
          <div className={styles.status}>
            <Spinner size="20px" />
          </div>
        )}
        {!loading && isEmpty && (
          <div className={styles.empty}>Ingen målinger i perioden</div>
        )}
      </div>
      <div className={styles.propChooser}>
        {PROPERTIES.map((option) => (
          <Icon
            selected={property === option}
            key={option.key}
            type={option.icon}
            label={option.label}
            onClick={() => setProperty(option)}
          />
        ))}
      </div>
    </div>
  );
}
