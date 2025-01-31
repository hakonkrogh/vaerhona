import './init';
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

export const getTopPublicPlaces = async ({ limit }) => {
  const places = await snapshotPlaceModel
    .find({
      isPublic: true,
      lastSnapshot: {
        $ne: null,
      },
    })
    .populate(['firstSnapshot', 'lastSnapshot'])
    .limit(limit)
    .sort({
      'lastSnapshot.dateAdded': 'desc',
    })
    .exec();

  return places.map(parsePlace);
};
