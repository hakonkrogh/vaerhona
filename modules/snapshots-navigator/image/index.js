import React, { useState } from 'react';

import { Button, IconArrow } from 'ui';

import { Outer, Bottom, BottomInner } from './ui';
import SliceOfTime from './slice-of-time';
import Metadata from './metadata';

export default function SnapshotImage({
  place,
  currentSnapshot,
  setCurrentSnapshot,
  compare,
}) {
  const [action, setAction] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(null);

  function onDateChange(newDate) {
    console.log({ newDate });
  }

  function buttonProps(snapshotsToMove) {
    let disabled =
      !compare &&
      snapshotsToMove > 0 &&
      new Date(currentSnapshot.date) >= new Date(place.lastSnapshot.date);

    return {
      clean: true,
      onClick: () => {
        if (!compare) {
          setAction({
            d: Date.now(),
            snapshotsToMove,
            respond: () => setAction(null),
          });
        }
      },
      disabled,
      loading: !compare && buttonLoading === snapshotsToMove,
    };
  }

  return (
    <Outer>
      {!compare ? (
        <>
          <SliceOfTime
            action={action}
            place={place}
            currentSnapshot={currentSnapshot}
            setCurrentSnapshot={setCurrentSnapshot}
            setLoading={setButtonLoading}
          />
          <Metadata
            place={place}
            snapshot={currentSnapshot}
            onDateChange={onDateChange}
          />
        </>
      ) : (
        'todo compare...'
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
