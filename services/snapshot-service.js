import './init';
import { snapshotModel } from './mongo/models';
import { normalizeAndEnrichSnapshot } from './utils';

export const getLatestSnapshotForPlace = async place => {
  if (!place || !place.cuid) {
    throw new Error('Place is not defined correctly');
  }

  const snapshot = await snapshotModel
    .findOne({ placeCuid: place.cuid })
    .sort('-dateAdded')
    .exec();

  return normalizeAndEnrichSnapshot({ snapshot, place });
};

export const getSnapshots = async ({ limit = 10, place, from, to }) => {
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

  return snapshots.map(snapshot =>
    normalizeAndEnrichSnapshot({
      snapshot,
      place
    })
  );
};
