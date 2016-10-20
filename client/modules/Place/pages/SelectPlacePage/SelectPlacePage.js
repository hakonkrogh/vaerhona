import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { unselectPlace, fetchFrontpagePlaces } from '../../../Place/PlaceActions';
import { getSelectedPlace, getFrontpagePlaces } from '../../../Place/PlaceReducer';

import Header from '../../../App/components/Header/Header';
import PlacePreviewList from '../../components/PlacePreviewList/PlacePreviewList';
import IconApp from '../../../../components/Icons/App';

const need = [
  () => fetchFrontpagePlaces()
];

export class SelectPlacePage extends Component {

  componentWillMount () {
  	if (this.props.selectedPlace) {
  	  this.props.dispatch(unselectPlace());
	  }
  }

  render () {
	  return (
	    <div>
	      <Helmet title="Velg værhøne" />
	      <Header>
          <IconApp width='40px' height='40px' />
        </Header>
	      <div>
          <PlacePreviewList items={this.props.frontpagePlaces} />
	      </div>
	    </div>
	  );
	}
}

// Retrieve data from store as props
function mapStateToProps (state, props) {
  return {
  	selectedPlace: getSelectedPlace(state),
    frontpagePlaces: getFrontpagePlaces(state)
  };
}

SelectPlacePage.need = need;

SelectPlacePage.propTypes = {
  dispatch: PropTypes.func.isRequired
};

export default connect(mapStateToProps)(SelectPlacePage);