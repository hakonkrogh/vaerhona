import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

//import Plotly from 'plotly.js';

//import c3 from 'c3';
//import 'c3/c3.css';

//import { Line } from 'react-chartjs-2';
//import ChartJS from 'chart.js';

import Icon from '../Icon/Icon';

import styles from './SnapshotGraph.css';

import { prettyDate } from '../../../../../shared/date';

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

class SnapshotGraph extends Component {

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
    return this.props.snapshots.map(snapshot => prettyDate(new Date(snapshot.dateAdded)));
  }

  componentDidMount () {
    this.loadChart();
  }

  componentDidUpdate () {
    this.loadChart();
  }

  loadChart () {

    // Client side only for now. Waiting for a universal graph framework
    if (typeof document !== 'undefined') {

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
        this.myLineChart = new Chart(this.refs.canvas, {
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
      <div className={styles['snapshot-graph']}>
        <div className={styles['snapshot-graph__inner']} ref='inner'>
          <canvas ref='canvas' className={styles['snapshot-graph__canvas']}></canvas>
        </div>
        <div className={styles['snapshot-graph__prop-chooser']}>
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
        </div>
      </div>
    );
  }
}

SnapshotGraph.propTypes = {
  snapshots: PropTypes.arrayOf(PropTypes.shape({
    cuid: PropTypes.string.isRequired,
    temperature: PropTypes.number.isRequired,
    humidity: PropTypes.number.isRequired,
    pressure: PropTypes.number.isRequired
  })).isRequired,
  dispatch: PropTypes.func.isRequired
};

function mapStateToProps (state) {
  return {};
}

export default connect(mapStateToProps)(SnapshotGraph);