import React from 'react';
import PropTypes from 'prop-types';

import { List } from './ui';
import ListItem from './list-item';

// About this many photos show without scrolling on a phone. They load first.
const PRIORITY_PHOTOS = 2;

const PlaceList = ({ places }) => (
  <List>
    {places.map((p, index) => (
      <ListItem {...p} key={p.cuid} priority={index < PRIORITY_PHOTOS} />
    ))}
  </List>
);

PlaceList.propTypes = {
  places: PropTypes.array,
};

export default PlaceList;
