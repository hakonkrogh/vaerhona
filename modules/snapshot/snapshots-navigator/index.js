import React, { Component } from "react";

// Import Components
import Icon from "../icon";
import SnapshotImage from "../snapshot-image";
import SnapshotGraph from "../snapshot-graph";

// Import ui
import { Outer, Inner, IconMenu } from "./ui";

export default class SnapshotsNavigator extends Component {
  state = {
    selected: "image"
  };

  changeToImage = () => {
    this.setState({
      selected: "image"
    });
  };

  changeToImageCompare = () => {
    this.setState({
      selected: "image-compare"
    });
  };

  changeToGraph = () => {
    this.setState({
      selected: "graph"
    });
  };

  render() {
    let child;
    const { selected } = this.state;

    switch (selected) {
      case "graph":
        child = <SnapshotGraph {...this.props} />;
        break;

      case "image-compare":
        child = <SnapshotImage {...this.props} compare />;
        break;

      default:
        child = <SnapshotImage {...this.props} />;
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
            selected={selected === "image-compare"}
            type="image-compare"
            onClick={this.changeToImageCompare}
          />
          <Icon
            selected={selected === "graph"}
            type="graph"
            onClick={this.changeToGraph}
          />
        </IconMenu>
      </Outer>
    );
  }
}
