import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Helmet from 'react-helmet';

import Header from '../../../App/components/Header/Header';

import { getPlaces } from '../../../Place/PlaceReducer';
import { fetchPlaces } from '../../../Place/PlaceActions';

import styles from './PlacesListPage.css';

const need = [
  params => fetchPlaces()
];

export class PlacesListPage extends Component {

  componentDidMount () {
    // We need to get data if we navigate to here client side
    if ((!this.props.places || this.props.places.length === 0) && this.props.params) {
      need.forEach(fn => this.props.dispatch(fn(this.props.params)));
    }
  }

  render () {
    return (
      <div>
        <Helmet title="Places" />
        <div>
          <Header>Places</Header>
          {
            this.props.places.map(place => (
              <div key={place.cuid}><Link to={`/${place.name}`}>{place.name} - {place.cuid}</Link></div>
            ))
          }
        </div>
      </div>
    );
  }
}

PlacesListPage.PropTypes = {
  places: PropTypes.arrayOf(PropTypes.shape({
    cuid: PropTypes.string,
    name: PropTypes.string
  })).isRequired,
  dispatch: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired
};

PlacesListPage.contextTypes = {
  router: React.PropTypes.object
};

PlacesListPage.need = need;

function mapStateToProps (state) {
  return {
    intl: state.intl,
    places: getPlaces(state)
  };
}

export default connect(mapStateToProps)(PlacesListPage);
