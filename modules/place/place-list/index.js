import React from 'react';
import PropTypes from 'prop-types';

import { ListLoading, List } from './ui';
import ListItem from './list-item';
import Loader from '../../Loader';

export default class PlaceList extends React.Component {
    static propTypes = {
        places: PropTypes.array
    }

    render () {

      const { data } = this.props;

      if (!data) {
        return (
          <ListLoading>
            <Loader>Henter forside...</Loader>
          </ListLoading>
        );
      }

        return (
            <List>
                {this.props.data.places.map(p => <ListItem data={p} key={p.place.cuid} />)}
            </List>
        );
    }
}
