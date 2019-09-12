import React from 'react';
import Link from 'next/link';
import upperFirst from 'upper-case-first';

import { timeOrDate } from 'core/date';
import SnapshotImg from 'modules/snapshot-image';

import { ListItem, Upper, PlaceName, Time, Image } from './ui';

const PlaceListItem = ({ name, mostRecentSnapshot: snapshot }) => (
  <ListItem>
    <Link as={`/${name}`} href={`/place?placeName=${name}`}>
      <a>
        <Upper>
          <PlaceName>{upperFirst(name)}</PlaceName>
          <div>
            <Time>{timeOrDate(snapshot.date)}</Time>
          </div>
        </Upper>
        <Image>
          <SnapshotImg {...snapshot} />
        </Image>
      </a>
    </Link>
  </ListItem>
);

export default PlaceListItem;
