import React, { useState, useEffect } from 'react';
import Head from 'next/head';

import { useRefreshWhenNewer } from 'core/use-refresh-when-newer';

import SnapshotImage from './image';
import { createSnapshotStore, initialListUrl } from './store';
// import SnapshotGraph from './graph';

const oneYear = 1000 * 60 * 60 * 24 * 365;

export function SnapshotsNavigator({ place }) {
  const [store] = useState(() =>
    place?.lastSnapshot ? createSnapshotStore(place) : null
  );
  const [currentSnapshot, setCurrentSnapshot] = useState(place?.lastSnapshot);
  // const [view, setView] = useState('image');
  const [compare, setCompare] = useState(false);
  const [compareDates, setCompareDates] = useState([]);

  // Only while the latest snapshot is on screen. A user who has browsed to an
  // older one, or is comparing years, keeps where they are.
  const onLatest =
    !compare &&
    currentSnapshot &&
    currentSnapshot.cuid === place?.lastSnapshot?.cuid;
  useRefreshWhenNewer(
    `/api/latest?place=${encodeURIComponent(place?.name ?? '')}`,
    onLatest ? { [place.name]: currentSnapshot.cuid } : null
  );

  const view = 'image';
  const canCompare =
    new Date(currentSnapshot?.date) - new Date(place?.firstSnapshot?.date) >
    oneYear;

  useEffect(() => {
    if (!place || !currentSnapshot) {
      return;
    }
    if (compare) {
      const { firstSnapshot } = place;
      const firstDate = new Date(firstSnapshot.date);
      // const lastDate = new Date(lastSnapshot.date);
      const currentDate = new Date(currentSnapshot.date);

      const dates = [];

      // Exclude the most recent
      currentDate.setFullYear(currentDate.getFullYear() - 1);
      do {
        if (currentDate > firstDate) {
          dates.push(new Date(currentDate.getTime()));
        }
        currentDate.setFullYear(currentDate.getFullYear() - 1);
      } while (currentDate > firstDate);
      setCompareDates(dates);
    }
  }, [compare, place, currentSnapshot, setCompareDates]);

  if (!place || !currentSnapshot) {
    return;
  }

  const sharedProps = {
    store,
    place,
    currentSnapshot,
    setCurrentSnapshot,
    canCompare,
    compare,
    setCompare,
    compareDates,
  };

  if (view === 'image') {
    return (
      <>
        <Head>
          {/* The arrows need this list. Asking for it here starts it while
              the scripts load, instead of after. Its answer can be cached, so
              the request from store.js gets it from the browser. */}
          <link
            rel="preload"
            as="fetch"
            href={initialListUrl(place)}
            crossOrigin="anonymous"
          />
        </Head>
        <SnapshotImage {...sharedProps} />
      </>
    );
  }

  return <div>todo graph</div>;
}
