import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import SnapshotImage from 'modules/snapshot-image';
import { Spinner } from 'ui';

import { PLACE_PHOTO_SIZES } from '../photo-prefetch';
import { findSnapshot } from '../store';
import { closestTarget } from '../timeline';
import Metadata from './metadata';

const Outer = styled.div`
  position: relative;
  max-width: 700px;
  margin: 0 auto;

  .loader {
    background: #eee;
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 16 / 9;

    @media (min-width: 700px) {
      width: 700px;
    }
  }
`;

const ImageWrap = styled.div`
  position: relative;
  max-width: 700px;
  margin: 0 auto;
`;

/** One snapshot: its values and its photo. */
export default function SliceOfTime({
  place,
  snapshot,
  priority,
  onPhotoLoad,
}) {
  if (!snapshot) {
    return (
      <Outer>
        <div className="loader">
          <Spinner size="30px" />
        </div>
      </Outer>
    );
  }

  return (
    <Outer>
      <Metadata place={place} snapshot={snapshot} />
      <ImageWrap>
        <SnapshotImage
          key={snapshot.cuid}
          {...snapshot}
          placeName={place.name}
          sizes={PLACE_PHOTO_SIZES}
          priority={priority}
          onLoad={onPhotoLoad}
        />
      </ImageWrap>
    </Outer>
  );
}

/** The snapshot closest to a date, for compare mode. */
export function SliceOfTimeAt({ store, place, date }) {
  const time = date.getTime();
  // Keeps the previous snapshot on screen while the next one loads.
  const [snapshot, setSnapshot] = useState(null);

  useEffect(() => {
    let active = true;

    findSnapshot(
      store,
      (timeline, settle) => closestTarget(timeline, time, { settle }),
      () => !active
    ).then((found) => {
      if (active && found) {
        setSnapshot(found);
      }
    });

    return () => {
      active = false;
    };
  }, [store, time]);

  return <SliceOfTime place={place} snapshot={snapshot} />;
}
