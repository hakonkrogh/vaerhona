import { beforeEach, describe, expect, it, vi } from 'vitest';

const { findById, store } = vi.hoisted(() => ({
  findById: vi.fn(),
  store: {
    removeLatestRecord: vi.fn(),
    putLatestRecord: vi.fn(),
    readLatestRecord: vi.fn(),
  },
}));

vi.mock('./config', () => ({ default: { environment: 'production' } }));
vi.mock('./mongo/models', () => ({ snapshotModel: { findById } }));
vi.mock('./latest-store', () => store);

import { buildLatestRecord, publishLatestSnapshot } from './latest-snapshot';

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
    findById.mockReturnValue({
      lean: () => ({ exec: async () => firstSnapshot }),
    });
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
      lean: () => ({
        exec: async () => {
          throw new Error('Mongo down');
        },
      }),
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
  });
});

describe('buildLatestRecord', () => {
  const place = { name: 'veggli', cuid: 'place-cuid' };

  it('has the same shape as the PLACE query', () => {
    const record = buildLatestRecord({
      place,
      firstSnapshot,
      lastSnapshot: snapshot,
    });

    expect(record).toEqual({
      cuid: 'place-cuid',
      name: 'veggli',
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
