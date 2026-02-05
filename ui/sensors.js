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
  const [showCrazy, setShowCrazy] = useState(false);

  if (isCrazy && !showCrazy) {
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

export const WindSpeed = ({ windSpeed }) => {
  if (windSpeed == null) return null;
  return (
    <Sensor>
      {windSpeed.toFixed(1)}
      <Unit>m/s</Unit>
    </Sensor>
  );
};

export const WindDirection = ({ windFromDirection, windDirectionCompass }) => {
  if (windDirectionCompass == null) return null;
  return (
    <Sensor title={`${windFromDirection}°`} style={{ cursor: 'help' }}>
      {windDirectionCompass}
    </Sensor>
  );
};

export const WindGust = ({ windSpeedOfGust }) => {
  if (windSpeedOfGust == null) return null;
  return (
    <Sensor>
      (gust {windSpeedOfGust.toFixed(1)}
      <Unit>m/s</Unit>)
    </Sensor>
  );
};

export const CloudCover = ({ cloudAreaFraction }) => {
  if (cloudAreaFraction == null) return null;
  return (
    <Sensor>
      {Math.round(cloudAreaFraction)}
      <Unit>%</Unit>
    </Sensor>
  );
};

export const SeaLevelPressure = ({ airPressureAtSeaLevel }) => {
  if (airPressureAtSeaLevel == null) return null;
  return (
    <Sensor>
      {Math.round(airPressureAtSeaLevel)}
      <Unit>hPa</Unit>
    </Sensor>
  );
};
