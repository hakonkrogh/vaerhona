import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import keycode from 'keycode';

import { getSelectedPlace } from '../../../Place/PlaceReducer';
import { getSelectedSnapshot, getSnapshots } from '../../SnapshotReducer';
import { showPrevSnapshot, showNextSnapshot, showSnapshotFromIndex } from '../../SnapshotActions';
import { getAbsolutePathForImage } from '../../../../../shared/aws/s3';

import RangeSlider from '../RangeSlider/RangeSlider';

import styles from './SnapshotImage.css';

class SnapshotImage extends Component {

  componentDidMount () {
    //if (!this.state && !this.state.mounted) {}

    if (typeof document !== 'undefined') {
      document.addEventListener("keydown", event => this.navigate({ fromKeyDown: event }));
    }
  }

  navigate ({ fromKeyDown }) {
    
    if (fromKeyDown) {
      if (keycode(fromKeyDown) === 'left') {
        return this.props.dispatch(showPrevSnapshot());
      }
      else if (keycode(fromKeyDown) === 'right') {
        return this.props.dispatch(showNextSnapshot());
      }
    }
  }

  onRangeSliderChange (data) {
    this.props.dispatch(showSnapshotFromIndex(data.index));
  }

  render () {
    return (
      <div className={styles['snapshot-image']}>
        
        <div>{this.props.selectedSnapshot.dateAdded}</div>
        <div>{this.props.selectedSnapshot.temperature} &#8451;</div>

      	<img className={styles['snapshot-image__img']}
          src={getAbsolutePathForImage({
	      		place: this.props.place,
	      		snapshot: this.props.selectedSnapshot
      		 })}
      		 alt={this.props.selectedSnapshot.temperature}
  		   />

         <RangeSlider
          value={this.props.selectedSnapshot}
          values={this.props.snapshots}
          onChange={this.onRangeSliderChange.bind(this)}
         />
      </div>
    );
  }
}

SnapshotImage.propTypes = {
  selectedSnapshot: PropTypes.oneOfType([
	  PropTypes.bool,
  	PropTypes.shape({
  		cuid: PropTypes.string.isRequired,
  		temperature: PropTypes.number.isRequired,
  		humidity: PropTypes.number.isRequired,
  		pressure: PropTypes.number.isRequired
  	})
  ]),
  place: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
};

function mapStateToProps (state) {
  return {
  	selectedPlace: getSelectedPlace(state),
  	selectedSnapshot: getSelectedSnapshot(state),
    snapshots: getSnapshots(state)
  };
}

export default connect(mapStateToProps)(SnapshotImage);