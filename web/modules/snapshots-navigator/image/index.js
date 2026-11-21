import React, { useState } from 'react';

import { Button, IconArrow, IconCompare } from 'ui';
import { PHOTO_TRANSITION_NAME } from 'core/page-transition';

import { useSnapshotNavigation } from '../use-snapshot-navigation';
import styles from './image.module.css';
import SliceOfTime from './slice-of-time';
import CompareGrid from './compare-grid';
import DateVisualiser from './date';
import SnapshotGraph from '../graph';
import Icon from '../icon';

export default function SnapshotImage({
  store,
  place,
  currentSnapshot,
  setCurrentSnapshot,
  setCompare,
  canCompare,
  compare,
  compareDates,
}) {
  // The snapshot whose photo has loaded. Photos ahead load only after it, so
  // they do not slow down the one on screen.
  const [loadedPhoto, setLoadedPhoto] = useState(null);
  // 'image' shows the photo, 'graph' shows a chart of the values.
  const [view, setView] = useState('image');
  const { go, goToDate, pending } = useSnapshotNavigation({
    store,
    current: currentSnapshot,
    setCurrent: setCurrentSnapshot,
    // The chart has no photo to wait for.
    photoLoaded: view === 'graph' || loadedPhoto === currentSnapshot.cuid,
  });

  function buttonProps(step) {
    let disabled =
      step > 0 &&
      new Date(currentSnapshot.date) >= new Date(place.lastSnapshot.date);

    return {
      clean: true,
      onClick: () => go(step),
      disabled,
      loading: pending === step,
    };
  }

  // The photo on screen, alone or as the first tile in compare mode.
  const photoProps = {
    place,
    // The front page shows the latest photo. An older one would move into
    // the card and then jump to the latest.
    transitionName:
      currentSnapshot.cuid === place.lastSnapshot.cuid
        ? PHOTO_TRANSITION_NAME
        : undefined,
    onPhotoLoad: () => setLoadedPhoto(currentSnapshot.cuid),
  };
  // With no earlier year to show, the photo stays as it is. That is so for a
  // moment after the switch is enabled, and when the user has browsed back
  // to the place's first year, where the switch is hidden.
  const showCompare = compare && compareDates.length > 0;

  return (
    <div className={styles.outer}>
      <DateVisualiser
        place={place}
        snapshot={currentSnapshot}
        onDateChange={goToDate}
      />

      {view === 'graph' ? (
        <SnapshotGraph
          store={store}
          place={place}
          currentSnapshot={currentSnapshot}
          compare={compare}
        />
      ) : showCompare ? (
        <CompareGrid
          {...photoProps}
          store={store}
          currentSnapshot={currentSnapshot}
          compareDates={compareDates}
        />
      ) : (
        <SliceOfTime {...photoProps} snapshot={currentSnapshot} priority />
      )}
      <div className={styles.bottom}>
        <div className={styles.bottomInner}>
          <span>
            <Button {...buttonProps(-24)}>
              <IconArrow left />
              <IconArrow left />
            </Button>
            <Button {...buttonProps(-1)}>
              <IconArrow left />
            </Button>
          </span>

          <div className={styles.middle}>
            <button
              type="button"
              className={styles.viewButton}
              aria-pressed={view === 'graph'}
              aria-label={view === 'graph' ? 'Vis bilde' : 'Vis graf'}
              onClick={() => setView(view === 'graph' ? 'image' : 'graph')}
            >
              <Icon type={view === 'graph' ? 'image' : 'graph'} />
            </button>
            {canCompare && (
              <div className={styles.switchOuter}>
                <label className={styles.switchLabel} htmlFor="compare-switch">
                  <IconCompare />
                  <input
                    type="checkbox"
                    role="switch"
                    id="compare-switch"
                    className={styles.switchInput}
                    checked={compare}
                    onChange={() => setCompare(!compare)}
                    aria-label="Sammenlign med året før"
                  />
                  <span className={styles.switchTrack} />
                </label>
              </div>
            )}
          </div>

          <span>
            <Button {...buttonProps(1)}>
              <IconArrow />
            </Button>
            <Button {...buttonProps(24)}>
              <IconArrow />
              <IconArrow />
            </Button>
          </span>
        </div>
      </div>
    </div>
  );
}
