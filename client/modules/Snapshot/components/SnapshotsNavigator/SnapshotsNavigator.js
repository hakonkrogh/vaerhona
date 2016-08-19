import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

// Import Components
import SnapshotDisplayChooser from '../SnapshotDisplayChooser/SnapshotDisplayChooser';
import SnapshotImage from '../SnapshotImage/SnapshotImage';
import SnapshotGraph from '../SnapshotGraph/SnapshotGraph';

// Import Actions
import { addSnapshotRequest, fetchSnapshots, deleteSnapshotRequest } from '../../SnapshotActions';
import { toggleAddSnapshot } from '../../../App/AppActions';

// Import Selectors
import { getShowAddSnapshot } from '../../../App/AppReducer';
import { getSnapshots } from '../../SnapshotReducer';

class SnapshotsNavigator extends Component {

  handleDeleteSnapshot = snapshot => {
    if (confirm('Do you want to delete this snapshot')) { // eslint-disable-line
      this.props.dispatch(deleteSnapshotRequest(snapshot));
    }
  };

  handleAddSnapshot = snapshot => {
    this.props.dispatch(toggleAddSnapshot());
    this.props.dispatch(addSnapshotRequest(snapshot));
  };

  render() {
    return (
      <div>
        <SnapshotDisplayChooser>
          <SnapshotImage snapshots={this.props.snapshots} place={this.props.place} />
          <SnapshotGraph snapshots={this.props.snapshots} place={this.props.place} />
        </SnapshotDisplayChooser>
      </div>
    );
  }
}

// Retrieve data from store as props
function mapStateToProps (state) {
  return {
    showAddSnapshot: getShowAddSnapshot(state)
  };
}

SnapshotsNavigator.propTypes = {
  snapshots: PropTypes.arrayOf(PropTypes.shape({
    cuid: PropTypes.string.isRequired,
    temperature: PropTypes.number.isRequired,
    humidity: PropTypes.number.isRequired,
    pressure: PropTypes.number.isRequired,
  })).isRequired,
  place: PropTypes.object.isRequired,
  showAddSnapshot: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired
};

SnapshotsNavigator.contextTypes = {
  router: React.PropTypes.object
};

export default connect(mapStateToProps)(SnapshotsNavigator);
