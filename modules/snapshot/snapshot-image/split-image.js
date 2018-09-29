import React from "react";
import styled from "styled-components";
import is from "styled-is";
import Draggable from "react-draggable";

import SnapshotImage from "modules/snapshot-image";
import { responsive } from "ui";

export const Outer = styled.div`
  display: none;

  ${responsive.smAndLess} {
    display: block;
    flex: 1 1 auto;
    position: relative;
    width: 100vw;
    overflow: hidden;
  }
`;

export const Img = styled.figure`
  position: absolute;
  top: 0;
  left: 0;
  width: 50vw;
  height: 100%;
  margin: 0;
  display: flex;
  align-items: center;
  overflow: hidden;

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100%;
    object-fit: contain;
    object-position: center left;
  }

  ${is("right")`
    left: auto;
    right: 0;

    img {
      left: auto;
      right: 0;
      object-position: center right;
    }
  `};
`;

export const Handle = styled.div`
  height: 100%;
  width: 40px;
  position: absolute;
  top: 0;
  left: 50%;
  margin-left: -20px;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 18px;
    width: 4px;
    height: 100%;
    background: #fcfcfc;
  }
`;

export default class SplitImage extends React.Component {
  state = {
    pos: 0.5
  };

  onDrag = event => {
    let pos = event.clientX / window.innerWidth;

    if (pos < 0) {
      pos = 0;
    } else if (pos > 1) {
      pos = 1;
    }

    this.setState({
      pos
    });
  };

  render() {
    const { snapshot, compareSnapshot } = this.props;
    const { pos } = this.state;

    return (
      <Outer>
        <Img left style={{ width: `${pos * 100}vw` }}>
          <SnapshotImage {...compareSnapshot} />
        </Img>
        <Img right style={{ width: `${(1 - pos) * 100}vw` }}>
          <SnapshotImage {...snapshot} />
        </Img>
        <Draggable axis="x" onDrag={this.onDrag} onStop={this.onDrag}>
          <Handle />
        </Draggable>
      </Outer>
    );
  }
}
