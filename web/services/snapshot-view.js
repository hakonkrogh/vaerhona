import config from './config';

const COMPASS_DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

/**
 * Public URL of a snapshot photo. The path must match where
 * services/aws/s3.js stores the photo.
 */
export function getSnapshotImageUrl({ placeName, dateAdded, cuid }) {
  const baseUrl =
    config.environment === 'development'
      ? 'https://vaerhona-development.s3-eu-west-1.amazonaws.com'
      : 'https://vaerhona.s3-eu-west-1.amazonaws.com';
  const date = new Date(dateAdded);

  return `${baseUrl}/${placeName}/${date.getFullYear()}/${
    date.getMonth() + 1
  }/${cuid}`;
}

export function getWindDirectionCompass(degrees) {
  if (degrees == null) return null;

  return COMPASS_DIRECTIONS[Math.round(degrees / 45) % 8];
}
