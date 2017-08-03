import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import keycode from 'keycode';

import TimeAgo from 'react-timeago';
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';
import TaNo from 'react-timeago/lib/language-strings/no';

// Shapes
import * as propTypeShapes from '../../../isomorphic/prop-type-shapes';

import {
  showPrevSnapshot,
  showNextSnapshot,
  showSnapshotFromIndex,
  getAdjecentsSnapshots } from '../../../store/snapshots';
import { getImagePath } from '../../../isomorphic/api';
import { prettyDateTime } from '../../../isomorphic/date';

import RangeSlider from '../../range-slider';

import {
  Outer,
  Inner,
  DateAdded,
  DateAddedTimeAgo,
  Values,
  Image
} from './ui';

import KeyHandler from './helpers/key-handler';
import PointerHandler from './helpers/pointer-handler';
import preloadSnapshotImages from './helpers/preload-snapshot-images';

class SnapshotImage extends Component {

  static propTypes = {
    selectedSnapshot: propTypeShapes.snapshot,
    place: propTypeShapes.place.isRequired,
    snapshots: PropTypes.arrayOf(propTypeShapes.snapshot).isRequired,
    adjecentsSnapshots: PropTypes.arrayOf(propTypeShapes.snapshot)
  }

  componentDidUpdate () {
    preloadSnapshotImages({
      place: this.props.place,
      snapshots: this.props.adjecentsSnapshots
    });
  }

  componentDidMount () {
    if (typeof document !== 'undefined') {

      this.keyHandler = new KeyHandler({
        element: document,
        onKeyPressAndRepeat: this.navigateFromKeyDown.bind(this)
      });

      this.pointerHandler = new PointerHandler({
        element: this.image,
        onPointerDownAndRepeat: this.onImageClick.bind(this),
        onSwipe: this.onImageSwipe.bind(this)
      });
      
      preloadSnapshotImages({
        place: this.props.place,
        snapshots: this.props.adjecentsSnapshots
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
        return this.props.showPrevSnapshot();
      }
      else if (direction === 'next') {
        return this.props.showNextSnapshot();
      }
    }
  }

  onRangeSliderChange (data) {
    this.props.showSnapshotFromIndex(data.index);
  }

  onImageSwipe (direction) {
    if (direction === 'left') {
      return this.navigate({ direction: 'prev' });
    }
    else {
      return this.navigate({ direction: 'next' });
    }
  }

  onImageClick (event) {
    
    // Determine position
    const clientX = event.center.x;
    const imageWidth = this.image.offsetWidth;
    const position = (clientX / imageWidth) * 100;
    
    if (position < 50) {
      return this.navigate({ direction: 'prev' });
    }
    else {
      return this.navigate({ direction: 'next' });
    }
  }

  render () {

    const { place, snapshots, selectedSnapshot } = this.props;

    if (!snapshots || !selectedSnapshot) {
      return (
        <Outer>
          <Inner>No snapshots</Inner>
        </Outer>
      );
    }

    // Set up the time ago component
    let timeAgoFormatter = buildFormatter(TaNo);
 
    return (
      <Outer>
        <Inner>
          <DateAdded>{prettyDateTime(selectedSnapshot.dateAdded)}</DateAdded>
          <DateAddedTimeAgo>
            <TimeAgo date={selectedSnapshot.dateAdded} formatter={timeAgoFormatter} />
          </DateAddedTimeAgo>
          <Values>
            <span>{selectedSnapshot.temperature}&#8451;</span>
            <span>{selectedSnapshot.humidity}%</span>
            <span>{selectedSnapshot.pressure}hPa</span>
          </Values>

          <Image
            src={getImagePath(selectedSnapshot)}
            innerRef={x => this.image = x}
           />
        </Inner>
        
         <RangeSlider
          value={selectedSnapshot}
          values={snapshots}
          onChange={this.onRangeSliderChange.bind(this)}
         />
      </Outer>
    );
  }
}

const mapStateToProps = (state) => ({
  selectedPlace: state.place,
  selectedSnapshot: state.snapshots.selected,
  adjecentsSnapshots: getAdjecentsSnapshots(state)
});

const mapDispatchToProps = (dispatch) => ({
  showPrevSnapshot: () => dispatch(showPrevSnapshot()),
  showNextSnapshot: () => dispatch(showNextSnapshot()),
  showSnapshotFromIndex: index => dispatch(showSnapshotFromIndex(index))
});

export default connect(mapStateToProps, mapDispatchToProps)(SnapshotImage);