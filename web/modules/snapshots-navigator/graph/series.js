// The numbers behind the chart: plain data in and out, so it can be tested
// without React. The values come from the browser's local database
// (modules/snapshot-history).

import { validHumidity, validTemperature } from 'core/readings';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// Days are cut at midnight Norwegian winter time. Daylight saving moves the
// cut one hour in summer, which a daily mean does not show.
const DAY_OFFSET = HOUR;

export const PERIODS = [
  { key: 'week', label: 'Uke', days: 7 },
  { key: 'month', label: 'Måned', days: 30 },
  { key: 'year', label: 'År', days: 365, daily: true },
  { key: 'all', label: 'Alt', daily: true },
];

const yrValue = (field) => (columns, i) => columns.yr?.[field]?.[i] ?? null;

/**
 * The values the chart can show, each in its own panel. `value` gives null
 * for a reading that is off, and the chart leaves it out (rule P11, see
 * core/readings.js).
 *
 * - yr: the value only comes from yr.no. The boxes measure only temperature,
 *   humidity and pressure, and their pressure is not at sea level, so it
 *   cannot be mixed with the yr.no pressure.
 * - zero: the scale starts at 0.
 * - min, max: the scale never goes past these. With `fixed`, it always shows
 *   all of it.
 */
export const VALUES = [
  {
    key: 'temperature',
    label: 'Temperatur',
    unit: '°C',
    decimals: 1,
    value: (columns, i) =>
      validTemperature(columns.temperature[i], columns.humidity[i]),
  },
  {
    key: 'humidity',
    label: 'Luftfuktighet',
    unit: '%',
    decimals: 0,
    min: 0,
    max: 100,
    // The yr.no value, as the place page shows (rule P2). In a month with
    // yr.no weather, a snapshot without it is left out instead of using the
    // box's own value. Some boxes send values such as 9 % and 99 % that
    // validHumidity cannot catch, which would draw a spike in the line.
    value: (columns, i) =>
      columns.yr
        ? (columns.yr.relativeHumidity?.[i] ?? null)
        : validHumidity(columns.temperature[i], columns.humidity[i]),
  },
  {
    key: 'wind',
    label: 'Vind',
    unit: 'm/s',
    decimals: 1,
    yr: true,
    zero: true,
    value: yrValue('windSpeed'),
    direction: yrValue('windFromDirection'),
  },
  {
    key: 'pressure',
    label: 'Lufttrykk',
    unit: 'hPa',
    decimals: 0,
    yr: true,
    value: yrValue('airPressureAtSeaLevel'),
  },
  {
    key: 'cloud',
    label: 'Skydekke',
    unit: '%',
    decimals: 0,
    yr: true,
    min: 0,
    max: 100,
    fixed: true,
    value: yrValue('cloudAreaFraction'),
  },
];

/**
 * The longest time between two points that is still drawn as a line. A
 * longer gap, when the box was off, is left open.
 */
export function gapLimit(period) {
  return (period.daily ? 3 : 0.5) * DAY;
}

/**
 * The time a period covers. It ends at the snapshot on screen, and "all" is
 * the whole history of the place.
 *
 * @param {object} period from PERIODS
 * @param {object} times milliseconds: current, first and latest snapshot
 */
export function periodRange(period, { current, first, latest }) {
  if (!period.days) {
    return { from: first, to: latest };
  }

  return { from: current - period.days * DAY, to: current };
}

function shiftYears(time, years) {
  const date = new Date(time);

  date.setUTCFullYear(date.getUTCFullYear() - years);

  return date.getTime();
}

/**
 * The same range in each earlier year the place has snapshots for, newest
 * first. For comparing years.
 */
export function earlierYears({ from, to }, first) {
  const ranges = [];

  for (let years = 1; shiftYears(to, years) > first; years++) {
    ranges.push({ from: shiftYears(from, years), to: shiftYears(to, years) });
  }

  return ranges;
}

/**
 * One point per snapshot in the range. x is the time since the start of the
 * range, so the same days of different years land on top of each other.
 *
 * @param {object[]} records from history.getRecords(), oldest first
 * @param {object} value from VALUES
 * @returns {{ x: number, y: number, dir?: number }[]} dir: where the wind
 * comes from, in degrees, for a value with a direction
 */
