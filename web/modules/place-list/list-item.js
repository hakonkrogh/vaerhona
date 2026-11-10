import React from 'react';
import Link from 'next/link';
import { upperFirst } from 'core/utils';

import { timeOrDate } from 'core/date';
import SnapshotImage from 'modules/snapshot-image';

import { ListItem, Upper, PlaceName, Time, ImageWrapper } from './ui';

const PlaceListItem = ({ name, lastSnapshot: snapshot, priority }) => (
  <ListItem>
    <Link href={`/${name}`}>
      <Upper>
        <PlaceName>{upperFirst(name)}</PlaceName>
        <div>
          <Time>{timeOrDate(snapshot.date)}</Time>
        </div>
      </Upper>

      <ImageWrapper>
        <SnapshotImage
          image={snapshot.image}
          date={snapshot.date}
          placeName={name}
          sizes="300px"
          priority={priority}
        />
      </ImageWrapper>
    </Link>
  </ListItem>
);

export default PlaceListItem;
