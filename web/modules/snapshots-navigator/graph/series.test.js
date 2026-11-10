import { describe, expect, it } from 'vitest';

import {
  chartLines,
  dailyPoints,
  earlierYears,
  periodRange,
  PERIODS,
  pointsInRange,
  PROPERTIES,
} from './series';

const [week, , year, all] = PERIODS;
const [temperature, humidity] = PROPERTIES;
const DAY = 24 * 60 * 60 * 1000;
const time = (iso) => new Date(iso).getTime();

const times = {
  current: time('2026-11-09T12:00:00.000Z'),
  first: time('2024-03-01T00:00:00.000Z'),
  latest: time('2026-11-10T12:00:00.000Z'),
};

function record(month, rows, yr = null) {
  return {
    month,
    columns: {
      time: rows.map(([iso]) => time(iso)),
      temperature: rows.map(([, value]) => value),
      humidity: rows.map(() => 50),
      yr,
    },
  };
}

describe('periodRange', () => {
  it('ends at the snapshot on screen', () => {
    expect(periodRange(week, times)).toEqual({
      from: times.current - 7 * DAY,
      to: times.current,
    });
  });

  it('covers the whole history for "all"', () => {
    expect(periodRange(all, times)).toEqual({
      from: times.first,
      to: times.latest,
    });
  });
});

describe('earlierYears', () => {
  it('gives the same range in each earlier year with snapshots', () => {
    const range = periodRange(week, times);

    expect(
      earlierYears(range, times.first).map((r) => new Date(r.to).toISOString())
    ).toEqual(['2025-11-09T12:00:00.000Z', '2024-11-09T12:00:00.000Z']);
  });

  it('gives nothing in the first year', () => {
    expect(
      earlierYears(periodRange(week, times), time('2026-01-01T00:00:00Z'))
    ).toEqual([]);
  });
});

describe('pointsInRange', () => {
  const records = [
    record('2026-10', [['2026-10-31T23:00:00.000Z', 1]]),
    record('2026-11', [
      ['2026-11-01T00:00:00.000Z', 2],
      ['2026-11-01T01:00:00.000Z', null],
      ['2026-11-02T00:00:00.000Z', 4],
    ]),
  ];

  it('takes the snapshots in the range, across months, by time from its start', () => {
    const from = time('2026-10-31T22:00:00.000Z');

    expect(
      pointsInRange(
        records,
        { from, to: time('2026-11-01T12:00:00.000Z') },
        temperature
      )
    ).toEqual([
      { x: 60 * 60 * 1000, y: 1 },
      { x: 2 * 60 * 60 * 1000, y: 2 },
    ]);
  });

  it('uses the yr.no humidity when there is one', () => {
    const withYr = record(
      '2026-11',
      [
        ['2026-11-01T00:00:00.000Z', 2],
        ['2026-11-01T01:00:00.000Z', 2],
      ],
      { relativeHumidity: [80, null] }
    );

    expect(
      pointsInRange([withYr], { from: 0, to: Infinity }, humidity).map(
        (p) => p.y
      )
    ).toEqual([80, 50]);
  });
});

describe('dailyPoints', () => {
  it('gives the mean, lowest and highest value of each day', () => {
    const from = time('2026-11-01T00:00:00.000Z');
    const at = (iso, y) => ({ x: time(iso) - from, y });

    expect(
      dailyPoints(
        [
          at('2026-11-01T06:00:00.000Z', 1),
          at('2026-11-01T12:00:00.000Z', 4),
          // After midnight in Norway, so the next day.
          at('2026-11-01T23:30:00.000Z', 10),
        ],
        from
      )
    ).toEqual([
      { x: time('2026-11-01T11:00:00.000Z') - from, y: 2.5, min: 1, max: 4 },
      { x: time('2026-11-02T11:00:00.000Z') - from, y: 10, min: 10, max: 10 },
    ]);
  });
});

describe('chartLines', () => {
  const records = [
    record('2025-11', [['2025-11-08T12:00:00.000Z', -3]]),
    record('2026-11', [['2026-11-08T12:00:00.000Z', 5]]),
  ];

  it('draws one line for the period', () => {
    const { lines } = chartLines({
      records,
      period: week,
      property: temperature,
      times,
    });

    expect(lines).toHaveLength(1);
    expect(lines[0].year).toBe(2026);
    expect(lines[0].points).toEqual([{ x: 6 * DAY, y: 5 }]);
  });

  it('draws the earlier years on the same days when comparing', () => {
    const { lines } = chartLines({
      records,
      period: week,
      property: temperature,
      times,
      compare: true,
    });

    expect(lines.map((line) => line.year)).toEqual([2026, 2025, 2024]);
    expect(lines[1].points).toEqual([{ x: 6 * DAY, y: -3 }]);
    expect(lines[2].points).toEqual([]);
  });

  it('gives one point per day for a long period', () => {
    const { lines } = chartLines({
      records: [
        record('2025-11', [['2025-11-20T12:00:00.000Z', -3]]),
        ...records.slice(1),
      ],
      period: year,
      property: temperature,
      times,
    });

    expect(lines[0].points).toHaveLength(2);
    expect(lines[0].points[0]).toMatchObject({ y: -3, min: -3, max: -3 });
  });

  it('does not compare the whole history with itself', () => {
    const { lines } = chartLines({
      records,
      period: all,
      property: temperature,
      times,
      compare: true,
    });

    expect(lines).toHaveLength(1);
  });
});
