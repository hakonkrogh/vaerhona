import { getDb } from '../init';
import { MODEL_NAMES } from './utils';

// This file must not import mongoose, not even through another file. Pages
// that read a record import it without ever using MongoDB. The schemas are in
// register-models.js, which runWithDb() loads when a connection is opened.

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
