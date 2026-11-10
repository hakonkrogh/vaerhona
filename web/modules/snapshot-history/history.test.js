import { beforeEach, describe, expect, it, vi } from 'vitest';

import { monthEnd, monthStart, toColumns } from 'core/snapshot-values';

import { backfillOrder, createHistory, fetchValues } from './history';
import { createMemoryDb } from './month-db';

const BASE = 'https://photos.test/veggli';
const FIRST = '2026-06-10T08:00:00.000Z';
const LATEST = '2026-11-09T12:00:00.000Z';
const time = (iso) => new Date(iso).getTime();

const place = {
  name: 'veggli',
  firstSnapshot: { cuid: 'first', date: FIRST },
  lastSnapshot: { cuid: 'latest', date: LATEST },
};

function snapshot(iso) {
  return {
    cuid: `snap-${iso}`,
    date: iso,
    temperature: 3,
    pressure: 1000,
    humidity: 80,
    image: `${BASE}/${new Date(iso).getUTCFullYear()}/${
      new Date(iso).getUTCMonth() + 1
    }/snap-${iso}`,
    yrWeather: null,
  };
}

// A server with one snapshot at noon on the 5th of every month, plus the
// latest snapshot.
const ALL = [
  '2026-06-05T12:00:00.000Z',
  '2026-07-05T12:00:00.000Z',
  '2026-08-05T12:00:00.000Z',
  '2026-09-05T12:00:00.000Z',
  '2026-10-05T12:00:00.000Z',
  '2026-11-05T12:00:00.000Z',
  LATEST,
].map(snapshot);

function makeServer(snapshots = ALL) {
  return vi.fn(async (url) => {
    const params = new URL(url, 'https://example.test').searchParams;
    const from = time(params.get('from'));
    const to = time(params.get('to'));

    return {
      v: 1,
      from: params.get('from'),
      to: params.get('to'),
      imageBase: BASE,
      ...toColumns(
        snapshots.filter((s) => time(s.date) >= from && time(s.date) <= to)
      ),
    };
  });
}

const requests = (fetchJson) =>
  fetchJson.mock.calls.map(([url]) => {
    const params = new URL(url, 'https://example.test').searchParams;

    return `${params.get('from')} ${params.get('to')}`;
  });

// Lets every promise that is ready run.
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('backfillOrder', () => {
  const order = (options) =>
    backfillOrder({ first: '2026-01', latest: '2026-11', ...options });

  it('goes back from now when the latest snapshot is on screen', () => {
    expect(order({ focus: '2026-11' }).slice(0, 4)).toEqual([
      '2026-11',
      '2026-10',
      '2026-09',
      '2026-08',
    ]);
  });

  it('grows outwards from the month on screen and from now', () => {
    expect(order({ focus: '2026-04' })).toEqual([
      '2026-04',
      '2026-11',
      '2026-05',
      '2026-03',
      '2026-10',
      '2026-06',
      '2026-02',
      '2026-09',
      '2026-07',
      '2026-01',
      '2026-08',
    ]);
  });

  it('leaves out months that need no loading', () => {
    expect(
      order({ focus: '2026-11', skip: (month) => month > '2026-02' })
    ).toEqual(['2026-02', '2026-01']);
  });
});

