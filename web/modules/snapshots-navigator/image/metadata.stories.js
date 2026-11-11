import Metadata from './metadata';

// The values under the photo on a place page.

const snapshot = {
  cuid: 'snapshot-1',
  date: '2026-11-10T11:58:00.000Z',
  temperature: 4.2,
  humidity: 78,
  yrWeather: {
    relativeHumidity: 81,
    cloudAreaFraction: 62,
    airPressureAtSeaLevel: 1008,
    windSpeed: 5.4,
    windSpeedOfGust: 9.8,
    windFromDirection: 210,
    windDirectionCompass: 'SW',
  },
};

const meta = {
  title: 'Modules/Snapshots navigator/Metadata',
  component: Metadata,
  parameters: { layout: 'padded' },
  args: { snapshot },
};

export default meta;

export const WithYrWeather = {};

/** A place without yr.no weather shows only what its box measures. */
export const BoxOnly = {
  args: { snapshot: { ...snapshot, yrWeather: null } },
};

export const NoWind = {
  args: {
    snapshot: {
      ...snapshot,
      yrWeather: { ...snapshot.yrWeather, windDirectionCompass: null },
    },
  },
};

export const BelowZero = {
  args: {
    snapshot: {
      ...snapshot,
      temperature: -12.6,
      yrWeather: {
        ...snapshot.yrWeather,
        cloudAreaFraction: 4,
        windSpeed: 1.2,
        windSpeedOfGust: null,
      },
    },
  },
};
