import React from 'react';

import {
  Temperature,
  Humidity,
  Pressure,
  WindSpeed,
  WindDirection,
  WindGust,
  CloudCover,
  SeaLevelPressure,
  WeatherCondition,
} from './sensors';

const meta = {
  title: 'UI/Sensors',
};

export default meta;

export const TemperatureValue = {
  render: (args) => <Temperature {...args} />,
  args: { temperature: 7.4 },
};

/** A value below zero that came in the wrong form. It shows repaired, and a
 * click shows the stored value. */
export const TemperatureRepaired = {
  render: (args) => <Temperature {...args} />,
  args: { temperature: -3265.8 },
};

export const HumidityValue = {
  render: (args) => <Humidity {...args} />,
  args: { humidity: 82 },
};

export const PressureValue = {
  render: (args) => <Pressure {...args} />,
  args: { pressure: 987 },
};

export const Wind = {
  render: (args) => (
    <span style={{ display: 'inline-flex', gap: 5 }}>
      <WindDirection {...args} />
      <WindSpeed {...args} />
      <WindGust {...args} />
    </span>
  ),
  args: {
    windFromDirection: 225,
    windDirectionCompass: 'SW',
    windSpeed: 6.3,
    windSpeedOfGust: 11.2,
  },
  argTypes: {
    windDirectionCompass: {
      control: 'select',
      options: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
    },
  },
};

export const Clouds = {
  render: (args) => <CloudCover {...args} />,
  args: { cloudAreaFraction: 64 },
};

/** The trend arrows for air pressure at sea level. */
export const SeaLevelPressureScale = {
  render: () => (
    <div style={{ display: 'grid', gap: 8 }}>
      {[990, 1005, 1013, 1025, 1040].map((hPa) => (
        <div key={hPa} style={{ display: 'flex', gap: 12 }}>
          <span style={{ width: 70 }}>{hPa} hPa</span>
          <SeaLevelPressure airPressureAtSeaLevel={hPa} />
        </div>
      ))}
    </div>
  ),
};

/** The weather icon for each kind of yr.no weather. */
export const WeatherConditions = {
  render: () => (
    <div style={{ display: 'grid', gap: 8 }}>
      {[
        ['Klart', { cloudAreaFraction: 5 }],
        ['Delvis skyet', { cloudAreaFraction: 35 }],
        ['Skyet', { cloudAreaFraction: 65 }],
        ['Overskyet', { cloudAreaFraction: 95 }],
        ['Mye vind', { cloudAreaFraction: 40, windSpeed: 14 }],
        [
          'Regn',
          {
            cloudAreaFraction: 90,
            airPressureAtSeaLevel: 998,
            relativeHumidity: 92,
          },
        ],
      ].map(([label, yr]) => (
        <div key={label} style={{ display: 'flex', gap: 12 }}>
          <span style={{ width: 100 }}>{label}</span>
          <WeatherCondition {...yr} />
        </div>
      ))}
    </div>
  ),
};
