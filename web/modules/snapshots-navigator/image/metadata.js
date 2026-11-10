import React from 'react';
import {
  Temperature,
  Humidity,
  WindDirection,
  WindSpeed,
  WindGust,
  WeatherCondition,
} from 'ui';

import styles from './metadata.module.css';

export default function Metadata({ snapshot }) {
  const yr = snapshot.yrWeather;

  // Prefer yr data over local sensor data when available
  const humidity = yr?.relativeHumidity ?? snapshot.humidity;

  return (
    <>
      <div className={styles.values}>
        <Temperature {...snapshot} /> /
        <Humidity humidity={humidity} />
      </div>
      {yr && (
        <div className={styles.yrWeatherRow}>
          <WeatherCondition {...yr} />
          {yr.windDirectionCompass != null && (
            <span className={styles.windGroup}>
              <WindDirection {...yr} />
              <WindSpeed {...yr} />
              {yr.windSpeedOfGust != null && <WindGust {...yr} />}
            </span>
          )}
        </div>
      )}
    </>
  );
}
