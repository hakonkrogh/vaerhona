import { runWithDb } from './init';
import { getTopPublicPlaces, TOP_PUBLIC_PLACES_LIMIT } from './place-service';
import { getSnapshotImageUrl } from './snapshot-view';

function toFrontPagePlace(place) {
  const snapshot = place.lastSnapshot;

  return {
    cuid: place.cuid,
    name: place.name,
    lastSnapshot: {
      cuid: snapshot.cuid,
      date: new Date(snapshot.dateAdded).toISOString(),
      image: getSnapshotImageUrl({
        placeName: place.name,
        dateAdded: snapshot.dateAdded,
        cuid: snapshot.cuid,
      }),
      placeName: place.name,
    },
  };
}

/**
 * The front page's data, read from MongoDB on every request. It does not use
 * the latest snapshot records, because a place with no recent upload has no
 * record, and the front page lists those places too.
 *
 * These are the same places, in the same order, as the `places` API query.
 */
export function getPlacesForFrontPage() {
  return runWithDb(async () => {
    const places = await getTopPublicPlaces({
      limit: TOP_PUBLIC_PLACES_LIMIT,
      withFirstSnapshot: false,
    });

    // A missing snapshot document leaves lastSnapshot empty after populate.
    return places.filter((place) => place.lastSnapshot).map(toFrontPagePlace);
  });
}

/**
 * @returns {Promise<{ places: object[] | null }>} places is null if they could
 * not be read. The page then shows an error instead of failing.
 */
export async function getFrontPageProps() {
  try {
    return { places: await getPlacesForFrontPage() };
  } catch (err) {
    console.error('[front-page] places read failed', err);
    return { places: null };
  }
}
