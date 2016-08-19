import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import SnapshotsNavigator from '../../../Snapshot/components/SnapshotsNavigator/SnapshotsNavigator';

import { setSelectedPlace } from '../../../App/AppActions';
import { fetchPlace } from '../../../Place/PlaceActions';
import { getSelectedPlace } from '../../../Place/PlaceReducer';
import { fetchSnapshots } from '../../../Snapshot/SnapshotActions';
import { getSnapshots } from '../../../Snapshot/SnapshotReducer';

export class PlacePage extends Component {

	componentWillMount () {

		// Set place if not set
		if (!this.props.selectedPlace) {
			this.setState({
				loading: true,
				selectedPlaceNotFound: false
			});
			fetchPlace(this.props.params.placeName)(this.props.dispatch).then(res => {
				this.setState({
					loading: false
				});

				if (!res || !res.place || !res.place.cuid) {
					this.setState({
						selectedPlaceNotFound: true
					});
				}
			});
		}

		// If there are no snapshots when loading, try to look again. This happens if we navigate here from the settings page
		//if ((!this.props.snapshots || this.props.snapshots.length === 0) && this.props.selectedPlace) {
		//	fetchSnapshots({ name: this.props.selectedPlace.name })(this.props.dispatch);
		//}
	}

	render () {

		// Waiting for place...
		if (this.state && this.state.loading) {
			return (
				<div>
					<Helmet title="Loading..." />
					<div>Loading...</div>
				</div>
			);
		}

		// We have a place, and it's got a name :)
		if (this.props.selectedPlace && this.props.selectedPlace.name) {
			return (
				<div>
					<Helmet title={this.props.selectedPlace.name[0].toUpperCase() + this.props.selectedPlace.name.substr(1)} />
					<SnapshotsNavigator snapshots={this.props.snapshots} place={this.props.selectedPlace} />
				</div>
			);
		}

		// Apparently no valid place was found
		return (
			<div>
				<Helmet title="Not a valid place" />
				<div>The place {this.props.params.placeName} not found</div>
			</div>
		);
	}
}

PlacePage.propTypes = {
  snapshots: PropTypes.arrayOf(PropTypes.shape({
    cuid: PropTypes.string.isRequired,
    temperature: PropTypes.number.isRequired,
    humidity: PropTypes.number.isRequired,
    pressure: PropTypes.number.isRequired,
  })),
  selectedPlace: PropTypes.oneOfType([
  	PropTypes.bool,
  	PropTypes.object
  ]),
  dispatch: PropTypes.func.isRequired
};

PlacePage.contextTypes = {
  router: React.PropTypes.object
};

PlacePage.need = [
	params => fetchPlace(params.placeName),
	params => fetchSnapshots({ name: params.placeName })
];

function mapStateToProps (state) {
	return {
		selectedPlace: getSelectedPlace(state),
		snapshots: getSnapshots(state)
	};
}

export default connect(mapStateToProps)(PlacePage);