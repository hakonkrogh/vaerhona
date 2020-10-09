import React, { useEffect, useCallback, useReducer, useState } from 'react';
import produce from 'immer';
import { useQuery } from 'urql';

import { Button, IconArrow } from 'ui';
import { getClosestSnapshot, hoursBetweenDates } from 'core/utils';
import { PLACE_SNAPSHOTS } from 'modules/queries';

import { Outer, Inner, Images, Bottom, BottomInner } from './ui';
import SliceOfTime from './slice-of-time';
import SplitImage from './split-image';

export default function SnapshotImage({
  place,
  currentSnapshot,
  setCurrentSnapshot,
  compare,
}) {
  const [action, setAction] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(null);

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
      <Inner>
        <Images>
          {!compare ? (
            <SliceOfTime
              action={action}
              place={place}
              currentSnapshot={currentSnapshot}
              setCurrentSnapshot={setCurrentSnapshot}
              setLoading={setButtonLoading}
            />
          ) : (
            'todo compare...'
          )}
        </Images>
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
      </Inner>
    </Outer>
  );
}
