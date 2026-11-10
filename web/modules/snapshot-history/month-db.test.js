import { describe, expect, it, vi } from 'vitest';

import { createMemoryDb, openMonthDb } from './month-db';

const record = (place, month) => ({ place, month, coveredTo: 1, columns: {} });

describe('createMemoryDb', () => {
  it('keeps months by place', async () => {
    const db = createMemoryDb();

    await db.put(record('veggli', '2024-06'));
    await db.put(record('veggli', '2024-07'));
    await db.put(record('myking', '2024-06'));

    expect(await db.get('veggli', '2024-06')).toEqual(
      record('veggli', '2024-06')
    );
    expect(await db.get('veggli', '2024-08')).toBeUndefined();
    expect((await db.list('veggli')).map((r) => r.month)).toEqual([
      '2024-06',
      '2024-07',
    ]);
  });

  it('clears one place', async () => {
    const db = createMemoryDb();

    await db.put(record('veggli', '2024-06'));
    await db.put(record('myking', '2024-06'));
    await db.putMeta({ place: 'veggli', v: 1, usedAt: 1 });
    await db.clearPlace('veggli');

    expect(await db.list('veggli')).toEqual([]);
    expect(await db.getMeta('veggli')).toBeUndefined();
    expect(await db.list('myking')).toHaveLength(1);
  });
});

describe('openMonthDb', () => {
  it('uses the persistent database while it works', async () => {
    const persistent = createMemoryDb();
    const db = openMonthDb(persistent);

    await db.put(record('veggli', '2024-06'));

    expect(await persistent.get('veggli', '2024-06')).toBeDefined();
  });

  it('moves to memory when storage fails, and never rejects', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const persistent = createMemoryDb();
    persistent.put = vi.fn(async () => {
      throw new Error('disk full');
    });
    persistent.get = vi.fn();
    const db = openMonthDb(persistent);

    await db.put(record('veggli', '2024-06'));

    expect(await db.get('veggli', '2024-06')).toEqual(
      record('veggli', '2024-06')
    );
    // The broken database is not asked again.
    expect(persistent.get).not.toHaveBeenCalled();
  });

  it('works with no persistent database at all', async () => {
    const db = openMonthDb(null);

    await db.put(record('veggli', '2024-06'));

    expect(await db.list('veggli')).toHaveLength(1);
  });
});
