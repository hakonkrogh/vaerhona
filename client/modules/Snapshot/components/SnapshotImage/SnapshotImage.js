import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import keycode from 'keycode';

import { getSelectedPlace } from '../../../Place/PlaceReducer';
import { getSelectedSnapshot, getSnapshots } from '../../SnapshotReducer';
import { showPrevSnapshot, showNextSnapshot, showSnapshotFromIndex } from '../../SnapshotActions';
import { getAbsolutePathForImage } from '../../../../../shared/aws/s3';

import RangeSlider from '../RangeSlider/RangeSlider';

import styles from './SnapshotImage.css';

import KeyHandler from './helpers/KeyHandler';
import PointerHandler from './helpers/PointerHandler';

class SnapshotImage extends Component {

  componentDidMount () {
    if (typeof document !== 'undefined') {

      this.keyHandler = new KeyHandler({
        onKeyPressAndRepeat: this.navigateFromKeyDown.bind(this)
      });

      this.pointerHandler = new PointerHandler({
        element: this.refs.image,
        onPointerDownAndRepeat: this.onImageClick.bind(this)
      });
      
    }
  }

  componentWillUnmount () {
    if (this.keyHandler) {
      this.keyHandler.unBind();
    }
    if (this.pointerHandler) {
      this.pointerHandler.unBind();
    }
  }

  navigateFromKeyDown (event) {
    if (keycode(event) === 'left') {
      this.navigate({ direction: 'prev' });
    }
    else if (keycode(event) === 'right') {
      this.navigate({ direction: 'next' });
    }
  }

  navigate ({ direction }) {
    if (direction) {
      if (direction === 'prev') {
        return this.props.dispatch(showPrevSnapshot());
      }
      else if (direction === 'next') {
        return this.props.dispatch(showNextSnapshot());
      }
    }
  }

  onRangeSliderChange (data) {
    this.props.dispatch(showSnapshotFromIndex(data.index));
  }

  onImageClick (event) {
    
    // Determine position
    const clientX = event.center.x;
    const imageWidth = this.refs.image.offsetWidth;
    const position = (clientX / imageWidth) * 100;
    
    if (position > 50) {
      return this.navigate({ direction: 'next' });
    }
    else {
      return this.navigate({ direction: 'prev' });
    }
  }

  render () {

    const dateDisplay = new Intl.DateTimeFormat('no', { weekday: 'long', year: 'numeric', month: 'narrow', day: 'numeric', hour: 'numeric', minute: 'numeric' }).format(new Date(this.props.selectedSnapshot.dateAdded));
    const temperature = Math.round(this.props.selectedSnapshot.temperature * 10) / 10;
    const imageStyle = {
      backgroundImage: `url("` + getAbsolutePathForImage({
        place: this.props.place,
        snapshot: this.props.selectedSnapshot
       }) + `")`
    };

    return (
      <div className={styles['snapshot-image']}>
        
        <div className={styles['snapshot-image__inner']}>
          <div className={styles['snapshot-image__date']}>{dateDisplay}</div>
          <div className={styles['snapshot-image__values']}>
            <span>{temperature} &#8451;</span>
            <span>{this.props.selectedSnapshot.humidity} %</span>
            <span>{this.props.selectedSnapshot.pressure} hPa</span>
          </div>

          <div className={styles['snapshot-image__img']}
            style={imageStyle}
            ref='image'
           />
        </div>
        
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