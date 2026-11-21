// Compare mode asks for the same time in an earlier year and gets the
// closest snapshot there is. If the box was off, that can be days or months
// away. This says how far, so the page can tell the user or show no photo.

import { graphDate } from 'core/date';

const DAY = 24 * 60 * 60 * 1000;

// Within this many days the photo still shows the same time of year. Further
// away it would mislead, so the year shows no photo.
export const MAX_DAYS_OFF = 14;

// The start of the day in Oslo, as a number that is one DAY from the next.
const osloDay = (date) => Date.parse(graphDate(date));

/**
 * Whole days in the Oslo calendar from the time asked for to the snapshot.
 * Negative when the snapshot is from before it.
 */
export function daysOff(snapshot, time) {
  return Math.round((osloDay(snapshot.date) - osloDay(time)) / DAY);
}

/** False when the snapshot is too far from the time to stand in for it. */
export function isCloseEnough(snapshot, time) {
  return Math.abs(daysOff(snapshot, time)) <= MAX_DAYS_OFF;
}

/** "3 dager før" or "1 dag etter". Null when the snapshot is from the day. */
export function offNote(snapshot, time) {
  const days = daysOff(snapshot, time);

  if (days === 0) {
    return null;
  }

  const count = Math.abs(days);

  return `${count} ${count === 1 ? 'dag' : 'dager'} ${days < 0 ? 'før' : 'etter'}`;
}
