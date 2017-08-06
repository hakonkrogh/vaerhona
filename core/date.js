import moment from 'moment';

export function prettyDate (date) {
  return moment(date).format('L');
}

export function prettyDateTime (date) {
  return moment(date).format('llll');
}

export function prettyTime (date) {
  return moment(date).format('LT');
}
