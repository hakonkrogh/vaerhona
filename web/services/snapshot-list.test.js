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

import { getSnapshotList, parseListQuery } from './snapshot-list';

const LATEST = new Date('2026-11-09T12:00:00.000Z');
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

function row(hoursBeforeLatest) {
  return {
    cuid: `snap-${hoursBeforeLatest}`,
    dateAdded: new Date(LATEST.getTime() - hoursBeforeLatest * HOUR),
    temperature: 3,
    humidity: 80,
    pressure: 1000,
    yrWeather: null,
  };
}

describe('parseListQuery', () => {
  const valid = { place: 'veggli', to: LATEST.toISOString(), limit: '168' };

  it('reads a valid query', () => {
    expect(parseListQuery(valid)).toEqual({
      placeName: 'veggli',
      from: null,
      to: LATEST,
      limit: 168,
    });
  });

  it('reads a start date', () => {
    const from = new Date(LATEST.getTime() - 24 * HOUR);

    expect(parseListQuery({ ...valid, from: from.toISOString() }).from).toEqual(
      from
    );
  });

  it.each([
    ['no place', { ...valid, place: undefined }],
    ['two places', { ...valid, place: ['a', 'b'] }],
    ['no end date', { ...valid, to: undefined }],
    ['a bad end date', { ...valid, to: 'soon' }],
    ['a bad start date', { ...valid, from: 'soon' }],
    ['no limit', { ...valid, limit: undefined }],
    ['a zero limit', { ...valid, limit: '0' }],
    ['a huge limit', { ...valid, limit: '100000' }],
  ])('rejects %s', (_, query) => {
    expect(parseListQuery(query)).toBeNull();
  });
});

describe('getSnapshotList', () => {
  let placeQuery;

  function givenSnapshots(rows) {
    const query = chain(rows);
    find.mockReturnValue(query);
    return query;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    placeQuery = chain({
      cuid: 'place-cuid',
      name: 'veggli',
      lastSnapshot: { dateAdded: LATEST },
    });
    findOne.mockReturnValue(placeQuery);
  });

  it('returns null for a place that does not exist', async () => {
    findOne.mockReturnValue(chain(null));

    expect(
      await getSnapshotList({ placeName: 'nope', to: LATEST, limit: 5 })
    ).toBeNull();
  });

  it('gets the newest snapshots up to the end date, oldest first', async () => {
    // MongoDB returns them newest first for this query.
    const query = givenSnapshots([row(0), row(1)]);

    const { list } = await getSnapshotList({
      placeName: 'veggli',
      from: null,
      to: LATEST,
      limit: 5,
    });

    expect(find).toHaveBeenCalledWith({
      placeCuid: 'place-cuid',
      dateAdded: { $lte: LATEST },
    });
    expect(query.sort).toHaveBeenCalledWith('-dateAdded');
    expect(query.limit).toHaveBeenCalledWith(5);
    expect(list.snapshots.map((s) => s.cuid)).toEqual(['snap-1', 'snap-0']);
    expect(list.snapshots[0]).toEqual({
      cuid: 'snap-1',
      date: '2026-11-09T11:00:00.000Z',
      temperature: 3,
      pressure: 1000,
      humidity: 80,
      image:
        'https://vaerhona.s3-eu-west-1.amazonaws.com/veggli/2026/11/snap-1',
      yrWeather: null,
    });
  });

  it('covers all earlier time when there are fewer snapshots than the limit', async () => {
    givenSnapshots([row(0), row(1)]);

    const { list } = await getSnapshotList({
      placeName: 'veggli',
      from: null,
      to: LATEST,
      limit: 5,
    });

    expect(list.from).toBeNull();
    expect(list.to).toBe(LATEST.toISOString());
  });

  it('covers back to the oldest snapshot when the limit cut the list', async () => {
    givenSnapshots([row(0), row(1)]);

    const { list } = await getSnapshotList({
      placeName: 'veggli',
      from: null,
      to: LATEST,
      limit: 2,
    });

    expect(list.from).toBe(row(1).dateAdded.toISOString());
  });

  it('gets the oldest snapshots from the start date', async () => {
    const from = new Date(LATEST.getTime() - 10 * HOUR);
    const query = givenSnapshots([row(9), row(8)]);

    const { list } = await getSnapshotList({
      placeName: 'veggli',
      from,
      to: LATEST,
      limit: 2,
    });

    expect(find).toHaveBeenCalledWith({
      placeCuid: 'place-cuid',
      dateAdded: { $gte: from, $lte: LATEST },
    });
    expect(query.sort).toHaveBeenCalledWith('dateAdded');
    expect(list.snapshots.map((s) => s.cuid)).toEqual(['snap-9', 'snap-8']);
    // The limit cut the list, so it covers only up to the newest one.
    expect(list.from).toBe(from.toISOString());
    expect(list.to).toBe(row(8).dateAdded.toISOString());
  });

  it('covers up to the end date when the limit did not cut the list', async () => {
    const from = new Date(LATEST.getTime() - 10 * HOUR);
    givenSnapshots([row(9)]);

    const { list } = await getSnapshotList({
      placeName: 'veggli',
      from,
      to: LATEST,
      limit: 2,
    });

    expect(list.to).toBe(LATEST.toISOString());
  });

  it('is final when it ends at the latest snapshot', async () => {
    givenSnapshots([]);

    const result = await getSnapshotList({
      placeName: 'veggli',
      to: LATEST,
      limit: 5,
    });

    expect(result.final).toBe(true);
  });

  it('is not final when it ends after the latest snapshot', async () => {
    givenSnapshots([]);

    const result = await getSnapshotList({
      placeName: 'veggli',
      to: new Date(LATEST.getTime() + 1),
      limit: 5,
    });

    expect(result.final).toBe(false);
  });

  it('is not final for a place with no latest snapshot', async () => {
    findOne.mockReturnValue(
      chain({ cuid: 'place-cuid', name: 'veggli', lastSnapshot: null })
    );
    givenSnapshots([]);

    const result = await getSnapshotList({
      placeName: 'veggli',
      to: LATEST,
      limit: 5,
    });

    expect(result.final).toBe(false);
  });
});
