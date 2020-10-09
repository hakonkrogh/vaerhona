import React, { useEffect, useCallback, useReducer } from 'react';
import produce from 'immer';
import { useQuery } from 'urql';
import styled from 'styled-components';

import { getClosestSnapshot, hoursBetweenDates } from 'core/utils';
import { PLACE_SNAPSHOTS } from 'modules/queries';

import Image from './image';

export const Outer = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-top: 10px;
`;

export const Inner = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

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

export default function SliceOfTime({
  place,
  action,
  actionRespond,
  setLoading,
  currentSnapshot,
  setCurrentSnapshot,
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
    setLoading?.(pendingNavigation);
  }, [setLoading, pendingNavigation]);

  // Listen for parent actions
  useEffect(() => {
    if (action) {
      const { snapshotsToMove, respond } = action;
      if (snapshotsToMove) {
        respond?.();

        const { snapshot, dateToBeCloseTo } = getNextSnapshot({
          snapshotsToMove,
        });

        // Check if we moved enough
        if (
          snapshot.cuid === currentSnapshot.cuid ||
          hoursBetweenDates(new Date(snapshot.date), dateToBeCloseTo) > 1
        ) {
          dispatch({
            action: 'get-more',
            snapshotsToMove,
            snapshots,
          });
          return;
        }

        setCurrentSnapshot(snapshot);
      }
    }
  }, [
    action,
    actionRespond,
    currentSnapshot.cuid,
    getNextSnapshot,
    setCurrentSnapshot,
    snapshots,
  ]);

  // Act on new data
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

  return (
    <Outer>
      <Inner>
        <Image
          snapshot={currentSnapshot}
          place={place}
          onDateChange={() => {}}
        />
      </Inner>
    </Outer>
  );
}
