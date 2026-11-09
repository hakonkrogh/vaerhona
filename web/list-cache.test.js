import { beforeEach, describe, expect, it, vi } from 'vitest';

import { isSnapshotListRequest, serveCachedList } from './list-cache';

const LIST =
  'https://example.test/api/snapshots?place=veggli&to=2026-11-09T12%3A00%3A00.000Z&limit=168';
const FINAL = 'public, max-age=31536000, immutable';

function makeCache() {
  const stored = new Map();

  return {
    stored,
    match: vi.fn(async (key) => stored.get(key.url)?.clone()),
    put: vi.fn(async (key, response) => {
      stored.set(key.url, response);
    }),
  };
}

function listResponse(cacheControl, status = 200) {
  return new Response('{"snapshots":[]}', {
    status,
    headers: {
      'content-type': 'application/json',
      'cache-control': cacheControl,
    },
  });
}

describe('isSnapshotListRequest', () => {
  it('accepts a list request', () => {
    expect(isSnapshotListRequest(new Request(LIST))).toBe(true);
  });

  it('skips other paths and methods', () => {
    expect(
      isSnapshotListRequest(new Request('https://example.test/api/graphql'))
    ).toBe(false);
    expect(isSnapshotListRequest(new Request(LIST, { method: 'HEAD' }))).toBe(
      false
    );
  });
});

describe('serveCachedList', () => {
  let cache;
  let ctx;
  let getList;

  beforeEach(() => {
    cache = makeCache();
    ctx = { waitUntil: vi.fn() };
    getList = vi.fn(async () => listResponse(FINAL));
  });

  const serve = (url = LIST) =>
    serveCachedList({ request: new Request(url), ctx, cache, getList });

  it('keeps a final list and serves the next request from the cache', async () => {
    const miss = await serve();
    const hit = await serve();

    expect(miss.headers.get('x-list-cache')).toBe('miss');
    expect(hit.headers.get('x-list-cache')).toBe('hit');
    expect(hit.headers.get('cache-control')).toBe(FINAL);
    expect(await hit.text()).toBe('{"snapshots":[]}');
    expect(getList).toHaveBeenCalledTimes(1);
  });

  it('does not keep a list that could still change', async () => {
    getList.mockImplementation(async () => listResponse('no-store'));

    await serve();
    await serve();

    expect(cache.put).not.toHaveBeenCalled();
    expect(getList).toHaveBeenCalledTimes(2);
  });

  it('does not keep a failed request', async () => {
    getList.mockResolvedValue(listResponse(FINAL, 500));

    const response = await serve();

    expect(response.status).toBe(500);
    expect(cache.put).not.toHaveBeenCalled();
  });

  it('keeps different lists apart', async () => {
    await serve();
    await serve(LIST.replace('limit=168', 'limit=24'));

    expect(getList).toHaveBeenCalledTimes(2);
  });

  it('ignores query parameters that do not change the list', async () => {
    await serve();
    await serve(`${LIST}&unused=1`);

    expect(getList).toHaveBeenCalledTimes(1);
  });

  it('still serves the list when the cache read fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    cache.match.mockRejectedValue(new Error('cache down'));

    const response = await serve();

    expect(response.status).toBe(200);
  });
});
