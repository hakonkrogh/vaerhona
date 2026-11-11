import React, { useMemo } from 'react';

import SnapshotGraph from '.';
import Chart from './chart';
import { chartPanels, PERIODS, VALUES } from './series';
import { makeHistory } from './story-data';

// The chart on a place page, with made-up values (see story-data.js).

const histories = new Map();

// Made once per kind, since three years of values take a moment to make.
function history(options) {
  const key = JSON.stringify(options);

  if (!histories.has(key)) {
    histories.set(key, makeHistory(options));
  }

  return histories.get(key);
}

function ChartStory({
  period: periodKey,
  values,
  compare,
  loading,
  width,
  history: options,
}) {
  const { records, times } = history(options);
  const period = PERIODS.find(({ key }) => key === periodKey);
  const data = useMemo(
    () =>
      chartPanels({
        records,
        period,
        values: VALUES.filter(({ key }) => values.includes(key)),
        times,
        compare,
      }),
    [records, period, values, times, compare]
  );

  return (
    <div style={{ width }}>
      <Chart
        key={`${period.key} ${compare}`}
        data={data}
        period={period}
        compare={compare}
        loading={loading}
      />
    </div>
  );
}

const meta = {
  title: 'Modules/Snapshots navigator/Graph',
  component: Chart,
  parameters: { layout: 'padded' },
  render: (args) => <ChartStory {...args} />,
  args: {
    period: 'week',
    values: ['temperature', 'humidity', 'wind'],
    compare: false,
    loading: false,
    width: 640,
    history: {},
  },
  argTypes: {
    period: {
      control: 'inline-radio',
      options: PERIODS.map(({ key }) => key),
    },
    values: {
      control: 'inline-check',
      options: VALUES.map(({ key }) => key),
    },
    width: { control: { type: 'range', min: 280, max: 1400, step: 10 } },
    history: { table: { disable: true } },
  },
};

export default meta;

export const Week = {};

export const Month = { args: { period: 'month' } };

export const Year = { args: { period: 'year' } };

export const All = { args: { period: 'all' } };

/** The same days in earlier years, as a grey band behind the line. */
export const CompareYears = { args: { period: 'month', compare: true } };

export const EveryValue = {
  args: { values: VALUES.map(({ key }) => key) },
};

/** The box was off for a day and a half. The line is left open. */
export const WithGap = {
  args: { history: { gaps: [{ from: 4, to: 2.5 }] } },
};

/** A place without yr.no weather has only temperature and humidity. */
export const BoxOnly = {
  args: {
    values: ['temperature', 'humidity'],
    history: { withYr: false },
  },
};

/** A box that has been up for 20 days. */
export const NewPlace = {
  args: { period: 'month', history: { days: 20 } },
};

export const Loading = { args: { loading: true } };

export const Phone = { args: { width: 360 } };

// What SnapshotGraph reads from the store, made from the made-up values.
function fakeStore(records) {
  return {
    history: {
      subscribe: () => () => {},
      getVersion: () => 0,
      getRecords: () => records,
      monthsBetween: () => [],
      load: () => Promise.resolve(),
    },
  };
}

/** The whole chart as the place page shows it, with its buttons. */
export const WithButtons = {
  // The buttons choose the period and values here.
  parameters: { controls: { include: ['width'] } },
  render: function Render({ width, history: options }) {
    const { records, times } = history(options);
    const store = useMemo(() => fakeStore(records), [records]);
    const iso = (time) => new Date(time).toISOString();

    return (
      <div style={{ width }}>
        <SnapshotGraph
          store={store}
          place={{
            firstSnapshot: { date: iso(times.first) },
            lastSnapshot: {
              date: iso(times.latest),
              yrWeather: options.withYr === false ? null : {},
            },
          }}
          currentSnapshot={{ date: iso(times.current) }}
          compare={false}
        />
      </div>
    );
  },
};
