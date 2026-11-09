// The snapshot list API. The place page builds these URLs, the API route reads
// them, and the Worker uses them as cache keys.

export const SNAPSHOT_LIST_PATH = '/api/snapshots';

// Only these change the answer, so the cache key uses only these.
export const SNAPSHOT_LIST_PARAMS = ['place', 'from', 'to', 'limit'];

// Boxes upload about once an hour, so this is about a week.
export const WEEK_OF_SNAPSHOTS = 168;

/**
 * @param {object} query
 * @param {string} query.place
 * @param {Date|string|number} [query.from] start of the list, included
 * @param {Date|string|number} query.to end of the list, included
 * @param {number} query.limit
 */
export function snapshotListUrl({ place, from, to, limit }) {
  const params = new URLSearchParams();

  params.set('place', place);
  if (from != null) {
    params.set('from', new Date(from).toISOString());
  }
  params.set('to', new Date(to).toISOString());
  params.set('limit', String(limit));

  return `${SNAPSHOT_LIST_PATH}?${params}`;
}
