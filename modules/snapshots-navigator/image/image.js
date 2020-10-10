import React from 'react';
import styled from 'styled-components';

import SnapshotImage from 'modules/snapshot-image';

const Outer = styled.div``;

export default function Image({ snapshot }) {
  return (
    <Outer>
      <SnapshotImage {...snapshot} sizes="100vw" />
    </Outer>
  );
}
