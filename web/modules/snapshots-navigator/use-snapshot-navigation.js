import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import { requestPersistentStorage } from 'modules/snapshot-history/persist';

import { prefetchPhotos } from './photo-prefetch';
import { findSnapshot } from './store';
import {
  closestTarget,
  nearbyLoads,
  photoTargets,
  stepTarget,
} from './timeline';

const HOUR = 60 * 60 * 1000;

export function useTimeline(store) {
  return useSyncExternalStore(
    store.subscribe,
    store.getTimeline,
    store.getTimeline
  );
}

function saveData() {
  return Boolean(navigator.connection?.saveData);
}

/**
 * Fills the browser's local database with the whole history of the place, in
 * the background (see modules/snapshot-history/history.js). It works outwards
 * from the snapshot on screen and from now.
 *
 * @param {object} options
 * @param {object} [options.history]
 * @param {object} [options.current] the snapshot on screen
 * @param {boolean} options.ready false while something more important loads,
 * such as the photo on screen (rule P8)
 */
export function useHistoryBackfill({ history, current, ready }) {
  const time = current ? new Date(current.date).getTime() : null;

  useEffect(() => {
    if (history && time != null) {
      history.setFocus(time);
    }
  }, [history, time]);

  useEffect(() => {
    // With data saver on, only what the user browses is loaded.
    if (!history || !ready || saveData()) {
      return;
    }

    requestPersistentStorage();
    history.startBackfill();
  }, [history, ready]);

  useEffect(() => {
    if (!history) {
      return undefined;
    }

    const onVisibility = () =>
      history.setPaused(document.visibilityState !== 'visible');

    onVisibility();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      history.stopBackfill();
    };
  }, [history]);
}

/**
 * Moves between snapshots, and loads ahead what the user is likely to need
 * next:
 *
 * - Eager: the week before the latest snapshot. The page starts it with the
 *   HTML (see index.js), and this picks up the answer.
 * - Lazy: the next week, when the user gets within a few days of the end of
 *   what is loaded.
 * - After the current photo has loaded: the photos the arrows lead to, then a
 *   few more steps back. Only the arrow photos with data saver on.
 *
 * @param {object} options
 * @param {object} options.store from store.js
 * @param {object} options.current the snapshot on screen
 * @param {(snapshot: object) => void} options.setCurrent
 * @param {boolean} options.photoLoaded true when the current photo has loaded
 */
export function useSnapshotNavigation({
  store,
  current,
  setCurrent,
  photoLoaded,
}) {
  const timeline = useTimeline(store);
  // The arrow that waits for data, so it can show a spinner.
  const [pending, setPending] = useState(null);
  const lastCommand = useRef(0);

  // Only the newest command counts. A slow load must not move the user after
  // they have tapped something else.
  const run = useCallback(
    async (key, findTarget) => {
      const command = ++lastCommand.current;
      const isStale = () => command !== lastCommand.current;
      const needsLoad = Boolean(findTarget(store.getTimeline(), false).load);

      setPending(needsLoad ? key : null);

      const snapshot = await findSnapshot(store, findTarget, isStale);

      if (isStale()) {
        return;
      }

      setPending(null);

      if (snapshot) {
        setCurrent(snapshot);
      }
    },
    [store, setCurrent]
  );

  /** One snapshot (-1, 1) or 24 hours (-24, 24), as the arrows do (P3). */
  const go = useCallback(
    (step) =>
      run(step, (timeline, settle) =>
        Math.abs(step) === 1
          ? stepTarget(timeline, current, step)
          : closestTarget(
              timeline,
              new Date(current.date).getTime() + step * HOUR,
              { settle }
            )
      ),
    [run, current]
  );

  const goToDate = useCallback(
    (date) =>
      run('date', (timeline, settle) =>
        closestTarget(timeline, date, { settle })
      ),
    [run]
  );

  useEffect(() => {
    for (const part of nearbyLoads(timeline, current)) {
      store.load(part);
    }
  }, [store, timeline, current]);

  useEffect(() => {
    if (!photoLoaded) {
      return;
    }

    const { first, later } = photoTargets(timeline, current);
    prefetchPhotos(saveData() ? first : [...first, ...later]);
  }, [timeline, current, photoLoaded]);

  useHistoryBackfill({ history: store.history, current, ready: photoLoaded });

  return { go, goToDate, pending };
}
