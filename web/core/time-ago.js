const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function amount(value, one, many) {
  return value > 1 ? many.replace('%d', value) : one;
}

/**
 * How long ago a date was, in Norwegian, like "for 5 minutter siden". A date
 * after `now` gives "om 5 minutter". An invalid date gives null.
 */
export function timeAgo(date, now = Date.now()) {
  // new Date(null) would be 1 January 1970.
  const then = date == null ? NaN : new Date(date).getTime();

  if (Number.isNaN(then)) {
    return null;
  }

  const distance = Math.abs(now - then);

  const seconds = Math.round(distance / SECOND);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);
  const months = Math.round(days / 30);
  const years = Math.round(days / 365);

  let text;
  if (seconds < 60) {
    text = 'mindre enn et minutt';
  } else if (minutes < 60) {
    text = amount(minutes, 'ca. et minutt', '%d minutter');
  } else if (hours < 24) {
    text = amount(hours, 'ca. en time', 'ca. %d timer');
  } else if (Math.round(days / 7) < 4) {
    text = amount(Math.round(distance / DAY), 'en dag', '%d dager');
  } else if (months < 12) {
    text = amount(months, 'ca. en måned', '%d måneder');
  } else {
    text = amount(years, 'ca. et år', '%d år');
  }

  return then > now ? `om ${text}` : `for ${text} siden`;
}
