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

  // let NODE_ENV = typeof process !== 'undefined' ? process.env.NODE_ENV : __NODE_ENV;
  // if (NODE_ENV === 'development') {
  //   return `/static/images/snapshot/dummy.jpg`;
  // }

  // Client side config
  if (typeof __APP_CONFIG__ !== 'undefined') {
    imageUrlBase = __APP_CONFIG__.imageUrlBase;
  }
  // Server side
  else {
    imageUrlBase = config.imageUrlBase;
  }

  //return `${imageUrlBase}/${getRelativePathForImage({ place, snapshot })}`;
  return `/api/snapshots/image/${place.name}/${snapshot.cuid}`;
}