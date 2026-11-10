import {
  SNAPSHOT_LIST_PARAMS,
  SNAPSHOT_LIST_PATH,
} from './core/snapshot-list.js';
import {
  SNAPSHOT_VALUES_PARAMS,
  SNAPSHOT_VALUES_PATH,
} from './core/snapshot-values.js';
import { serveFromCache } from './edge-cache.js';

// The APIs that answer with snapshots for a part of time, and the query
// parameters that change each answer.
const LIST_PARAMS = {
  [SNAPSHOT_LIST_PATH]: SNAPSHOT_LIST_PARAMS,
  [SNAPSHOT_VALUES_PATH]: SNAPSHOT_VALUES_PARAMS,
};

export function isSnapshotListRequest(request) {
  return (
    request.method === 'GET' &&
    Object.hasOwn(LIST_PARAMS, new URL(request.url).pathname)
  );
}

function getCacheKey(request) {
  const url = new URL(request.url);
  const key = new URL(url.pathname, url.origin);

  for (const name of LIST_PARAMS[url.pathname]) {
    if (url.searchParams.has(name)) {
      key.searchParams.set(name, url.searchParams.get(name));
    }
  }

  return new Request(key.toString());
}

/**
 * The API decides which lists can never change, and marks them `immutable`
 * (see pages/api/snapshots.js and pages/api/values.js). Only those are kept. Any other list could
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
