import React from 'react';
import styled from 'styled-components';

import {
  Temperature,
  Humidity,
  WindDirection,
  WindSpeed,
  WindGust,
  CloudCover,
  SeaLevelPressure,
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
  flex-wrap: wrap;
`;

const WindGroup = styled.span`
  display: inline-flex;
  gap: 5px;
`;

export default function Metadata({ snapshot }) {
  const yr = snapshot.yrWeather;

  return (
    <>
      <Values>
        <Temperature {...snapshot} /> /
        <Humidity {...snapshot} />
      </Values>
      {yr && (
        <YrWeatherRow>
          {yr.windDirectionCompass != null && (
            <WindGroup>
              <WindDirection {...yr} />
              <WindSpeed {...yr} />
              {yr.windSpeedOfGust != null && <WindGust {...yr} />}
            </WindGroup>
          )}
          {yr.cloudAreaFraction != null && <CloudCover {...yr} />}
          {yr.airPressureAtSeaLevel != null && <SeaLevelPressure {...yr} />}
        </YrWeatherRow>
      )}
    </>
  );
}
