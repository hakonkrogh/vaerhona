import { beforeEach, describe, expect, it, vi } from 'vitest';

const { find, findOne } = vi.hoisted(() => ({
  find: vi.fn(),
  findOne: vi.fn(),
}));

vi.mock('./config', () => ({ default: { environment: 'production' } }));
vi.mock('./init', () => ({ runWithDb: (fn) => fn() }));
vi.mock('./mongo/models', () => ({
  snapshotModel: { find },
  snapshotPlaceModel: { findOne },
}));

import { fromColumns } from '../core/snapshot-values';

import {
  getSnapshotValues,
  parseValuesQuery,
  ROW_LIMIT,
} from './snapshot-values';

const LATEST = new Date('2026-11-09T12:00:00.000Z');
const FROM = new Date('2026-11-01T00:00:00.000Z');
const HOUR = 60 * 60 * 1000;

function chain(result) {
  const query = {
    select: vi.fn(() => query),
    populate: vi.fn(() => query),
    sort: vi.fn(() => query),
    limit: vi.fn(() => query),
    lean: vi.fn(() => query),
    exec: vi.fn(async () => result),
  };
  return query;
}

function row(hoursAfterFrom) {
  return {
    cuid: `snap-${hoursAfterFrom}`,
    dateAdded: new Date(FROM.getTime() + hoursAfterFrom * HOUR),
    temperature: 3,
    humidity: 80.04,
    pressure: 1000,
    yrWeather: null,
  };
}

describe('parseValuesQuery', () => {
  const valid = {
    place: 'veggli',
    from: FROM.toISOString(),
    to: LATEST.toISOString(),
    v: '1',
  };

  it('reads a valid query', () => {
    expect(parseValuesQuery(valid)).toEqual({
      placeName: 'veggli',
      from: FROM,
      to: LATEST,
    });
  });

  it('accepts a whole month of 31 days', () => {
    expect(
      parseValuesQuery({
        ...valid,
        from: '2026-10-01T00:00:00.000Z',
        to: '2026-10-31T23:59:59.999Z',
      })
    ).not.toBeNull();
  });

  it.each([
    ['no place', { ...valid, place: undefined }],
    ['two places', { ...valid, place: ['a', 'b'] }],
    ['no version', { ...valid, v: undefined }],
    ['another version', { ...valid, v: '2' }],
    ['no start date', { ...valid, from: undefined }],
    ['no end date', { ...valid, to: undefined }],
    ['a bad date', { ...valid, to: 'soon' }],
    ['an end before the start', { ...valid, to: '2026-10-01T00:00:00.000Z' }],
    ['more than 31 days', { ...valid, to: '2026-12-02T00:00:00.001Z' }],
  ])('rejects %s', (_, query) => {
    expect(parseValuesQuery(query)).toBeNull();
  });
});

describe('getSnapshotValues', () => {
  function givenSnapshots(rows) {
    const query = chain(rows);
    find.mockReturnValue(query);
    return query;
  }

  const get = (to = LATEST) =>
    getSnapshotValues({ placeName: 'veggli', from: FROM, to });

  beforeEach(() => {
    vi.clearAllMocks();
    findOne.mockReturnValue(
      chain({
        cuid: 'place-cuid',
        name: 'veggli',
        lastSnapshot: { dateAdded: LATEST },
      })
    );
  });

  it('returns null for a place that does not exist', async () => {
    findOne.mockReturnValue(chain(null));

    expect(await get()).toBeNull();
  });

  it('gets every snapshot in the part of time, oldest first', async () => {
    const query = givenSnapshots([row(0), row(1)]);

    const { values } = await get();

    expect(find).toHaveBeenCalledWith({
      placeCuid: 'place-cuid',
      dateAdded: { $gte: FROM, $lte: LATEST },
    });
    expect(query.sort).toHaveBeenCalledWith('dateAdded');
    expect(values).toMatchObject({
      v: 1,
      from: FROM.toISOString(),
      to: LATEST.toISOString(),
      cuid: ['snap-0', 'snap-1'],
      time: [FROM.getTime(), FROM.getTime() + HOUR],
      temperature: [3, 3],
      humidity: [80, 80],
    });
  });

  it('gives the browser what it needs to build the same snapshots as a list', async () => {
    givenSnapshots([row(1)]);

    const { values } = await get();

    expect(fromColumns(values, values.imageBase)).toEqual([
      {
        cuid: 'snap-1',
        date: '2026-11-01T01:00:00.000Z',
        temperature: 3,
        pressure: 1000,
        humidity: 80,
        image:
          'https://vaerhona.s3-eu-west-1.amazonaws.com/veggli/2026/11/snap-1',
        yrWeather: null,
      },
    ]);
  });

  it('covers only up to its newest snapshot when the limit cut it', async () => {
    const rows = Array.from({ length: ROW_LIMIT }, (_, i) => row(i / 100));
    givenSnapshots(rows);

    const { values } = await get();

    expect(values.to).toBe(rows[ROW_LIMIT - 1].dateAdded.toISOString());
  });

  it('is final when it ends at the latest snapshot', async () => {
    givenSnapshots([]);

    expect((await get(LATEST)).final).toBe(true);
  });

  it('is not final when it ends after the latest snapshot', async () => {
    givenSnapshots([]);

    expect((await get(new Date(LATEST.getTime() + 1))).final).toBe(false);
  });

  it('is not final for a place with no latest snapshot', async () => {
    findOne.mockReturnValue(
      chain({ cuid: 'place-cuid', name: 'veggli', lastSnapshot: null })
    );
    givenSnapshots([]);

    expect((await get()).final).toBe(false);
  });
});
