import moment from "moment-timezone";

// Set the global locale
moment.locale("nb");

const tz = "Europe/Oslo";

export function prettyDate(date, { year = true } = {}) {
  return moment(date)
    .tz(tz)
    .format(year ? "L" : "MM.DD");
}

export function prettyDateTime(date) {
  return moment(date)
    .tz(tz)
    .format("llll");
}

export function prettyTime(date) {
  return moment(date)
    .tz(tz)
    .format("LT");
}

export function timeOrDate(date) {
  if (moment().isSame(date, "day")) {
    return prettyTime(date);
  }
  return prettyDate(date, { year: false });
}

export function graphDate(date) {
  if (!date) {
    return;
  }

  return moment(date)
    .tz(tz)
    .format("YYYY-MM-DD");
}
