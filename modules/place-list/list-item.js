import React from 'react';
import Link from 'next/link';
import upperFirst from 'upper-case-first';

import { timeOrDate } from 'core/date';
import SnapshotImage from 'modules/snapshot-image';

import { ListItem, Upper, PlaceName, Time, ImageWrapper } from './ui';

const PlaceListItem = ({ name, lastSnapshot: snapshot }) => (
  <ListItem>
    <Link as={`/${name}`} href={`/place?placeName=${name}`}>
      <a>
        <Upper>
          <PlaceName>{upperFirst(name)}</PlaceName>
          <div>
            <Time>{timeOrDate(snapshot.date)}</Time>
          </div>
        </Upper>

        <ImageWrapper>
          <SnapshotImage {...snapshot} />
        </ImageWrapper>
      </a>
    </Link>
  </ListItem>
);

export default PlaceListItem;
