import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import SnapshotsNavigator from '../../../Snapshot/components/SnapshotsNavigator/SnapshotsNavigator';

import { setSelectedPlace, getSelectedPlace } from '../../../App/AppActions';
import { fetchSnapshots } from '../../../Snapshot/SnapshotActions';
import { getSnapshots } from '../../../Snapshot/SnapshotReducer';

export class PlacePage extends Component {
	componentDidMount() {
		this.props.dispatch(setSelectedPlace({ name: this.props.params.placeName }));
	}
	render() {
		return (
			<div>
				<Helmet title={this.props.params.placeName[0].toUpperCase() + this.props.params.placeName.substr(1)} />
				<div>
					<SnapshotsNavigator snapshots={this.props.snapshots} />
				</div>
			</div>
		);
	}
}

// Actions required to provide data for this component to render in sever side.
PlacePage.need = [() => { return fetchSnapshots(); }];

PlacePage.propTypes = {
  snapshots: PropTypes.arrayOf(PropTypes.shape({
    cuid: PropTypes.string.isRequired,
    temperature: PropTypes.number.isRequired,
    humidity: PropTypes.number.isRequired,
    pressure: PropTypes.number.isRequired,
  })).isRequired,
  dispatch: PropTypes.func.isRequired
};

//PlacePage.contextTypes = {
//  router: React.PropTypes.object
//};

function mapStateToProps (state) {
	return {
		selectedPlace: getSelectedPlace(state),
		snapshots: getSnapshots(state)
	};
}

export default connect(mapStateToProps)(PlacePage);