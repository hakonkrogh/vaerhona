import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getTopPublicPlaces } = vi.hoisted(() => ({
  getTopPublicPlaces: vi.fn(),
}));

vi.mock('./config', () => ({ default: { environment: 'production' } }));
vi.mock('./init', () => ({ runWithDb: (fn) => fn() }));
vi.mock('./place-service', () => ({
  getTopPublicPlaces,
  TOP_PUBLIC_PLACES_LIMIT: 10,
}));

import { getFrontPageProps, getPlacesForFrontPage } from './front-page';

const DATE = new Date('2026-11-09T11:58:18.601Z');

function mongoPlace(name, lastSnapshot) {
  return { name, cuid: `${name}-cuid`, isPublic: true, lastSnapshot };
}

describe('getPlacesForFrontPage', () => {
  beforeEach(() => {
    getTopPublicPlaces.mockReset();
  });

  it('returns the latest snapshot of each place as plain data', async () => {
    getTopPublicPlaces.mockResolvedValue([
      mongoPlace('veggli', { cuid: 'snap-1', dateAdded: DATE, temperature: 3 }),
    ]);

    expect(await getPlacesForFrontPage()).toEqual([
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
      mongoPlace('veggli', { cuid: 'a', dateAdded: DATE }),
      mongoPlace('tornes', { cuid: 'b', dateAdded: new Date('2026-04-05') }),
    ]);

    const places = await getPlacesForFrontPage();

    expect(places.map((p) => p.name)).toEqual(['veggli', 'tornes']);
  });

  it('leaves out a place whose snapshot is missing', async () => {
    getTopPublicPlaces.mockResolvedValue([
      mongoPlace('veggli', null),
      mongoPlace('myking', { cuid: 'c', dateAdded: DATE }),
    ]);

    const places = await getPlacesForFrontPage();

    expect(places.map((p) => p.name)).toEqual(['myking']);
  });

  it('passes on a database error', async () => {
    getTopPublicPlaces.mockRejectedValue(new Error('db down'));

    await expect(getPlacesForFrontPage()).rejects.toThrow('db down');
  });
});

describe('getFrontPageProps', () => {
  beforeEach(() => {
    getTopPublicPlaces.mockReset();
  });

  it('returns the places', async () => {
    getTopPublicPlaces.mockResolvedValue([
      mongoPlace('veggli', { cuid: 'a', dateAdded: DATE }),
    ]);

    const props = await getFrontPageProps();

    expect(props.places.map((p) => p.name)).toEqual(['veggli']);
  });

  it('returns no places instead of failing when MongoDB fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    getTopPublicPlaces.mockRejectedValue(new Error('db down'));

    expect(await getFrontPageProps()).toEqual({ places: null });
  });
});
