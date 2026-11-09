import React, { useState } from 'react';
import Switch from 'react-switch';

import { Button, IconArrow, IconCompare } from 'ui';

import { useSnapshotNavigation } from '../use-snapshot-navigation';
import { Outer, Bottom, BottomInner, SwitchOuter, CompareList } from './ui';
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
    <Outer>
      <DateVisualiser
        place={place}
        snapshot={currentSnapshot}
        onDateChange={goToDate}
      />

      <SliceOfTime
        place={place}
        snapshot={currentSnapshot}
        priority
        onPhotoLoad={() => setLoadedPhoto(currentSnapshot.cuid)}
      />

      {compare && (
        <CompareList>
          {compareDates.map((date, index) => (
            <li key={index}>
              <div style={{ margin: '30px 0 15px', textAlign: 'center' }}>
                {date.getFullYear()}
              </div>
              <SliceOfTimeAt store={store} place={place} date={date} />
            </li>
          ))}
        </CompareList>
      )}
      <Bottom>
        <BottomInner>
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
            <SwitchOuter>
              <label htmlFor="compare-switch">
                <IconCompare />
                <Switch
                  checked={compare}
                  id="compare-switch"
                  onChange={() => setCompare(!compare)}
                  onColor="#b7ccc2"
                  onHandleColor="#81a594"
                  handleDiameter={20}
                  uncheckedIcon={false}
                  checkedIcon={false}
                  boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                  height={20}
                  width={36}
                  aria-label="Sammenlign med året før"
                />
              </label>
            </SwitchOuter>
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
        </BottomInner>
      </Bottom>
    </Outer>
  );
}
