import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import { getImagePath } from '../../../isomorphic/api';
import {
    ListItem,
    Link as AsyncLink,
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
        const date = moment(snapshot.dateAdded);
        const imageAltText = `Bilde fra ${place.name} tatt ${snapshot.dateAdded.toLocaleString()}`;
        const time = date.format('HH:mm');

        return (
            <ListItem>
                <AsyncLink href={`/${place.name}`}>
                    <PlaceName>{place.name}</PlaceName>
                    <Time>{time}</Time>
                    <Temperature>{snapshot.temperature}&#8451;</Temperature>
                    <Image src={getImagePath(snapshot)} alt={imageAltText}/>
                </AsyncLink>
            </ListItem>
        );
    }
}
