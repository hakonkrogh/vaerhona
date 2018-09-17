import React from "react";
import PropTypes from "prop-types";
import Link from "next/link";

import { timeOrDate } from "core/date";

import { ListItem, PlaceName, Temperature, Time, Image } from "./ui";

export default class PlaceListItem extends React.Component {
  static propTypes = {
    data: PropTypes.object,
    query: PropTypes.object
  };

  render() {
    const { name, mostRecentSnapshot: snapshot } = this.props.data;

    return (
      <ListItem>
        <Link
          as={`/${name}`}
          href={{ pathname: "/place", query: { placeName: name } }}
          prefetch
        >
          <a>
            <PlaceName>{name}</PlaceName>
            <Time>{timeOrDate(snapshot.date)}</Time>
            <Temperature>
              {snapshot.temperature}
              &#8451;
            </Temperature>
            <Image snapshot={snapshot} />
          </a>
        </Link>
      </ListItem>
    );
  }
}
