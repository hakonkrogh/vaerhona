import { Schema } from 'mongoose';

import { MODEL_NAMES } from './utils';

export const snapshotPlaceSchema = new Schema({
  cuid: { type: 'String', required: true },
  name: { type: 'String', required: true },
  isPublic: { type: 'Boolean', required: true, default: false },
  firstSnapshot: { type: Schema.Types.ObjectId, ref: MODEL_NAMES.SNAPSHOT },
  firstSnapshotDate: { type: 'Date' },
  lastSnapshot: { type: Schema.Types.ObjectId, ref: MODEL_NAMES.SNAPSHOT },
  lastSnapshotDate: { type: 'Date' }
});

export const snapshotSchema = new Schema({
  cuid: { type: 'String', required: true },
  placeCuid: { type: 'String', required: true },
  temperature: { type: 'Number', required: true },
  humidity: { type: 'Number', required: true },
  pressure: { type: 'Number', required: true },
  dateAdded: { type: 'Date', default: Date.now, required: true }
});
