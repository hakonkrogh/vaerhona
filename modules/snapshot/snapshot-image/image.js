import React from "react";
import styled from "styled-components";

import SnapshotImage from "modules/snapshot-image";

const Outer = styled.div`
  flex: 0 1 50vh;
  position: relative;

  > img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

export default class Image extends React.PureComponent {
  render() {
    return (
      <Outer>
        <SnapshotImage {...this.props} sizes="100vw" />
      </Outer>
    );
  }
}
