import React from 'react';
import styled from 'styled-components';

import { Temperature, Humidity, Pressure } from 'ui';

const Values = styled.div`
  font-size: 1.5em;
  color: #555;
  margin: 0 auto;
  padding: 15px 0;
  display: flex;
  gap: 20px;
  justify-content: center;
`;

export default function Metadata({ snapshot }) {
  return (
    <Values>
      <Temperature {...snapshot} /> /
      <Humidity {...snapshot} />
      {/* <Pressure {...snapshot} /> */}
    </Values>
  );
}
