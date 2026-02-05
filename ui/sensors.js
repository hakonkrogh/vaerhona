import { useState } from 'react';
import styled from 'styled-components';
import {
  ArrowUp,
  ArrowUpRight,
  ArrowRight,
  ArrowDownRight,
  ArrowDown,
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpLeft,
  TrendUp,
  TrendDown,
  Minus,
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  Wind,
} from '@phosphor-icons/react';

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

const windDirectionIcons = {
  N: ArrowDown,
  NE: ArrowDownLeft,
  E: ArrowLeft,
  SE: ArrowUpLeft,
  S: ArrowUp,
  SW: ArrowUpRight,
  W: ArrowRight,
  NW: ArrowDownRight,
};

export const WindDirection = ({ windFromDirection, windDirectionCompass }) => {
  if (windDirectionCompass == null) return null;
  const Icon = windDirectionIcons[windDirectionCompass];
  return (
    <Sensor
      title={`${windDirectionCompass} (${windFromDirection}°)`}
      style={{ cursor: 'help' }}
    >
      {Icon && <Icon size={18} weight="bold" />}
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
      ☁️
      {Math.round(cloudAreaFraction)}
      <Unit>%</Unit>
    </Sensor>
  );
};

function getPressureInfo(hPa) {
  if (hPa < 1000) return { label: 'Low', Icon: TrendDown, double: true };
  if (hPa < 1010) return { label: 'Falling', Icon: TrendDown };
  if (hPa <= 1020) return { label: 'Normal', Icon: Minus };
  if (hPa <= 1030) return { label: 'Rising', Icon: TrendUp };
  return { label: 'High', Icon: TrendUp, double: true };
}

export const SeaLevelPressure = ({ airPressureAtSeaLevel }) => {
  if (airPressureAtSeaLevel == null) return null;
  const { label, Icon, double } = getPressureInfo(airPressureAtSeaLevel);
  return (
    <Sensor
      title={`${label} (${Math.round(airPressureAtSeaLevel)} hPa)`}
      style={{ cursor: 'help', display: 'inline-flex', gap: '2px' }}
    >
      <Icon size={18} weight="bold" />
      {double && <Icon size={18} weight="bold" />}
    </Sensor>
  );
};

function getWeatherCondition({
  cloudAreaFraction,
  airPressureAtSeaLevel,
  windSpeed,
  relativeHumidity,
}) {
  const clouds = cloudAreaFraction ?? 0;
  const pressure = airPressureAtSeaLevel ?? 1013;
  const wind = windSpeed ?? 0;
  const humidity = relativeHumidity ?? 50;

  // Regn: lavt trykk + mye skyer + høy fuktighet
  if (pressure < 1005 && clouds > 70 && humidity > 75) {
    return { label: 'Regn', Icon: CloudRain };
  }

  // Mye vind (> 10 m/s)
  if (wind > 10) {
    return { label: 'Mye vind', Icon: Wind };
  }

  // Overskyet: veldig høy skydekke
  if (clouds > 80) {
    return { label: 'Overskyet', Icon: Cloud };
  }

  // Skyet: høy skydekke
  if (clouds > 50) {
    return { label: 'Skyet', Icon: Cloud };
  }

  // Delvis skyet: middels skydekke
  if (clouds > 20) {
    return { label: 'Delvis skyet', Icon: CloudSun };
  }

  // Klart: lite skyer
  return { label: 'Klart', Icon: Sun };
}

export const WeatherCondition = (yr) => {
  if (!yr) return null;
  const { label, Icon } = getWeatherCondition(yr);
  const details = [
    yr.cloudAreaFraction != null && `Skyer: ${Math.round(yr.cloudAreaFraction)}%`,
    yr.airPressureAtSeaLevel != null && `Trykk: ${Math.round(yr.airPressureAtSeaLevel)} hPa`,
    yr.windSpeed != null && `Vind: ${yr.windSpeed.toFixed(1)} m/s`,
    yr.relativeHumidity != null && `Fuktighet: ${Math.round(yr.relativeHumidity)}%`,
  ].filter(Boolean).join('\n');

  return (
    <Sensor title={`${label}\n${details}`} style={{ cursor: 'help' }}>
      <Icon size={24} weight="fill" />
    </Sensor>
  );
};
