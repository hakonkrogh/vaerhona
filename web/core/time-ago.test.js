import { describe, expect, it } from 'vitest';

import { timeAgo } from './time-ago';

const now = new Date('2026-06-15T12:00:00Z').getTime();
const ago = (ms) => timeAgo(now - ms, now);

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe('timeAgo', () => {
  it('says less than a minute for the first minute', () => {
    expect(ago(0)).toBe('for mindre enn et minutt siden');
    expect(ago(59 * 1000)).toBe('for mindre enn et minutt siden');
  });

  it('counts minutes', () => {
    expect(ago(MINUTE)).toBe('for ca. et minutt siden');
    expect(ago(5 * MINUTE)).toBe('for 5 minutter siden');
    expect(ago(59 * MINUTE)).toBe('for 59 minutter siden');
  });

  it('counts hours', () => {
    expect(ago(HOUR)).toBe('for ca. en time siden');
    expect(ago(23 * HOUR)).toBe('for ca. 23 timer siden');
  });

  it('counts days for the first weeks', () => {
    expect(ago(DAY)).toBe('for en dag siden');
    expect(ago(6 * DAY)).toBe('for 6 dager siden');
    expect(ago(20 * DAY)).toBe('for 20 dager siden');
  });

  it('counts months and years', () => {
    expect(ago(30 * DAY)).toBe('for ca. en måned siden');
    expect(ago(90 * DAY)).toBe('for 3 måneder siden');
    expect(ago(365 * DAY)).toBe('for ca. et år siden');
    expect(ago(3 * 365 * DAY)).toBe('for 3 år siden');
  });

  it('handles dates ahead of now', () => {
    expect(timeAgo(now + 5 * MINUTE, now)).toBe('om 5 minutter');
  });

  it('gives null for an invalid date', () => {
    expect(timeAgo('not a date', now)).toBeNull();
    expect(timeAgo(null, now)).toBeNull();
    expect(timeAgo(undefined, now)).toBeNull();
  });

  it('takes date strings', () => {
    expect(timeAgo('2026-06-15T10:00:00Z', now)).toBe('for ca. 2 timer siden');
  });
});
