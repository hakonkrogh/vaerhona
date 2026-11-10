import { getWindDirectionCompass } from '../core/snapshot-values';

import config from './config';

export { getWindDirectionCompass };

function getImageBaseUrl() {
  return config.environment === 'development'
    ? 'https://vaerhona-development.s3-eu-west-1.amazonaws.com'
    : 'https://vaerhona.s3-eu-west-1.amazonaws.com';
}

/**
 * Where the photos of a place are. The browser builds photo URLs from this
 * for snapshots in its local database (fromColumns in core/snapshot-values.js).
 */
export function getPlaceImageBase(placeName) {
  return `${getImageBaseUrl()}/${placeName}`;
}

/**
 * Public URL of a snapshot photo. The path must match where
 * services/aws/s3.js stores the photo.
 */
export function getSnapshotImageUrl({ placeName, dateAdded, cuid }) {
  const date = new Date(dateAdded);

  return `${getPlaceImageBase(placeName)}/${date.getFullYear()}/${
    date.getMonth() + 1
  }/${cuid}`;
}

function finiteOrNull(value) {
  return Number.isFinite(value) ? value : null;
}

function toYrWeatherView(yrWeather) {
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

/**
 * A snapshot as plain data for the place page, in the same shape as the
 * `snapshots` API query. The latest snapshot record and the snapshot list
 * both use it, so the page gets the same fields from each.
 */
export function toSnapshotView(snapshot, placeName) {
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
    yrWeather: toYrWeatherView(snapshot.yrWeather),
  };
}
