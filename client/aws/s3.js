import config from '../../server/config';
import { getRelativePathForImage } from '../../shared/aws/s3';

/**
 * Returns the absolute path for an image for a snapshot (ex: http://some-domain/test/1/1/cuid.jpg)
 * @param place
 * @param snapshot
 * @returns string
*/
export function getAbsolutePathForImage ({ place, snapshot }) {

  if (!place || !snapshot) {
    return '/static/images/snapshot/404.svg';
  }

  let imageUrlBase;

  if (typeof __NODE_ENV !== 'undefined' && __NODE_ENV === 'development') {
    return `/static/images/snapshot/dummy.jpg`;
  }

  // Client side config
  if (typeof __APP_CONFIG__ !== 'undefined') {
    imageUrlBase = __APP_CONFIG__.imageUrlBase;
  }
  // Server side
  else {
    imageUrlBase = config.imageUrlBase;
  }

  return `${imageUrlBase}/${getRelativePathForImage({ place, snapshot })}`;
}