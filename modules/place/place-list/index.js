import React from "react";
import PropTypes from "prop-types";

import { List } from "./ui";
import ListItem from "./list-item";

export default class PlaceList extends React.Component {
  static propTypes = {
    places: PropTypes.array
  };

  render() {
    const { places } = this.props;

    return (
      <List>
        {places.map(p => (
          <ListItem data={p} key={p.cuid} />
        ))}
      </List>
    );
  }
}
