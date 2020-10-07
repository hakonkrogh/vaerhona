import React, { useEffect, useCallback, useReducer } from 'react';
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
    limit: 25 * 2,
  },
};

const reducer = produce((draft, { action, ...rest }) => {
  switch (action) {
    case 'get-more': {
      const { snapshots, snapshotsToMove } = rest;

      draft.pendingNavigation = snapshotsToMove;
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
  const [{ pendingNavigation, query }, dispatch] = useReducer(
    reducer,
    initialState
  );

  const [{ data: { snapshots } = {} }, fetching] = useQuery({
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

  // Set the new snapshot after fetching from api
  useEffect(() => {
    if (pendingNavigation && !fetching) {
      if (!snapshots.some((s) => s.cuid === currentSnapshot.cuid)) {
        const { snapshot } = getNextSnapshot({
          snapshotsToMove: pendingNavigation,
        });

        if (snapshot) {
          setCurrentSnapshot(snapshot);
        }
      }

      dispatch({ action: 'got-more' });
    }
  }, [
    snapshots,
    fetching,
    currentSnapshot,
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
          if (dateToBeCloseTo < new Date()) {
            dispatch({
              action: 'get-more',
              snapshotsToMove,
              snapshots,
            });
          }
        } else {
          setCurrentSnapshot(snapshot);
        }
      },
      disabled: !loading && !snapshots,
      loading,
    };
  }

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
            <Button {...buttonProps(1)}>
              <IconArrow />
            </Button>
            <Button {...buttonProps(24)}>
              <IconArrow />
              <IconArrow />
            </Button>
          </span>
        </Bottom>
      </Inner>
    </Outer>
  );
}
