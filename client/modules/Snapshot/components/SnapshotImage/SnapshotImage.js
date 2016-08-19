import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import keycode from 'keycode';

import { getSelectedPlace } from '../../../Place/PlaceReducer';
import { getSelectedSnapshot } from '../../SnapshotReducer';
import { showPrevSnapshot, showNextSnapshot } from '../../SnapshotActions';
import { getAbsolutePathForImage } from '../../../../../shared/aws/s3';

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

  onKeyDown (e) {
    console.log('key down', e);
  }

  render () {

    return (
      <div className={styles['img-container']} onKeyDown={this.onKeyDown}>
      	
        {this.props.selectedSnapshot.temperature}

        {this.props.selectedSnapshot.dateAdded}

      	<img className={styles['img']}
          src={getAbsolutePathForImage({
	      		place: this.props.place,
	      		snapshot: this.props.selectedSnapshot
      		 })}
      		 alt={this.props.selectedSnapshot.temperature}
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
  	selectedSnapshot: getSelectedSnapshot(state)
  };
}

export default connect(mapStateToProps)(SnapshotImage);