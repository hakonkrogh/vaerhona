import { snapshotListUrl, WEEK_OF_SNAPSHOTS } from 'core/snapshot-list';

import { addList, createTimeline } from './timeline';

// The server allows up to 500. A window of six days has about 150.
const WINDOW_LIMIT = 500;

/**
 * The first list the page needs: the week up to the latest snapshot. The page
 * starts loading it with the HTML, before the scripts run.
 */
export function initialListUrl(place) {
  return snapshotListUrl({
    place: place.name,
    to: place.lastSnapshot.date,
    limit: WEEK_OF_SNAPSHOTS,
  });
}

/**
 * Every list ends at or before the latest snapshot the page has. Nobody can
 * browse past it (rule P4), and it makes every list final, so the browser and
 * the Worker can keep it (see services/snapshot-list.js).
 *
 * @returns {string|null} null if there is nothing to load
 */
function listUrl(place, { from, to }) {
  const latest = new Date(place.lastSnapshot.date).getTime();

  if (from == null) {
    return snapshotListUrl({
      place: place.name,
      to: Math.min(to, latest),
      limit: WEEK_OF_SNAPSHOTS,
    });
  }

  if (from >= latest) {
    return null;
  }

  return snapshotListUrl({
    place: place.name,
    from,
    to: Math.min(to ?? latest, latest),
    limit: to == null ? WEEK_OF_SNAPSHOTS : WINDOW_LIMIT,
  });
}

async function fetchList(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Holds the snapshots of one place that the page has loaded. React reads it
 * with useSyncExternalStore.
 */
export function createSnapshotStore(place) {
  let timeline = createTimeline(place);
  const listeners = new Set();
  // Requests by URL, so the same list is never asked for twice at once.
  const requests = new Map();

  return {
    getTimeline: () => timeline,

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    /**
     * @param {{ from?: number, to?: number }} part what timeline.js asked for
     * @returns {Promise<void>} never rejects. A failed list is left out, and
     * the next call tries again.
     */
    load(part) {
      const url = listUrl(place, part);

      if (!url) {
        return Promise.resolve();
      }

      if (!requests.has(url)) {
        const request = fetchList(url).then(
          (list) => {
            timeline = addList(timeline, list);
            listeners.forEach((listener) => listener());
          },
          (err) => {
            requests.delete(url);
            console.error(`[snapshots] ${url} failed`, err);
          }
        );

        requests.set(url, request);
      }

      return requests.get(url);
    },
  };
}

// Rounds of loading before a search takes what it has. Two are enough to
// cross a gap: the days around a date, then the weeks on each side of them.
const MAX_ROUNDS = 3;

/**
 * Loads what `findTarget` asks for until it finds its snapshot.
 *
 * @param {object} store
 * @param {(timeline: object, settle: boolean) => object} findTarget a target
 * from timeline.js. settle is true in the last round.
 * @param {() => boolean} [isStale] true stops the search
 * @returns {Promise<object|undefined>} the snapshot, or undefined if there is
 * none, it could not be loaded, or the search was stopped
 */
export async function findSnapshot(store, findTarget, isStale = () => false) {
  let target = findTarget(store.getTimeline(), false);

  for (let round = 1; target.load && round <= MAX_ROUNDS; round++) {
    await Promise.all(target.load.map((part) => store.load(part)));

    if (isStale()) {
      return undefined;
    }

    target = findTarget(store.getTimeline(), round === MAX_ROUNDS);
  }

  return target.snapshot;
}
