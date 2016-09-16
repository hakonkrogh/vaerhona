import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
//import c3 from 'c3';
//import 'c3/c3.css';

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

    // Client side only
    if (typeof document !== 'undefined') {
      
      if (this.myLineChart) {
        this.myLineChart.data.labels = this.getColumnDates();
        this.myLineChart.data.datasets[0].label = this.state.selectedProperty.label;
        this.myLineChart.data.datasets[0].data = this.getColumnData();
        this.myLineChart.update();
      }
      else {
        this.myLineChart = new Chart(this.refs.canvas, {
            type: 'line',
            data: {
              labels: this.getColumnDates(),
              datasets: [
                {
                  label: this.state.selectedProperty.label,
                  data: this.getColumnData(),
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

  setTooltip () {
    //tooltip: {
    //  format: {
    //    title: x => this.props.snapshots[x].dateAdded,
    //    name: () => '',
    //    value: (name, ratio, id, index) => (Math.round(data[index] * 10) / 10)
    //  }
    //}
  }

  changeSelectedProperty (newProperty) {
    this.setState({
      selectedProperty: newProperty
    });
  }

  render () {
    return (
      <div className={styles['outer']}>
        <div className={styles['inner']} ref='inner'>
          <canvas ref='canvas'></canvas>
        </div>
        <div className={styles['prop-chooser']}>
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