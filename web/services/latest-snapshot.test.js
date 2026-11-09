import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { findById, getTopPublicPlaces, store } = vi.hoisted(() => ({
  findById: vi.fn(),
  getTopPublicPlaces: vi.fn(),
  store: {
    removeLatestRecord: vi.fn(),
    putLatestRecord: vi.fn(),
    readLatestRecord: vi.fn(),
    listRecordEtags: vi.fn(),
    putFrontPageList: vi.fn(),
    putLatestRecordIfUnchanged: vi.fn(),
  },
}));

vi.mock('./config', () => ({ default: { environment: 'production' } }));
vi.mock('./mongo/models', () => ({ snapshotModel: { findById } }));
vi.mock('./latest-store', () => store);
vi.mock('./place-service', () => ({
  getTopPublicPlaces,
  TOP_PUBLIC_PLACES_LIMIT: 10,
}));

import {
  buildLatestRecord,
  isFrontPageListTrusted,
  isRecordTrusted,
  publishLatestSnapshot,
} from './latest-snapshot';

const snapshot = {
  _id: 'new-id',
  cuid: 'new-cuid',
  dateAdded: new Date('2026-11-06T12:00:00.000Z'),
  temperature: 4.25,
  humidity: 80.04,
  pressure: 1001,
  yrWeather: { windFromDirection: 90, windSpeed: 3 },
};

const firstSnapshot = {
  cuid: 'first-cuid',
  placeCuid: 'place-cuid',
  dateAdded: new Date('2016-10-18T04:31:46.085Z'),
  temperature: 7,
  humidity: 60.04,
};

function makePlace(calls) {
  return {
    name: 'veggli',
    cuid: 'place-cuid',
    firstSnapshot: 'first-id',
    updateOne: vi.fn((update) => ({
      exec: async () => {
        calls.push(`mongo:${update.lastSnapshot}`);
      },
    })),
  };
}

describe('publishLatestSnapshot', () => {
  let calls;
  let place;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    calls = [];
    place = makePlace(calls);
    findById.mockReturnValue({ exec: async () => firstSnapshot });
    store.removeLatestRecord.mockImplementation(async () => {
      calls.push('remove');
    });
    store.putLatestRecord.mockImplementation(async () => {
      calls.push('put');
      return 1;
    });
    store.readLatestRecord.mockResolvedValue({
      lastSnapshot: { cuid: snapshot.cuid },
    });
    store.listRecordEtags.mockResolvedValue(new Map());
    getTopPublicPlaces.mockResolvedValue([]);
  });

  it('removes the record, moves lastSnapshot, then writes the record', async () => {
    await publishLatestSnapshot({ place, snapshot });

    expect(calls).toEqual(['remove', 'mongo:new-id', 'put']);
    expect(store.putLatestRecord.mock.calls[0][1].lastSnapshot.cuid).toBe(
      'new-cuid'
    );
  });

  it('publishes nothing when the remove fails', async () => {
    store.removeLatestRecord.mockRejectedValue(new Error('R2 down'));

    await expect(publishLatestSnapshot({ place, snapshot })).rejects.toThrow(
      'R2 down'
    );

    expect(place.updateOne).not.toHaveBeenCalled();
    expect(store.putLatestRecord).not.toHaveBeenCalled();
  });

  it('writes no record when the MongoDB update fails', async () => {
    place.updateOne.mockReturnValue({
      exec: async () => {
        throw new Error('Mongo down');
      },
    });

    await expect(publishLatestSnapshot({ place, snapshot })).rejects.toThrow(
      'Mongo down'
    );

    expect(calls).toEqual(['remove']);
    expect(store.putLatestRecord).not.toHaveBeenCalled();
  });

  it('still succeeds when the record write fails', async () => {
    store.putLatestRecord.mockRejectedValue(new Error('R2 down'));

    await expect(
      publishLatestSnapshot({ place, snapshot })
    ).resolves.toBeUndefined();

    expect(calls).toEqual(['remove', 'mongo:new-id']);
  });

  it('still succeeds when the first snapshot lookup fails', async () => {
    findById.mockReturnValue({
      exec: async () => {
        throw new Error('Mongo down');
      },
    });

    await expect(
      publishLatestSnapshot({ place, snapshot })
    ).resolves.toBeUndefined();

    expect(calls).toEqual(['remove', 'mongo:new-id']);
  });

  it('still succeeds when the read-back fails', async () => {
    store.readLatestRecord.mockRejectedValue(new Error('R2 down'));

    await expect(
      publishLatestSnapshot({ place, snapshot })
    ).resolves.toBeUndefined();

    expect(calls).toEqual(['remove', 'mongo:new-id', 'put']);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('read-back failed'),
      expect.any(Error)
    );
  });

  it('sets confirmedAt to when it writes the record', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-09T12:00:00.000Z'));

    await publishLatestSnapshot({ place, snapshot });

    expect(store.putLatestRecord.mock.calls[0][1].confirmedAt).toBe(
      '2026-11-09T12:00:00.000Z'
    );
    vi.useRealTimers();
  });

  it('skips the read-back when the record write fails', async () => {
    store.putLatestRecord.mockRejectedValue(new Error('R2 down'));

    await publishLatestSnapshot({ place, snapshot });

    expect(store.readLatestRecord).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('record write failed'),
      expect.any(Error)
    );
  });
});

