const TIME_ZONE = 'Europe/Oslo';
const INVALID_DATE = 'Invalid date';

const WEEKDAYS = ['sø.', 'ma.', 'ti.', 'on.', 'to.', 'fr.', 'lø.'];
const MONTHS = [
  'jan.',
  'feb.',
  'mars',
  'apr.',
  'mai',
  'juni',
  'juli',
  'aug.',
  'sep.',
  'okt.',
  'nov.',
  'des.',
];

const partsFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIME_ZONE,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

/**
 * The calendar values of a date in Oslo, or null if the date is invalid.
 * All text on the site uses this time zone, wherever the viewer is.
 */
function osloParts(date = new Date()) {
  // new Date(null) would be 1 January 1970.
  const parsed = date === null ? new Date(NaN) : new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const parts = {};
  for (const { type, value } of partsFormatter.formatToParts(parsed)) {
    parts[type] = value;
  }

  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);

  return {
    year,
    monthName: MONTHS[month - 1],
    day,
    weekdayName: WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()],
    paddedMonth: parts.month,
    paddedDay: parts.day,
    paddedHour: parts.hour,
    paddedMinute: parts.minute,
  };
}

function format(date, formatParts) {
  const parts = osloParts(date);

  return parts ? formatParts(parts) : INVALID_DATE;
}

export function prettyDate(date, { year = true } = {}) {
  return format(date, (p) =>
    year
      ? `${p.paddedDay}.${p.paddedMonth}.${p.year}`
      : `${p.paddedDay} ${p.monthName}`
  );
}

export function prettyDateTime(date) {
  return format(
    date,
    (p) =>
      `${p.weekdayName} ${p.day}. ${p.monthName} ${p.year} kl. ${p.paddedHour}:${p.paddedMinute}`
  );
}

export function prettyYearMonth(date) {
  return format(date, (p) => `${p.monthName} ${p.year}`);
}

/** "ti. 4. nov. 2026" */
export function prettyDay(date) {
  return format(
    date,
    (p) => `${p.weekdayName} ${p.day}. ${p.monthName} ${p.year}`
  );
}

/** "ti. 4." */
export function prettyWeekday(date) {
  return format(date, (p) => `${p.weekdayName} ${p.day}.`);
}

/** "4. nov." */
export function prettyDayMonth(date) {
  return format(date, (p) => `${p.day}. ${p.monthName}`);
}

/** "nov." */
export function prettyMonth(date) {
  return format(date, (p) => p.monthName);
}

/** "2026" */
export function prettyYear(date) {
  return format(date, (p) => String(p.year));
}

export function chartDate(date) {
  return format(date, (p) => `${p.day}. ${p.monthName} ${p.paddedHour}`);
}

export function prettyTime(date) {
  return format(date, (p) => `${p.paddedHour}:${p.paddedMinute}`);
}

export function timeOrDate(date) {
  if (graphDate(new Date()) === graphDate(date)) {
    return prettyTime(date);
  }

  return prettyDate(date, { year: false });
}

export function graphDate(date) {
  if (!date) {
    return;
  }

  return format(date, (p) => `${p.year}-${p.paddedMonth}-${p.paddedDay}`);
}
