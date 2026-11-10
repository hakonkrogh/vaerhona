import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createSnapshotStore, findSnapshot, initialListUrl } from './store';
import { nearbyLoads } from './timeline';

const LATEST = '2026-11-09T12:58:17.834Z';
const HOUR = 60 * 60 * 1000;

const place = {
  name: 'veggli',
  firstSnapshot: { cuid: 'first', date: '2020-01-01T00:00:00.000Z' },
  lastSnapshot: { cuid: 'last', date: LATEST },
};

function okList(list) {
  return { ok: true, json: async () => list };
}

describe('createSnapshotStore', () => {
  let fetch;

  beforeEach(() => {
    fetch = vi.fn(async () =>
      okList({ from: null, to: LATEST, snapshots: [] })
    );
    vi.stubGlobal('fetch', fetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('asks first for the list the page preloads', async () => {
    const store = createSnapshotStore(place);
    const [first] = nearbyLoads(store.getTimeline(), place.lastSnapshot);

    await store.load(first);

    expect(fetch).toHaveBeenCalledWith(initialListUrl(place));
    expect(initialListUrl(place)).toBe(
      '/api/snapshots?place=veggli&to=2026-11-09T12%3A58%3A17.834Z&limit=168'
    );
  });

  it('never asks for a list that ends after the latest snapshot', async () => {
    const store = createSnapshotStore(place);
    const latest = new Date(LATEST).getTime();

    await store.load({ from: latest - 24 * HOUR, to: latest + 72 * HOUR });

    const url = new URL(fetch.mock.calls[0][0], 'https://example.test');
    expect(url.searchParams.get('to')).toBe(LATEST);
  });

  it('loads nothing after the latest snapshot', async () => {
    const store = createSnapshotStore(place);

    await store.load({ from: new Date(LATEST).getTime() + HOUR });

    expect(fetch).not.toHaveBeenCalled();
  });

  it('asks once for a list that is already on its way', async () => {
    const store = createSnapshotStore(place);
    const part = { to: new Date(LATEST).getTime() };

    await Promise.all([store.load(part), store.load(part)]);

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('adds the list and tells subscribers', async () => {
    const snapshot = { cuid: 'a', date: '2026-11-09T11:58:17.834Z' };
    fetch.mockResolvedValue(
      okList({ from: null, to: LATEST, snapshots: [snapshot] })
    );
    const store = createSnapshotStore(place);
    const listener = vi.fn();
    store.subscribe(listener);

    await store.load({ to: new Date(LATEST).getTime() });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getTimeline().snapshots.map((s) => s.cuid)).toEqual([
      'first',
      'a',
      'last',
    ]);
  });

  it('tries again after a failed list', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    fetch.mockResolvedValueOnce({ ok: false, status: 500 });
    const store = createSnapshotStore(place);
    const part = { to: new Date(LATEST).getTime() };

    await store.load(part);
    await store.load(part);

    expect(fetch).toHaveBeenCalledTimes(2);
  });
});

describe('findSnapshot', () => {
  function fakeStore() {
    let loaded = 0;
    return {
      getTimeline: () => ({ loaded }),
      load: vi.fn(async () => {
        loaded++;
      }),
    };
  }

  it('loads until the target is found', async () => {
    const store = fakeStore();
    const findTarget = ({ loaded }) =>
      loaded < 2 ? { load: [{}] } : { snapshot: 'found' };

    expect(await findSnapshot(store, findTarget)).toBe('found');
    expect(store.load).toHaveBeenCalledTimes(2);
  });

  it('settles in the last round instead of loading forever', async () => {
    const store = fakeStore();
    const findTarget = (_, settle) =>
      settle ? { snapshot: 'closest known' } : { load: [{}] };

    expect(await findSnapshot(store, findTarget)).toBe('closest known');
    expect(store.load).toHaveBeenCalledTimes(3);
  });

  it('stops when the search is no longer wanted', async () => {
    const store = fakeStore();
    const findTarget = () => ({ load: [{}] });

    expect(await findSnapshot(store, findTarget, () => true)).toBeUndefined();
    expect(store.load).toHaveBeenCalledTimes(1);
  });
});

describe('createSnapshotStore with a history', () => {
  const DAY = 24 * HOUR;
  const latest = new Date(LATEST).getTime();
  const october = { cuid: 'oct', date: '2026-10-20T10:00:00.000Z' };
  let fetch;
  let history;

  function makeHistory(snapshotsByMonth) {
    return {
      monthsBetween: vi.fn((from, to) => {
        const months = [];
        const date = new Date(from);
        date.setUTCDate(1);

        while (date.getTime() <= Math.min(to, latest)) {
          months.push(date.toISOString().slice(0, 7));
          date.setUTCMonth(date.getUTCMonth() + 1);
        }

        return months;
      }),
      load: vi.fn(async () => {}),
      getCoverage: (month) => ({
        from: Date.parse(`${month}-01T00:00:00.000Z`),
        to:
          month === '2026-11' ? latest : Date.parse('2026-10-31T23:59:59.999Z'),
      }),
      getSnapshots: (month) => snapshotsByMonth[month] ?? [],
    };
  }

  beforeEach(() => {
    fetch = vi.fn(async () =>
      okList({ from: null, to: LATEST, snapshots: [] })
    );
    vi.stubGlobal('fetch', fetch);
    history = makeHistory({ '2026-10': [october] });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('still asks the list API for the list the page preloads', async () => {
    const store = createSnapshotStore(place, history);
    const [first] = nearbyLoads(store.getTimeline(), place.lastSnapshot);

    await store.load(first);

    expect(fetch).toHaveBeenCalledWith(initialListUrl(place));
    expect(history.load).not.toHaveBeenCalled();
  });

  it('takes a part of time from the history, with no list request', async () => {
    const store = createSnapshotStore(place, history);
    const time = new Date(october.date).getTime();

    await store.load({ from: time - 3 * DAY, to: time + 3 * DAY });

    expect(history.load).toHaveBeenCalledWith('2026-10');
    expect(fetch).not.toHaveBeenCalled();
    expect(store.getTimeline().snapshots).toContainEqual(october);
    expect(store.getTimeline().ranges).toContainEqual({
      from: Date.parse('2026-10-01T00:00:00.000Z'),
      to: Date.parse('2026-10-31T23:59:59.999Z'),
    });
  });

  it('loads both months when the week before a time crosses a month', async () => {
    const store = createSnapshotStore(place, history);

    await store.load({ to: Date.parse('2026-11-02T00:00:00.000Z') });

    expect(history.load.mock.calls.map(([month]) => month)).toEqual([
      '2026-10',
      '2026-11',
    ]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('asks the list API when the months have nothing before the time', async () => {
    const store = createSnapshotStore(place, history);

    // The box was off: nothing in October before the 15th.
    await store.load({ to: Date.parse('2026-10-15T00:00:00.000Z') });

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('asks the list API when the history fails', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    history.load.mockRejectedValue(new Error('offline'));
    const store = createSnapshotStore(place, history);
    const time = new Date(october.date).getTime();

    await store.load({ from: time - 3 * DAY, to: time + 3 * DAY });

    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
