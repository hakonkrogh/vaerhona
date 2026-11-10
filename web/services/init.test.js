import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createConnection, registerModels, loads } = vi.hoisted(() => ({
  createConnection: vi.fn(),
  registerModels: vi.fn(),
  loads: { mongoose: 0 },
}));

// The factory runs the first time something imports mongoose, so the counter
// shows when mongoose would have been loaded.
vi.mock('mongoose', () => {
  loads.mongoose += 1;
  return { default: { createConnection } };
});
vi.mock('./mongo/register-models', () => ({ registerModels }));
vi.mock('./config', () => ({
  default: { environment: 'production', mongo: { url: 'mongodb://test/db' } },
}));
vi.mock('@opennextjs/cloudflare', () => ({ getCloudflareContext: vi.fn() }));

function fakeConnection() {
  const connection = { close: vi.fn().mockResolvedValue(undefined) };
  createConnection.mockReturnValue({ asPromise: async () => connection });
  return connection;
}

beforeEach(() => {
  vi.clearAllMocks();
});

// The order of these tests matters: the first one must run before anything
// has opened a connection.
describe('mongoose is loaded late', () => {
  it('is not loaded by the code behind the pages', async () => {
    await import('./place-page');
    await import('./front-page');
    await import('./latest-api');
    await import('./snapshot-list');
    await import('./snapshot-service');

    expect(loads.mongoose).toBe(0);
  });

  it('is loaded when a connection is opened', async () => {
    const connection = fakeConnection();
    const { runWithDb, getDb } = await import('./init');

    const result = await runWithDb(async () => getDb());

    expect(loads.mongoose).toBe(1);
    expect(result).toBe(connection);
    expect(registerModels).toHaveBeenCalledWith(connection);
    expect(connection.close).toHaveBeenCalledTimes(1);
  });
});

describe('runWithDb', () => {
  it('closes the connection when the work fails', async () => {
    const connection = fakeConnection();
    const { runWithDb } = await import('./init');

    await expect(
      runWithDb(async () => {
        throw new Error('query failed');
      })
    ).rejects.toThrow('query failed');
    expect(connection.close).toHaveBeenCalledTimes(1);
  });

  it('has no connection outside runWithDb', async () => {
    const { getDb } = await import('./init');

    expect(() => getDb()).toThrow('No MongoDB connection');
  });
});
