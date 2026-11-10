import { describe, expect, it } from 'vitest';

import {
  addMonths,
  fromColumns,
  monthEnd,
  monthOf,
  monthStart,
  snapshotValuesUrl,
  toColumns,
} from './snapshot-values';

const BASE = 'https://photos.test/veggli';

const withYr = {
  cuid: 'snap-1',
  date: '2024-06-30T23:30:00.000Z',
  temperature: 12.4,
  pressure: 1012,
  humidity: 81,
  image: `${BASE}/2024/6/snap-1`,
  yrWeather: {
    airTemperature: 11.9,
    windSpeed: 2.1,
    windFromDirection: 90,
    windSpeedOfGust: 4,
    airPressureAtSeaLevel: 1013,
    cloudAreaFraction: 50,
    dewPointTemperature: 8,
    relativeHumidity: 80,
    windDirectionCompass: 'E',
  },
};

const withoutYr = {
  cuid: 'snap-2',
  date: '2024-07-01T00:30:00.000Z',
  temperature: 12.1,
  pressure: null,
  humidity: 83,
  image: `${BASE}/2024/7/snap-2`,
  yrWeather: null,
};

describe('months', () => {
  it('uses UTC months', () => {
    expect(monthOf(Date.parse('2024-06-30T23:59:59.999Z'))).toBe('2024-06');
    expect(monthOf(Date.parse('2024-07-01T00:00:00.000Z'))).toBe('2024-07');
  });

  it('gives the first and last millisecond of a month', () => {
    expect(new Date(monthStart('2024-02')).toISOString()).toBe(
      '2024-02-01T00:00:00.000Z'
    );
    expect(new Date(monthEnd('2024-02')).toISOString()).toBe(
      '2024-02-29T23:59:59.999Z'
    );
  });

  it('steps over a year', () => {
    expect(addMonths('2024-12', 1)).toBe('2025-01');
    expect(addMonths('2024-01', -1)).toBe('2023-12');
    expect(addMonths('2024-06', -18)).toBe('2022-12');
  });
});

describe('snapshotValuesUrl', () => {
  it('builds the same URL for the same part of time', () => {
    expect(
      snapshotValuesUrl({
        place: 'veggli',
        from: monthStart('2024-06'),
        to: monthEnd('2024-06'),
      })
    ).toBe(
      '/api/values?place=veggli&from=2024-06-01T00%3A00%3A00.000Z&to=2024-06-30T23%3A59%3A59.999Z&v=1'
    );
  });
});

describe('columns', () => {
  it('gives the same snapshots back', () => {
    const snapshots = [withYr, withoutYr];

    expect(fromColumns(toColumns(snapshots), BASE)).toEqual(snapshots);
  });

  it('survives JSON, as the API and the local database store it', () => {
    const columns = JSON.parse(JSON.stringify(toColumns([withYr, withoutYr])));

    expect(fromColumns(columns, BASE)).toEqual([withYr, withoutYr]);
  });

  it('leaves out yr.no columns when no snapshot has them', () => {
    const columns = toColumns([withoutYr]);

    expect(columns.yr).toBeNull();
    expect(fromColumns(columns, BASE)).toEqual([withoutYr]);
  });

  it('handles no snapshots', () => {
    expect(fromColumns(toColumns([]), BASE)).toEqual([]);
  });
});