describe('buildLatestRecord', () => {
  const place = { name: 'veggli', cuid: 'place-cuid' };

  it('has the fields the page uses from the PLACE query', () => {
    const record = buildLatestRecord({
      place,
      firstSnapshot,
      lastSnapshot: snapshot,
      confirmedAt: '2026-11-06T12:00:01.000Z',
    });

    expect(record).toEqual({
      cuid: 'place-cuid',
      name: 'veggli',
      confirmedAt: '2026-11-06T12:00:01.000Z',
      firstSnapshot: {
        cuid: 'first-cuid',
        date: '2016-10-18T04:31:46.085Z',
        temperature: 7,
        pressure: null,
        humidity: 60,
        image: expect.stringMatching(
          /^https:\/\/vaerhona\.s3-eu-west-1\.amazonaws\.com\/veggli\/2016\/10\/first-cuid$/
        ),
        yrWeather: null,
      },
      lastSnapshot: {
        cuid: 'new-cuid',
        date: '2026-11-06T12:00:00.000Z',
        temperature: 4.25,
        pressure: 1001,
        humidity: 80.04,
        image: expect.stringMatching(/\/veggli\/2026\/11\/new-cuid$/),
        yrWeather: {
          airTemperature: null,
          windSpeed: 3,
          windFromDirection: 90,
          windSpeedOfGust: null,
          airPressureAtSeaLevel: null,
          cloudAreaFraction: null,
          dewPointTemperature: null,
          relativeHumidity: null,
          windDirectionCompass: 'E',
        },
      },
    });
  });

  it('survives JSON with no invalid numbers', () => {
    const record = buildLatestRecord({
      place,
      firstSnapshot,
      lastSnapshot: { ...snapshot, pressure: undefined, yrWeather: undefined },
      confirmedAt: '2026-11-06T12:00:01.000Z',
    });

    expect(JSON.parse(JSON.stringify(record))).toEqual(record);
    expect(record.lastSnapshot.pressure).toBeNull();
    expect(record.lastSnapshot.yrWeather).toBeNull();
  });

  it('allows a place with no first snapshot', () => {
    const record = buildLatestRecord({
      place,
      firstSnapshot: null,
      lastSnapshot: snapshot,
    });

    expect(record.firstSnapshot).toBeNull();
  });
});

