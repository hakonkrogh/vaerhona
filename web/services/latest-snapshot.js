import { snapshotModel } from './mongo/models';
import {
  listRecordEtags,
  putFrontPageList,
  putLatestRecord,
  putLatestRecordIfUnchanged,
  readLatestRecord,
  removeLatestRecord,
} from './latest-store';
import { getTopPublicPlaces, TOP_PUBLIC_PLACES_LIMIT } from './place-service';
import { getSnapshotImageUrl, getWindDirectionCompass } from './snapshot-view';
import { normalizeAndEnrichSnapshot } from './utils';

// A record is trusted only if it was checked against MongoDB this recently.
// This limits the damage from a failure nobody planned for. Boxes upload every
// hour. See docs/latest-snapshot-design.md and docs/front-page-records-design.md.
const MAX_RECORD_AGE_MS = 90 * 60 * 1000;

// A box with no upload for this long counts as quiet. Only then may another
// upload create its missing record. For an active box, a missing record means
// its own upload failed to write it, and it stays missing until the next one.
const QUIET_AFTER_MS = 24 * 60 * 60 * 1000;

function isRecent(isoDate, now) {
  return now - new Date(isoDate).getTime() < MAX_RECORD_AGE_MS;
}

/**
 * True if the record was checked against MongoDB in the last 90 minutes.
 * Records written before confirmedAt existed use their snapshot date.
 */
export function isRecordTrusted(record, now = Date.now()) {
  return isRecent(record?.confirmedAt ?? record?.lastSnapshot?.date, now);
}

/**
 * True if the front page list was written by an upload in the last 90 minutes.
 */
export function isFrontPageListTrusted(list, now = Date.now()) {
  return Array.isArray(list?.places) && isRecent(list.writtenAt, now);
}

function finiteOrNull(value) {
  return Number.isFinite(value) ? value : null;
}

function toRecordYrWeather(yrWeather) {
  if (!yrWeather) {
    return null;
  }

  return {
    airTemperature: finiteOrNull(yrWeather.airTemperature),
    windSpeed: finiteOrNull(yrWeather.windSpeed),
    windFromDirection: finiteOrNull(yrWeather.windFromDirection),
    windSpeedOfGust: finiteOrNull(yrWeather.windSpeedOfGust),
    airPressureAtSeaLevel: finiteOrNull(yrWeather.airPressureAtSeaLevel),
    cloudAreaFraction: finiteOrNull(yrWeather.cloudAreaFraction),
    dewPointTemperature: finiteOrNull(yrWeather.dewPointTemperature),
    relativeHumidity: finiteOrNull(yrWeather.relativeHumidity),
    windDirectionCompass: getWindDirectionCompass(yrWeather.windFromDirection),
  };
}

function toRecordSnapshot(snapshot, placeName) {
  return {
    cuid: snapshot.cuid,
    date: new Date(snapshot.dateAdded).toISOString(),
    temperature: finiteOrNull(snapshot.temperature),
    pressure: finiteOrNull(snapshot.pressure),
    humidity: finiteOrNull(snapshot.humidity),
    image: getSnapshotImageUrl({
      placeName,
      dateAdded: snapshot.dateAdded,
      cuid: snapshot.cuid,
    }),
    yrWeather: toRecordYrWeather(snapshot.yrWeather),
  };
}

/**
 * The record has the fields the place page uses from the PLACE query, in the
 * same shape. It leaves out isPublic, which the page does not read.
 * The first snapshot is normalized and the last one is not, because that is
 * how services/place-service.js returns them.
 *
 * @param {string} confirmedAt when the data was read from MongoDB, as an ISO
 * date. Only code that has just read MongoDB may set it.
 */
export function buildLatestRecord({
  place,
  firstSnapshot,
  lastSnapshot,
  confirmedAt,
}) {
  return {
    cuid: place.cuid,
    name: place.name,
    confirmedAt,
    firstSnapshot: firstSnapshot
      ? toRecordSnapshot(
          normalizeAndEnrichSnapshot({ snapshot: firstSnapshot, place }),
          place.name
        )
      : null,
    lastSnapshot: lastSnapshot
      ? toRecordSnapshot(lastSnapshot, place.name)
      : null,
  };
}

