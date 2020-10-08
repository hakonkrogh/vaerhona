import React, { useEffect, useCallback, useReducer, useRef } from 'react';
import produce from 'immer';
import { useQuery } from 'urql';

import { Button, IconArrow } from 'ui';
import { getClosestSnapshot, hoursBetweenDates } from 'core/utils';
import { PLACE_SNAPSHOTS } from 'modules/queries';

import { Outer, Inner, Images, Bottom } from './ui';
import Image from './image';
import SplitImage from './split-image';

const initialState = {
  pendingNavigation: null,
  query: {
    from: null,
    to: new Date(),
    limit: 24 * 7,
  },
};

const reducer = produce((draft, { action, ...rest }) => {
  switch (action) {
    case 'get-more': {
      const { snapshots, snapshotsToMove } = rest;

      draft.pendingNavigation = snapshotsToMove;
      draft.firstSnapshotCuid = snapshots[0].cuid;
      if (snapshotsToMove < 0) {
        draft.query.from = null;
        draft.query.to = snapshots[0].date;
      } else {
        draft.query.from = snapshots[snapshots.length - 1].date;
        draft.query.to = null;
      }
      break;
    }
    case 'got-more': {
      draft.pendingNavigation = null;
      break;
    }
    default: {
      throw new Error(`Action "${action}" not implemented`);
    }
  }
});

export default function SnapshotImage({
  place,
  currentSnapshot,
  setCurrentSnapshot,
  compare,
}) {
  const [
    { pendingNavigation, firstSnapshotCuid, query },
    dispatch,
  ] = useReducer(reducer, initialState);

  const [{ data: { snapshots } = {} }] = useQuery({
    query: PLACE_SNAPSHOTS,
    variables: {
      ...query,
      placeName: place.name,
    },
  });

  const getNextSnapshot = useCallback(
    ({ snapshotsToMove }) => {
      if (Math.abs(snapshotsToMove) === 1) {
        const index = snapshots.findIndex(
          (s) => s.cuid === currentSnapshot.cuid
        );
        if (snapshotsToMove === 1) {
          return {
            snapshot: snapshots[index + 1] || snapshots[snapshots.length - 1],
          };
        } else if (snapshotsToMove === -1) {
          return { snapshot: snapshots[index - 1] || snapshots[0] };
        }
      } else {
        const dateToBeCloseTo = new Date(currentSnapshot.date);
        dateToBeCloseTo.setHours(dateToBeCloseTo.getHours() + snapshotsToMove);

        const { snapshot } = getClosestSnapshot({
          dateToBeCloseTo,
          snapshots,
        });

        return { snapshot, dateToBeCloseTo };
      }
    },
    [snapshots, currentSnapshot]
  );

  useEffect(() => {
    if (snapshots?.[0]?.cuid !== firstSnapshotCuid && pendingNavigation) {
      const { snapshot } = getNextSnapshot({
        snapshotsToMove: pendingNavigation,
      });

      if (snapshot) {
        setCurrentSnapshot(snapshot);
      }
      dispatch({ action: 'got-more' });
    }
  }, [
    firstSnapshotCuid,
    snapshots,
    getNextSnapshot,
    pendingNavigation,
    setCurrentSnapshot,
  ]);

  function buttonProps(snapshotsToMove) {
    const loading = pendingNavigation === snapshotsToMove;

    return {
      clean: true,
      onClick: () => {
        const { snapshot, dateToBeCloseTo } = getNextSnapshot({
          snapshotsToMove,
        });

        // Check if we did not move enough
        if (
          snapshot.cuid === currentSnapshot.cuid ||
          hoursBetweenDates(new Date(snapshot.date), dateToBeCloseTo) > 1
        ) {
          if (!dateToBeCloseTo || dateToBeCloseTo < new Date()) {
            dispatch({
              action: 'get-more',
              snapshotsToMove,
              snapshots,
            });
            return;
          }
        }

        setCurrentSnapshot(snapshot);
      },
      disabled: !loading && !snapshots,
      loading,
    };
  }

  const currentIsNow =
    new Date() - new Date(currentSnapshot.date) < 60 * 60 * 1000;

  return (
    <Outer>
      <Inner>
        <Images>
          <Image
            snapshot={currentSnapshot}
            place={place}
            onDateChange={() => {}}
          />
        </Images>
        <Bottom>
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
            <Button {...buttonProps(1)} disabled={currentIsNow}>
              <IconArrow />
            </Button>
            <Button {...buttonProps(24)} disabled={currentIsNow}>
              <IconArrow />
              <IconArrow />
            </Button>
          </span>
        </Bottom>
      </Inner>
    </Outer>
  );
}
