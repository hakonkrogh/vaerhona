import React, { useState } from 'react';
import Switch from 'react-switch';

import { Button, IconArrow, IconCompare } from 'ui';

import { Outer, Bottom, BottomInner, SwitchOuter, CompareList } from './ui';
import SliceOfTime from './slice-of-time';
import Metadata from './metadata';
import DateVisualiser from './date';

export default function SnapshotImage({
  place,
  currentSnapshot,
  setCurrentSnapshot,
  setCompare,
  canCompare,
  compare,
  compareDates,
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
      snapshotsToMove > 0 &&
      new Date(currentSnapshot.date) >= new Date(place.lastSnapshot.date);

    return {
      clean: true,
      onClick: () => {
        setCommand({
          d: Date.now(),
          snapshotsToMove,
        });
      },
      disabled,
      loading: buttonLoading === snapshotsToMove,
    };
  }

  const compareDate = new Date(currentSnapshot.date);
  compareDate.setFullYear(compareDate.getFullYear() - 1);

  if (!currentSnapshot) {
    return null;
  }

  return (
    <Outer>
      <DateVisualiser
        place={place}
        snapshot={currentSnapshot}
        onDateChange={onDateChange}
      />
      <SliceOfTime
        command={command}
        place={place}
        snapshot={currentSnapshot}
        setSnapshot={setCurrentSnapshot}
        setLoading={setButtonLoading}
      />
      {!compare && <Metadata place={place} snapshot={currentSnapshot} />}
      {compare && (
        <CompareList>
          {compareDates.map((date) => (
            <li key={date}>
              <div style={{ margin: '30px 0 15px', textAlign: 'center' }}>
                {date.getFullYear()}
              </div>
              <SliceOfTime place={place} date={date} />
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
