import './init';
import { snapshotPlaceModel } from './mongo/models';

function parsePlace(place) {
  if (place.firstSnapshot) {
    place.firstSnapshot.placeName = place.name;
  }
  if (place.lastSnapshot) {
    place.lastSnapshot.placeName = place.name;
  }

  return place;
}

export const getPlace = async ({ placeName, populateSnapshotFields }) => {
  const place = await snapshotPlaceModel
    .findOne({
      name: placeName,
    })
    .populate(
      populateSnapshotFields ? ['firstSnapshot', 'lastSnapshot'] : undefined
    )
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
