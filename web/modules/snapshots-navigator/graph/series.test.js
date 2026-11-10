import { describe, expect, it } from 'vitest';

import {
  chartPanels,
  dailyPoints,
  earlierYears,
  periodRange,
  PERIODS,
  pointsInRange,
  VALUES,
  yearBand,
} from './series';

const [week, , year, all] = PERIODS;
const [temperature, humidity, wind, pressure] = VALUES;
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

  it('uses only the yr.no humidity in a month with yr.no weather', () => {
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
    ).toEqual([80]);
  });

  it('uses the humidity of the box in a month without yr.no weather', () => {
    expect(
      pointsInRange(
        [record('2026-11', [['2026-11-01T00:00:00.000Z', 2]])],
        { from: 0, to: Infinity },
        humidity
      ).map((p) => p.y)
    ).toEqual([50]);
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

describe('values', () => {
  it('leaves out the broken temperatures of old boxes', () => {
    const broken = record('2026-11', [
      ['2026-11-01T00:00:00.000Z', 3273.7],
      ['2026-11-01T01:00:00.000Z', 2],
    ]);

    expect(
      pointsInRange([broken], { from: 0, to: Infinity }, temperature).map(
        (p) => p.y
      )
    ).toEqual([2]);
  });

  it('gives the wind with the direction it comes from', () => {
    const withYr = record('2026-11', [['2026-11-01T00:00:00.000Z', 2]], {
      windSpeed: [3.5],
      windFromDirection: [250],
    });

    expect(pointsInRange([withYr], { from: 0, to: Infinity }, wind)).toEqual([
      { x: time('2026-11-01T00:00:00.000Z'), y: 3.5, dir: 250 },
    ]);
  });

  it('has no yr.no values for snapshots without yr.no weather', () => {
    expect(
      pointsInRange(
        [record('2026-11', [['2026-11-01T00:00:00.000Z', 2]])],
        { from: 0, to: Infinity },
        pressure
      )
    ).toEqual([]);
  });
});

describe('yearBand', () => {
  const HOUR = 60 * 60 * 1000;
  const line = (...values) => ({
    points: values.map(([x, y]) => ({ x, y })),
  });

  it('gives the lowest, middle and highest year of each part', () => {
    expect(
      yearBand(
        [line([0, 1], [HOUR, 5]), line([0, 3]), line([10, 2], [HOUR, 9])],
        HOUR
      )
    ).toEqual([
      { x: 3, lo: 1, mid: 2, hi: 3 },
      { x: HOUR, lo: 5, mid: 7, hi: 9 },
    ]);
  });

  it('counts each year once in a part, with its mean', () => {
    expect(yearBand([line([0, 1], [10, 3]), line([0, 10])], HOUR)).toEqual([
      { x: 3, lo: 2, mid: 6, hi: 10 },
    ]);
  });
});

describe('chartPanels', () => {
  const records = [
    record('2025-11', [['2025-11-08T12:00:00.000Z', -3]]),
    record('2026-11', [['2026-11-08T12:00:00.000Z', 5]]),
  ];

  it('gives one panel per value, with the points of the period', () => {
    const { panels } = chartPanels({
      records,
      period: week,
      values: [temperature, humidity],
      times,
    });

    expect(panels.map((panel) => panel.value)).toEqual([temperature, humidity]);
    expect(panels[0].points).toEqual([{ x: 6 * DAY, y: 5 }]);
    expect(panels[0].band).toBeNull();
  });

  it('adds what is normal from the earlier years when comparing', () => {
    const { panels } = chartPanels({
      records,
      period: week,
      values: [temperature],
      times,
      compare: true,
    });

    // 2024 has no snapshots in the period, so only 2025 is in the band.
    expect(panels[0].bandYears).toEqual([2025, 2025]);
    expect(panels[0].band).toEqual([{ x: 6 * DAY, lo: -3, mid: -3, hi: -3 }]);
  });

  it('gives one point per day for a long period', () => {
    const { panels } = chartPanels({
      records: [
        record('2025-11', [['2025-11-20T12:00:00.000Z', -3]]),
        ...records.slice(1),
      ],
      period: year,
      values: [temperature],
      times,
    });

    expect(panels[0].points).toHaveLength(2);
    expect(panels[0].points[0]).toMatchObject({ y: -3, min: -3, max: -3 });
  });

  it('does not compare the whole history with itself', () => {
    const { panels } = chartPanels({
      records,
      period: all,
      values: [temperature],
      times,
      compare: true,
    });

    expect(panels[0].band).toBeNull();
  });
});
