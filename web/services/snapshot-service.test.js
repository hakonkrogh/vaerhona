import { beforeEach, describe, expect, it, vi } from 'vitest';

const { place, publishLatestSnapshot, saveImageFromSnapshot } = vi.hoisted(
  () => ({
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

import { addSnapshot, addSnapshotLegacy } from './snapshot-service';

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
