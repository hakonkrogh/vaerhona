// The view-transition-name of the photo that moves between the front page and
// the place page. Only one element on a page can have it.
export const PHOTO_TRANSITION_NAME = 'place-photo';

// The place whose photo moves. Set by a tap on the front page and by the
// place page, so the way back finds the same photo in the list.
let transitionPlace = null;

export function setTransitionPlace(name) {
  transitionPlace = name;
}

export function getTransitionPlace() {
  return transitionPlace;
}

// A version of each photo that has loaded, by photo URL. The two pages show
// the same photo in different sizes. The new page shows this one until its
// own size has loaded, so the transition never moves an empty box.
const loadedPhotos = new Map();

/** @param {HTMLImageElement} img a photo that has loaded */
export function rememberLoadedPhoto(image, img) {
  if (image && img.currentSrc && img.naturalWidth) {
    loadedPhotos.set(image, {
      src: img.currentSrc,
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
  }
}

export function getLoadedPhoto(image) {
  return loadedPhotos.get(image) ?? null;
}

/**
 * Tells the global style which side of the next page change is this page.
 * A page that calls this shows the whole photo, and the other page a cut of
 * it. Only the whole photo is drawn while it moves, so the two never fade
 * over each other. Call it from a layout effect, and return its result.
 */
export function markFullPhotoPage() {
  const root = document.documentElement;

  // React runs layout effects after the browser has captured the old page
  // and before it captures the new one.
  root.dataset.fullPhoto = 'new';
  return () => {
    root.dataset.fullPhoto = 'old';
  };
}
