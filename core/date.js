import moment from 'moment-timezone';

// Set the global locale
moment.locale('nb');

const tz = 'Europe/Oslo';

export function prettyDate (date) {
  return moment(date).tz(tz).format('L');
}

export function prettyDateTime (date) {
  return moment(date).tz(tz).format('llll');
}

export function prettyTime (date) {
  return moment(date).tz(tz).format('LT');
}