async function writeLatestRecord({ place, snapshot }) {
  const firstSnapshot = place.firstSnapshot
    ? await snapshotModel.findById(place.firstSnapshot).exec()
    : null;
  const record = buildLatestRecord({
    place,
    firstSnapshot,
    lastSnapshot: snapshot,
    // The snapshot was just made the latest in MongoDB.
    confirmedAt: new Date().toISOString(),
  });

  const putStarted = Date.now();
  const putAttempts = await putLatestRecord(place.name, record);
  const putMs = Date.now() - putStarted;

  console.log(
    `[latest] place=${place.name} putAttempts=${putAttempts} putMs=${putMs}`
  );
}

// Rollout measurement: how fast is a read, and does it return what we wrote?
async function measureLatestRecordRead({ place, snapshot }) {
  const readStarted = Date.now();
  const stored = await readLatestRecord(place.name);
  const readMs = Date.now() - readStarted;

  console.log(
    `[latest] place=${place.name} readMs=${readMs} matches=${
      stored?.lastSnapshot?.cuid === snapshot.cuid
    }`
  );
}

/**
 * Writes the list of front page places, and checks the records of the other
 * places against MongoDB, so they stay trusted while their box is quiet. See
 * docs/front-page-records-design.md for why each step is safe.
 */
async function refreshFrontPage({ place: uploaded }) {
  // This must come before the MongoDB read. An upload that changes a record
  // after this point changes its etag, and the write below is then refused.
  const etags = await listRecordEtags();
  const places = await getTopPublicPlaces({ limit: TOP_PUBLIC_PLACES_LIMIT });
  const now = Date.now();
  const confirmedAt = new Date(now).toISOString();
  const counts = { written: 0, refused: 0, skipped: 0 };

  await putFrontPageList({
    writtenAt: confirmedAt,
    places: places.map((place) => place.name),
  });

  // The uploading place wrote its own record already.
  const others = places.filter((place) => place.name !== uploaded.name);

  await Promise.all(
    others.map(async (place) => {
      const etag = etags.get(place.name);
      const quiet =
        now - new Date(place.lastSnapshot.dateAdded).getTime() > QUIET_AFTER_MS;

      if (!etag && !quiet) {
        counts.skipped++;
        return;
      }

      const record = buildLatestRecord({
        place,
        firstSnapshot: place.firstSnapshot,
        lastSnapshot: place.lastSnapshot,
        confirmedAt,
      });
      const written = await putLatestRecordIfUnchanged(
        place.name,
        record,
        etag
      );

      counts[written ? 'written' : 'refused']++;
    })
  );

  console.log(
    `[front-page] upload=${uploaded.name} places=${places.length} written=${counts.written} refused=${counts.refused} skipped=${counts.skipped}`
  );
}

/**
 * Makes a stored snapshot the latest one for its place. See
 * docs/latest-snapshot-design.md for why the steps have this order.
 *
 * Call this only after the snapshot and its photo are stored.
 */
export async function publishLatestSnapshot({ place, snapshot }) {
  // If this throws, nothing is published, and the record and MongoDB still
  // agree on the previous snapshot.
  await removeLatestRecord(place.name);

  await place
    .updateOne({
      lastSnapshot: snapshot._id,
    })
    .exec();

  // The new snapshot is published now. Without a record, readers use MongoDB,
  // so a failure here must not fail the upload.
  try {
    await writeLatestRecord({ place, snapshot });
  } catch (err) {
    console.error(`[latest] place=${place.name} record write failed`, err);
    return;
  }

  try {
    await measureLatestRecordRead({ place, snapshot });
  } catch (err) {
    console.error(`[latest] place=${place.name} read-back failed`, err);
  }

  // The front page falls back to MongoDB without this, so a failure here must
  // not fail the upload.
  try {
    await refreshFrontPage({ place });
  } catch (err) {
    console.error(`[front-page] upload=${place.name} refresh failed`, err);
  }
}
