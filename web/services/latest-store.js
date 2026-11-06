import { getCloudflareContext } from '@opennextjs/cloudflare';

// Change the prefix when the record format changes. Old records then become
// misses instead of being read in the wrong shape.
const KEY_PREFIX = 'v1';

// R2 allows one write per second to the same key. The delete and the write of
// one upload can be closer than that, so the write may need another try.
const PUT_ATTEMPTS = 3;
const PUT_RETRY_DELAY_MS = 1100;

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

export async function removeLatestRecord(placeName) {
  const bucket = await getBucket();

  await bucket?.delete(getKey(placeName));
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

  for (let attempt = 1; ; attempt++) {
    try {
      await bucket.put(getKey(placeName), body, {
        httpMetadata: { contentType: 'application/json' },
      });
      return attempt;
    } catch (err) {
      if (attempt >= PUT_ATTEMPTS) {
        throw err;
      }
      await sleep(PUT_RETRY_DELAY_MS);
    }
  }
}

/**
 * @returns {Promise<object|null>} the stored record, or null if there is none
 */
export async function readLatestRecord(placeName) {
  const bucket = await getBucket();
  const object = await bucket?.get(getKey(placeName));

  return object ? object.json() : null;
}
