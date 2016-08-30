// Fix for server side Hammer
if (typeof window === 'undefined') {
  var window = {};
}

import React, { PropTypes, Component } from 'react';
import Hammer from 'hammerjs';

import styles from './RangeSlider.css';

class RangeSlider extends Component {

  componentDidMount () {
    if (typeof document !== 'undefined' && !this.eventsBinded) {
      this.eventsBinded = true;

      this.hammerMc = new Hammer.Manager(this.refs.outer);
      //this.hammerMc.add(new Hammer.Pan());
      //this.hammerMc.get('pan').set({ threshold: 0 });
      //this.hammerMc.on('pan', this.onPan);
      this.hammerMc.on('hammer.input', event => this.onPan(event));
    }
  }

  componentWillUnmount () {
    if (this.eventsBinded && this.hammerMc) {
      this.hammerMc.destroy();
    }
  }

  onPan (event) {

    // Ensure that we can not select other elements on the page while dragging
    event.preventDefault();
    
    // Store dimensions for range
    if (event.isFirst) {
      const children = this.refs.outer.childNodes;
      if (children.length !== 1) {
        throw new Error('The child count for the range slider outer is not 1 as assumed');
      }

      const child = children[0];

      this._tmpDimensions = {
        width: child.clientWidth,
        offsetLeft: child.offsetLeft,
        outerWidth: this.refs.outer.clientWidth
      };
    }

    if (event.isFinal) {
      delete this._tmpDimensions;
    }
    else {
      const adj = this._tmpDimensions.offsetLeft;

      let pct = ((event.center.x - adj) / this._tmpDimensions.width) * 100;

      if (pct > 100) {
        pct = 100;
      }
      else if (pct < 0) {
        pct = 0;
      }

      // Determine the closest index for this percentage
      let closestIndex;
      let closestPct = -1;
      for (let i = 0; i < this.props.values.length; i++) {
        let indexPct = i === 0 ? 0 : (i / (this.props.values.length - 1)) * 100;
        let indexDistance = Math.abs(indexPct - pct);

        if (closestPct === -1 || indexDistance < closestPct) {
          closestIndex = i;
          closestPct = indexDistance;
        }
      }

      if (this.props.onChange) {
        this.props.onChange({
          index: closestIndex
        });
      }
    }
  }

  getSelectedIndex () {

    if (typeof this.props.value === 'undefined') {
      return 0;
    }

    return this.props.values.findIndex(value => value.cuid === this.props.value.cuid);
  }

  // Returns the percentage position for a given index
  getIndicatorPercentage (index = this.getSelectedIndex()) {
    return (index / (this.props.values.length - 1)) * 100;
  }

  render () {
    return (
      <div className={styles['range-slider']} ref='outer'>
        <div className={styles['range-slider__inner']}>
          <div className={styles['range-slider__line']}></div>
          {
            this.props.values.length > 0
            ? <div className={styles['range-slider__indicator']} style={{ left: this.getIndicatorPercentage() + '%' }}></div>
            : null
          }
        </div>
      </div>
    );
  }
}

RangeSlider.propTypes = {
  values: PropTypes.array.isRequired,
  onChange: PropTypes.func
};

export default RangeSlider;