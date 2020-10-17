import React, { useEffect, useCallback, useReducer } from 'react';
import produce from 'immer';
import { useQuery } from 'urql';
import styled from 'styled-components';
import is from 'styled-is';

import { getClosestSnapshot, hoursBetweenDates } from 'core/utils';
import { graphDate } from 'core/date';
import { PLACE_SNAPSHOTS } from 'modules/queries';
import SnapshotImage from 'modules/snapshot-image';

const Outer = styled.div`
  text-align: center;

  ${is('$placeholder')`
    padding-top: ${(9 / 16) * 100}%;
  `};

  img {
    max-height: 80vh;
  }
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
      draft.pendingDate = null;
      break;
    }
    case 'command': {
      draft.nextCommand = rest.command;
      draft.pendingNavigation = null;
      draft.pendingDate = null;
      break;
    }
    case 'get-more': {
      const { snapshots, snapshotsToMove, desiredDate } = rest;

      draft.firstSnapshotCuid = snapshots?.[0]?.cuid;

      if (desiredDate) {
        const from = new Date(desiredDate.getTime());
        const to = new Date(desiredDate.getTime());
        from.setDate(from.getDate() - 3);
        to.setDate(to.getDate() + 3);
        draft.query.from = graphDate(from);
        draft.query.to = graphDate(to);
        draft.pendingDate = desiredDate;
        break;
      }

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
      draft.pendingDate = null;

      draft.localSnapshot = rest.nextLocalSnapshot;
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
  date,
  snapshot: snapshotFromParent,
  setSnapshot,
}) {
  const [
    {
      nextCommand,
      pendingNavigation,
      pendingDate,
      firstSnapshotCuid,
      query,
      localSnapshot,
    },
    dispatch,
  ] = useReducer(reducer, initialState);

  const snapshot = localSnapshot || snapshotFromParent;

  const [{ data: { snapshots } = {} }] = useQuery({
    query: PLACE_SNAPSHOTS,
    variables: {
      ...query,
      placeName: place.name,
    },
  });

  const getNextSnapshot = useCallback(
    ({ snapshotsToMove, desiredDate: desiredDateFromCommand }) => {
      if (!snapshots) {
        return {};
      }

      if (desiredDateFromCommand) {
        const closest = getClosestSnapshot({
          desiredDate: desiredDateFromCommand,
          snapshots,
        });

        return {
          snapshot: closest.snapshot,
          desiredDate: desiredDateFromCommand,
        };
      } else {
        if (!snapshot) {
          return {};
        }
        if (Math.abs(snapshotsToMove) === 1) {
          const index = snapshots?.findIndex((s) => s.cuid === snapshot.cuid);
          if (snapshotsToMove === 1) {
            return {
              snapshot: snapshots[index + 1] || snapshots[snapshots.length - 1],
            };
          } else if (snapshotsToMove === -1) {
            return { snapshot: snapshots[index - 1] || snapshots[0] };
          }
        } else {
          const desiredDate = new Date(snapshot.date);
          desiredDate.setHours(desiredDate.getHours() + snapshotsToMove);

          const closest = getClosestSnapshot({
            desiredDate,
            snapshots,
          });

          return { snapshot: closest.snapshot, desiredDate };
        }
      }
    },
    [snapshots, snapshot]
  );

  // Act on date from parent
  useEffect(() => {
    if (date) {
      dispatch({ action: 'command', command: { nextDesiredDate: date } });
    }
  }, [date]);

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
        const next = getNextSnapshot({
          snapshotsToMove,
          desiredDate: nextDesiredDate,
        });

        // Check if we moved enough
        if (
          !next.snapshot ||
          !snapshot ||
          snapshot?.cuid === next.snapshot?.cuid ||
          hoursBetweenDates(new Date(snapshot.date), nextDesiredDate) > 1
        ) {
          dispatch({
            action: 'get-more',
            desiredDate: nextDesiredDate,
            snapshotsToMove,
            snapshots,
          });
          return;
        }

        if (setSnapshot) {
          if (next.snapshot) {
            setSnapshot?.(next.snapshot);
          }
        } else {
          dispatch({ action: 'got-more', nextLocalSnapshot: next.snapshot });
        }
      }
    }
  }, [nextCommand, snapshot, snapshots, getNextSnapshot, setSnapshot]);

  // Act on new data
  useEffect(() => {
    const newFirstSnapshotCuid = snapshots?.[0]?.cuid;
    if (
      newFirstSnapshotCuid !== firstSnapshotCuid &&
      (pendingNavigation || pendingDate)
    ) {
      const next = getNextSnapshot({
        snapshotsToMove: pendingNavigation,
        desiredDate: pendingDate,
      });

      if (setSnapshot) {
        if (next.snapshot) {
          setSnapshot?.(next.snapshot);
        }
        dispatch({ action: 'got-more' });
      } else {
        dispatch({ action: 'got-more', nextLocalSnapshot: next.snapshot });
      }
    }
  }, [
    firstSnapshotCuid,
    snapshots,
    getNextSnapshot,
    pendingNavigation,
    pendingDate,
    setSnapshot,
  ]);

  if (!snapshot) {
    return <Outer $placeholder />;
  }

  return (
    <Outer>
      <SnapshotImage {...snapshot} placeName={place.name} sizes="100vw" />
    </Outer>
  );
}
