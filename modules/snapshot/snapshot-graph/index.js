import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { isClient } from '../../../core/utils';

var Chart;
if (isClient) {
    Chart = require('chart.js');
}

import Icon from '../icon';
import {
    Outer,
    Inner,
    Canvas,
    PropChooser
} from './ui';

import { prettyDate } from '../../../core/date';
import * as propTypeShapes from '../../../core/prop-type-shapes';

const snapshotProperties = [
  {
    type: 'temperature',
    icon: 'thermometer',
    label: 'Temperatur',
    valueType: 'C'
  },
  {
    type: 'humidity',
    icon: 'droplets',
    label: 'Luftfuktighet',
    valueType: '%'
  },
  {
    type: 'pressure',
    icon: 'compass',
    label: 'Trykk',
    valueType: 'hPa'
  }
];

export default class SnapshotGraph extends Component {

  static propTypes = {
    snapshots: PropTypes.arrayOf(propTypeShapes.snapshot).isRequired
  }

  constructor (props) {
    super(props);

    this.state = {
      selectedProperty: snapshotProperties[0]
    };
  }

  getColumnData () {
    return this.props.snapshots.map(snapshot => snapshot[this.state.selectedProperty.type]);
  }

  getColumnDates () {
    return this.props.snapshots.map(snapshot => prettyDate(snapshot.dateAdded));
  }

  componentDidMount () {
    this.loadChart();
  }

  componentDidUpdate () {
    setTimeout(this.loadChart.bind(this), 100);
  }

  loadChart () {

    // Client side only for now. Waiting for a universal graph framework
    if (isClient) {

      const labels = this.getColumnDates();
      const data = this.getColumnData();

      if (!data.length || !labels.length) {
        return;
      }

      if (this.myLineChart) {
        this.myLineChart.data.labels = labels;
        this.myLineChart.data.datasets[0].label = this.state.selectedProperty.label;
        this.myLineChart.data.datasets[0].data = data;
        this.myLineChart.update();
      }
      else {
        this.myLineChart = new Chart(this.canvas, {
            type: 'line',
            data: {
              labels,
              datasets: [
                {
                  label: this.state.selectedProperty.label,
                  data,
                  fill: false,
                  borderColor: 'rgba(72, 120, 220, .5)'
                }
              ]
            },
            options: {
              maintainAspectRatio: false,
              title: {
                display: false,
                position: 'bottom'
              },
              legend: {
                display: false,
                position: 'bottom'
              }
            }
        });
      }
    }
  }

  changeSelectedProperty (newProperty) {
    this.setState({
      selectedProperty: newProperty
    });
  }

  render () {
    return (
      <Outer>
        <Inner>
          <Canvas innerRef={x => this.canvas = x} />
        </Inner>
        <PropChooser>
          {
            snapshotProperties.map(prop => (
              <Icon
                selected={this.state.selectedProperty.type === prop.type}
                key={prop.type}
                type={prop.icon}
                label={prop.label}
                onClick={this.changeSelectedProperty.bind(this, prop)}
              />
            ))
          }
        </PropChooser>
      </Outer>
    );
  }
}
