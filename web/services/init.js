import { AsyncLocalStorage } from 'node:async_hooks';
import mongoose from 'mongoose';

import config from './config';
import { registerModels } from './mongo/models';

const dbStorage = new AsyncLocalStorage();

/**
 * Opens a MongoDB connection for the duration of `fn` and closes it after.
 *
 * On Cloudflare Workers a socket belongs to the request that opened it, so a
 * connection cannot be cached across requests. Each request gets its own
 * connection, exposed to the models through AsyncLocalStorage.
 */
export async function runWithDb(fn) {
  // Checked here and not when the module loads, because `next build` loads this
  // module and CI has no database secrets at build time.
  if (!config.mongo.url) {
    throw new Error('process.env.MONGO_DB_URI is not set');
  }

  const connection = await mongoose
    .createConnection(config.mongo.url, {
      maxPoolSize: 1,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 10000,
      // Every request opens a new connection, so these would each add requests
      // to MongoDB every time. Indexes are created by a script instead, and
      // MongoDB creates a missing collection on the first insert.
      autoIndex: false,
      autoCreate: false,
    })
    .asPromise();

  registerModels(connection);

  try {
    return await dbStorage.run(connection, fn);
  } finally {
    await connection.close().catch((err) => {
      console.error('MongoDB close error:', err);
    });
  }
}

export function getDb() {
  const connection = dbStorage.getStore();

  if (!connection) {
    throw new Error('No MongoDB connection. Wrap the call in runWithDb().');
  }

  return connection;
}
