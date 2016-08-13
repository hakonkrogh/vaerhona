import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

import { getSelectedPlace } from '../../../App/AppActions';
import { getSelectedSnapshot } from '../../SnapshotReducer';
import { getAbsolutePathForImage } from '../../../../../shared/aws/s3';

class SnapshotImage extends Component {
  render() {
    return (
      <div className="snapshot-image">
      	image...
      	{this.props.selectedSnapshot.temperature}

      	<img src={getAbsolutePathForImage({ place: this.props.selectedPlace, snapshot: this.props.selectedSnapshot })} alt={this.props.selectedSnapshot.temperature} />
      </div>
    );
  }
}

SnapshotImage.propTypes = {
  selectedSnapshot: React.PropTypes.oneOfType([
	PropTypes.bool,
  	PropTypes.shape({
		cuid: PropTypes.string.isRequired,
		temperature: PropTypes.number.isRequired,
		humidity: PropTypes.number.isRequired,
		pressure: PropTypes.number.isRequired
	})
  ])
};

function mapStateToProps (state) {
  return {
  	selectedPlace: getSelectedPlace(state),
  	selectedSnapshot: getSelectedSnapshot(state)
  };
}

export default connect(mapStateToProps)(SnapshotImage);