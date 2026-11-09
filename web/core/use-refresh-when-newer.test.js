import { describe, expect, it } from 'vitest';

import { hasNewer } from './use-refresh-when-newer';

describe('hasNewer', () => {
  const shown = { veggli: 'a', myking: 'b' };

  it('is false when every place shows its latest snapshot', () => {
    expect(hasNewer({ veggli: 'a', myking: 'b' }, shown)).toBe(false);
  });

  it('is true when a place has a newer snapshot', () => {
    expect(hasNewer({ veggli: 'a', myking: 'c' }, shown)).toBe(true);
  });

  it('is true when a place was added or removed', () => {
    expect(hasNewer({ veggli: 'a', myking: 'b', tornes: 'd' }, shown)).toBe(
      true
    );
    expect(hasNewer({ veggli: 'a' }, shown)).toBe(true);
  });

  it('is true when a place was swapped for another', () => {
    expect(hasNewer({ veggli: 'a', tornes: 'b' }, shown)).toBe(true);
  });
});
