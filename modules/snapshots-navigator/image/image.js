import React from 'react';
import styled from 'styled-components';

import SnapshotImage from 'modules/snapshot-image';
import { responsive } from 'ui';

const Outer = styled.div`
  position: relative;
  padding-top: 100%;

  > img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  ${responsive.smAndMore} {
    padding-top: 56.25%;
    > img {
      object-fit: contain;
    }
  }
`;

export default function Image({ snapshot }) {
  return (
    <Outer>
      <SnapshotImage {...snapshot} sizes="100vw" />
    </Outer>
  );
}
