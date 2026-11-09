import { getSnapshotImageProps } from 'modules/snapshot-image';

// How the place page photo is laid out. The photo and its prefetch must use
// the same value, or the browser picks a different size for each.
export const PLACE_PHOTO_SIZES = '(min-width: 700px) 700px, 100vw';

// Few at a time, so a tap on an arrow is not stuck behind many photos.
const MAX_PARALLEL = 2;

// Photos never change, so one that loaded once stays in the browser cache.
const requested = new Set();
let queue = [];
let running = 0;

function startNext() {
  while (running < MAX_PARALLEL && queue.length) {
    const props = queue.shift();

    if (requested.has(props.src)) {
      continue;
    }

    requested.add(props.src);
    running++;

    const img = new Image();
    const done = () => {
      running--;
      startNext();
    };

    img.onload = done;
    img.onerror = () => {
      // Let a later prefetch try again.
      requested.delete(props.src);
      done();
    };
    img.decoding = 'async';
    img.fetchPriority = 'low';
    // sizes and srcset before src, so the browser picks from the srcset.
    img.sizes = props.sizes;
    img.srcset = props.srcSet;
    img.src = props.src;
  }
}

/**
 * Loads photos into the browser cache, in order. A new call replaces the
 * photos that have not started yet, because the user has moved on.
 */
export function prefetchPhotos(snapshots) {
  queue = snapshots
    .map((snapshot) =>
      getSnapshotImageProps({ image: snapshot.image, sizes: PLACE_PHOTO_SIZES })
    )
    .filter((props) => !requested.has(props.src));

  startNext();
}
