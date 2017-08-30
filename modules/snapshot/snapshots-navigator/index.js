import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

// Shapes
import * as propTypeShapes from '../../../core/prop-type-shapes';

// Import Components
import Icon from '../icon';
import SnapshotImage from '../snapshot-image';
import SnapshotGraph from '../snapshot-graph';

// Import store
import { changeMainNavigation, MAIN_NAVIGATION_ITEMS } from '../../../store/app';

// Import ui
import {
  Outer,
  Inner,
  IconMenu
} from './ui';

class SnapshotsNavigator extends Component {

  static propTypes = {
    selectedMainNavigation: PropTypes.string.isRequired,
    snapshots: PropTypes.arrayOf(propTypeShapes.snapshot).isRequired,
    place: propTypeShapes.place.isRequired,
    changeMainNavigation: PropTypes.func.isRequired
  }

  static mapStateToProps = (state) => ({
    selectedMainNavigation: state.app.mainNavigation,
    snapshots: state.snapshots.data,
    place: state.place
  })

  static mapDispatchToProps = (dispatch) => ({
    changeMainNavigation: itemName => dispatch(changeMainNavigation(itemName))
  })

  render () {

    let child;

    const {
      place,
      snapshots,
      selectedMainNavigation,
      changeMainNavigation
    } = this.props;

    if (!place || !place.cuid || !snapshots || snapshots.length === 0) {
      return (
        <Outer>
          <Inner center>
            Loading...
          </Inner>
        </Outer>
      );
    }

    switch (selectedMainNavigation) {
      case 'image' :
        child = <SnapshotImage snapshots={snapshots} place={place} key='image' />;
        break;

      case 'graph' :
        child = <SnapshotGraph snapshots={snapshots} place={place} key='graph' />;
        break;

      default :
        child = '404';
    }

    return (
      <Outer>
        <Inner>
          {child}
        </Inner>
        <IconMenu>
          {MAIN_NAVIGATION_ITEMS.map((itemName) => (
            <Icon
              selected={selectedMainNavigation === itemName}
              key={itemName}
              type={itemName}
              onClick={() => changeMainNavigation(itemName)}
            />
          ))}
        </IconMenu>
      </Outer>
    );
  }
}

export default connect(SnapshotsNavigator.mapStateToProps, SnapshotsNavigator.mapDispatchToProps)(SnapshotsNavigator);
