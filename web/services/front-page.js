import { runWithDb } from './init';
import { isFrontPageListTrusted, isRecordTrusted } from './latest-snapshot';
import {
  readFrontPageList,
  readLatestRecord,
  withTimeout,
} from './latest-store';
import { getTopPublicPlaces, TOP_PUBLIC_PLACES_LIMIT } from './place-service';
import { getSnapshotImageUrl } from './snapshot-view';

// For the list and all records together.
const RECORDS_READ_TIMEOUT_MS = 500;

function toFrontPagePlace({ cuid, name, lastSnapshot }) {
  return {
    cuid,
    name,
    lastSnapshot: {
      cuid: lastSnapshot.cuid,
      date: lastSnapshot.date,
      image: lastSnapshot.image,
      placeName: name,
    },
  };
}

function fromMongoPlace(place) {
  const snapshot = place.lastSnapshot;

  return toFrontPagePlace({
    cuid: place.cuid,
    name: place.name,
    lastSnapshot: {
      cuid: snapshot.cuid,
      date: new Date(snapshot.dateAdded).toISOString(),
      image: getSnapshotImageUrl({
        placeName: place.name,
        dateAdded: snapshot.dateAdded,
        cuid: snapshot.cuid,
      }),
    },
  });
}

/**
 * The front page's data from MongoDB. These are the same places, in the same
 * order, as the `places` API query.
 */
export function getPlacesFromMongo() {
  return runWithDb(async () => {
    const places = await getTopPublicPlaces({
      limit: TOP_PUBLIC_PLACES_LIMIT,
      withFirstSnapshot: false,
    });

    return places.map(fromMongoPlace);
  });
}

async function readRecords() {
  const list = await readFrontPageList();

  if (!isFrontPageListTrusted(list)) {
    return null;
  }

  const records = await Promise.all(list.places.map(readLatestRecord));

  return records.every((record) => isRecordTrusted(record))
    ? records.map(toFrontPagePlace)
    : null;
}

/**
 * The front page's data from the latest snapshot records, or null if any of
 * them is missing, slow or not trusted. See docs/front-page-records-design.md.
 */
export async function getPlacesFromRecords() {
  try {
    return await withTimeout(readRecords(), RECORDS_READ_TIMEOUT_MS);
  } catch (err) {
    console.error('[front-page] records read failed', err);
    return null;
  }
}

/**
 * Records when they can all be trusted, MongoDB otherwise. This must never
 * write a record, for the same reason as the place page.
 *
 * @returns {Promise<{ places: object[] | null }>} places is null if they could
 * not be read. The page then shows an error instead of failing.
 */
export async function getFrontPageProps() {
  const fromRecords = await getPlacesFromRecords();

  if (fromRecords) {
    console.log('[front-page] source=records');
    return { places: fromRecords };
  }

  try {
    console.log('[front-page] source=mongo');
    return { places: await getPlacesFromMongo() };
  } catch (err) {
    console.error('[front-page] places read failed', err);
    return { places: null };
  }
}
