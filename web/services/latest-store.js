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

// The names of the places the front page shows. See
// docs/front-page-records-design.md.
const FRONT_PAGE_KEY = 'front-page/v1.json';

function getKey(placeName) {
  return `${KEY_PREFIX}/${placeName}.json`;
}

function getPlaceName(key) {
  return key.slice(KEY_PREFIX.length + 1, -'.json'.length);
}

const JSON_METADATA = { httpMetadata: { contentType: 'application/json' } };

/**
 * Resolves to null if the read takes longer than `ms`. A slow read must only
 * make a page fall back to MongoDB, never hold it up.
 */
export async function withTimeout(promise, ms) {
  let timer;

  try {
    return await Promise.race([
      promise,
      new Promise((resolve) => {
        timer = setTimeout(() => resolve(null), ms);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
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

  return withRetry(() => bucket.put(getKey(placeName), body, JSON_METADATA));
}

/**
 * Writes the record only if it has not changed since `etag` was read, or,
 * with no etag, only if there is still no record. R2 checks this as part of
 * the write, so a write that loses a race with an upload is refused.
 *
 * @returns {Promise<boolean>} false if the write was refused
 */
export async function putLatestRecordIfUnchanged(placeName, record, etag) {
  const bucket = await getBucket();

  if (!bucket) {
    return false;
  }

  const stored = await bucket.put(getKey(placeName), JSON.stringify(record), {
    ...JSON_METADATA,
    onlyIf: etag
      ? { etagMatches: etag }
      : new Headers({ 'If-None-Match': '*' }),
  });

  return stored !== null;
}

/**
 * @returns {Promise<Map<string, string>>} the etag of every stored record, by
 * place name. An etag changes on every write.
 */
export async function listRecordEtags() {
  const bucket = await getBucket();
  const etags = new Map();
  let cursor;

  do {
    const page = await bucket?.list({ prefix: `${KEY_PREFIX}/`, cursor });

    for (const object of page?.objects ?? []) {
      etags.set(getPlaceName(object.key), object.etag);
    }
    cursor = page?.truncated ? page.cursor : undefined;
  } while (cursor);

  return etags;
}

export async function putFrontPageList(list) {
  const bucket = await getBucket();
  const body = JSON.stringify(list);

  await bucket?.put(FRONT_PAGE_KEY, body, JSON_METADATA);
}

/**
 * @returns {Promise<object|null>} the stored list, or null if there is none
 */
export async function readFrontPageList() {
  const bucket = await getBucket();
  const object = await bucket?.get(FRONT_PAGE_KEY);

  return object ? object.json() : null;
}

/**
 * @returns {Promise<object|null>} the stored record, or null if there is none
 */
export async function readLatestRecord(placeName) {
  const bucket = await getBucket();
  const object = await bucket?.get(getKey(placeName));

  return object ? object.json() : null;
}
