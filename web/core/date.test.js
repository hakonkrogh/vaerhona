import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  chartDate,
  graphDate,
  prettyDate,
  prettyDateTime,
  prettyDay,
  prettyDayMonth,
  prettyMonth,
  prettyTime,
  prettyWeekday,
  prettyYear,
  prettyYearMonth,
  timeOrDate,
} from './date';

// Output recorded from moment-timezone before it was removed. Covers each
// month and weekday, new year, leap day and both daylight saving changes.
const MOMENT_OUTPUT = [
  ["2026-11-06T12:52:00.208Z", "06.11.2026", "06 nov.", "fr. 6. nov. 2026 kl. 13:52", "nov. 2026", "6. nov. 13", "13:52", "2026-11-06"],
  ["2026-01-01T00:30:00.000Z", "01.01.2026", "01 jan.", "to. 1. jan. 2026 kl. 01:30", "jan. 2026", "1. jan. 01", "01:30", "2026-01-01"],
  ["2025-12-31T22:59:00.000Z", "31.12.2025", "31 des.", "on. 31. des. 2025 kl. 23:59", "des. 2025", "31. des. 23", "23:59", "2025-12-31"],
  ["2025-12-31T23:00:00.000Z", "01.01.2026", "01 jan.", "to. 1. jan. 2026 kl. 00:00", "jan. 2026", "1. jan. 00", "00:00", "2026-01-01"],
  ["2026-03-29T00:59:00.000Z", "29.03.2026", "29 mars", "sø. 29. mars 2026 kl. 01:59", "mars 2026", "29. mars 01", "01:59", "2026-03-29"],
  ["2026-03-29T01:00:00.000Z", "29.03.2026", "29 mars", "sø. 29. mars 2026 kl. 03:00", "mars 2026", "29. mars 03", "03:00", "2026-03-29"],
  ["2026-10-25T00:59:00.000Z", "25.10.2026", "25 okt.", "sø. 25. okt. 2026 kl. 02:59", "okt. 2026", "25. okt. 02", "02:59", "2026-10-25"],
  ["2026-10-25T01:00:00.000Z", "25.10.2026", "25 okt.", "sø. 25. okt. 2026 kl. 02:00", "okt. 2026", "25. okt. 02", "02:00", "2026-10-25"],
  ["2024-02-29T11:05:09.000Z", "29.02.2024", "29 feb.", "to. 29. feb. 2024 kl. 12:05", "feb. 2024", "29. feb. 12", "12:05", "2024-02-29"],
  ["2026-03-01T06:00:00Z", "01.03.2026", "01 mars", "sø. 1. mars 2026 kl. 07:00", "mars 2026", "1. mars 07", "07:00", "2026-03-01"],
  ["2026-05-03T06:00:00Z", "03.05.2026", "03 mai", "sø. 3. mai 2026 kl. 08:00", "mai 2026", "3. mai 08", "08:00", "2026-05-03"],
  ["2026-06-07T06:00:00Z", "07.06.2026", "07 juni", "sø. 7. juni 2026 kl. 08:00", "juni 2026", "7. juni 08", "08:00", "2026-06-07"],
  ["2026-07-05T06:00:00Z", "05.07.2026", "05 juli", "sø. 5. juli 2026 kl. 08:00", "juli 2026", "5. juli 08", "08:00", "2026-07-05"],
  ["2026-08-02T06:00:00Z", "02.08.2026", "02 aug.", "sø. 2. aug. 2026 kl. 08:00", "aug. 2026", "2. aug. 08", "08:00", "2026-08-02"],
  ["2026-09-06T06:00:00Z", "06.09.2026", "06 sep.", "sø. 6. sep. 2026 kl. 08:00", "sep. 2026", "6. sep. 08", "08:00", "2026-09-06"],
  ["2026-10-04T06:00:00Z", "04.10.2026", "04 okt.", "sø. 4. okt. 2026 kl. 08:00", "okt. 2026", "4. okt. 08", "08:00", "2026-10-04"],
  ["2026-12-06T06:00:00Z", "06.12.2026", "06 des.", "sø. 6. des. 2026 kl. 07:00", "des. 2026", "6. des. 07", "07:00", "2026-12-06"],
  ["2026-02-02T06:00:00Z", "02.02.2026", "02 feb.", "ma. 2. feb. 2026 kl. 07:00", "feb. 2026", "2. feb. 07", "07:00", "2026-02-02"],
  ["2026-04-07T06:00:00Z", "07.04.2026", "07 apr.", "ti. 7. apr. 2026 kl. 08:00", "apr. 2026", "7. apr. 08", "08:00", "2026-04-07"],
  ["2026-04-08T06:00:00Z", "08.04.2026", "08 apr.", "on. 8. apr. 2026 kl. 08:00", "apr. 2026", "8. apr. 08", "08:00", "2026-04-08"],
  ["2026-04-09T06:00:00Z", "09.04.2026", "09 apr.", "to. 9. apr. 2026 kl. 08:00", "apr. 2026", "9. apr. 08", "08:00", "2026-04-09"],
  ["2026-04-10T06:00:00Z", "10.04.2026", "10 apr.", "fr. 10. apr. 2026 kl. 08:00", "apr. 2026", "10. apr. 08", "08:00", "2026-04-10"],
  ["2026-04-11T06:00:00Z", "11.04.2026", "11 apr.", "lø. 11. apr. 2026 kl. 08:00", "apr. 2026", "11. apr. 08", "08:00", "2026-04-11"],
];

