// Fix for server side Hammer
if (typeof window === 'undefined') {
  var window = {};
}

import React, { PropTypes, Component } from 'react';
import Hammer from 'hammerjs';

import styles from './RangeSlider.css';

import { prettyDate, prettyTime } from '../../../../../shared/date';

class RangeSlider extends Component {

  componentDidMount () {
    if (typeof document !== 'undefined' && !this.eventsBinded) {
      this.eventsBinded = true;

      this.hammertime = new Hammer.Manager(this.refs.wrap);
      //this.hammertime.add(new Hammer.Pan());
      //this.hammertime.get('pan').set({ threshold: 0 });
      //this.hammertime.on('pan', this.onPan);
      this.hammertime.on('hammer.input', event => this.onPan(event));
    }
  }

  componentWillUnmount () {
    if (this.eventsBinded && this.hammertime) {
      this.hammertime.destroy();
    }
  }

  onPan (event) {

    // Ensure that we can not select other elements on the page while dragging
    event.preventDefault();
    
    // Store dimensions for range
    if (event.isFirst) {
      this._tmpDimensions = {
        width: this.refs.outer.clientWidth,
        offsetLeft: this.refs.outer.offsetLeft,
        outerWidth: this.refs.wrap.clientWidth
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

    let firstDate = prettyDate(new Date(this.props.values[0].dateAdded));
    let lastDate = prettyDate(new Date(this.props.values[this.props.values.length - 1].dateAdded));

    return (
      <div className={styles['range-slider'] + ' ' + (this.props.values.length <= 1 ? styles['range-slider--hide'] : '')} ref='wrap'>
        <div className={styles['range-slider__dates']}>
          <div className={styles['range-slider__dates__from']}>{firstDate}</div>
          <div className={styles['range-slider__dates__to']}>{lastDate}</div>
        </div>

        <div className={styles['range-slider__outer']} ref='outer'>
          <div className={styles['range-slider__inner']}>
            <div className={styles['range-slider__line']}></div>
            <div className={styles['range-slider__indicator']} style={{ left: this.getIndicatorPercentage() + '%' }}></div>
          </div>
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