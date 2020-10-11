import React, { useEffect, useCallback, useReducer } from 'react';
import produce from 'immer';
import { useQuery } from 'urql';
import styled from 'styled-components';

import { getClosestSnapshot, hoursBetweenDates } from 'core/utils';
import { PLACE_SNAPSHOTS } from 'modules/queries';
import SnapshotImage from 'modules/snapshot-image';

const Outer = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Inner = styled.div`
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
    case 'clear-command': {
      draft.nextCommand = null;
      draft.pendingNavigation = null;
      break;
    }
    case 'command': {
      draft.nextCommand = rest.command;
      draft.pendingNavigation = null;
      break;
    }
    case 'get-more': {
      const { snapshots, snapshotsToMove, desiredDate } = rest;

      if (desiredDate) {
        const from = new Date(desiredDate.getTime());
        const to = new Date(desiredDate.getTime());
        from.setDate(from.getDate() - 3);
        to.setDate(to.getDate() + 3);
        draft.query.from = from.toString();
        draft.query.to = to.toString();
        draft.pendingDate = desiredDate;
        break;
      }

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
  command,
  setLoading,
  currentSnapshot,
  setCurrentSnapshot,
}) {
  const [
    { nextCommand, pendingNavigation, pendingDate, firstSnapshotCuid, query },
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
    ({ snapshotsToMove, desiredDate: desiredDateFromCommand }) => {
      if (desiredDateFromCommand) {
        const { snapshot } = getClosestSnapshot({
          desiredDate: desiredDateFromCommand,
          snapshots,
        });

        return { snapshot, desiredDate: desiredDateFromCommand };
      } else if (Math.abs(snapshotsToMove) === 1) {
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
        const desiredDate = new Date(currentSnapshot.date);
        desiredDate.setHours(desiredDate.getHours() + snapshotsToMove);

        const { snapshot } = getClosestSnapshot({
          desiredDate,
          snapshots,
        });

        return { snapshot, desiredDate };
      }
    },
    [snapshots, currentSnapshot]
  );

  // Parent notification of loading
  useEffect(() => {
    setLoading?.(pendingNavigation);
  }, [setLoading, pendingNavigation]);

  // Listen for parent commands
  useEffect(() => {
    if (command) {
      dispatch({ action: 'command', command });
    }
  }, [command]);

  // Act on command
  useEffect(() => {
    if (nextCommand) {
      dispatch({ action: 'clear-command' });
      const { snapshotsToMove, nextDesiredDate } = nextCommand;

      if (snapshotsToMove || nextDesiredDate) {
        const { snapshot, desiredDate } = getNextSnapshot({
          snapshotsToMove,
          desiredDate: nextDesiredDate,
        });

        // Check if we moved enough
        if (
          snapshot.cuid === currentSnapshot.cuid ||
          hoursBetweenDates(new Date(snapshot.date), desiredDate) > 1
        ) {
          dispatch({
            action: 'get-more',
            desiredDate,
            snapshotsToMove,
            snapshots,
          });
          return;
        }

        setCurrentSnapshot(snapshot);
      }
    }
  }, [
    nextCommand,
    currentSnapshot.cuid,
    getNextSnapshot,
    setCurrentSnapshot,
    snapshots,
  ]);

  // Act on new data
  useEffect(() => {
    if (
      snapshots?.[0]?.cuid !== firstSnapshotCuid &&
      (pendingNavigation || pendingDate)
    ) {
      const { snapshot } = getNextSnapshot({
        snapshotsToMove: pendingNavigation,
        desiredDate: pendingDate,
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
    pendingDate,
    setCurrentSnapshot,
  ]);

  return (
    <Outer>
      <Inner>
        <SnapshotImage
          {...currentSnapshot}
          placeName={place.name}
          sizes="100vw"
        />
      </Inner>
    </Outer>
  );
}
