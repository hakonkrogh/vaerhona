import React, { useState } from 'react';

import { Button, IconArrow, IconCompare } from 'ui';
import { PHOTO_TRANSITION_NAME } from 'core/page-transition';

import { useSnapshotNavigation } from '../use-snapshot-navigation';
import styles from './image.module.css';
import SliceOfTime, { SliceOfTimeAt } from './slice-of-time';
import DateVisualiser from './date';

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
  const { go, goToDate, pending } = useSnapshotNavigation({
    store,
    current: currentSnapshot,
    setCurrent: setCurrentSnapshot,
    photoLoaded: loadedPhoto === currentSnapshot.cuid,
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

  return (
    <div className={styles.outer}>
      <DateVisualiser
        place={place}
        snapshot={currentSnapshot}
        onDateChange={goToDate}
      />

      <SliceOfTime
        place={place}
        snapshot={currentSnapshot}
        priority
        // The front page shows the latest photo. An older one would move
        // into the card and then jump to the latest.
        transitionName={
          currentSnapshot.cuid === place.lastSnapshot.cuid
            ? PHOTO_TRANSITION_NAME
            : undefined
        }
        onPhotoLoad={() => setLoadedPhoto(currentSnapshot.cuid)}
      />

      {compare && (
        <ul className={styles.compareList}>
          {compareDates.map((date, index) => (
            <li key={index}>
              <div className={styles.compareYear}>{date.getFullYear()}</div>
              <SliceOfTimeAt store={store} place={place} date={date} />
            </li>
          ))}
        </ul>
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
