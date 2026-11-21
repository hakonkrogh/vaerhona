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

/**
 * The values of a snapshot. `compact` is for a small tile in compare mode:
 * temperature and humidity only, in smaller text.
 */
export default function Metadata({ snapshot, compact }) {
  const yr = snapshot.yrWeather;

  // Prefer yr data over local sensor data when available
  const humidity = yr?.relativeHumidity ?? snapshot.humidity;

  if (compact) {
    return (
      <div className={styles.compact}>
        <Temperature key={snapshot.cuid} {...snapshot} /> /
        <Humidity humidity={humidity} />
      </div>
    );
  }

  return (
    <>
      <div className={styles.values}>
        {/* The key makes a click that shows the stored value apply to this
            snapshot only. */}
        <Temperature key={snapshot.cuid} {...snapshot} /> /
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
