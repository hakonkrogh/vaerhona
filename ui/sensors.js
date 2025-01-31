import { useState } from 'react';
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

export const Temperature = ({ temperature }) => {
  const normalised = normaliseCrazyTemperature(temperature);
  const isCrazy = Math.abs(normalised - temperature) > 1;
  const [showCrazy, setShowCrazy] = useState(isCrazy);

  if (isCrazy && showCrazy) {
    return (
      <TempSensor
        title={temperature}
        onClick={() => setShowCrazy((c) => !c)}
        style={{ cursor: 'pointer' }}
      >
        ca. {normalised}
        <Unit>&#8451;</Unit>
      </TempSensor>
    );
  }

  return (
    <TempSensor
      onClick={() => setShowCrazy((c) => !c)}
      style={{ cursor: 'pointer' }}
    >
      {temperature}
      <Unit>&#8451;</Unit>
    </TempSensor>
  );
};

function normaliseCrazyTemperature(temperature) {
  const magicNumber = 3273.7; // Used to be 3276.7
  let temp = temperature;
  if (Math.abs(temp) > 100) {
    if (temperature > 0) {
      temp -= magicNumber;
    } else {
      temp += magicNumber;
    }
    temp = Math.floor(temp);
  }
  return Math.round(temp * 10) / 10;
}

export const Humidity = ({ humidity }) => (
  <Sensor>
    {humidity}
    <Unit>%</Unit>
  </Sensor>
);

export const Pressure = ({ pressure }) => (
  <Sensor>
    {pressure}
    <Unit>hPa</Unit>
  </Sensor>
);
