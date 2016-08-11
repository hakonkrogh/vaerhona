import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

import { getSnapshots } from '../../SnapshotReducer';

class SnapshotImage extends Component {
  render() {
  	let lastSnapshot = this.props.snapshots && this.props.snapshots.length > 0 ? this.props.snapshots[this.props.snapshots.length - 1] : {};
  	
    return (
      <div className="snapshot-image">
      	image...
      	{lastSnapshot.temperature}
      </div>
    );
  }
}

SnapshotImage.propTypes = {
  snapshots: PropTypes.arrayOf(PropTypes.shape({
    cuid: PropTypes.string.isRequired,
    temperature: PropTypes.number.isRequired,
    humidity: PropTypes.number.isRequired,
    pressure: PropTypes.number.isRequired
  })).isRequired,
  dispatch: PropTypes.func.isRequired
};

function mapStateToProps (state) {
  return {};
}

export default connect(mapStateToProps)(SnapshotImage);