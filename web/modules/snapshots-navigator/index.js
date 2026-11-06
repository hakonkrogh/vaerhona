import React, { useState, useEffect } from 'react';

import SnapshotImage from './image';
// import SnapshotGraph from './graph';

const oneYear = 1000 * 60 * 60 * 24 * 365;

export function SnapshotsNavigator({ place }) {
  const [currentSnapshot, setCurrentSnapshot] = useState(place?.lastSnapshot);
  // const [view, setView] = useState('image');
  const [compare, setCompare] = useState(false);
  const [compareDates, setCompareDates] = useState([]);

  const view = 'image';
  const canCompare =
    new Date(currentSnapshot?.date) - new Date(place?.firstSnapshot.date) >
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
    place,
    currentSnapshot,
    setCurrentSnapshot,
    canCompare,
    compare,
    setCompare,
    compareDates,
  };

  if (view === 'image') {
    return <SnapshotImage {...sharedProps} />;
  }

  return <div>todo graph</div>;
}
