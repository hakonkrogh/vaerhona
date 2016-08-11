import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

// Import Components
import SnapshotList from '../../components/SnapshotList';
import SnapshotCreateWidget from '../../components/SnapshotCreateWidget/SnapshotCreateWidget';

// Import Actions
import { addSnapshotRequest, fetchSnapshots, deleteSnapshotRequest } from '../../SnapshotActions';
import { toggleAddSnapshot } from '../../../App/AppActions';

// Import Selectors
import { getShowAddSnapshot } from '../../../App/AppReducer';
import { getSnapshots } from '../../SnapshotReducer';

class SnapshotListPage extends Component {
  componentDidMount() {
    this.props.dispatch(fetchSnapshots());
  }

  handleDeleteSnapshot = snapshot => {
    if (confirm('Do you want to delete this snapshot')) { // eslint-disable-line
      this.props.dispatch(deleteSnapshotRequest(snapshot));
    }
  };

  handleAddSnapshot = (snapshot) => {
    this.props.dispatch(toggleAddSnapshot());
    this.props.dispatch(addSnapshotRequest(snapshot));
  };

  render() {
    return (
      <div>
        <SnapshotCreateWidget addSnapshot={this.handleAddSnapshot} showAddSnapshot={this.props.showAddSnapshot} />
        <SnapshotList handleDeleteSnapshot={this.handleDeleteSnapshot} snapshots={this.props.snapshots} />
      </div>
    );
  }
}

// Actions required to provide data for this component to render in sever side.
SnapshotListPage.need = [() => { return fetchSnapshots(); }];

// Retrieve data from store as props
function mapStateToProps (state) {
  return {
    showAddSnapshot: getShowAddSnapshot(state),
    snapshots: getSnapshots(state)
  };
}

SnapshotListPage.propTypes = {
  snapshots: PropTypes.arrayOf(PropTypes.shape({
    placeCuid: PropTypes.string.isRequired,
    temperature: PropTypes.number.isRequired,
    humidity: PropTypes.number.isRequired,
    pressure: PropTypes.number.isRequired,
  })).isRequired,
  showAddSnapshot: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
};

SnapshotListPage.contextTypes = {
  router: React.PropTypes.object,
};

export default connect(mapStateToProps)(SnapshotListPage);