describe('refreshing the front page during an upload', () => {
  const NOW = new Date('2026-11-09T12:00:00.000Z');
  const HOUR = 60 * 60 * 1000;
  let calls;

  function mongoPlace(name, lastSnapshotAgeMs) {
    return {
      name,
      cuid: `${name}-cuid`,
      firstSnapshot: null,
      lastSnapshot: {
        cuid: `${name}-snap`,
        dateAdded: new Date(NOW.getTime() - lastSnapshotAgeMs),
      },
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    calls = [];
    findById.mockReturnValue({ exec: async () => null });
    store.removeLatestRecord.mockResolvedValue();
    store.putLatestRecord.mockResolvedValue(1);
    store.readLatestRecord.mockResolvedValue(null);
    store.listRecordEtags.mockImplementation(async () => {
      calls.push('list etags');
      return new Map([
        ['veggli', 'veggli-etag'],
        ['myking', 'myking-etag'],
      ]);
    });
    getTopPublicPlaces.mockImplementation(async () => {
      calls.push('mongo');
      return [
        mongoPlace('veggli', 0),
        mongoPlace('myking', 5 * 60 * 1000),
        mongoPlace('tornes', 200 * 24 * HOUR),
      ];
    });
    store.putLatestRecordIfUnchanged.mockResolvedValue(true);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const upload = () =>
    publishLatestSnapshot({ place: makePlace([]), snapshot });

  it('reads the record etags before MongoDB', async () => {
    await upload();

    expect(calls).toEqual(['list etags', 'mongo']);
  });

  it('writes the list of front page places', async () => {
    await upload();

    expect(store.putFrontPageList).toHaveBeenCalledWith({
      writtenAt: NOW.toISOString(),
      places: ['veggli', 'myking', 'tornes'],
    });
  });

  it('confirms the other records only if they have not changed', async () => {
    await upload();

    const writes = store.putLatestRecordIfUnchanged.mock.calls;
    expect(writes.map(([name, , etag]) => [name, etag])).toEqual([
      ['myking', 'myking-etag'],
      ['tornes', undefined],
    ]);
    expect(writes[0][1]).toMatchObject({
      name: 'myking',
      confirmedAt: NOW.toISOString(),
      lastSnapshot: { cuid: 'myking-snap' },
    });
  });

  it('does not touch the uploading place, which wrote its own record', async () => {
    await upload();

    const names = store.putLatestRecordIfUnchanged.mock.calls.map(([n]) => n);
    expect(names).not.toContain('veggli');
  });

  it('leaves a missing record missing for a box that uploaded recently', async () => {
    store.listRecordEtags.mockResolvedValue(new Map());
    getTopPublicPlaces.mockResolvedValue([
      mongoPlace('veggli', 0),
      mongoPlace('myking', 23 * HOUR),
    ]);

    await upload();

    expect(store.putLatestRecordIfUnchanged).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('written=0 refused=0 skipped=1')
    );
  });

  it('counts a refused write', async () => {
    store.putLatestRecordIfUnchanged.mockResolvedValue(false);

    await upload();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('written=0 refused=2 skipped=0')
    );
  });

  it('still succeeds when the refresh fails', async () => {
    store.listRecordEtags.mockRejectedValue(new Error('R2 down'));

    await expect(upload()).resolves.toBeUndefined();
    expect(store.putFrontPageList).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('refresh failed'),
      expect.any(Error)
    );
  });
});

describe('trust rules', () => {
  const NOW = new Date('2026-11-09T12:00:00.000Z').getTime();
  const ago = (minutes) => new Date(NOW - minutes * 60 * 1000).toISOString();

  it('trusts a record confirmed in the last 90 minutes', () => {
    expect(
      isRecordTrusted(
        { confirmedAt: ago(89), lastSnapshot: { date: ago(1e6) } },
        NOW
      )
    ).toBe(true);
    expect(isRecordTrusted({ confirmedAt: ago(90) }, NOW)).toBe(false);
  });

  it('uses the snapshot date for a record without confirmedAt', () => {
    expect(isRecordTrusted({ lastSnapshot: { date: ago(10) } }, NOW)).toBe(
      true
    );
    expect(isRecordTrusted({ lastSnapshot: { date: ago(91) } }, NOW)).toBe(
      false
    );
  });

  it('does not trust a missing or broken record', () => {
    expect(isRecordTrusted(null, NOW)).toBe(false);
    expect(isRecordTrusted({ confirmedAt: 'nope' }, NOW)).toBe(false);
  });

  it('trusts a front page list written in the last 90 minutes', () => {
    expect(
      isFrontPageListTrusted({ writtenAt: ago(30), places: [] }, NOW)
    ).toBe(true);
    expect(
      isFrontPageListTrusted({ writtenAt: ago(91), places: ['veggli'] }, NOW)
    ).toBe(false);
    expect(isFrontPageListTrusted({ writtenAt: ago(1) }, NOW)).toBe(false);
    expect(isFrontPageListTrusted(null, NOW)).toBe(false);
  });
});
