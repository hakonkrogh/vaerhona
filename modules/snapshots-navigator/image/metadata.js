import React from 'react';
import styled from 'styled-components';

import { Temperature, Humidity, Pressure } from 'ui';

const Values = styled.div`
  display: flex;
  justify-content: space-around;
  font-size: 1.5em;
  color: #555;
  max-width: 500px;
  margin: 0 auto;
  padding: 15px 0;

  > span {
    margin: 0 20px;
    text-align: center;
    min-width: 80px;
  }
`;

export default function Metadata({ snapshot }) {
  return (
    <Values>
      <Temperature {...snapshot} />
      <Humidity {...snapshot} />
      <Pressure {...snapshot} />
    </Values>
  );
}
