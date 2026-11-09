import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { getTopPublicPlaces, store } = vi.hoisted(() => ({
  getTopPublicPlaces: vi.fn(),
  store: {
    readFrontPageList: vi.fn(),
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
vi.mock('./mongo/models', () => ({ snapshotModel: {} }));
vi.mock('./place-service', () => ({
  getTopPublicPlaces,
  TOP_PUBLIC_PLACES_LIMIT: 10,
}));
// Only reading is available, so a write from the page would throw.
vi.mock('./latest-store', () => store);

import { getFrontPageProps, getPlacesFromMongo } from './front-page';

const NOW = new Date('2026-11-09T12:00:00.000Z');
const MINUTE = 60 * 1000;
const ago = (minutes) => new Date(NOW.getTime() - minutes * MINUTE);

function mongoPlace(name, lastSnapshot) {
  return { name, cuid: `${name}-cuid`, isPublic: true, lastSnapshot };
}

function record(name, confirmedMinutesAgo) {
  return {
    cuid: `${name}-cuid`,
    name,
    confirmedAt: ago(confirmedMinutesAgo).toISOString(),
    firstSnapshot: null,
    lastSnapshot: {
      cuid: `${name}-snap`,
      date: '2026-04-05T14:32:07.468Z',
      image: `https://example.test/${name}`,
      temperature: 3,
    },
  };
}

function useRecords(records, listAgeMinutes = 5) {
  store.readFrontPageList.mockResolvedValue({
    writtenAt: ago(listAgeMinutes).toISOString(),
    places: Object.keys(records),
  });
  store.readLatestRecord.mockImplementation(async (name) => records[name]);
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  getTopPublicPlaces.mockReset();
  getTopPublicPlaces.mockResolvedValue([
    mongoPlace('veggli', { cuid: 'from-mongo', dateAdded: ago(5) }),
  ]);
  store.readFrontPageList.mockReset();
  store.readLatestRecord.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('getPlacesFromMongo', () => {
  it('returns the latest snapshot of each place as plain data', async () => {
    getTopPublicPlaces.mockResolvedValue([
      mongoPlace('veggli', {
        cuid: 'snap-1',
        dateAdded: new Date('2026-11-09T11:58:18.601Z'),
        temperature: 3,
      }),
    ]);

    expect(await getPlacesFromMongo()).toEqual([
      {
        cuid: 'veggli-cuid',
        name: 'veggli',
        lastSnapshot: {
          cuid: 'snap-1',
          date: '2026-11-09T11:58:18.601Z',
          image:
            'https://vaerhona.s3-eu-west-1.amazonaws.com/veggli/2026/11/snap-1',
          placeName: 'veggli',
        },
      },
    ]);
    expect(getTopPublicPlaces).toHaveBeenCalledWith({
      limit: 10,
      withFirstSnapshot: false,
    });
  });

  it('keeps the order from MongoDB', async () => {
    getTopPublicPlaces.mockResolvedValue([
      mongoPlace('veggli', { cuid: 'a', dateAdded: ago(5) }),
      mongoPlace('tornes', { cuid: 'b', dateAdded: new Date('2026-04-05') }),
    ]);

    const places = await getPlacesFromMongo();

    expect(places.map((p) => p.name)).toEqual(['veggli', 'tornes']);
  });
});

describe('getFrontPageProps', () => {
  it('uses the records when all of them are trusted', async () => {
    useRecords({ veggli: record('veggli', 5), tornes: record('tornes', 30) });

    const { places } = await getFrontPageProps();

    expect(places).toEqual([
      {
        cuid: 'veggli-cuid',
        name: 'veggli',
        lastSnapshot: {
          cuid: 'veggli-snap',
          date: '2026-04-05T14:32:07.468Z',
          image: 'https://example.test/veggli',
          placeName: 'veggli',
        },
      },
      expect.objectContaining({ name: 'tornes' }),
    ]);
    expect(getTopPublicPlaces).not.toHaveBeenCalled();
  });

  it.each([
    [
      'the list is missing',
      () => store.readFrontPageList.mockResolvedValue(null),
    ],
    [
      'the list is over 90 minutes old',
      () => useRecords({ veggli: record('veggli', 5) }, 90),
    ],
    [
      'a record is missing',
      () => useRecords({ veggli: record('veggli', 5), tornes: null }),
    ],
    [
      'a record was confirmed over 90 minutes ago',
      () =>
        useRecords({
          veggli: record('veggli', 5),
          tornes: record('tornes', 95),
        }),
    ],
    [
      'a record cannot be read',
      () => {
        useRecords({ veggli: record('veggli', 5) });
        store.readLatestRecord.mockRejectedValue(new Error('R2 down'));
      },
    ],
  ])('uses MongoDB when %s', async (_, setUp) => {
    setUp();

    const { places } = await getFrontPageProps();

    expect(places[0].lastSnapshot.cuid).toBe('from-mongo');
    expect(getTopPublicPlaces).toHaveBeenCalled();
  });

  it('uses MongoDB when the records are too slow', async () => {
    store.readFrontPageList.mockReturnValue(new Promise(() => {}));

    const pending = getFrontPageProps();
    await vi.advanceTimersByTimeAsync(500);

    expect((await pending).places[0].lastSnapshot.cuid).toBe('from-mongo');
  });

  it('returns no places instead of failing when MongoDB fails too', async () => {
    store.readFrontPageList.mockResolvedValue(null);
    getTopPublicPlaces.mockRejectedValue(new Error('db down'));

    expect(await getFrontPageProps()).toEqual({ places: null });
  });
});
