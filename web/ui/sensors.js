import { useState } from 'react';

import { Arrow, TrendUp, TrendDown, Minus } from './line-icons';
import {
  ClearDay,
  PartlyCloudyDay,
  Cloudy,
  Overcast,
  OvercastRain,
  Wind,
} from './weather-icons';
import styles from './sensors.module.css';

const Sensor = ({ className, ...props }) => (
  <span
    className={className ? `${styles.sensor} ${className}` : styles.sensor}
    {...props}
  />
);

const Unit = (props) => <span className={styles.unit} {...props} />;

export const Temperature = ({ temperature }) => {
  const normalised = normaliseCrazyTemperature(temperature);
  const isCrazy = Math.abs(normalised - temperature) > 1;
  const [showCrazy, setShowCrazy] = useState(false);

  if (isCrazy && !showCrazy) {
    return (
      <Sensor
        className={styles.temperature}
        title={temperature}
        onClick={() => setShowCrazy((c) => !c)}
      >
        ca. {normalised}
        <Unit>&#8451;</Unit>
      </Sensor>
    );
  }

  return (
    <Sensor
      className={styles.temperature}
      onClick={() => setShowCrazy((c) => !c)}
    >
      {temperature}
      <Unit>&#8451;</Unit>
    </Sensor>
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

// The arrow shows where the wind blows to, so wind from the north points
// down. The value is how far the arrow is turned from pointing up.
const windArrowDegrees = {
  N: 180,
  NE: 225,
  E: 270,
  SE: 315,
  S: 0,
  SW: 45,
  W: 90,
  NW: 135,
};

export const WindDirection = ({ windFromDirection, windDirectionCompass }) => {
  if (windDirectionCompass == null) return null;
  const degrees = windArrowDegrees[windDirectionCompass];
  return (
    <Sensor
      className={styles.help}
      title={`${windDirectionCompass} (${windFromDirection}°)`}
    >
      {degrees != null && <Arrow degrees={degrees} />}
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
      className={`${styles.help} ${styles.pressure}`}
      title={`${label} (${Math.round(airPressureAtSeaLevel)} hPa)`}
    >
      <Icon />
      {double && <Icon />}
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
    return { label: 'Regn', Icon: OvercastRain };
  }

  // Mye vind (> 10 m/s)
  if (wind > 10) {
    return { label: 'Mye vind', Icon: Wind };
  }

  // Overskyet: veldig høy skydekke
  if (clouds > 80) {
    return { label: 'Overskyet', Icon: Overcast };
  }

  // Skyet: høy skydekke
  if (clouds > 50) {
    return { label: 'Skyet', Icon: Cloudy };
  }

  // Delvis skyet: middels skydekke
  if (clouds > 20) {
    return { label: 'Delvis skyet', Icon: PartlyCloudyDay };
  }

  // Klart: lite skyer
  return { label: 'Klart', Icon: ClearDay };
}

export const WeatherCondition = (yr) => {
  if (!yr) return null;
  const { label, Icon } = getWeatherCondition(yr);
  const details = [
    yr.cloudAreaFraction != null &&
      `Skyer: ${Math.round(yr.cloudAreaFraction)}%`,
    yr.airPressureAtSeaLevel != null &&
      `Trykk: ${Math.round(yr.airPressureAtSeaLevel)} hPa`,
    yr.windSpeed != null && `Vind: ${yr.windSpeed.toFixed(1)} m/s`,
    yr.relativeHumidity != null &&
      `Fuktighet: ${Math.round(yr.relativeHumidity)}%`,
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <Sensor className={styles.help} title={`${label}\n${details}`}>
      <Icon size={32} />
    </Sensor>
  );
};
