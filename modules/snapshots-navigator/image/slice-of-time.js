import React, { useEffect, useCallback, useReducer } from 'react';
import produce from 'immer';
import { useQuery } from 'urql';
import styled from 'styled-components';

import { getClosestSnapshot, hoursBetweenDates } from 'core/utils';
import { graphDate } from 'core/date';
import { PLACE_SNAPSHOTS } from 'modules/queries';
import SnapshotImage from 'modules/snapshot-image';
import { Spinner } from 'ui';

const Outer = styled.div`
  position: relative;
  max-width: 700px;
  margin: 0 auto;

  .loader {
    background: #eee;
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 16 / 9;

    @media (min-width: 700px) {
      width: 700px;
    }
  }
`;

const ImageWrap = styled.div`
  position: relative;
  max-width: 700px;
  margin: 0 auto;
`;

const initialState = {
  pendingNavigation: null,
  snapshots: [],
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
      draft.pendingDateOnSnapshotChange = null;
      break;
    }
    case 'command': {
      draft.nextCommand = rest.command;
      draft.pendingNavigation = null;
      draft.pendingDate = null;
      draft.pendingDateOnSnapshotChange = null;
      break;
    }
    case 'get-more': {
      const { snapshots, snapshotsToMove, desiredDate } = rest;

      draft.lastSnapshotsDate = draft.snapshotsDate;

      if (desiredDate) {
        const from = new Date(desiredDate.getTime());
        const to = new Date(desiredDate.getTime());
        from.setDate(from.getDate() - 3);
        to.setDate(to.getDate() + 3);
        draft.query.from = graphDate(from);
        draft.query.to = graphDate(to);
        draft.pendingDateOnSnapshotChange = desiredDate;
        break;
      }

      draft.pendingNavigation = snapshotsToMove;

      if (snapshotsToMove < 0) {
        draft.query.from = null;
        draft.query.to = snapshots[0]?.date || new Date().toISOString();
      } else {
        draft.query.from = snapshots[snapshots.length - 1].date;
        draft.query.to = null;
      }
      break;
    }
    case 'got-more': {
      draft.pendingNavigation = null;
      draft.pendingDate = null;
      draft.pendingDateOnSnapshotChange = null;

      draft.localSnapshot = rest.nextLocalSnapshot;
      break;
    }
    case 'snapshots': {
      draft.snapshots = (draft.snapshots || []).concat(rest.snapshots);
      draft.snapshotsDate = new Date();
      draft.pendingDate = draft.pendingDateOnSnapshotChange;
      draft.pendingDateOnSnapshotChange = null;
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
      snapshots,
      snapshotsDate,
      lastSnapshotsDate,
      query,
      localSnapshot,
    },
    dispatch,
  ] = useReducer(reducer, initialState);

  const snapshot = localSnapshot || snapshotFromParent;

  const [{ data = {} }] = useQuery({
    query: PLACE_SNAPSHOTS,
    variables: {
      ...query,
      placeName: place.name,
    },
  });

  useEffect(() => {
    if (data.snapshots) {
      dispatch({ action: 'snapshots', ...data });
    }
  }, [data]);

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
          hoursBetweenDates(new Date(next.snapshot.date), nextDesiredDate) > 1
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
            setSnapshot(next.snapshot);
          }
        } else {
          dispatch({ action: 'got-more', nextLocalSnapshot: next.snapshot });
        }
      }
    }
  }, [nextCommand, snapshot, snapshots, getNextSnapshot, setSnapshot]);

  // Act on new data
  useEffect(() => {
    if (
      lastSnapshotsDate !== snapshotsDate &&
      (pendingNavigation || pendingDate)
    ) {
      const next = getNextSnapshot({
        snapshotsToMove: pendingNavigation,
        desiredDate: pendingDate,
      });

      if (setSnapshot) {
        if (next.snapshot) {
          setSnapshot(next.snapshot);
        }
        dispatch({ action: 'got-more' });
      } else {
        dispatch({ action: 'got-more', nextLocalSnapshot: next.snapshot });
      }
    }
  }, [
    lastSnapshotsDate,
    snapshots,
    snapshotsDate,
    getNextSnapshot,
    pendingNavigation,
    pendingDate,
    setSnapshot,
  ]);

  if (!snapshot) {
    return (
      <Outer>
        <div className="loader">
          <Spinner size="30px" />
        </div>
      </Outer>
    );
  }

  return (
    <Outer>
      <ImageWrap>
        <SnapshotImage
          key={snapshot.cuid}
          {...snapshot}
          placeName={place.name}
          sizes="100vw"
        />
      </ImageWrap>
    </Outer>
  );
}
