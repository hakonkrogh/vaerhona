import React, { useState } from 'react';
import Switch from 'react-switch';

import Icon from './icon';
import SnapshotImage from './image';
import SnapshotGraph from './graph';

import { IconCompare } from 'ui';
import { Outer, Inner, IconMenu, SwitchOuter } from './ui';

export function SnapshotsNavigator({ place }) {
  const [currentSnapshot, setCurrentSnapshot] = useState(place.lastSnapshot);
  const [view, setView] = useState('image');
  const [compare, setCompare] = useState(false);

  const sharedProps = {
    place,
    currentSnapshot,
    setCurrentSnapshot,
    compare,
  };

  return (
    <Outer>
      <Inner>
        {view === 'image' && <SnapshotImage {...sharedProps} />}
        {view === 'graph' && <SnapshotGraph {...sharedProps} />}
      </Inner>
      <IconMenu>
        <Icon
          selected={view === 'image'}
          type="image"
          onClick={() => setView('image')}
        />
        <Icon
          selected={view === 'graph'}
          type="graph"
          onClick={() => setView('graph')}
        />

        <SwitchOuter>
          <label htmlFor="compare-switch">
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
            <IconCompare />
          </label>
        </SwitchOuter>
      </IconMenu>
    </Outer>
  );
}