describe.each(MOMENT_OUTPUT)(
  '%s',
  (date, full, dayMonth, dateTime, yearMonth, chart, time, iso) => {
    it('matches moment-timezone', () => {
      expect(prettyDate(date)).toBe(full);
      expect(prettyDate(date, { year: false })).toBe(dayMonth);
      expect(prettyDateTime(date)).toBe(dateTime);
      expect(prettyYearMonth(date)).toBe(yearMonth);
      expect(chartDate(date)).toBe(chart);
      expect(prettyTime(date)).toBe(time);
      expect(graphDate(date)).toBe(iso);
    });
  }
);

describe('date input types', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('accepts a Date', () => {
    expect(graphDate(new Date('2026-11-06T12:52:00.208Z'))).toBe('2026-11-06');
  });

  it('keeps the day of a date-only string, as the date picker sends', () => {
    expect(graphDate('2026-06-12')).toBe('2026-06-12');
  });

  it('uses now when the date is undefined', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-06T12:52:00.000Z'));

    expect(prettyTime()).toBe('13:52');
  });

  it('returns no value from graphDate when there is no date', () => {
    expect(graphDate(undefined)).toBeUndefined();
    expect(graphDate(null)).toBeUndefined();
  });

  it('reports an invalid date', () => {
    expect(prettyDateTime('not a date')).toBe('Invalid date');
    expect(prettyDateTime(null)).toBe('Invalid date');
  });
});

describe('chart labels', () => {
  // 23:30 UTC is already the next day in Oslo.
  const date = '2025-12-31T23:30:00.000Z';

  it('uses the day in Oslo', () => {
    expect(prettyDay(date)).toBe('to. 1. jan. 2026');
    expect(prettyWeekday(date)).toBe('to. 1.');
    expect(prettyDayMonth(date)).toBe('1. jan.');
    expect(prettyMonth(date)).toBe('jan.');
    expect(prettyYear(date)).toBe('2026');
  });
});

describe('timeOrDate', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the time for a date today in Oslo', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-06T22:30:00.000Z'));

    expect(timeOrDate('2026-11-06T00:15:00.000Z')).toBe('01:15');
  });

  it('shows the date once it is a new day in Oslo', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-06T23:30:00.000Z'));

    expect(timeOrDate('2026-11-06T22:30:00.000Z')).toBe('06 nov.');
  });
});
