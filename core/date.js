import moment from 'moment-timezone';

// Set the global locale
moment.locale('nb');

// Set the global timezone
moment.tz.setDefault('Europe/Oslo');

export function prettyDate (date) {
  return moment(date).format('L');
}

export function prettyDateTime (date) {
  return moment(date).format('llll');
}

export function prettyTime (date) {
  return moment(date).format('LT');
}
