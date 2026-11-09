import {
  SNAPSHOT_LIST_PARAMS,
  SNAPSHOT_LIST_PATH,
} from './core/snapshot-list.js';
import { serveFromCache } from './edge-cache.js';

export function isSnapshotListRequest(request) {
  return (
    request.method === 'GET' &&
    new URL(request.url).pathname === SNAPSHOT_LIST_PATH
  );
}

function getCacheKey(request) {
  const url = new URL(request.url);
  const key = new URL(url.pathname, url.origin);

  for (const name of SNAPSHOT_LIST_PARAMS) {
    if (url.searchParams.has(name)) {
      key.searchParams.set(name, url.searchParams.get(name));
    }
  }

  return new Request(key.toString());
}

/**
 * The API decides which lists can never change, and marks them `immutable`
 * (see pages/api/snapshots.js). Only those are kept. Any other list could
 * leave out a snapshot that is uploaded later.
 */
export function serveCachedList({ request, ctx, cache, getList }) {
  return serveFromCache({
    name: 'list',
    key: getCacheKey(request),
    ctx,
    cache,
    getResponse: getList,
    toCacheable(list) {
      const cacheControl = list.headers.get('cache-control') ?? '';

      return list.status === 200 && cacheControl.includes('immutable')
        ? new Response(list.body, list)
        : null;
    },
  });
}
