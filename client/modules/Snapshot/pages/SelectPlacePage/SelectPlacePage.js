import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { unselectPlace } from '../../../Place/PlaceActions';
import { getSelectedPlace } from '../../../Place/PlaceReducer';

// Import Style
//import styles from '../../components/SnapshotListItem/SnapshotListItem.css';
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
	      <div>
	        Skriv inn navn på værhøne:
	      </div>
	    </div>
	  );
	}
}

// Actions required to provide data for this component to render in sever side.
//SnapshotDetailPage.need = [params => {
//  return fetchSnapshot(params.cuid);
//}];

// Retrieve data from store as props
function mapStateToProps (state, props) {
  return {
  	selectedPlace: getSelectedPlace(state)
  };
}

SelectPlacePage.propTypes = {
  dispatch: PropTypes.func.isRequired
};

export default connect(mapStateToProps)(SelectPlacePage);
