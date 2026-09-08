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
  const connection = await mongoose
    .createConnection(config.mongo.url, {
      maxPoolSize: 1,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 10000,
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
