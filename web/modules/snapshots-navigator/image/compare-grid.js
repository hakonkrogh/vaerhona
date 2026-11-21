import React, { useEffect, useState } from 'react';

import { prettyDayMonth, prettyTime, prettyYear } from 'core/date';
import SnapshotImage from 'modules/snapshot-image';
import { Spinner } from 'ui';

import { isCloseEnough, offNote } from '../compare-match';
import { PLACE_PHOTO_SIZES } from '../photo-prefetch';
import { findSnapshot } from '../store';
import { closestTarget } from '../timeline';
import Metadata from './metadata';
import styles from './compare-grid.module.css';

// Two tiles share the width of a phone. On a wider screen a tile is never
// wider than this (see the columns in compare-grid.module.css).
const TILE_PHOTO_SIZES = '(min-width: 700px) 350px, 50vw';

/**
 * One year in compare mode: its photo with the year on it, and under it the
 * values and the time the photo was taken.
 *
 * @param {{ snapshot: object, time: number }|null} [found] the snapshot and
 * the time that was asked for. Undefined while it is searched for, null when
 * the year has no snapshot close enough to that time.
 */
export function YearTile({
  place,
  year,
  found,
  sizes = TILE_PHOTO_SIZES,
  priority,
  transitionName,
  onPhotoLoad,
}) {
  const snapshot = found?.snapshot;
  const note = snapshot ? offNote(snapshot, found.time) : null;

  return (
    <div className={styles.tile}>
      <div className={styles.photo}>
        {found === undefined && <Spinner size="30px" />}
        {found === null && (
          <span className={styles.none}>Fant ingen bilder fra denne tiden</span>
        )}
        {snapshot && (
          <SnapshotImage
            key={snapshot.cuid}
            image={snapshot.image}
            date={snapshot.date}
            placeName={place.name}
            sizes={sizes}
            priority={priority}
            transitionName={transitionName}
            onLoad={onPhotoLoad}
            // A snapshot can have no photo (SPEC.md, known gap 10). Photos
            // ahead must still load then.
            onError={onPhotoLoad}
          />
        )}
        <span className={styles.year}>{year}</span>
      </div>
      <div className={styles.text}>
        {snapshot && (
          <>
            <Metadata snapshot={snapshot} compact />
            <div className={styles.when}>
              {prettyDayMonth(snapshot.date)} kl. {prettyTime(snapshot.date)}
            </div>
            {note && <div className={styles.note}>{note}</div>}
          </>
        )}
      </div>
    </div>
  );
}

/** The tile for the snapshot closest to a date. */
function YearTileAt({ store, place, date }) {
  const time = date.getTime();
  // The last snapshot found stays on screen while the next one is searched
  // for. It is kept with the time it was found for, so its note stays right.
  const [found, setFound] = useState(undefined);

  useEffect(() => {
    let active = true;

    findSnapshot(
      store,
      (timeline, settle) => closestTarget(timeline, time, { settle }),
      () => !active
    ).then((snapshot) => {
      if (active) {
        setFound(
          snapshot && isCloseEnough(snapshot, time) ? { snapshot, time } : null
        );
      }
    });

    return () => {
      active = false;
    };
  }, [store, time]);

  return <YearTile place={place} year={prettyYear(date)} found={found} />;
}

/**
 * Compare mode: the snapshot on screen and the same time in earlier years,
 * newest first, as one grid of tiles.
 */
export default function CompareGrid({
  store,
  place,
  currentSnapshot,
  compareDates,
  transitionName,
  onPhotoLoad,
}) {
  return (
    <div className={styles.outer}>
      <ul className={styles.grid}>
        <li>
          <YearTile
            place={place}
            year={prettyYear(currentSnapshot.date)}
            found={{
              snapshot: currentSnapshot,
              time: new Date(currentSnapshot.date).getTime(),
            }}
            // The size the photo has outside compare mode, so the copy the
            // browser has is used, and the photos loaded ahead for the arrows.
            sizes={PLACE_PHOTO_SIZES}
            priority
            transitionName={transitionName}
            onPhotoLoad={onPhotoLoad}
          />
        </li>
        {compareDates.map((date) => (
          <li key={date.getFullYear()}>
            <YearTileAt store={store} place={place} date={date} />
          </li>
        ))}
      </ul>
    </div>
  );
}
