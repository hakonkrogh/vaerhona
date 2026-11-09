import { getSnapshotList, parseListQuery } from '../../services/snapshot-list';

// A final list never changes (see services/snapshot-list.js). worker.js also
// keeps it in the Cloudflare cache, see list-cache.js.
const FINAL_CACHE_CONTROL = 'public, max-age=31536000, immutable';

/**
 * GET /api/snapshots?place=veggli&to=<ISO date>&limit=168[&from=<ISO date>]
 *
 * The place page uses this to browse snapshots. The answer has the snapshots
 * oldest first, and `from` and `to` for the part of time it covers completely.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end();
  }

  res.setHeader('Cache-Control', 'no-store');

  const query = parseListQuery(req.query);

  if (!query) {
    return res.status(400).json({ error: 'Invalid query' });
  }

  try {
    const result = await getSnapshotList(query);

    if (!result) {
      return res.status(404).json({ error: 'No such place' });
    }

    if (result.final) {
      res.setHeader('Cache-Control', FINAL_CACHE_CONTROL);
    }

    return res.status(200).json(result.list);
  } catch (err) {
    console.error(`[snapshots] place=${query.placeName} read failed`, err);
    return res.status(500).json({ error: 'Could not read snapshots' });
  }
}
