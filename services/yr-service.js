/**
 * yr.no API integration service
 * Fetches weather data from the Norwegian Meteorological Institute
 */

const YR_API_BASE = 'https://api.met.no/weatherapi/locationforecast/2.0/compact';
const USER_AGENT = 'vaerhona-weather-monitor/1.0';

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

  const url = `${YR_API_BASE}?lat=${place.lat}&lon=${place.lon}`;

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