describe('createHistory', () => {
  let db;
  let fetchJson;

  const make = (options = {}) =>
    createHistory({ place, db, fetchJson, now: () => 1000, ...options });

  beforeEach(() => {
    db = createMemoryDb();
    fetchJson = makeServer();
  });

  it('loads a whole month from the server and stores it', async () => {
    const history = make();

    await history.load('2026-08');

    expect(requests(fetchJson)).toEqual([
      '2026-08-01T00:00:00.000Z 2026-08-31T23:59:59.999Z',
    ]);
    expect(history.getSnapshots('2026-08')).toEqual([
      snapshot('2026-08-05T12:00:00.000Z'),
    ]);
    expect((await db.get('veggli', '2026-08')).coveredTo).toBe(
      monthEnd('2026-08')
    );
  });

  it('ends the newest month at the latest snapshot of the page', async () => {
    const history = make();

    await history.load('2026-11');

    expect(requests(fetchJson)).toEqual([`2026-11-01T00:00:00.000Z ${LATEST}`]);
    expect(history.getCoverage('2026-11')).toEqual({
      from: monthStart('2026-11'),
      to: time(LATEST),
    });
    expect(history.getSnapshots('2026-11').map((s) => s.date)).toEqual([
      '2026-11-05T12:00:00.000Z',
      LATEST,
    ]);
  });

  it('reads a stored month without asking the server', async () => {
    await make().load('2026-08');
    fetchJson.mockClear();

    const history = make();
    await history.load('2026-08');

    expect(fetchJson).not.toHaveBeenCalled();
    expect(history.getSnapshots('2026-08')).toHaveLength(1);
  });

  it('asks only for the new part of a month stored on an earlier visit', async () => {
    const earlier = '2026-11-06T00:00:00.000Z';
    const before = createHistory({
      place: { ...place, lastSnapshot: { cuid: 'x', date: earlier } },
      db,
      fetchJson,
    });
    await before.load('2026-11');
    fetchJson.mockClear();

    const history = make();
    await history.load('2026-11');

    expect(requests(fetchJson)).toEqual([`2026-11-06T00:00:00.001Z ${LATEST}`]);
    expect(history.getSnapshots('2026-11').map((s) => s.date)).toEqual([
      '2026-11-05T12:00:00.000Z',
      LATEST,
    ]);
  });

  it('never gives a snapshot after the latest snapshot of the page', async () => {
    await make().load('2026-11');

    const history = createHistory({
      place: {
        ...place,
        lastSnapshot: { cuid: 'x', date: '2026-11-06T00:00:00.000Z' },
      },
      db,
      fetchJson,
    });
    await history.load('2026-11');

    expect(history.getSnapshots('2026-11').map((s) => s.date)).toEqual([
      '2026-11-05T12:00:00.000Z',
    ]);
  });

  it('asks again when the row limit cut the answer', async () => {
    const cut = '2026-08-10T00:00:00.000Z';
    const server = makeServer();
    fetchJson = vi.fn(async (url) => {
      const answer = await server(url);

      return fetchJson.mock.calls.length === 1
        ? { ...answer, to: cut }
        : answer;
    });
    const history = make();

    await history.load('2026-08');

    expect(requests(fetchJson)).toEqual([
      '2026-08-01T00:00:00.000Z 2026-08-31T23:59:59.999Z',
      '2026-08-10T00:00:00.001Z 2026-08-31T23:59:59.999Z',
    ]);
  });

  it('does not load the same month twice at once', async () => {
    const history = make();

    await Promise.all([history.load('2026-08'), history.load('2026-08')]);

    expect(fetchJson).toHaveBeenCalledTimes(1);
  });

  it('rejects when the month cannot be loaded, and tries again later', async () => {
    fetchJson.mockRejectedValueOnce(new Error('offline'));
    const history = make();

    await expect(history.load('2026-08')).rejects.toThrow('offline');
    expect(history.getSnapshots('2026-08')).toBeNull();

    await history.load('2026-08');
    expect(history.getSnapshots('2026-08')).toHaveLength(1);
  });

  it('ignores an answer in another format', async () => {
    fetchJson.mockResolvedValue({ v: 2, to: LATEST, cuid: [] });
    const history = make();

    await expect(history.load('2026-08')).rejects.toThrow();
    expect(await db.get('veggli', '2026-08')).toBeUndefined();
  });

  it('drops the local copy when the data version has changed', async () => {
    await db.putMeta({ place: 'veggli', v: 0, usedAt: 1 });
    await db.put({ place: 'veggli', month: '2026-08', coveredTo: Infinity });

    const history = make();
    await history.load('2026-08');

    expect(fetchJson).toHaveBeenCalledTimes(1);
    expect((await db.getMeta('veggli')).v).toBe(1);
  });

  it('drops the local copy of a place the server does not have', async () => {
    await make().load('2026-07');
    fetchJson.mockRejectedValue(
      Object.assign(new Error('gone'), { status: 404 })
    );
    const history = make();
    await history.open();
    expect(history.getRecords()).toHaveLength(1);

    await expect(history.load('2026-08')).rejects.toThrow('gone');

    expect(await db.list('veggli')).toEqual([]);
    expect(history.getRecords()).toEqual([]);
    expect(history.getSnapshots('2026-07')).toBeNull();
  });

  it('removes places that have not been opened for a year', async () => {
    const year = 365 * 24 * 60 * 60 * 1000;
    await db.putMeta({ place: 'old', v: 1, usedAt: 0 });
    await db.put({ place: 'old', month: '2020-01', coveredTo: 1 });
    await db.putMeta({ place: 'recent', v: 1, usedAt: year });

    await make({ now: () => year + 1 }).open();
    await settle();

    expect(await db.list('old')).toEqual([]);
    expect(await db.getMeta('recent')).toBeDefined();
  });

  it('lists the months of a part of time, inside the history', () => {
    const history = make();

    expect(
      history.monthsBetween(
        time('2026-01-01T00:00:00Z'),
        time('2026-07-15T00:00:00Z')
      )
    ).toEqual(['2026-06', '2026-07']);
    expect(
      history.monthsBetween(
        time('2026-10-20T00:00:00Z'),
        time('2027-03-01T00:00:00Z')
      )
    ).toEqual(['2026-10', '2026-11']);
  });

  describe('backfill', () => {
    it('fills in the whole history, newest first', async () => {
      const history = make();

      history.startBackfill();
      await settle();

      expect(requests(fetchJson).map((r) => r.slice(0, 7))).toEqual([
        '2026-11',
        '2026-10',
        '2026-09',
        '2026-08',
        '2026-07',
        '2026-06',
      ]);
      expect(history.getProgress()).toEqual({ complete: 6, total: 6 });
    });

    it('starts with the month on screen', async () => {
      const history = make();

      history.setFocus(time('2026-07-20T00:00:00.000Z'));
      history.startBackfill();
      await settle();

      expect(
        requests(fetchJson)
          .map((r) => r.slice(0, 7))
          .slice(0, 3)
      ).toEqual(['2026-07', '2026-11', '2026-08']);
    });

    it('asks the server for nothing when everything is stored', async () => {
      make().startBackfill();
      await settle();
      fetchJson.mockClear();

      const history = make();
      history.startBackfill();
      await settle();

      expect(fetchJson).not.toHaveBeenCalled();
      expect(history.getProgress()).toEqual({ complete: 6, total: 6 });
    });

    it('runs at most two requests at a time', async () => {
      let open = 0;
      let most = 0;
      const server = makeServer();
      fetchJson = vi.fn(async (url) => {
        most = Math.max(most, ++open);
        await settle();
        open--;
        return server(url);
      });

      make().startBackfill();
      await vi.waitFor(() => expect(fetchJson).toHaveBeenCalledTimes(6));

      expect(most).toBe(2);
    });

    it('waits while paused', async () => {
      const history = make();

      history.setPaused(true);
      history.startBackfill();
      await settle();
      expect(fetchJson).not.toHaveBeenCalled();

      history.setPaused(false);
      await settle();
      expect(history.getProgress().complete).toBe(6);
    });

    it('stops after failures in a row', async () => {
      fetchJson.mockRejectedValue(new Error('offline'));

      make().startBackfill();
      await settle();

      expect(fetchJson.mock.calls.length).toBeLessThanOrEqual(4);
    });

    it('does not run when another tab has the lock', async () => {
      const locks = { request: vi.fn(async (name, options, run) => run(null)) };

      make({ locks }).startBackfill();
      await settle();

      expect(locks.request.mock.calls[0][0]).toBe('vaerhona-backfill:veggli');
      expect(fetchJson).not.toHaveBeenCalled();
    });

    it('runs with the lock, and gives it back when stopped', async () => {
      let released = false;
      const locks = {
        request: vi.fn(async (name, options, run) => {
          await run({});
          released = true;
        }),
      };
      const history = make({ locks });

      history.startBackfill();
      await settle();
      expect(history.getProgress().complete).toBe(6);
      expect(released).toBe(false);

      history.stopBackfill();
      await settle();
      expect(released).toBe(true);
    });

    it('does not start when it was stopped while waiting for the lock', async () => {
      let grant;
      const locks = {
        request: vi.fn(
          (name, options, run) =>
            new Promise((resolve) => {
              grant = () => resolve(run({}));
            })
        ),
      };
      const history = make({ locks });

      history.startBackfill();
      history.stopBackfill();
      grant();
      await settle();

      expect(fetchJson).not.toHaveBeenCalled();
    });

    it('tells listeners as months arrive', async () => {
      const history = make();
      const listener = vi.fn();
      history.subscribe(listener);

      history.startBackfill();
      await settle();

      expect(listener.mock.calls.length).toBeGreaterThanOrEqual(6);
    });
  });
});

describe('fetchValues', () => {
  const respond = (cacheControl, status = 200) =>
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response('{"v":1}', {
            status,
            headers: { 'cache-control': cacheControl },
          })
      )
    );

  it('gives values the server calls final', async () => {
    respond('public, max-age=31536000, immutable');

    expect(await fetchValues('/api/values')).toEqual({ v: 1 });
    vi.unstubAllGlobals();
  });

  it('refuses values that could still change, so they are never stored', async () => {
    respond('no-store');

    await expect(fetchValues('/api/values')).rejects.toThrow('not final');
    vi.unstubAllGlobals();
  });

  it('passes on the status of a failed request', async () => {
    respond('no-store', 404);

    await expect(fetchValues('/api/values')).rejects.toMatchObject({
      status: 404,
    });
    vi.unstubAllGlobals();
  });
});
