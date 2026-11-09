import { runWithDb } from './init';
import { buildLatestRecord, isRecordTrusted } from './latest-snapshot';
import { readLatestRecord, withTimeout } from './latest-store';
import { snapshotPlaceModel } from './mongo/models';

const RECORD_READ_TIMEOUT_MS = 500;

/**
 * @returns {Promise<object|null>} the record, or null if it cannot be read in
 * time. A problem here must only make the page slower, never break it.
 */
async function readRecord(placeName) {
  try {
    return await withTimeout(
      readLatestRecord(placeName),
      RECORD_READ_TIMEOUT_MS
    );
  } catch (err) {
    console.error(`[latest] place=${placeName} record read failed`, err);
    return null;
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
          confirmedAt: new Date().toISOString(),
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

  if (isRecordTrusted(record)) {
    console.log(`[latest] place=${placeName} source=record`);
    return record;
  }

  console.log(`[latest] place=${placeName} source=mongo`);
  return readFromMongo(placeName);
}
