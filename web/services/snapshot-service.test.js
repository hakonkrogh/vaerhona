import { beforeEach, describe, expect, it, vi } from 'vitest';

const { find, place, publishLatestSnapshot, saveImageFromSnapshot } = vi.hoisted(
  () => ({
    find: vi.fn(),
    place: { _id: 'place-id', cuid: 'place-cuid', name: 'veggli' },
    publishLatestSnapshot: vi.fn(),
    saveImageFromSnapshot: vi.fn(),
  })
);

vi.mock('./mongo/models', () => ({
  snapshotModel: class {
    constructor(body) {
      Object.assign(this, body);
      this._id = 'snapshot-id';
    }
    async save() {
      return this;
    }
    static find(filter) {
      return find(filter);
    }
  },
  snapshotPlaceModel: {
    findOne: () => ({ exec: async () => place }),
  },
}));
vi.mock('./aws/s3', () => ({ saveImageFromSnapshot }));
vi.mock('./yr-service', () => ({
  hasYrSupport: () => false,
  fetchWeatherData: vi.fn(),
}));
vi.mock('./latest-snapshot', () => ({ publishLatestSnapshot }));

import { addSnapshot, addSnapshotLegacy, getSnapshots } from './snapshot-service';

const uploads = [
  [
    'snapshots.add',
    () =>
      addSnapshot({ boxId: 'box', image: 'photo', temperature: 4, humidity: 80 }),
  ],
  [
    'addSnapshot (legacy)',
    () =>
      addSnapshotLegacy({
        placeCuid: 'place-cuid',
        imageBase64: 'photo',
        temperature: 4,
        humidity: 80,
      }),
  ],
];

describe.each(uploads)('%s', (_, upload) => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    saveImageFromSnapshot.mockResolvedValue();
    publishLatestSnapshot.mockResolvedValue();
  });

  it('publishes the snapshot after its photo is stored', async () => {
    const order = [];
    saveImageFromSnapshot.mockImplementation(async () => order.push('photo'));
    publishLatestSnapshot.mockImplementation(async () => order.push('publish'));

    const saved = await upload();

    expect(order).toEqual(['photo', 'publish']);
    expect(publishLatestSnapshot).toHaveBeenCalledWith({
      place,
      snapshot: saved,
    });
  });

  it('does not publish when the photo upload fails', async () => {
    saveImageFromSnapshot.mockRejectedValue(new Error('S3 down'));

    await expect(upload()).rejects.toThrow('S3 down');

    expect(publishLatestSnapshot).not.toHaveBeenCalled();
  });
});

describe('getSnapshots', () => {
  let query;

  beforeEach(() => {
    query = {
      select: vi.fn(() => query),
      sort: vi.fn(() => query),
      lean: vi.fn(() => query),
      limit: vi.fn(() => query),
      exec: vi.fn(async () => [
        { cuid: 'b', dateAdded: new Date('2026-01-02') },
        { cuid: 'a', dateAdded: new Date('2026-01-01') },
      ]),
    };
    find.mockReset();
    find.mockReturnValue(query);
  });

  it('gets the newest snapshots before an end date', async () => {
    await getSnapshots({ place, to: '2026-01-03', limit: 5 });

    expect(find).toHaveBeenCalledWith({
      placeCuid: 'place-cuid',
      dateAdded: { $lte: '2026-01-03' },
    });
    expect(query.sort).toHaveBeenCalledWith('-dateAdded');
    expect(query.limit).toHaveBeenCalledWith(5);
  });

  it('gets the oldest snapshots after a start date', async () => {
    await getSnapshots({ place, from: '2026-01-01', limit: 5 });

    expect(find).toHaveBeenCalledWith({
      placeCuid: 'place-cuid',
      dateAdded: { $gte: '2026-01-01' },
    });
    expect(query.sort).toHaveBeenCalledWith('dateAdded');
    expect(query.limit).toHaveBeenCalledWith(5);
  });

  it('gets a whole date range with no limit', async () => {
    await getSnapshots({ place, from: '2026-01-01', to: '2026-01-03' });

    expect(query.sort).toHaveBeenCalledWith('dateAdded');
    expect(query.limit).not.toHaveBeenCalled();
  });

  it('returns snapshots oldest first, with the place name', async () => {
    const snapshots = await getSnapshots({ place, to: '2026-01-03' });

    expect(snapshots.map((snapshot) => snapshot.cuid)).toEqual(['a', 'b']);
    expect(snapshots[0].placeName).toBe('veggli');
  });
});
