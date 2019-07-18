import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import upperFirst from 'upper-case-first';

import { timeOrDate } from 'core/date';
import SnapshotImg from 'modules/snapshot-image';

import { ListItem, PlaceName, Temperature, Time, Image } from './ui';

export default class PlaceListItem extends React.Component {
  static propTypes = {
    data: PropTypes.object,
    query: PropTypes.object
  };

  render() {
    const { name, mostRecentSnapshot: snapshot } = this.props.data;

    return (
      <ListItem>
        <Link as={`/p/${name}`} href="/p/[placeName]" prefetch>
          <a>
            <PlaceName>{upperFirst(name)}</PlaceName>
            <Time>{timeOrDate(snapshot.date)}</Time>
            <Temperature>
              {snapshot.temperature}
              &#8451;
            </Temperature>
            <Image>
              <SnapshotImg {...snapshot} />
            </Image>
          </a>
        </Link>
      </ListItem>
    );
  }
}
