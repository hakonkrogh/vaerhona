import React, { Component } from "react";

import { isClient } from "core/utils";
import { chartDate } from "core/date";

var Chart;
if (isClient) {
  Chart = require("chart.js");
}

import Icon from "../icon";
import { Outer, Inner, Canvas, PropChooser } from "./ui";

const snapshotProperties = [
  {
    type: "temperature",
    icon: "thermometer",
    label: "Temperatur",
    valueType: "C"
  },
  {
    type: "humidity",
    icon: "droplets",
    label: "Luftfuktighet",
    valueType: "%"
  },
  {
    type: "pressure",
    icon: "compass",
    label: "Trykk",
    valueType: "hPa"
  }
];

const setColors = ["rgba(129, 165, 148, .5)", "rgba(72, 120, 220, .5)"];

export default class SnapshotGraph extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedProperty: snapshotProperties[0]
    };
  }
  getColumnDates() {
    const { snapshots } = this.props;
    let [first] = snapshots;
    let firstDate = new Date(first.date);
    const lastDate = new Date(snapshots[snapshots.length - 1].date);
    const dates = [];
    while (firstDate <= lastDate) {
      dates.push(chartDate(firstDate));
      firstDate.setHours(firstDate.getHours() + 1);
    }

    return dates;
  }

  getColumnData() {
    const { selectedProperty } = this.state;
    const { snapshots, compareSnapshots, compare } = this.props;

    if (compare) {
      return [
        compareSnapshots.map(s => s[selectedProperty.type]),
        snapshots.map(s => s[selectedProperty.type])
      ];
    }

    return [snapshots.map(s => s[selectedProperty.type])];
  }

  getLegends() {
    function getYearFromSnapshots(s) {
      return new Date(s[s.length - 1].date).getFullYear();
    }
    const { snapshots, compareSnapshots } = this.props;
    return [
      getYearFromSnapshots(compareSnapshots),
      getYearFromSnapshots(snapshots)
    ];
  }

  componentDidMount() {
    this.loadChart();
  }

  componentDidUpdate() {
    clearTimeout(this.loadChartTimeout);
    this.loadChartTimeout = setTimeout(this.loadChart, 100);
  }

  loadChart = () => {
    // Client side only for now. Waiting for a universal graph framework
    if (isClient) {
      const { selectedProperty } = this.state;

      const labels = this.getColumnDates();
      const data = this.getColumnData();
      const legends = this.getLegends();

      if (!data[0].length || !labels.length) {
        return;
      }

      const datasets = data.map((d, i) => ({
        labelOld: selectedProperty.label,
        label: legends[i],
        data: d,
        fill: false,
        borderColor: setColors[i]
      }));

      if (this.myLineChart) {
        this.myLineChart.data.labels = labels;
        this.myLineChart.data.datasets = datasets;
        this.myLineChart.update();
      } else {
        this.myLineChart = new Chart(this.canvas, {
          type: "line",
          data: {
            labels,
            datasets
          },
          options: {
            maintainAspectRatio: false,
            title: {
              display: false,
              position: "bottom"
            },
            legend: {
              position: "bottom",
              fillStyle: "red",
              labels: {
                boxWidth: 20
              }
            }
          }
        });
      }
    }
  };

  changeSelectedProperty(newProperty) {
    this.setState({
      selectedProperty: newProperty
    });
  }

  render() {
    return (
      <Outer>
        <Inner>
          <Canvas ref={x => (this.canvas = x)} />
        </Inner>
        <PropChooser>
          {snapshotProperties.map(prop => (
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