export function pointsInRange(records, { from, to }, value) {
  const points = [];

  for (const { columns } of records) {
    const { time } = columns;

    if (!time.length || time[time.length - 1] < from || time[0] > to) {
      continue;
    }

    for (let i = 0; i < time.length; i++) {
      if (time[i] < from || time[i] > to) {
        continue;
      }

      const y = value.value(columns, i);

      if (y == null) {
        continue;
      }

      const point = { x: time[i] - from, y };
      const dir = value.direction?.(columns, i);

      if (dir != null) {
        point.dir = dir;
      }

      points.push(point);
    }
  }

  return points;
}

const round = (value) => Math.round(value * 10) / 10;

/**
 * One point per day: the mean, with the lowest and highest value of the day.
 *
 * @param {{ x: number, y: number }[]} points from pointsInRange, oldest first
 * @param {number} from the start of the range the points belong to
 * @returns {{ x: number, y: number, min: number, max: number }[]}
 */
export function dailyPoints(points, from) {
  const days = [];
  let day;

  for (const { x, y } of points) {
    const number = Math.floor((from + x + DAY_OFFSET) / DAY);

    if (!day || day.number !== number) {
      day = { number, sum: 0, count: 0, min: y, max: y };
      days.push(day);
    }

    day.sum += y;
    day.count++;
    day.min = Math.min(day.min, y);
    day.max = Math.max(day.max, y);
  }

  return days.map(({ number, sum, count, min, max }) => ({
    // The middle of the day.
    x: number * DAY - DAY_OFFSET + DAY / 2 - from,
    y: round(sum / count),
    min,
    max,
  }));
}

function median(sorted) {
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

/**
 * What is normal for each part of the period: the lowest, middle and highest
 * value of the earlier years. Each year counts once in a part, with the mean
 * of its points there.
 *
 * @param {{ points: object[] }[]} lines the earlier years
 * @param {number} size the length of a part: an hour, or a day for daily
 * points. The ranges of all years start at the same time of day, so their
 * parts line up.
 * @returns {{ x: number, lo: number, mid: number, hi: number }[]}
 */
export function yearBand(lines, size) {
  const parts = new Map();

  for (const { points } of lines) {
    const ofYear = new Map();

    for (const { x, y } of points) {
      const key = Math.floor(x / size);
      const part = ofYear.get(key) ?? { x: 0, y: 0, count: 0 };

      part.x += x;
      part.y += y;
      part.count++;
      ofYear.set(key, part);
    }

    for (const [key, part] of ofYear) {
      const all = parts.get(key) ?? { x: 0, values: [] };

      all.x += part.x / part.count;
      all.values.push(part.y / part.count);
      parts.set(key, all);
    }
  }

  return [...parts.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, { x, values }]) => {
      const sorted = values.sort((a, b) => a - b);

      return {
        x: Math.round(x / values.length),
        lo: round(sorted[0]),
        mid: round(median(sorted)),
        hi: round(sorted[sorted.length - 1]),
      };
    });
}

/**
 * Everything the chart draws for a period: one panel per value.
 *
 * @param {object} options
 * @param {object[]} options.values from VALUES
 * @param {boolean} [options.compare] add what is normal from earlier years.
 * Not for "all", which has no earlier years.
 * @returns {{ range: object, panels: object[] }} Each panel has its value,
 * the points of the period, and with `compare` a band from yearBand and the
 * first and last year in it. The band is null when no earlier year has data.
 */
export function chartPanels({ records, period, values, times, compare }) {
  const range = periodRange(period, times);
  const earlier =
    compare && period.days ? earlierYears(range, times.first) : [];

  const lineOf = (lineRange, value) => {
    const points = pointsInRange(records, lineRange, value);

    return {
      year: new Date(lineRange.to).getUTCFullYear(),
      points: period.daily ? dailyPoints(points, lineRange.from) : points,
    };
  };

  const panels = values.map((value) => {
    const panel = { value, points: lineOf(range, value).points, band: null };
    const lines = earlier
      .map((lineRange) => lineOf(lineRange, value))
      .filter((line) => line.points.length);

    if (lines.length) {
      panel.band = yearBand(lines, period.daily ? DAY : HOUR);
      // The lines are newest first.
      panel.bandYears = [lines[lines.length - 1].year, lines[0].year];
    }

    return panel;
  });

  return { range, panels };
}
