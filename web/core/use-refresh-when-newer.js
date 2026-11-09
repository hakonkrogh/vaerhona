import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

// Switching apps back and forth quickly should not ask the server each time.
const MIN_INTERVAL_MS = 30 * 1000;

/**
 * Place name to latest snapshot cuid, the shape /api/latest answers with.
 */
export function latestByPlace(places) {
  return Object.fromEntries(places.map((p) => [p.name, p.lastSnapshot.cuid]));
}

/**
 * True if `latest` and `shown` do not have the same snapshot for every place.
 * Both map a place name to a snapshot cuid.
 */
export function hasNewer(latest, shown) {
  const latestEntries = Object.entries(latest ?? {});

  return (
    latestEntries.length !== Object.keys(shown ?? {}).length ||
    latestEntries.some(([name, cuid]) => shown?.[name] !== cuid)
  );
}

/**
 * When the page becomes visible again, for example when the home screen app
 * is opened after a while, asks `url` (an /api/latest URL) for the newest
 * snapshots. If they differ from `shown`, the page gets its data from the
 * server again, without a full reload.
 *
 * @param {object|null} shown place name to the snapshot cuid on screen, or
 * null to skip the check, for example while the user looks at an older
 * snapshot. Where the user has browsed to must not be thrown away.
 */
export function useRefreshWhenNewer(url, shown) {
  const router = useRouter();
  const shownRef = useRef(shown);
  const routerRef = useRef(router);
  shownRef.current = shown;
  routerRef.current = router;

  useEffect(() => {
    // The first return to the page always checks.
    let lastCheck = 0;
    let checking = false;

    async function check() {
      if (
        document.visibilityState !== 'visible' ||
        checking ||
        !shownRef.current ||
        Date.now() - lastCheck < MIN_INTERVAL_MS
      ) {
        return;
      }

      lastCheck = Date.now();
      checking = true;

      try {
        const res = await fetch(url, { cache: 'no-store' });

        if (!res.ok) {
          return;
        }

        const { latest } = await res.json();

        // The check can take a moment. Skip if the user moved away meanwhile.
        if (shownRef.current && hasNewer(latest, shownRef.current)) {
          const current = routerRef.current;
          await current.replace(current.asPath, undefined, { scroll: false });
        }
      } catch (err) {
        // The page still works. It is only not updated this time.
        console.warn('Could not check for a newer snapshot', err);
      } finally {
        checking = false;
      }
    }

    document.addEventListener('visibilitychange', check);
    return () => document.removeEventListener('visibilitychange', check);
  }, [url]);
}
