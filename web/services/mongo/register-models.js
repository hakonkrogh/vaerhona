import { MODEL_NAMES } from './utils';
import { snapshotSchema, snapshotPlaceSchema } from './schemas';

const definitions = [
  [MODEL_NAMES.SNAPSHOT_PLACE, snapshotPlaceSchema],
  [MODEL_NAMES.SNAPSHOT, snapshotSchema],
];

/**
 * Registers all models on a connection. Both models must exist on the
 * connection before any query runs, since populate() looks them up by name.
 *
 * This file imports mongoose through the schemas, so only runWithDb() may
 * import it, and only with import(). See the comment there.
 */
export function registerModels(connection) {
  for (const [name, schema] of definitions) {
    if (!connection.models[name]) {
      connection.model(name, schema);
    }
  }
}
