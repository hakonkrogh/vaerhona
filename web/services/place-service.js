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
    .limit(limit)
    .sort({
      'lastSnapshot.dateAdded': 'desc',
    })
    .exec();

  return places.map(parsePlace);
};
