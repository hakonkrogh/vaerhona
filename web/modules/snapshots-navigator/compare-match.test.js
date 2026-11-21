import { describe, expect, it } from 'vitest';

import { MAX_DAYS_OFF, daysOff, isCloseEnough, offNote } from './compare-match';

const at = (date) => new Date(date).getTime();
const snapshot = (date) => ({ date });

// 15:00 in Oslo.
const ASKED = at('2023-11-20T14:00:00.000Z');

describe('daysOff', () => {
  it('is 0 for another time on the same day', () => {
    expect(daysOff(snapshot('2023-11-20T03:10:00.000Z'), ASKED)).toBe(0);
  });

  it('counts days before as negative and days after as positive', () => {
    expect(daysOff(snapshot('2023-11-17T14:00:00.000Z'), ASKED)).toBe(-3);
    expect(daysOff(snapshot('2023-11-22T14:00:00.000Z'), ASKED)).toBe(2);
  });

  it('counts days in the Oslo calendar, not in hours', () => {
    // 23:30 the day before in Oslo, 15.5 hours away.
    expect(daysOff(snapshot('2023-11-19T22:30:00.000Z'), ASKED)).toBe(-1);
    // 00:30 the same day in Oslo. In UTC it is still the day before.
    expect(daysOff(snapshot('2023-11-19T23:30:00.000Z'), ASKED)).toBe(0);
  });

  it('counts across a daylight saving change', () => {
    // Summer time ended on 29 October 2023, so this day had 25 hours.
    const asked = at('2023-10-30T14:00:00.000Z');

    expect(daysOff(snapshot('2023-10-28T13:00:00.000Z'), asked)).toBe(-2);
  });

  it('counts across new year', () => {
    const asked = at('2023-01-02T14:00:00.000Z');

    expect(daysOff(snapshot('2022-12-28T14:00:00.000Z'), asked)).toBe(-5);
  });
});

describe('isCloseEnough', () => {
  const daysLater = (days) =>
    snapshot(new Date(ASKED + days * 24 * 60 * 60 * 1000).toISOString());

  it('accepts a snapshot up to the limit, on both sides', () => {
    expect(isCloseEnough(daysLater(0), ASKED)).toBe(true);
    expect(isCloseEnough(daysLater(MAX_DAYS_OFF), ASKED)).toBe(true);
    expect(isCloseEnough(daysLater(-MAX_DAYS_OFF), ASKED)).toBe(true);
  });

  it('refuses a snapshot past the limit', () => {
    expect(isCloseEnough(daysLater(MAX_DAYS_OFF + 1), ASKED)).toBe(false);
    expect(isCloseEnough(daysLater(-200), ASKED)).toBe(false);
  });
});

describe('offNote', () => {
  it('is null for the same day', () => {
    expect(offNote(snapshot('2023-11-20T08:00:00.000Z'), ASKED)).toBeNull();
  });

  it('says how many days before or after', () => {
    expect(offNote(snapshot('2023-11-17T14:00:00.000Z'), ASKED)).toBe(
      '3 dager før'
    );
    expect(offNote(snapshot('2023-11-21T14:00:00.000Z'), ASKED)).toBe(
      '1 dag etter'
    );
  });
});
