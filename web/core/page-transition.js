import { useLayoutEffect } from 'react';

// The view-transition-name of the photo that moves between the front page and
// the place page. Only one element on a page can have it.
// ui/global.css styles the transition by this name, so keep the two the same.
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

// Enough for the photos around the one on screen. The oldest go first.
const MAX_LOADED_PHOTOS = 50;

/** @param {HTMLImageElement} img a photo that has loaded */
export function rememberLoadedPhoto(image, img) {
  if (image && img.currentSrc && img.naturalWidth) {
    // Deleting first moves the photo to the end, as the newest.
    loadedPhotos.delete(image);
    loadedPhotos.set(image, {
      src: img.currentSrc,
      width: img.naturalWidth,
      height: img.naturalHeight,
    });

    if (loadedPhotos.size > MAX_LOADED_PHOTOS) {
      loadedPhotos.delete(loadedPhotos.keys().next().value);
    }
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

// Set by the back and forward buttons. Next.js starts its page change after
// the popstate event.
let cameByHistory = false;

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    cameByHistory = true;
  });
}

// Where each page was scrolled to when the user left it, by a key the page
// picks.
const scrollByPage = new Map();

/**
 * Puts the page back where the user left it, when they come back with the
 * back or forward button. The browser does this too, but too early: the old
 * page is still on screen while the next one loads. The photo would then
 * move to the wrong place in the view transition.
 */
export function useRestoreScrollOnBack(key) {
  // A layout effect runs before the browser captures the new page. Its
  // cleanup runs before Next.js scrolls the next page to the top.
  useLayoutEffect(() => {
    if (cameByHistory && scrollByPage.has(key)) {
      window.scrollTo(0, scrollByPage.get(key));
    }
    cameByHistory = false;

    return () => {
      scrollByPage.set(key, window.scrollY);
    };
  }, [key]);
}
