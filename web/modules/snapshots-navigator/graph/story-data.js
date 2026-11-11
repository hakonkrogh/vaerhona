// Made-up history for the chart stories (graph.stories.js), in the form
// history.getRecords() gives (modules/snapshot-history): one record per month,
// with one value per hour. A seeded random makes it the same every time, so a
// design change is the only thing that changes the picture.

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// The snapshot on screen, and the latest one.
const LATEST = Date.UTC(2026, 10, 10, 12);

// mulberry32: a small random number generator that takes a seed.
function seeded(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const round = (value, decimals) => Number(value.toFixed(decimals));

function emptyColumns(withYr) {
  const columns = { time: [], temperature: [], humidity: [] };

  if (withYr) {
    columns.yr = {
      relativeHumidity: [],
      windSpeed: [],
      windFromDirection: [],
      airPressureAtSeaLevel: [],
      cloudAreaFraction: [],
    };
  }

  return columns;
}

/**
 * @param {object} options
 * @param {number} options.days how long the place has had a box
 * @param {boolean} options.withYr if the place has yr.no weather
 * @param {{ from: number, to: number }[]} options.gaps days ago, when the box
 * was off
 * @returns {{ records: object[], times: object }} times: for chartPanels
 */
export function makeHistory({ days = 3 * 365, withYr = true, gaps = [] } = {}) {
  const random = seeded(42);
  const first = LATEST - days * DAY;
  const off = gaps.map(({ from, to }) => ({
    from: LATEST - from * DAY,
    to: LATEST - to * DAY,
  }));
  const months = new Map();

  let drift = 0;
  let pressure = 1013;
  let cloud = 50;
  let wind = 4;
  let direction = 200;

  for (let time = first; time <= LATEST; time += HOUR) {
    const date = new Date(time);
    // 0 in January, so winter is cold.
    const yearAngle =
      ((time - Date.UTC(date.getUTCFullYear(), 0, 1)) / (365 * DAY)) *
      2 *
      Math.PI;
    // Warmest at 14:00.
    const dayAngle = ((date.getUTCHours() - 14) / 24) * 2 * Math.PI;

    drift = (drift + (random() - 0.5) * 0.6) * 0.97;
    pressure = clamp(
      pressure + (random() - 0.5) * 1.6 + (1013 - pressure) * 0.01,
      970,
      1050
    );
    cloud = clamp(cloud + (random() - 0.5) * 18, 0, 100);
    wind = clamp(wind + (random() - 0.5) * 1.4 + (4 - wind) * 0.03, 0, 20);
    direction = (direction + (random() - 0.5) * 30 + 360) % 360;

    if (off.some(({ from, to }) => time >= from && time < to)) {
      continue;
    }

    const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}`;

    if (!months.has(key)) {
      months.set(key, emptyColumns(withYr));
    }

    const columns = months.get(key);
    const humidity = clamp(78 - 12 * Math.cos(dayAngle), 20, 100);

    columns.time.push(time);
    columns.temperature.push(
      round(5 - 10 * Math.cos(yearAngle) + 3.5 * Math.cos(dayAngle) + drift, 1)
    );
    columns.humidity.push(Math.round(humidity + (random() - 0.5) * 10));

    if (withYr) {
      columns.yr.relativeHumidity.push(Math.round(humidity));
      columns.yr.windSpeed.push(round(wind, 1));
      columns.yr.windFromDirection.push(Math.round(direction));
      columns.yr.airPressureAtSeaLevel.push(round(pressure, 1));
      columns.yr.cloudAreaFraction.push(Math.round(cloud));
    }
  }

  return {
    records: [...months.values()].map((columns) => ({ columns })),
    times: { current: LATEST, first, latest: LATEST },
  };
}
