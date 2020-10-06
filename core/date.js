import moment from 'moment-timezone';

// Set the global locale
moment.locale('nb');

const tz = 'Europe/Oslo';

export function prettyDate(date, { year = true } = {}) {
  return moment(date)
    .tz(tz)
    .format(year ? 'L' : 'DD MMM');
}

export function prettyDateTime(date) {
  return moment(date).tz(tz).format('llll');
}

export function prettyYearMonth(date) {
  return moment(date).tz(tz).format('MMM YYYY');
}

export function chartDate(date) {
  return moment(date).tz(tz).format('Do MMM HH');
}

export function prettyTime(date) {
  return moment(date).tz(tz).format('LT');
}

export function timeOrDate(date) {
  if (moment().isSame(date, 'day')) {
    return prettyTime(date);
  }

  return prettyDate(date, { year: false });
}

export function graphDate(date) {
  if (!date) {
    return;
  }

  /**
   * Cannot use this on the server side
   * Throws an error in apollo.cache.readQyuery
   */
  // if (typeof window !== 'undefined') {
  //   return new Date(date).toISOString();
  // }

  return moment(date).tz(tz).format('YYYY-MM-DD');
}
