/**
 * Returns the absolute path for an image for a snapshot (ex: /api/snapshots/image/test/cuid)
 * @param place
 * @param snapshot
 * @returns string
*/
export function getAbsolutePathForImage ({ place, snapshot }) {

  if (!place || !snapshot) {
    return '/static/images/snapshot/404.svg';
  }

  // let NODE_ENV = typeof process !== 'undefined' ? process.env.NODE_ENV : __NODE_ENV;
  // if (NODE_ENV === 'development') {
  //   return `/static/images/snapshot/dummy.jpg`;
  // }

  return `/api/snapshots/image/${place.name}/${snapshot.cuid}`;
}