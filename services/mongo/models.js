import { getDb } from '../init';
import { MODEL_NAMES } from './utils';
import { snapshotSchema, snapshotPlaceSchema } from './schemas';

const definitions = [
  [MODEL_NAMES.SNAPSHOT_PLACE, snapshotPlaceSchema],
  [MODEL_NAMES.SNAPSHOT, snapshotSchema],
];

/**
 * Registers all models on a connection. Both models must exist on the
 * connection before any query runs, since populate() looks them up by name.
 */
export function registerModels(connection) {
  for (const [name, schema] of definitions) {
    if (!connection.models[name]) {
      connection.model(name, schema);
    }
  }
}

/**
 * Returns a model bound to the current request's connection.
 * The proxy keeps the call sites unchanged (`snapshotModel.find(...)`).
 */
function currentModel(name) {
  return new Proxy(function () {}, {
    get(_, prop) {
      const model = getDb().models[name];
      const value = model[prop];
      return typeof value === 'function' ? value.bind(model) : value;
    },
    construct(_, args) {
      const Model = getDb().models[name];
      return new Model(...args);
    },
  });
}

export const snapshotModel = currentModel(MODEL_NAMES.SNAPSHOT);
export const snapshotPlaceModel = currentModel(MODEL_NAMES.SNAPSHOT_PLACE);
