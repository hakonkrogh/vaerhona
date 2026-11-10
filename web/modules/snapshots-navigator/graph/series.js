// The numbers behind the chart: plain data in and out, so it can be tested
// without React or Chart.js. The values come from the browser's local database
// (modules/snapshot-history).

import { validHumidity, validTemperature } from 'core/readings';

const DAY = 24 * 60 * 60 * 1000;

// Days are cut at midnight Norwegian winter time. Daylight saving moves the
// cut one hour in summer, which a daily mean does not show.
const DAY_OFFSET = 60 * 60 * 1000;

export const PERIODS = [
  { key: 'week', label: 'Uke', days: 7 },
  { key: 'month', label: 'Måned', days: 30 },
  { key: 'year', label: 'År', days: 365, daily: true },
  { key: 'all', label: 'Alt', daily: true },
];

// `value` gives null for a reading that is off, and the chart leaves it out
// (rule P11, see core/readings.js).
export const PROPERTIES = [
  {
    key: 'temperature',
    icon: 'thermometer',
    label: 'Temperatur',
    unit: '°C',
    value: (columns, i) =>
      validTemperature(columns.temperature[i], columns.humidity[i]),
  },
  {
    key: 'humidity',
    icon: 'droplets',
    label: 'Luftfuktighet',
    unit: '%',
    // The yr.no value when there is one, as the place page shows (rule P2).
    value: (columns, i) =>
      columns.yr?.relativeHumidity[i] ??
      validHumidity(columns.temperature[i], columns.humidity[i]),
  },
];

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
 * @returns {{ x: number, y: number }[]}
 */
export function pointsInRange(records, { from, to }, property) {
  const points = [];

  for (const { columns } of records) {
    const { time } = columns;

    if (!time.length || time[time.length - 1] < from || time[0] > to) {
      continue;
    }

    for (let i = 0; i < time.length; i++) {
      const y = property.value(columns, i);

      if (time[i] >= from && time[i] <= to && y != null) {
        points.push({ x: time[i] - from, y });
      }
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

/**
 * Everything the chart draws for a period.
 *
 * @returns {{ range: object, lines: object[] }} lines: the period itself
 * first, then the same period in earlier years if `compare` is set. Each has
 * the start time of its range, the year it ends in, and its points.
 */
export function chartLines({ records, period, property, times, compare }) {
  const range = periodRange(period, times);
  // Comparing the whole history with itself makes no sense.
  const ranges =
    compare && period.days
      ? [range, ...earlierYears(range, times.first)]
      : [range];

  const lines = ranges.map((lineRange) => {
    const points = pointsInRange(records, lineRange, property);

    return {
      from: lineRange.from,
      year: new Date(lineRange.to).getUTCFullYear(),
      points: period.daily ? dailyPoints(points, lineRange.from) : points,
    };
  });

  return { range, lines };
}
