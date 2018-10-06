import React, { Component } from "react";
import Switch from "react-switch";

// Import Components
import Icon from "../icon";
import SnapshotImage from "../snapshot-image";
import SnapshotGraph from "../snapshot-graph";

// Import ui
import { IconCompare } from "ui";
import { Outer, Inner, IconMenu, SwitchOuter } from "./ui";

export default class SnapshotsNavigator extends Component {
  state = {
    selected: "image",
    compare: false
  };

  changeToImage = () => {
    this.setState({
      selected: "image"
    });
  };

  changeToGraph = () => {
    this.setState({
      selected: "graph"
    });
  };

  onCompareChange = compare => {
    this.setState({
      compare
    });
  };

  render() {
    let child;
    const { selected, compare } = this.state;

    switch (selected) {
      case "graph":
        child = <SnapshotGraph {...this.props} compare={compare} />;
        break;

      default:
        child = <SnapshotImage {...this.props} compare={compare} />;
    }

    return (
      <Outer>
        <Inner>{child}</Inner>
        <IconMenu>
          <Icon
            selected={selected === "image"}
            type="image"
            onClick={this.changeToImage}
          />
          <Icon
            selected={selected === "graph"}
            type="graph"
            onClick={this.changeToGraph}
          />

          <SwitchOuter>
            <label htmlFor="compare-switch">
              <Switch
                checked={compare}
                id="compare-switch"
                onChange={this.onCompareChange}
                onColor="#b7ccc2"
                onHandleColor="#81a594"
                handleDiameter={20}
                uncheckedIcon={false}
                checkedIcon={false}
                boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                height={20}
                width={36}
                aria-label="Sammenlign data"
              />
              <IconCompare />
            </label>
          </SwitchOuter>
        </IconMenu>
      </Outer>
    );
  }
}
