import { latestByPlace } from '../core/use-refresh-when-newer';

import { getFrontPageProps } from './front-page';
import { getPlaceForPage } from './place-page';

/**
 * GET /api/latest              the newest snapshot id of each front page place
 * GET /api/latest?place=veggli the newest snapshot id of one place
 *
 * Answers { latest: { <place name>: <snapshot cuid> } }. An open page asks this
 * when it becomes visible again, and reloads its data if something is newer.
 * It reads the latest snapshot records, with MongoDB as the fallback, the same
 * way as the pages, so it never disagrees with them.
 */
export async function handleLatestRequest(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end();
  }

  // The answer changes with every upload (rule F3 in SPEC.md).
  res.setHeader('Cache-Control', 'no-store');

  const { place } = req.query;

  if (place !== undefined && (typeof place !== 'string' || !place)) {
    return res.status(400).json({ error: 'Invalid place' });
  }

  try {
    if (place) {
      const found = await getPlaceForPage(place);

      if (!found) {
        return res.status(404).json({ error: 'No such place' });
      }

      return res
        .status(200)
        .json({ latest: { [found.name]: found.lastSnapshot?.cuid ?? null } });
    }

    const { places } = await getFrontPageProps();

    if (!places) {
      return res.status(503).json({ error: 'Could not read places' });
    }

    return res.status(200).json({
      latest: latestByPlace(places),
    });
  } catch (err) {
    console.error(`[latest-api] place=${place ?? '(front page)'} failed`, err);
    return res.status(500).json({ error: 'Could not read the latest' });
  }
}
