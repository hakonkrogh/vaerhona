// Scales, ticks and SVG paths for the chart. Plain functions, so they can be
// tested without React.

import {
  prettyDayMonth,
  prettyMonth,
  prettyWeekday,
  prettyYear,
} from 'core/date';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/**
 * A round step that gives about `count` steps over `span`: 1, 2 or 5 × 10ⁿ,
 * whichever is nearest (on a log scale, as d3 does).
 */
function niceStep(span, count) {
  const raw = span / Math.max(1, count);
  const power = 10 ** Math.floor(Math.log10(raw));
  const fraction = raw / power;

  if (fraction >= Math.sqrt(50)) {
    return 10 * power;
  }

  if (fraction >= Math.sqrt(10)) {
    return 5 * power;
  }

  return (fraction >= Math.sqrt(2) ? 2 : 1) * power;
}

/** Round numbers from `lo` to `hi`, about `count` of them. */
export function niceTicks(lo, hi, count) {
  if (!(hi > lo)) {
    return [lo];
  }

  const step = niceStep(hi - lo, count);
  const ticks = [];

  for (let i = Math.ceil(lo / step); i * step <= hi + step * 1e-9; i++) {
    // toFixed removes float noise such as 0.30000000000000004.
    ticks.push(Number((i * step).toFixed(10)));
  }

  return ticks;
}

/**
 * The lowest and highest value a panel's scale shows, with a little room
 * above and below. Null if the panel has nothing to draw.
 *
 * @param {object} panel from chartPanels
 */
export function valueDomain({ value, points, band }) {
  let lo = Infinity;
  let hi = -Infinity;
  const take = (v) => {
    if (v != null) {
      lo = Math.min(lo, v);
      hi = Math.max(hi, v);
    }
  };

  for (const point of points) {
    take(point.y);
    take(point.min);
    take(point.max);
  }

  for (const part of band ?? []) {
    take(part.lo);
    take(part.hi);
  }

  if (lo === Infinity) {
    return null;
  }

  if (value.fixed) {
    return [value.min, value.max];
  }

  const room = (hi - lo) * 0.08 || 1;

  lo = value.zero ? Math.min(0, lo) : lo - room;
  hi += room;

  return [Math.max(lo, value.min ?? lo), Math.min(hi, value.max ?? hi)];
}

/** The points split where the time between two is longer than `maxGap`. */
export function segments(points, maxGap) {
  const parts = [];
  let part = [];

  for (const point of points) {
    if (part.length && point.x - part[part.length - 1].x > maxGap) {
      parts.push(part);
      part = [];
    }

    part.push(point);
  }

  if (part.length) {
    parts.push(part);
  }

  return parts;
}

const xy = (x, y) => `${x.toFixed(1)},${y.toFixed(1)}`;

/**
 * A line through the points, open where the time between two points is
 * longer than `maxGap`. A point alone is drawn as a dot (with round caps).
 *
 * @param {(x: number) => number} x time to pixels
 * @param {(point: object) => number} y point to pixels
 */
export function linePath(points, maxGap, x, y) {
  return segments(points, maxGap)
    .map((part) =>
      part.length === 1
        ? `M${xy(x(part[0].x), y(part[0]))}h0.1`
        : `M${part.map((point) => xy(x(point.x), y(point))).join('L')}`
    )
    .join('');
}

/**
 * The area between two lines through the points, for example the lowest and
 * highest value, or a line and the bottom of the panel.
 */
export function areaPath(points, maxGap, x, top, bottom) {
  return segments(points, maxGap)
    .filter((part) => part.length > 1)
    .map((part) => {
      const upper = part.map((point) => xy(x(point.x), top(point)));
      const lower = part
        .map((point) => xy(x(point.x), bottom(point)))
        .reverse();

      return `M${upper.join('L')}L${lower.join('L')}Z`;
    })
    .join('');
}

/** The index of the point nearest to `x`, or -1 if there are none. */
export function nearestIndex(points, x) {
  if (!points.length) {
    return -1;
  }

  let lo = 0;
  let hi = points.length - 1;

  while (hi - lo > 1) {
    const middle = (lo + hi) >> 1;

    if (points[middle].x < x) {
      lo = middle;
    } else {
      hi = middle;
    }
  }

  return Math.abs(points[lo].x - x) <= Math.abs(points[hi].x - x) ? lo : hi;
}

// Midnight in Norway in winter. In summer the tick is an hour late, which
// cannot be seen.
const osloDay = (year, month, day) => Date.UTC(year, month, day) - HOUR;

/**
 * Where to mark the time axis, with labels, so that labels do not overlap.
 *
 * @param {{ from: number, to: number }} range
 * @param {number} width the width of the plot in pixels
 * @returns {{ x: number, label: string }[]} x: time since `from`
 */
export function timeTicks({ from, to }, width) {
  const span = to - from;
  const perPixel = span / Math.max(1, width);
  const start = new Date(from + HOUR);
  const ticks = [];
  const add = (time, label) => {
    if (time >= from && time <= to) {
      ticks.push({ x: time - from, label });
    }
  };
  // The first step from `steps` that leaves at least `pixels` between ticks.
  const pick = (steps, size, pixels) =>
    steps.find((step) => (step * size) / perPixel >= pixels) ??
    steps[steps.length - 1];

  if (span <= 62 * DAY) {
    const weekly = span <= 10 * DAY;
    const step = pick(weekly ? [1, 2] : [1, 2, 3, 7, 14], DAY, 56);

    for (let day = 0; day * DAY <= span + DAY; day += step) {
      const time = osloDay(
        start.getUTCFullYear(),
        start.getUTCMonth(),
        start.getUTCDate() + day
      );

      add(time, weekly ? prettyWeekday(time) : prettyDayMonth(time));
    }
  } else if (span <= 800 * DAY) {
    const step = pick([1, 2, 3, 6], 30 * DAY, 36);

    for (let month = 0; month * 28 * DAY <= span + 31 * DAY; month++) {
      const date = new Date(
        Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + month, 1)
      );
      const number = date.getUTCMonth();

      if (number % step === 0) {
        const time = osloDay(date.getUTCFullYear(), number, 1);

        // January shows the year, so a year that starts can be seen.
        add(time, number === 0 ? prettyYear(time) : prettyMonth(time));
      }
    }
  } else {
    const step = pick([1, 2, 5, 10], 365 * DAY, 40);

    for (
      let year = start.getUTCFullYear();
      year <= new Date(to).getUTCFullYear() + 1;
      year++
    ) {
      if (year % step === 0) {
        add(osloDay(year, 0, 1), String(year));
      }
    }
  }

  return ticks;
}
