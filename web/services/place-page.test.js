import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { findOne, store } = vi.hoisted(() => ({
  findOne: vi.fn(),
  store: {
    readLatestRecord: vi.fn(),
    withTimeout: (promise, ms) =>
      Promise.race([
        promise,
        new Promise((resolve) => setTimeout(() => resolve(null), ms)),
      ]),
  },
}));

vi.mock('./config', () => ({ default: { environment: 'production' } }));
vi.mock('./init', () => ({ runWithDb: (fn) => fn() }));
vi.mock('./mongo/models', () => ({
  snapshotModel: {},
  snapshotPlaceModel: { findOne },
}));
// Only reading is available, so a write from the page would throw.
vi.mock('./latest-store', () => store);

import { getPlaceForPage } from './place-page';

const NOW = new Date('2026-11-06T12:00:00.000Z');
const MINUTE = 60 * 1000;

function recordWithAge(ageMs) {
  return {
    name: 'veggli',
    lastSnapshot: {
      cuid: 'from-record',
      date: new Date(NOW.getTime() - ageMs).toISOString(),
    },
  };
}

const mongoPlace = {
  name: 'veggli',
  cuid: 'place-cuid',
  firstSnapshot: null,
  lastSnapshot: {
    cuid: 'from-mongo',
    dateAdded: new Date(NOW.getTime() - 5 * MINUTE),
  },
};

describe('getPlaceForPage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    store.readLatestRecord.mockReset();
    findOne.mockReset();
    findOne.mockReturnValue({
      populate: () => ({ exec: async () => mongoPlace }),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('uses a fresh record without touching MongoDB', async () => {
    const record = recordWithAge(89 * MINUTE);
    store.readLatestRecord.mockResolvedValue(record);

    await expect(getPlaceForPage('veggli')).resolves.toBe(record);
    expect(findOne).not.toHaveBeenCalled();
  });

  it('uses a record with an old snapshot that was confirmed recently', async () => {
    const record = {
      ...recordWithAge(200 * 24 * 60 * MINUTE),
      confirmedAt: new Date(NOW.getTime() - 30 * MINUTE).toISOString(),
    };
    store.readLatestRecord.mockResolvedValue(record);

    await expect(getPlaceForPage('veggli')).resolves.toBe(record);
    expect(findOne).not.toHaveBeenCalled();
  });

  it('uses MongoDB when the record was confirmed over 90 minutes ago', async () => {
    store.readLatestRecord.mockResolvedValue({
      ...recordWithAge(5 * MINUTE),
      confirmedAt: new Date(NOW.getTime() - 90 * MINUTE).toISOString(),
    });

    const place = await getPlaceForPage('veggli');

    expect(place.lastSnapshot.cuid).toBe('from-mongo');
  });

  it.each([
    ['is missing', async () => null],
    ['is over 90 minutes old', async () => recordWithAge(90 * MINUTE)],
    ['has no last snapshot', async () => ({ name: 'veggli' })],
    ['has an invalid date', async () => ({ lastSnapshot: { date: 'nope' } })],
    [
      'cannot be read',
      async () => {
        throw new Error('R2 down');
      },
    ],
  ])('uses MongoDB when the record %s', async (_, read) => {
    store.readLatestRecord.mockImplementation(read);

    const place = await getPlaceForPage('veggli');

    expect(place.lastSnapshot.cuid).toBe('from-mongo');
    expect(findOne).toHaveBeenCalledWith({ name: 'veggli' });
  });

  it('uses MongoDB when the record read is too slow', async () => {
    store.readLatestRecord.mockReturnValue(new Promise(() => {}));

    const pending = getPlaceForPage('veggli');
    await vi.advanceTimersByTimeAsync(500);

    expect((await pending).lastSnapshot.cuid).toBe('from-mongo');
  });

  it('returns null for an unknown place', async () => {
    store.readLatestRecord.mockResolvedValue(null);
    findOne.mockReturnValue({ populate: () => ({ exec: async () => null }) });

    await expect(getPlaceForPage('nope')).resolves.toBeNull();
  });

  it('handles a place with no snapshots', async () => {
    store.readLatestRecord.mockResolvedValue(null);
    findOne.mockReturnValue({
      populate: () => ({
        exec: async () => ({
          name: 'new',
          cuid: 'c',
          firstSnapshot: null,
          lastSnapshot: null,
        }),
      }),
    });

    await expect(getPlaceForPage('new')).resolves.toEqual({
      cuid: 'c',
      name: 'new',
      confirmedAt: NOW.toISOString(),
      firstSnapshot: null,
      lastSnapshot: null,
    });
  });
});
