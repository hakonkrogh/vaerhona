import React from 'react';
import PropTypes from 'prop-types';

import { List } from './ui';
import ListItem from './list-item';

export default class PlaceList extends React.Component {
    static propTypes = {
        places: PropTypes.array
    }
    
    render () {
        return (
            <List>
                {this.props.data.places.map(p => <ListItem data={p} key={p.place.cuid} />)}
            </List>
        );
    }
}
