import React from 'react';
import styled from 'styled-components';

import {
  Temperature,
  Humidity,
  WindDirection,
  WindSpeed,
  WindGust,
  WeatherCondition,
} from 'ui';

const Values = styled.div`
  font-size: 1.5em;
  color: #555;
  margin: 0 auto;
  padding: 15px 0;
  display: flex;
  gap: 20px;
  justify-content: center;
`;

const YrWeatherRow = styled.div`
  font-size: 0.9em;
  color: #888;
  margin: 0 auto;
  padding: 0 0 10px;
  display: flex;
  gap: 15px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
`;

const WindGroup = styled.span`
  display: inline-flex;
  gap: 5px;
`;

export default function Metadata({ snapshot }) {
  const yr = snapshot.yrWeather;

  // Prefer yr data over local sensor data when available
  const humidity = yr?.relativeHumidity ?? snapshot.humidity;

  return (
    <>
      <Values>
        <Temperature {...snapshot} /> /
        <Humidity humidity={humidity} />
      </Values>
      {yr && (
        <YrWeatherRow>
          <WeatherCondition {...yr} />
          {yr.windDirectionCompass != null && (
            <WindGroup>
              <WindDirection {...yr} />
              <WindSpeed {...yr} />
              {yr.windSpeedOfGust != null && <WindGust {...yr} />}
            </WindGroup>
          )}
        </YrWeatherRow>
      )}
    </>
  );
}
