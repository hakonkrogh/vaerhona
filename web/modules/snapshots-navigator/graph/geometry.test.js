import { describe, expect, it } from 'vitest';

import {
  areaPath,
  linePath,
  nearestIndex,
  niceTicks,
  segments,
  timeTicks,
  valueDomain,
} from './geometry';
import { VALUES } from './series';

const [temperature, humidity, wind, , cloud] = VALUES;
const DAY = 24 * 60 * 60 * 1000;
const time = (iso) => new Date(iso).getTime();
const points = (...values) => values.map(([x, y]) => ({ x, y }));

describe('niceTicks', () => {
  it('gives round numbers inside the range', () => {
    expect(niceTicks(-5.6, 10.9, 4)).toEqual([-5, 0, 5, 10]);
    expect(niceTicks(1008, 1038, 3)).toEqual([1010, 1020, 1030]);
  });

  it('has no float noise', () => {
    expect(niceTicks(0.1, 0.7, 3)).toEqual([0.2, 0.4, 0.6]);
  });

  it('gives the one value when there is no range', () => {
    expect(niceTicks(3, 3, 4)).toEqual([3]);
  });
});

describe('valueDomain', () => {
  it('leaves a little room above and below', () => {
    const [lo, hi] = valueDomain({
      value: temperature,
      points: points([0, 0], [1, 10]),
    });

    expect(lo).toBeCloseTo(-0.8);
    expect(hi).toBeCloseTo(10.8);
  });

  it('includes the lowest and highest of each day and the earlier years', () => {
    const [lo, hi] = valueDomain({
      value: temperature,
      points: [{ x: 0, y: 2, min: -4, max: 6 }],
      band: [{ x: 0, lo: -10, mid: 0, hi: 3 }],
    });

    expect(lo).toBeLessThan(-10);
    expect(hi).toBeGreaterThan(6);
  });

  it('starts the wind at 0', () => {
    expect(
      valueDomain({ value: wind, points: points([0, 2], [1, 4]) })[0]
    ).toBe(0);
  });

  it('keeps humidity between 0 and 100', () => {
    const [, hi] = valueDomain({
      value: humidity,
      points: points([0, 60], [1, 100]),
    });

    expect(hi).toBe(100);
  });

  it('always shows all of the cloud cover', () => {
    expect(valueDomain({ value: cloud, points: points([0, 40]) })).toEqual([
      0, 100,
    ]);
  });

  it('is null without points', () => {
    expect(valueDomain({ value: temperature, points: [] })).toBeNull();
  });
});

describe('paths', () => {
  const x = (value) => value;
  const y = (point) => point.y;

  it('splits at a long gap', () => {
    expect(
      segments(points([0, 1], [1, 1], [10, 1]), 5).map((part) => part.length)
    ).toEqual([2, 1]);
  });

  it('draws a line with a gap, and a point alone as a dot', () => {
    expect(linePath(points([0, 1], [1, 2], [10, 3]), 5, x, y)).toBe(
      'M0.0,1.0L1.0,2.0M10.0,3.0h0.1'
    );
  });

  it('draws an area between two lines', () => {
    expect(
      areaPath(
        [
          { x: 0, min: 1, max: 3 },
          { x: 1, min: 2, max: 4 },
        ],
        5,
        x,
        (point) => point.max,
        (point) => point.min
      )
    ).toBe('M0.0,3.0L1.0,4.0L1.0,2.0L0.0,1.0Z');
  });
});

describe('nearestIndex', () => {
  const list = points([0, 0], [10, 0], [20, 0]);

  it('finds the nearest point', () => {
    expect(nearestIndex(list, 14)).toBe(1);
    expect(nearestIndex(list, 16)).toBe(2);
    expect(nearestIndex(list, -5)).toBe(0);
    expect(nearestIndex(list, 99)).toBe(2);
  });

  it('is -1 without points', () => {
    expect(nearestIndex([], 3)).toBe(-1);
  });
});

describe('timeTicks', () => {
  const labels = (range, width) =>
    timeTicks(range, width).map((tick) => tick.label);

  it('marks each day of a week at midnight in Norway', () => {
    const range = {
      from: time('2026-11-03T15:51:00Z'),
      to: time('2026-11-10T15:51:00Z'),
    };
    const ticks = timeTicks(range, 600);

    expect(ticks.map((tick) => tick.label)).toEqual([
      'on. 4.',
      'to. 5.',
      'fr. 6.',
      'lø. 7.',
      'sø. 8.',
      'ma. 9.',
      'ti. 10.',
    ]);
    expect(range.from + ticks[0].x).toBe(time('2026-11-03T23:00:00Z'));
  });

  it('skips days when the chart is narrow', () => {
    expect(
      labels(
        {
          from: time('2026-10-11T15:51:00Z'),
          to: time('2026-11-10T15:51:00Z'),
        },
        300
      ).length
    ).toBeLessThanOrEqual(6);
  });

  it('marks months for a year, with the year at January', () => {
    expect(
      labels(
        {
          from: time('2025-11-10T15:51:00Z'),
          to: time('2026-11-10T15:51:00Z'),
        },
        600
      )
    ).toEqual([
      'des.',
      '2026',
      'feb.',
      'mars',
      'apr.',
      'mai',
      'juni',
      'juli',
      'aug.',
      'sep.',
      'okt.',
      'nov.',
    ]);
  });

  it('marks years for a long history', () => {
    expect(
      labels(
        {
          from: time('2020-01-10T00:00:00Z'),
          to: time('2026-11-10T00:00:00Z'),
        },
        600
      )
    ).toEqual(['2021', '2022', '2023', '2024', '2025', '2026']);
  });

  it('gives each tick once', () => {
    const range = { from: 0, to: 5 * 365 * DAY };
    const xs = timeTicks(range, 600).map((tick) => tick.x);

    expect(new Set(xs).size).toBe(xs.length);
  });
});
