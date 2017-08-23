import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Link from 'next/link';

import { prettyTime } from '../../../core/date';
import { getImagePath } from '../../../isomorphic/api';
import {
    ListItem,
    PlaceLink,
    Image,
    PlaceName,
    Temperature,
    Time
} from './ui';

export default class PlaceListItem extends React.Component {
    static propTypes = {
        data: PropTypes.object
    }

    render () {
        const { place, snapshot } = this.props.data;
        const imageAltText = `Bilde fra ${place.name} tatt ${snapshot.dateAdded.toLocaleString()}`;

        return (
            <ListItem>
                <Link as={`/${place.name}`} href='/place' query={{ placeName: place.name }}>
                    <a>
                        <PlaceName>{place.name}</PlaceName>
                        <Time>{prettyTime(snapshot.dateAdded)}</Time>
                        <Temperature>{snapshot.temperature}&#8451;</Temperature>
                        <Image src={getImagePath({ snapshot })} alt={imageAltText}/>
                    </a>
                </Link>
            </ListItem>
        );
    }
}
