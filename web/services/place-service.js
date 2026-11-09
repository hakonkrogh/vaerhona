import { snapshotPlaceModel } from './mongo/models';
import { normalizeAndEnrichSnapshot } from './utils';

function parsePlace(place) {
  if (place?.firstSnapshot) {
    place.firstSnapshot = normalizeAndEnrichSnapshot({
      snapshot: place.firstSnapshot,
      place,
    });
  }
  if (place?.lastSnapshot) {
    place.lastSnapshot.placeName = place.name;
  }

  return place;
}

export const getPlace = async ({ placeName }) => {
  const place = await snapshotPlaceModel
    .findOne({
      name: placeName,
    })
    .populate(['firstSnapshot', 'lastSnapshot'])
    .exec();

  return parsePlace(place);
};

/**
 * Only what is needed to query snapshots. The first and last snapshot are not
 * loaded, since every lookup is one more request to MongoDB.
 */
export const getPlaceForSnapshots = ({ placeName }) =>
  snapshotPlaceModel
    .findOne({
      name: placeName,
    })
    .select('cuid name')
    .lean()
    .exec();

// How many places the front page lists, both on the page and in the API.
export const TOP_PUBLIC_PLACES_LIMIT = 10;

// A place with no snapshot for this long is left off the front page (rule S1).
// Its page still works by URL.
const SHOWN_FOR_MS = 364 * 24 * 60 * 60 * 1000;

function hasRecentSnapshot(place, now) {
  const date = new Date(place.lastSnapshot?.dateAdded).getTime();

  return now - date <= SHOWN_FOR_MS;
}

/**
 * @param {boolean} [withFirstSnapshot] false skips loading the first snapshot,
 * which saves a request to MongoDB when it is not needed.
 */
export const getTopPublicPlaces = async ({
  limit,
  withFirstSnapshot = true,
}) => {
  const places = await snapshotPlaceModel
    .find({
      isPublic: true,
      lastSnapshot: {
        $ne: null,
      },
    })
    .populate(
      withFirstSnapshot ? ['firstSnapshot', 'lastSnapshot'] : 'lastSnapshot'
    )
    .sort({
      'lastSnapshot.dateAdded': 'desc',
    })
    .exec();
  const now = Date.now();

  // Filtered here, since the date is only known after populate. The limit
  // comes after, so old places do not take up its slots.
  // A missing snapshot document leaves lastSnapshot empty after populate.
  return places
    .filter((place) => place.lastSnapshot && hasRecentSnapshot(place, now))
    .slice(0, limit)
    .map(parsePlace);
};
