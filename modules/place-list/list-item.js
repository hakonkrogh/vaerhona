import React from 'react';
import PropTypes from 'prop-types';

import { getImagePath } from '../../isomorphic/api';
import { ListItem, Image } from './ui';

export default class PlaceListItem extends React.Component {
    static propTypes = {
        data: PropTypes.object
    }
    
    render () {
        const { place, snapshot } = this.props.data;
        const imageAltText = `Bilde fra ${place.name} tatt ${snapshot.dateAdded.toLocaleString()}`;
        return (
            <ListItem>
                {place.name} - {snapshot.temperature}
                <Image src={getImagePath(snapshot)} alt={imageAltText}/>
            </ListItem>
        );
    }
}
