import { model, Schema } from 'mongoose';

export const MODEL_NAMES = Object.freeze({
  SNAPSHOT_PLACE: 'SnapshotPlace',
  SNAPSHOT: 'Snapshot'
});

const snapshotPlaceSchema = new Schema({
  cuid: { type: 'String', required: true },
  name: { type: 'String', required: true },
  isPublic: { type: 'Boolean', required: true, default: false },
  firstSnapshot: { type: Schema.Types.ObjectId, ref: MODEL_NAMES.SNAPSHOT },
  firstSnapshotDate: { type: 'Date' },
  lastSnapshot: { type: Schema.Types.ObjectId, ref: MODEL_NAMES.SNAPSHOT },
  lastSnapshotDate: { type: 'Date' }
});

const snapshotSchema = new Schema({
  cuid: { type: 'String', required: true },
  placeCuid: { type: 'String', required: true },
  temperature: { type: 'Number', required: true },
  humidity: { type: 'Number', required: true },
  pressure: { type: 'Number', required: true },
  dateAdded: { type: 'Date', default: Date.now, required: true }
});

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
