import { runWithDb } from './init';
import { buildLatestRecord } from './latest-snapshot';
import { readLatestRecord } from './latest-store';
import { snapshotPlaceModel } from './mongo/models';

// See docs/latest-snapshot-design.md. A record this old is not trusted, which
// limits the damage from a failure nobody planned for. Boxes upload every hour.
const MAX_RECORD_AGE_MS = 90 * 60 * 1000;
const RECORD_READ_TIMEOUT_MS = 500;

function isUsable(record) {
  const date = new Date(record?.lastSnapshot?.date).getTime();

  return Date.now() - date < MAX_RECORD_AGE_MS;
}

/**
 * @returns {Promise<object|null>} the record, or null if it cannot be read in
 * time. A problem here must only make the page slower, never break it.
 */
async function readRecord(placeName) {
  let timer;

  try {
    return await Promise.race([
      readLatestRecord(placeName),
      new Promise((resolve) => {
        timer = setTimeout(() => resolve(null), RECORD_READ_TIMEOUT_MS);
      }),
    ]);
  } catch (err) {
    console.error(`[latest] place=${placeName} record read failed`, err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function readFromMongo(placeName) {
  return runWithDb(async () => {
    const place = await snapshotPlaceModel
      .findOne({ name: placeName })
      .populate(['firstSnapshot', 'lastSnapshot'])
      .exec();

    return place
      ? buildLatestRecord({
          place,
          firstSnapshot: place.firstSnapshot,
          lastSnapshot: place.lastSnapshot,
        })
      : null;
  });
}

/**
 * The place page's data: the latest snapshot record if it can be trusted, and
 * MongoDB otherwise. This must never write the record. If it did, a page view
 * that read MongoDB just before an upload could overwrite the newer record.
 *
 * @returns {Promise<object|null>} null if there is no such place
 */
export async function getPlaceForPage(placeName) {
  const record = await readRecord(placeName);

  if (isUsable(record)) {
    console.log(`[latest] place=${placeName} source=record`);
    return record;
  }

  console.log(`[latest] place=${placeName} source=mongo`);
  return readFromMongo(placeName);
}
