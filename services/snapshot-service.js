import generateCuid from 'cuid';

import './init';
import { snapshotModel, snapshotPlaceModel } from './mongo/models';
import { normalizeAndEnrichSnapshot } from './utils';
import { saveImageFromSnapshot } from './aws/s3';

function byDateAscending(a, b) {
  return new Date(a.dateAdded) - new Date(b.dateAdded);
}

export async function getSnapshots({ limit = 10, place, from, to }) {
  const whereFilter = { placeCuid: place.cuid };
  if (from) {
    whereFilter.dateAdded = {
      $gte: from,
    };
    if (to) {
      whereFilter.dateAdded.$lte = to;
    }
  } else if (to) {
    whereFilter.dateAdded = {
      $lte: to,
    };
  }

  const inst = snapshotModel.find(whereFilter);

  if (!to || !from) {
    inst.limit(limit);
  }

  if (to && !from) {
    inst.sort('-dateAdded');
  }

  const snapshots = await inst.exec();

  return snapshots
    .map((snapshot) =>
      normalizeAndEnrichSnapshot({
        snapshot,
        place,
      })
    )
    .sort(byDateAscending);
}

export async function addSnapshot({ boxId, image, ...snapshotBody }) {
  const boxIdTrimmed = boxId.trim().replace(/\/n/g, '');

  // Get place
  let place = await snapshotPlaceModel
    .findOne({
      boxId: boxIdTrimmed,
    })
    .exec();

  // Fallback to test place if box is not paired
  let isTestPlace = false;
  if (!place) {
    place = await snapshotPlaceModel
      .findOne({
        name: 'test',
      })
      .exec();
    isTestPlace = true;
  }

  console.log('addSnapshot', { boxIdTrimmed, isTestPlace, place: place?._id });

  if (!place) {
    throw new Error('Place 404');
  }

  // Add snapshot
  const snapshot = new snapshotModel({
    place: place._id,
    placeCuid: place.cuid,
    cuid: generateCuid(),
    dateAdded: Date.now(),
    ...snapshotBody,
    temperature: snapshotBody.temperature.toFixed(2),
    humidity: snapshotBody.humidity.toFixed(2),
    ...(isTestPlace && { boxId }),
  });

  const saveResponse = await snapshot.save();

  // Save image
  if (image) {
    await saveImageFromSnapshot({ place, snapshot, image });
  }

  // Update the place with the last snapshot
  await place
    .updateOne({
      lastSnapshot: saveResponse._id,
    })
    .exec();

  return saveResponse;
}

export async function addSnapshotLegacy({
  placeCuid,
  imageBase64,
  ...snapshotBody
}) {
  // Get place
  const place = await snapshotPlaceModel
    .findOne({
      cuid: placeCuid,
    })
    .exec();

  // Fallback to test place if box is not paired
  if (!place) {
    place = await snapshotPlaceModel
      .findOne({
        name: 'test',
      })
      .exec();
  }

  // Add snapshot
  const snapshot = new snapshotModel({
    placeCuid,
    cuid: generateCuid(),
    dateAdded: Date.now(),
    ...snapshotBody,
  });

  const saveResponse = await snapshot.save();

  // Save image
  if (imageBase64) {
    await saveImageFromSnapshot({ place, snapshot, image: imageBase64 });
  }

  // Update the place with the last snapshot
  await place
    .updateOne({
      lastSnapshot: saveResponse._id,
    })
    .exec();

  return saveResponse;
}
