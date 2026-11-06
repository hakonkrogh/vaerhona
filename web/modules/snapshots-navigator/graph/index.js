import React, { Component } from 'react';

import { isClient } from 'core/utils';
import { chartDate, prettyYearMonth } from 'core/date';

var Chart;
if (isClient) {
  Chart = require('chart.js');
}

import Icon from '../icon';
import { Outer, Inner, Canvas, PropChooser } from './ui';

const snapshotProperties = [
  {
    type: 'temperature',
    icon: 'thermometer',
    label: 'Temperatur',
    valueType: 'C',
  },
  {
    type: 'humidity',
    icon: 'droplets',
    label: 'Luftfuktighet',
    valueType: '%',
  },
  // {
  //   type: 'pressure',
  //   icon: 'compass',
  //   label: 'Trykk',
  //   valueType: 'hPa',
  // },
];

const setColors = ['rgba(129, 165, 148, .5)', 'rgba(72, 120, 220, .5)'];

export default class SnapshotGraph extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedProperty: snapshotProperties[0],
    };
  }

  getColumnDates() {
    const { snapshots } = this.props;
    let [first] = snapshots;
    let firstDate = new Date(first.date);
    const lastDate = new Date(snapshots[snapshots.length - 1].date);
    const dates = [];

    // The display labels
    dates.labels = [];

    while (firstDate <= lastDate) {
      dates.labels.push(chartDate(firstDate));
      dates.push(new Date(firstDate.getTime()));
      firstDate.setHours(firstDate.getHours() + 1);
    }

    return dates;
  }

  getColumnData(dates) {
    const { selectedProperty } = this.state;
    const { snapshots, compareSnapshots, compare } = this.props;

    function handleArr({ month, date, hours }, arr, returnArr) {
      const snapshot = arr.find((s) => {
        const sD = new Date(s.date);

        // Month, date and hour need to match
        return (
          sD.getMonth() === month &&
          sD.getDate() === date &&
          sD.getHours() === hours
        );
      });

      if (snapshot) {
        returnArr.push(snapshot[selectedProperty.type]);
      } else {
        returnArr.push(null);
      }
    }

    const returnSnapshots = [];
    const returnCompareSnapshots = [];

    dates.forEach((date) => {
      const d = {
        month: date.getMonth(),
        date: date.getDate(),
        hours: date.getHours(),
      };

      handleArr(d, snapshots, returnSnapshots);
      if (compare) {
        handleArr(d, compareSnapshots, returnCompareSnapshots);
      }
    });

    if (compare) {
      return [returnCompareSnapshots, returnSnapshots];
    }

    return [returnSnapshots];
  }

  getLegends() {
    function getYearFromSnapshots(s) {
      const $0 = new Date(s[0].date).getFullYear();
      const $1 = new Date(s[s.length - 1].date).getFullYear();
      if ($0 === $1) {
        return $0;
      }
      return `${$0} - ${$1}`;
    }
    const { snapshots, compareSnapshots, compare } = this.props;

    if (!compare) {
      return [getYearFromSnapshots(snapshots)];
    }

    return [
      getYearFromSnapshots(compareSnapshots),
      getYearFromSnapshots(snapshots),
    ];
  }

  componentDidMount() {
    this.loadChart();
  }

  componentDidUpdate() {
    clearTimeout(this.loadChartTimeout);
    this.loadChartTimeout = setTimeout(this.loadChart, 100);
  }

  getColor = (index) => {
    const { compare } = this.props;

    if (!compare) {
      return setColors[1];
    }

    return setColors[index];
  };

  loadChart = () => {
    // Client side only for now. Waiting for a universal graph framework
    if (isClient) {
      const { selectedProperty } = this.state;

      const dates = this.getColumnDates();
      const data = this.getColumnData(dates);
      const legends = this.getLegends();

      if (!data[0].length || !dates.length) {
        return;
      }

      const datasets = data.map((d, i) => ({
        labelOld: selectedProperty.label,
        label: legends[i],
        data: d,
        fill: false,
        borderColor: this.getColor(i),
      }));

      if (this.myLineChart) {
        this.myLineChart.data.labels = dates.labels;
        this.myLineChart.data.datasets = datasets;
        this.myLineChart.update();
      } else {
        this.myLineChart = new Chart(this.canvas, {
          type: 'line',
          data: {
            labels: dates.labels,
            datasets,
          },
          options: {
            maintainAspectRatio: false,
            title: {
              display: false,
              position: 'bottom',
            },
            legend: {
              position: 'bottom',
              fillStyle: 'red',
              labels: {
                boxWidth: 20,
              },
            },
          },
        });
      }
    }
  };

  changeSelectedProperty(newProperty) {
    this.setState({
      selectedProperty: newProperty,
    });
  }

  render() {
    return (
      <Outer>
        <Inner>
          <Canvas ref={(x) => (this.canvas = x)} />
        </Inner>
        <PropChooser>
          {snapshotProperties.map((prop) => (
            <Icon
              selected={this.state.selectedProperty.type === prop.type}
              key={prop.type}
              type={prop.icon}
              label={prop.label}
              onClick={this.changeSelectedProperty.bind(this, prop)}
            />
          ))}
        </PropChooser>
      </Outer>
    );
  }
}
