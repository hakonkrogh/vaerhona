import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { getCloudflareContext } = vi.hoisted(() => ({
  getCloudflareContext: vi.fn(),
}));

vi.mock('@opennextjs/cloudflare', () => ({ getCloudflareContext }));

import {
  putLatestRecord,
  readLatestRecord,
  removeLatestRecord,
} from './latest-store';

describe('latest-store', () => {
  let bucket;

  beforeEach(() => {
    vi.useFakeTimers();
    bucket = { delete: vi.fn(), put: vi.fn(), get: vi.fn() };
    getCloudflareContext.mockResolvedValue({
      env: { LATEST_R2_BUCKET: bucket },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('uses a versioned key per place', async () => {
    await removeLatestRecord('veggli');

    expect(bucket.delete).toHaveBeenCalledWith('v1/veggli.json');
  });

  it('retries a failed remove', async () => {
    bucket.delete.mockRejectedValueOnce(new Error('500')).mockResolvedValue();

    const removed = removeLatestRecord('veggli');
    await vi.advanceTimersByTimeAsync(1100);

    await expect(removed).resolves.toBeUndefined();
    expect(bucket.delete).toHaveBeenCalledTimes(2);
  });

  it('throws when every remove fails', async () => {
    bucket.delete.mockRejectedValue(new Error('R2 down'));

    const removed = removeLatestRecord('veggli').catch((err) => err);
    await vi.advanceTimersByTimeAsync(2200);

    expect((await removed).message).toBe('R2 down');
    expect(bucket.delete).toHaveBeenCalledTimes(3);
  });

  it('retries a failed write after the rate limit window', async () => {
    bucket.put.mockRejectedValueOnce(new Error('429')).mockResolvedValue({});

    const attempts = putLatestRecord('veggli', { name: 'veggli' });
    await vi.advanceTimersByTimeAsync(1100);

    await expect(attempts).resolves.toBe(2);
    expect(bucket.put).toHaveBeenCalledTimes(2);
  });

  it('throws when every write fails', async () => {
    bucket.put.mockRejectedValue(new Error('429'));

    const attempts = putLatestRecord('veggli', {}).catch((err) => err);
    await vi.advanceTimersByTimeAsync(2200);

    expect((await attempts).message).toBe('429');
    expect(bucket.put).toHaveBeenCalledTimes(3);
  });

  it('returns null when there is no record', async () => {
    bucket.get.mockResolvedValue(null);

    await expect(readLatestRecord('veggli')).resolves.toBeNull();
  });

  it('returns the stored record', async () => {
    bucket.get.mockResolvedValue({ json: async () => ({ name: 'veggli' }) });

    await expect(readLatestRecord('veggli')).resolves.toEqual({
      name: 'veggli',
    });
  });

  it('does nothing without the binding', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    getCloudflareContext.mockResolvedValue({ env: {} });

    await expect(removeLatestRecord('veggli')).resolves.toBeUndefined();
    await expect(putLatestRecord('veggli', {})).resolves.toBe(0);
    await expect(readLatestRecord('veggli')).resolves.toBeNull();
  });
});
