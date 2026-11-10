// The snapshot values API. It gives the sensor values of a place for a part
// of time in columns, which is much smaller than one object per snapshot. The
// browser keeps the answers in its local database (see
// modules/snapshot-history and docs/client-storage-design.md).
//
// The page builds these URLs, the API route reads them, and the Worker uses
// them as cache keys.

export const SNAPSHOT_VALUES_PATH = '/api/values';

// Only these change the answer, so the cache key uses only these.
export const SNAPSHOT_VALUES_PARAMS = ['place', 'from', 'to', 'v'];

// Raise this when the format changes, or when stored snapshots were deleted or
// corrected. Every browser then drops its local copy and loads it again, and
// the Cloudflare cache gets new keys.
export const VALUES_VERSION = 1;

const DAY = 24 * 60 * 60 * 1000;

// The longest part of time one request may ask for: a month.
export const MAX_VALUES_SPAN = 31 * DAY;

export const YR_FIELDS = [
  'airTemperature',
  'windSpeed',
  'windFromDirection',
  'windSpeedOfGust',
  'airPressureAtSeaLevel',
  'cloudAreaFraction',
  'dewPointTemperature',
  'relativeHumidity',
];

const COMPASS_DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

export function getWindDirectionCompass(degrees) {
  if (degrees == null) return null;

  return COMPASS_DIRECTIONS[Math.round(degrees / 45) % 8];
}

/**
 * @param {object} query
 * @param {string} query.place
 * @param {Date|string|number} query.from start, included
 * @param {Date|string|number} query.to end, included
 */
export function snapshotValuesUrl({ place, from, to }) {
  const params = new URLSearchParams();

  params.set('place', place);
  params.set('from', new Date(from).toISOString());
  params.set('to', new Date(to).toISOString());
  params.set('v', String(VALUES_VERSION));

  return `${SNAPSHOT_VALUES_PATH}?${params}`;
}

// Months are UTC months, so every visitor asks for the same parts of time and
// shares the Cloudflare cache.

/** "2024-06" for a time in milliseconds. */
export function monthOf(time) {
  const date = new Date(time);
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');

  return `${date.getUTCFullYear()}-${month}`;
}

/** The first millisecond of a month such as "2024-06". */
export function monthStart(month) {
  const [year, number] = month.split('-').map(Number);

  return Date.UTC(year, number - 1, 1);
}

/** The last millisecond of a month. */
export function monthEnd(month) {
  const [year, number] = month.split('-').map(Number);

  return Date.UTC(year, number, 1) - 1;
}

/** The month `count` months after `month` (before, if negative). */
export function addMonths(month, count) {
  const [year, number] = month.split('-').map(Number);

  return monthOf(Date.UTC(year, number - 1 + count, 1));
}

/**
 * Public URL of a snapshot photo. The path uses the UTC year and month of the
 * snapshot, which is what the Worker used when it stored the photo (see
 * getSnapshotImageUrl in services/snapshot-view.js).
 */
function imageUrl(imageBase, time, cuid) {
  const date = new Date(time);

  return `${imageBase}/${date.getUTCFullYear()}/${date.getUTCMonth() + 1}/${cuid}`;
}

/**
 * Snapshots (as toSnapshotView in services/snapshot-view.js gives them, oldest
 * first) to columns.
 */
export function toColumns(snapshots) {
  const hasYr = snapshots.some((snapshot) => snapshot.yrWeather);
  const columns = {
    cuid: snapshots.map((snapshot) => snapshot.cuid),
    time: snapshots.map((snapshot) => new Date(snapshot.date).getTime()),
    temperature: snapshots.map((snapshot) => snapshot.temperature),
    humidity: snapshots.map((snapshot) => snapshot.humidity),
    pressure: snapshots.map((snapshot) => snapshot.pressure),
    // Left out when no snapshot has yr.no weather, as for old snapshots.
    yr: null,
  };

  if (hasYr) {
    columns.yr = {};

    for (const field of YR_FIELDS) {
      columns.yr[field] = snapshots.map(
        (snapshot) => snapshot.yrWeather?.[field] ?? null
      );
    }
  }

  return columns;
}

/**
 * Columns back to snapshots, in the same shape as toSnapshotView gives.
 *
 * @param {object} columns from toColumns
 * @param {string} imageBase where the place's photos are, from the API answer
 */
export function fromColumns(columns, imageBase) {
  return columns.cuid.map((cuid, i) => {
    const time = columns.time[i];
    let yrWeather = null;

    if (columns.yr && YR_FIELDS.some((field) => columns.yr[field][i] != null)) {
      yrWeather = {};

      for (const field of YR_FIELDS) {
        yrWeather[field] = columns.yr[field][i];
      }

      yrWeather.windDirectionCompass = getWindDirectionCompass(
        yrWeather.windFromDirection
      );
    }

    return {
      cuid,
      date: new Date(time).toISOString(),
      temperature: columns.temperature[i],
      pressure: columns.pressure[i],
      humidity: columns.humidity[i],
      image: imageUrl(imageBase, time, cuid),
      yrWeather,
    };
  });
}

/** The columns of an API answer, without the other fields. */
export function pickColumns({
  cuid,
  time,
  temperature,
  humidity,
  pressure,
  yr,
}) {
  return { cuid, time, temperature, humidity, pressure, yr: yr ?? null };
}

/** Two sets of columns after each other. `first` must be the older one. */
export function concatColumns(first, second) {
  const columns = {};

  for (const name of ['cuid', 'time', 'temperature', 'humidity', 'pressure']) {
    columns[name] = [...first[name], ...second[name]];
  }

  columns.yr = null;

  if (first.yr || second.yr) {
    const nulls = (count) => new Array(count).fill(null);

    columns.yr = {};

    for (const field of YR_FIELDS) {
      columns.yr[field] = [
        ...(first.yr?.[field] ?? nulls(first.cuid.length)),
        ...(second.yr?.[field] ?? nulls(second.cuid.length)),
      ];
    }
  }

  return columns;
}
