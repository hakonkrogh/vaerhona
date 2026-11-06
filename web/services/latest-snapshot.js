import { snapshotModel } from './mongo/models';
import {
  putLatestRecord,
  readLatestRecord,
  removeLatestRecord,
} from './latest-store';
import { getSnapshotImageUrl, getWindDirectionCompass } from './snapshot-view';
import { normalizeAndEnrichSnapshot } from './utils';

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
 */
export function buildLatestRecord({ place, firstSnapshot, lastSnapshot }) {
  return {
    cuid: place.cuid,
    name: place.name,
    firstSnapshot: firstSnapshot
      ? toRecordSnapshot(
          normalizeAndEnrichSnapshot({ snapshot: firstSnapshot, place }),
          place.name
        )
      : null,
    lastSnapshot: toRecordSnapshot(lastSnapshot, place.name),
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
}
