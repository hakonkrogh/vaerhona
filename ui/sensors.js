import styled from 'styled-components';

const Sensor = styled.span`
  display: inline-flex;
  align-items: baseline;
`;

const TempSensor = styled(Sensor)`
  align-items: flex-start;
`;

const Unit = styled.span`
  font-size: 0.6em;
`;

export const Temperature = ({ temperature }) => (
  <TempSensor>
    {temperature}
    <Unit>&#8451;</Unit>
  </TempSensor>
);

export const Humidity = ({ humidity }) => (
  <Sensor>
    {humidity}
    <Unit>%</Unit>
  </Sensor>
);

export const Pressure = ({ humidity }) => (
  <Sensor>
    {humidity}
    <Unit>hPa</Unit>
  </Sensor>
);
