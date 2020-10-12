import React, { useState } from 'react';

import { Button, IconArrow } from 'ui';

import { Outer, Bottom, BottomInner } from './ui';
import SliceOfTime from './slice-of-time';
import Metadata from './metadata';
import DateVisualiser from './date';

export default function SnapshotImage({
  place,
  currentSnapshot,
  setCurrentSnapshot,
  compare,
}) {
  const [command, setCommand] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(null);

  function onDateChange(newDate) {
    setCommand({
      d: Date.now(),
      nextDesiredDate: newDate,
    });
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
          setCommand({
            d: Date.now(),
            snapshotsToMove,
          });
        }
      },
      disabled,
      loading: !compare && buttonLoading === snapshotsToMove,
    };
  }

  const compareDate = new Date(currentSnapshot.date);
  compareDate.setFullYear(compareDate.getFullYear() - 1);

  return (
    <Outer>
      {!compare ? (
        <>
          {currentSnapshot && (
            <DateVisualiser
              place={place}
              snapshot={currentSnapshot}
              onDateChange={onDateChange}
            />
          )}
          <SliceOfTime
            command={command}
            place={place}
            snapshot={currentSnapshot}
            setSnapshot={setCurrentSnapshot}
            setLoading={setButtonLoading}
          />
          {/* <SliceOfTime command={command} place={place} date={compareDate} /> */}
          <Metadata place={place} snapshot={currentSnapshot} />
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
