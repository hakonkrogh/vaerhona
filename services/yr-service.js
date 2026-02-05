/**
 * yr.no API integration service
 * Fetches weather data from the Norwegian Meteorological Institute
 */

const YR_API_BASE = 'https://api.met.no/weatherapi/locationforecast/2.0/compact';
const USER_AGENT = 'vaerhona-weather-monitor/1.0';
const COORDINATE_PRECISION = 4; // MET API requires max 4 decimal places

/**
 * Round coordinate to the precision required by MET API (4 decimal places)
 * @param {number} coord - Latitude or longitude value
 * @returns {number}
 */
export function roundCoordinate(coord) {
  const factor = Math.pow(10, COORDINATE_PRECISION);
  return Math.round(coord * factor) / factor;
}

/**
 * Check if a place has yr.no support (coordinates configured in database)
 * @param {object} place - The place object from database
 * @returns {boolean}
 */
export function hasYrSupport(place) {
  return typeof place?.lat === 'number' && typeof place?.lon === 'number';
}

/**
 * Fetch current temperature from yr.no for a given place
 * @param {object} place - The place object with lat/lon from database
 * @returns {Promise<number|null>} Temperature in Celsius or null on failure
 */
export async function fetchTemperature(place) {
  if (!hasYrSupport(place)) {
    console.log(`[yr-service] No coordinates configured for place: ${place?.name}`);
    return null;
  }

  const lat = roundCoordinate(place.lat);
  const lon = roundCoordinate(place.lon);
  const url = `${YR_API_BASE}?lat=${lat}&lon=${lon}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
      },
    });

    if (!response.ok) {
      console.error(`[yr-service] API request failed: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    const temperature = data?.properties?.timeseries?.[0]?.data?.instant?.details?.air_temperature;

    if (typeof temperature !== 'number') {
      console.error('[yr-service] Could not extract temperature from response');
      return null;
    }

    console.log(`[yr-service] Fetched temperature for ${place.name}: ${temperature}°C`);
    return temperature;
  } catch (error) {
    console.error(`[yr-service] Error fetching temperature: ${error.message}`);
    return null;
  }
}

/**
 * @typedef {Object} YrWeatherData
 * @property {number} [airTemperature] - Air temperature in Celsius
 * @property {number} [windSpeed] - Wind speed in m/s
 * @property {number} [windFromDirection] - Wind direction in degrees (0-360)
 * @property {number} [windSpeedOfGust] - Wind gust speed in m/s
 * @property {number} [airPressureAtSeaLevel] - Pressure in hPa
 * @property {number} [cloudAreaFraction] - Cloud cover percentage (0-100)
 * @property {number} [dewPointTemperature] - Dew point in Celsius
 * @property {number} [relativeHumidity] - Relative humidity percentage
 */

/**
 * Fetch all available weather data from yr.no for a given place
 * @param {object} place - The place object with lat/lon from database
 * @returns {Promise<YrWeatherData|null>} Weather data object or null on failure
 */
export async function fetchWeatherData(place) {
  if (!hasYrSupport(place)) {
    console.log(`[yr-service] No coordinates configured for place: ${place?.name}`);
    return null;
  }

  const lat = roundCoordinate(place.lat);
  const lon = roundCoordinate(place.lon);
  const url = `${YR_API_BASE}?lat=${lat}&lon=${lon}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
      },
    });

    if (!response.ok) {
      console.error(`[yr-service] API request failed: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    const details = data?.properties?.timeseries?.[0]?.data?.instant?.details;

    if (!details) {
      console.error('[yr-service] Could not extract weather details from response');
      return null;
    }

    const weatherData = {
      airTemperature: details.air_temperature,
      windSpeed: details.wind_speed,
      windFromDirection: details.wind_from_direction,
      windSpeedOfGust: details.wind_speed_of_gust,
      airPressureAtSeaLevel: details.air_pressure_at_sea_level,
      cloudAreaFraction: details.cloud_area_fraction,
      dewPointTemperature: details.dew_point_temperature,
      relativeHumidity: details.relative_humidity,
    };

    console.log(`[yr-service] Fetched weather data for ${place.name}:`, weatherData);
    return weatherData;
  } catch (error) {
    console.error(`[yr-service] Error fetching weather data: ${error.message}`);
    return null;
  }
}
