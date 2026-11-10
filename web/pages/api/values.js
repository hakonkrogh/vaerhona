import {
  getSnapshotValues,
  parseValuesQuery,
} from '../../services/snapshot-values';

// Final values never change (see services/snapshot-values.js). worker.js also
// keeps them in the Cloudflare cache, see list-cache.js.
const FINAL_CACHE_CONTROL = 'public, max-age=31536000, immutable';

/**
 * GET /api/values?place=veggli&from=<ISO date>&to=<ISO date>&v=1
 *
 * The values of every snapshot in a part of time, at most 31 days, in columns.
 * The place page fills the browser's local database with this, a month at a
 * time. `v` must be the current data version (see core/snapshot-values.js).
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end();
  }

  res.setHeader('Cache-Control', 'no-store');

  const query = parseValuesQuery(req.query);

  if (!query) {
    return res.status(400).json({ error: 'Invalid query' });
  }

  try {
    const result = await getSnapshotValues(query);

    if (!result) {
      return res.status(404).json({ error: 'No such place' });
    }

    if (result.final) {
      res.setHeader('Cache-Control', FINAL_CACHE_CONTROL);
    }

    return res.status(200).json(result.values);
  } catch (err) {
    console.error(`[values] place=${query.placeName} read failed`, err);
    return res.status(500).json({ error: 'Could not read values' });
  }
}
