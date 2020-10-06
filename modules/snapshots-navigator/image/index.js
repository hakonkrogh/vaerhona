import React, { useEffect, useCallback, useReducer } from 'react';
import produce from 'immer';
import { useQuery } from 'urql';

import { Button, IconArrow } from 'ui';
import { getClosestSnapshot } from 'core/utils';
import { PLACE_SNAPSHOTS } from 'modules/queries';

import { Outer, Inner, Images, Bottom } from './ui';
import Image from './image';
import SplitImage from './split-image';

const initialState = {
  activeNavigation: null,
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

      draft.activeNavigation = snapshotsToMove;
      if (snapshotsToMove < 0) {
        draft.query.to = snapshots[0].date;
      } else {
        draft.query.to = null;
        draft.query.from = snapshots[snapshots.length - 1].date;
      }
      break;
    }
    case 'got-more': {
      draft.activeNavigation = null;
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
  const [{ activeNavigation, query }, dispatch] = useReducer(
    reducer,
    initialState
  );

  const [{ data: { snapshots } = {}, fetching }] = useQuery({
    query: PLACE_SNAPSHOTS,
    variables: {
      ...query,
      placeName: place.name,
    },
  });

  // Set the new snapshot after fetching from api
  useEffect(() => {
    if (activeNavigation && snapshots) {
      const { index } = getClosestSnapshot({
        dateToBeCloseTo: currentSnapshot.date,
        snapshots,
      });
      let newSnapshot = snapshots[index + activeNavigation];
      if (!newSnapshot) {
        if (activeNavigation < 0) {
          newSnapshot = snapshots[0];
        } else {
          newSnapshot = snapshots[snapshots.length + 1];
        }
      }

      if (newSnapshot) {
        setCurrentSnapshot(newSnapshot);
      }

      dispatch({ action: 'got-more' });
    }
  }, [activeNavigation, snapshots, setCurrentSnapshot, currentSnapshot]);

  function buttonProps(snapshotsToMove) {
    return {
      clean: true,
      onClick: () => {
        const newSnapshot =
          snapshots[
            snapshots.findIndex((s) => s.cuid === currentSnapshot.cuid) +
              snapshotsToMove
          ];

        if (newSnapshot) {
          setCurrentSnapshot(newSnapshot);
        } else {
          dispatch({
            action: 'get-more',
            snapshotsToMove,
            snapshots,
          });
        }
      },
      disabled: !snapshots || fetching,
      loading: fetching && activeNavigation === snapshotsToMove,
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
