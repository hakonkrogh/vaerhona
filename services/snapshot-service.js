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
      $gte: from
    };
    if (to) {
      whereFilter.dateAdded.$lte = to;
    }
  } else if (to) {
    whereFilter.dateAdded = {
      $lte: to
    };
  }

  const snapshots = await snapshotModel
    .find(whereFilter)
    .sort('-dateAdded')
    .limit(limit)
    .exec();

  return snapshots
    .map(snapshot =>
      normalizeAndEnrichSnapshot({
        snapshot,
        place
      })
    )
    .sort(byDateAscending);
}

export async function addSnapshot({ placeCuid, imageBase64, ...snapshotBody }) {
  // Get place
  const place = await snapshotPlaceModel
    .findOne({
      cuid: placeCuid
    })
    .exec();

  if (!place) {
    throw new Error(`Place with cuid "${placeCuid}" not found`);
  }

  // Add snapshot
  const snapshot = new snapshotModel({
    placeCuid,
    cuid: generateCuid(),
    dateAdded: Date.now(),
    ...snapshotBody
  });

  const saveResponse = await snapshot.save();

  // Save image
  if (imageBase64) {
    await saveImageFromSnapshot({ place, snapshot, image: imageBase64 });
  }

  // Update the place with the last snapshot
  await place
    .updateOne({
      lastSnapshot: saveResponse._id
    })
    .exec();

  return saveResponse;
}
