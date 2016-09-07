import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import SnapshotsNavigator from '../../../Snapshot/components/SnapshotsNavigator/SnapshotsNavigator';

import FullHeightWrapper from '../../../App/components/FullHeightWrapper/FullHeightWrapper';
import Header from '../../../App/components/Header/Header';

import { setSelectedPlace } from '../../../App/AppActions';
import { fetchPlace } from '../../../Place/PlaceActions';
import { getSelectedPlace } from '../../../Place/PlaceReducer';
import { fetchSnapshots } from '../../../Snapshot/SnapshotActions';
import { getSnapshots } from '../../../Snapshot/SnapshotReducer';

import AppIcon from '../../../../components/Icons/App';

// Define the data dependencies
const need = [
	params => fetchPlace(params.placeName),
	params => fetchSnapshots({ name: params.placeName })
];

export class PlacePage extends Component {

	componentDidMount () {

		// Client side stuff
		if (typeof document !== 'undefined') {

			// We need to get data if we navigate to here client side
			if ((!this.props.snapshots || this.props.snapshots.length === 0) && this.props.params) {
				need.forEach(fn => this.props.dispatch(fn(this.props.params)));
			}

			/*if (!this.props.selectedPlace) {
			
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
			}*/
		}
	}

	render () {

		// Waiting for place...
		if ((this.state && this.state.loading) || (!this.props.snapshots || this.props.snapshots.length === 0)) {
			return (
				<FullHeightWrapper>
					<Helmet title="Loading..." />
					<Header>
						<AppIcon fill='#555' />
						<div>Loading....</div>
					</Header>
					<div>Loading...</div>
				</FullHeightWrapper>
			);
		}

		// We have a place, and it's got a name :)
		if (this.props.selectedPlace && this.props.selectedPlace.name) {
			const settingsLink = `/${this.props.selectedPlace.name}/settings`;
			return (
				<FullHeightWrapper>
					<Helmet title={this.props.selectedPlace.name[0].toUpperCase() + this.props.selectedPlace.name.substr(1)} />
					<Header>
						<AppIcon fill='#555' />
						<div>{this.props.selectedPlace.name}</div>
						{/*<Link to={settingsLink}>Settings</Link>*/}
					</Header>
					<SnapshotsNavigator snapshots={this.props.snapshots} place={this.props.selectedPlace} />
				</FullHeightWrapper>
			);
		}

		// Apparently no valid place was found
		return (
			<FullHeightWrapper>
				<Helmet title="Not a valid place" />
				<Header>
					<AppIcon fill='#555' />
					<div>Not a valid place</div>
				</Header>
				<div>The place {this.props.params.placeName} not found</div>
			</FullHeightWrapper>
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

// Server side data requirements
PlacePage.need = need;

function mapStateToProps (state) {
	return {
		selectedPlace: getSelectedPlace(state),
		snapshots: getSnapshots(state)
	};
}

export default connect(mapStateToProps)(PlacePage);