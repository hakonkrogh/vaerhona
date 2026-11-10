import React from 'react';

import ListItem from './list-item';
import styles from './place-list.module.css';

// About this many photos show without scrolling on a phone. They load first.
const PRIORITY_PHOTOS = 2;

const PlaceList = ({ places }) => (
  <ul className={styles.list}>
    {places.map((p, index) => (
      <ListItem {...p} key={p.cuid} priority={index < PRIORITY_PHOTOS} />
    ))}
  </ul>
);

export default PlaceList;
