import React from 'react';
import PropTypes from 'prop-types';

import { List } from './ui';
import ListItem from './list-item';

const PlaceList = ({ places }) => (
  <List>
    {places.map(p => (
      <ListItem {...p} key={p.cuid} />
    ))}
  </List>
);

PlaceList.propTypes = {
  places: PropTypes.array
};

export default PlaceList;
