import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

// Import Components
import Icon from './components/Icon/Icon';
import SnapshotImage from '../SnapshotImage/SnapshotImage';
import SnapshotGraph from '../SnapshotGraph/SnapshotGraph';

// Import Actions
import { addSnapshotRequest, fetchSnapshots, deleteSnapshotRequest } from '../../SnapshotActions';
import { changeMainNavigation, toggleAddSnapshot, MAIN_NAVIGATION_ITEMS } from '../../../App/AppActions';

// Import Selectors
import { getShowAddSnapshot, getSelectedMainNavigation } from '../../../App/AppReducer';
import { getSnapshots } from '../../SnapshotReducer';

// Import styles
import styles from './SnapshotsNavigator.css';

class SnapshotsNavigator extends Component {

  handleDeleteSnapshot = snapshot => {
    if (confirm('Do you want to delete this snapshot')) { // eslint-disable-line
      this.props.dispatch(deleteSnapshotRequest(snapshot));
    }
  }

  handleAddSnapshot = snapshot => {
    this.props.dispatch(toggleAddSnapshot());
    this.props.dispatch(addSnapshotRequest(snapshot));
  }

  changeSelectedNavigationItem (itemName) {
    this.props.dispatch(changeMainNavigation(itemName));
  }

  render() {

    const IconMenu = (
      <div className={styles['icon-menu']}>
        {
          MAIN_NAVIGATION_ITEMS.map(itemName => (
            <Icon
              selected={this.props.selectedMainNavigation === itemName}
              key={itemName}
              type={itemName}
              onClick={this.changeSelectedNavigationItem.bind(this, itemName)}
            />
          ))
        }
      </div>
    );

    let child;

    switch (this.props.selectedMainNavigation) {
      case 'image' :
        child = (<SnapshotImage snapshots={this.props.snapshots} place={this.props.place} key='image' />);
        break;

      case 'graph' :
        child = (<SnapshotGraph snapshots={this.props.snapshots} place={this.props.place} key='graph' />);
        break;

      default :
        child = '404';
    }

    return (
      <div className={styles['outer']}>
        <div className={styles['inner']}>
          {child}
        </div>
        {IconMenu}
      </div>
    );
  }
}

// Retrieve data from store as props
function mapStateToProps (state) {
  return {
    showAddSnapshot: getShowAddSnapshot(state),
    selectedMainNavigation: getSelectedMainNavigation(state)
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
