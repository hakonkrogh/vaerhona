import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { find } = vi.hoisted(() => ({ find: vi.fn() }));

vi.mock('./mongo/models', () => ({ snapshotPlaceModel: { find } }));

import { getTopPublicPlaces } from './place-service';

const NOW = new Date('2026-11-09T12:00:00.000Z');
const DAY = 24 * 60 * 60 * 1000;

function placeWithSnapshotAge(name, ageMs) {
  return {
    name,
    lastSnapshot:
      ageMs === null
        ? null
        : { cuid: `${name}-snap`, dateAdded: new Date(NOW - ageMs) },
  };
}

describe('getTopPublicPlaces', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function returns(places) {
    const query = {
      populate: () => query,
      limit: () => query,
      sort: () => query,
      exec: async () => places,
    };
    find.mockReturnValue(query);
  }

  it('leaves out places with no snapshot in the last 364 days', async () => {
    returns([
      placeWithSnapshotAge('veggli', 0),
      placeWithSnapshotAge('tornes', 364 * DAY),
      placeWithSnapshotAge('gone', 365 * DAY),
      placeWithSnapshotAge('broken', null),
    ]);

    const places = await getTopPublicPlaces({ limit: 10 });

    expect(places.map((p) => p.name)).toEqual(['veggli', 'tornes']);
  });

  it('applies the limit after leaving out old places', async () => {
    returns([
      placeWithSnapshotAge('gone', 400 * DAY),
      placeWithSnapshotAge('veggli', 0),
      placeWithSnapshotAge('myking', 0),
    ]);

    const places = await getTopPublicPlaces({ limit: 1 });

    expect(places.map((p) => p.name)).toEqual(['veggli']);
  });
});
