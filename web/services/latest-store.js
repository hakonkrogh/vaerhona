import { getCloudflareContext } from '@opennextjs/cloudflare';

// Change the prefix when the record format changes. Old records then become
// misses instead of being read in the wrong shape.
const KEY_PREFIX = 'v1';

// R2 allows one write per second to the same key. The delete and the write of
// one upload can be closer than that, so each may need another try. A failed
// delete also stops the upload from publishing, so a brief error should not
// be final.
const ATTEMPTS = 3;
const RETRY_DELAY_MS = 1100;

function getKey(placeName) {
  return `${KEY_PREFIX}/${placeName}.json`;
}

async function getBucket() {
  const { env } = await getCloudflareContext({ async: true });

  // Without the binding there is no record that could go stale, so uploads
  // should still publish.
  if (!env.LATEST_R2_BUCKET) {
    console.warn('[latest] LATEST_R2_BUCKET binding is not defined');
    return null;
  }

  return env.LATEST_R2_BUCKET;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @returns {Promise<number>} how many tries it took
 */
async function withRetry(operation) {
  for (let attempt = 1; ; attempt++) {
    try {
      await operation();
      return attempt;
    } catch (err) {
      if (attempt >= ATTEMPTS) {
        throw err;
      }
      await sleep(RETRY_DELAY_MS);
    }
  }
}

export async function removeLatestRecord(placeName) {
  const bucket = await getBucket();

  if (bucket) {
    await withRetry(() => bucket.delete(getKey(placeName)));
  }
}

/**
 * @returns {Promise<number>} how many tries the write took
 */
export async function putLatestRecord(placeName, record) {
  const bucket = await getBucket();

  if (!bucket) {
    return 0;
  }

  const body = JSON.stringify(record);

  return withRetry(() =>
    bucket.put(getKey(placeName), body, {
      httpMetadata: { contentType: 'application/json' },
    })
  );
}

/**
 * @returns {Promise<object|null>} the stored record, or null if there is none
 */
export async function readLatestRecord(placeName) {
  const bucket = await getBucket();
  const object = await bucket?.get(getKey(placeName));

  return object ? object.json() : null;
}
