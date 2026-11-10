import React, { useState } from 'react';

import { getTransitionPlace, setTransitionPlace } from 'core/page-transition';

import ListItem from './list-item';
import styles from './place-list.module.css';

// About this many photos show without scrolling on a phone. They load first.
const PRIORITY_PHOTOS = 2;

const PlaceList = ({ places }) => {
  // The place whose photo moves to or from the place page. Coming back from
  // a place page, it is that place.
  const [transitionPlace, setPlace] = useState(getTransitionPlace);

  function select(name) {
    setTransitionPlace(name);
    setPlace(name);
  }

  return (
    <ul className={styles.list}>
      {places.map((p, index) => (
        <ListItem
          {...p}
          key={p.cuid}
          priority={index < PRIORITY_PHOTOS}
          photoTransition={p.name === transitionPlace}
          onSelect={() => select(p.name)}
        />
      ))}
    </ul>
  );
};

export default PlaceList;
