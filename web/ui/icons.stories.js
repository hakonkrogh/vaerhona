import React from 'react';

import { IconApp, IconArrow, IconCompare } from './icons';
import { Arrow, TrendUp, TrendDown, Minus } from './line-icons';
import {
  ClearDay,
  PartlyCloudyDay,
  Cloudy,
  Overcast,
  OvercastRain,
  Wind,
} from './weather-icons';

// Every icon in ui/, side by side, at one size and colour. Change an icon's
// file and it updates here.

const LINE_ICONS = { Arrow, TrendUp, TrendDown, Minus };
const WEATHER_ICONS = {
  ClearDay,
  PartlyCloudyDay,
  Cloudy,
  Overcast,
  OvercastRain,
  Wind,
};
const OTHER_ICONS = { IconApp, IconArrow, IconCompare };

function Grid({ icons, size, color }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: 24,
        color,
        fill: color,
      }}
    >
      {Object.entries(icons).map(([name, Icon]) => (
        <figure
          key={name}
          style={{
            margin: 0,
            display: 'grid',
            justifyItems: 'center',
            gap: 8,
          }}
        >
          <Icon size={size} />
          <figcaption style={{ fontSize: 12, color: '#666' }}>
            {name}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

const meta = {
  title: 'UI/Icons',
  parameters: { layout: 'padded' },
  args: { size: 32, color: '#222222' },
  argTypes: {
    size: { control: { type: 'range', min: 12, max: 128, step: 2 } },
    color: { control: 'color' },
  },
};

export default meta;

export const LineIcons = {
  render: (args) => <Grid icons={LINE_ICONS} {...args} />,
};

export const WeatherIcons = {
  args: { size: 64 },
  render: (args) => <Grid icons={WEATHER_ICONS} {...args} />,
};

export const Other = {
  render: (args) => <Grid icons={OTHER_ICONS} {...args} />,
};

/** The arrow the wind direction uses, at each compass point. */
export const ArrowDirections = {
  render: ({ size, color }) => (
    <Grid
      icons={Object.fromEntries(
        [0, 45, 90, 135, 180, 225, 270, 315].map((degrees) => [
          `${degrees}°`,
          (props) => <Arrow degrees={degrees} {...props} />,
        ])
      )}
      size={size}
      color={color}
    />
  ),
};
