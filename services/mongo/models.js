import { model } from 'mongoose';

import { MODEL_NAMES } from './utils';
import { snapshotSchema, snapshotPlaceSchema } from './schemas';

/**
 * Due to how `now dev` works, we have to declare
 * the models in this verbose fashion. If `now dev`
 * changes in the future, we can write it like this:
 * export const snapshotModel = model(MODEL_NAMES.SNAPSHOT, snapshotSchema);
 */
let _snapshotPlaceModel;
let _snapshotModel;

try {
  _snapshotPlaceModel = model(MODEL_NAMES.SNAPSHOT_PLACE, snapshotPlaceSchema);
} catch (err) {
  _snapshotPlaceModel = model(MODEL_NAMES.SNAPSHOT_PLACE);
}

try {
  _snapshotModel = model(MODEL_NAMES.SNAPSHOT, snapshotSchema);
} catch (err) {
  _snapshotModel = model(MODEL_NAMES.SNAPSHOT);
}

export const snapshotModel = _snapshotModel;
export const snapshotPlaceModel = _snapshotPlaceModel;
