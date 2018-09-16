import Hammer from '../common/hammer';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { prettyDate, prettyTime, prettyDateTime } from '../../core/date';
import {
  Container,
  Outer,
  Inner,
  Values,
  Line,
  Indicator,
  CurrentValue
} from './ui';

export default class RangeSlider extends Component {

  static propTypes = {
    values: PropTypes.array.isRequired,
    onChange: PropTypes.func
  }

  componentDidMount () {
    if (Hammer && !this.eventsBinded && this.wrap) {
      this.eventsBinded = true;

      this.hammertime = new Hammer.Manager(this.wrap);
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

    if (event.pointers.length === 1) {

      // Store dimensions for range
      if (event.isFirst) {
        let computedStyle = getComputedStyle(this.outer, null);
        this._tmpDimensions = {
          width: this.inner.clientWidth,
          paddingLeft: parseInt(computedStyle.getPropertyValue("padding-left"), 10),
          paddingRight: parseInt(computedStyle.getPropertyValue("padding-right"), 10)
        };
      }

      if (event.isFinal) {
        delete this._tmpDimensions;
      }
      else {
        const adj = this._tmpDimensions.paddingLeft;

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
          clearTimeout(this._onChangeTimeout);
          this._onChangeTimeout = setTimeout(() => this.props.onChange({ index: closestIndex }), 5);
        }
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

    const { values } = this.props;

    if (!values) {
      return null;
    }

    const firstDate = prettyDate(new Date(values[0].dateAdded));
    const lastDate = prettyDate(new Date(values[values.length - 1].dateAdded));
    const currentDate = values[this.getSelectedIndex()].dateAdded;

    return (
      <Container hidden={values.length <= 1} ref={el => this.wrap = el}>
        <Values>
          <div>{firstDate}</div>
          <div>{prettyDateTime(currentDate)}</div>
          <div>{lastDate}</div>
        </Values>
        <Outer ref={el => this.outer = el}>
          <Inner ref={el => this.inner = el}>
            <Line />
            <Indicator style={{ left: this.getIndicatorPercentage() + '%' }} />
          </Inner>
        </Outer>
      </Container>
    );
  }
}
