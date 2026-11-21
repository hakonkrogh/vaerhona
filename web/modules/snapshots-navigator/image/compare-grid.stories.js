import CompareGrid, { YearTile } from './compare-grid';

// Compare mode on a place page: the photo on screen and the same time in
// earlier years, as tiles.

// Photos from public/static/snapshots, so the stories need no network.
const photo = (name) => `/static/snapshots/${name}.jpg`;

const place = { name: 'veggli' };

const snapshotAt = (date, name, temperature, humidity) => ({
  cuid: name,
  date,
  image: photo(name),
  temperature,
  humidity,
});

// 15:00 in Oslo on 20 November.
const current = snapshotAt(
  '2026-11-20T14:00:00.000Z',
  'cj4x48kzg0003zk2yfqi2pxgh',
  1.4,
  81
);

// 2023 has its closest snapshot three days before, and 2022 has none: the
// box was off.
const earlier = [
  snapshotAt('2025-11-20T14:00:00.000Z', 'cj5fbqw0v00002n2yslw52cni', -3.2, 88),
  snapshotAt('2024-11-20T14:01:00.000Z', 'cj5jiy9uj0000412yzmzwln8u', 0.3, 92),
  snapshotAt('2023-11-17T21:10:00.000Z', 'cj4x48loh0005zk2y0ytthoe6', -7.8, 74),
  snapshotAt('2021-11-20T14:00:00.000Z', 'cj5fk9kij0000f92y6kiozygq', -0.9, 90),
  snapshotAt('2020-11-20T14:00:00.000Z', 'cj5menicm0000n62y1pupiaoc', -0.1, 79),
];

// A store that has loaded everything, so a search answers at once.
const store = {
  getTimeline: () => ({
    snapshots: [...earlier, current].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    ),
    ranges: [{ from: -Infinity, to: Infinity }],
  }),
  load: () => Promise.resolve(),
};

const yearsBefore = (date, years) => {
  const earlierDate = new Date(date);
  earlierDate.setFullYear(earlierDate.getFullYear() - years);
  return earlierDate;
};

const meta = {
  title: 'Modules/Snapshots navigator/Compare grid',
  component: CompareGrid,
  parameters: { layout: 'fullscreen' },
  args: {
    width: 1024,
    store,
    place,
    currentSnapshot: current,
    compareDates: [1, 2, 3, 4, 5, 6].map((years) =>
      yearsBefore(current.date, years)
    ),
  },
  argTypes: {
    width: { control: { type: 'range', min: 280, max: 1600, step: 10 } },
  },
  render: ({ width, ...args }) => (
    <div style={{ width }}>
      <CompareGrid {...args} />
    </div>
  ),
};

export default meta;

export const Grid = {};

export const Phone = { args: { width: 375 } };

export const Wide = { args: { width: 1400 } };

const tile = (args) => ({
  render: (tileArgs) => (
    <div style={{ width: 180, padding: 10 }}>
      <YearTile {...tileArgs} />
    </div>
  ),
  args: { place, year: '2023', ...args },
  parameters: { controls: { include: ['year'] } },
});

const asked = new Date('2023-11-20T14:00:00.000Z').getTime();

export const Tile = tile({
  found: {
    snapshot: { ...earlier[0], date: '2023-11-20T14:00:00.000Z' },
    time: asked,
  },
});

/** The box was off on the day, so the photo is from the closest day. */
export const TileFromAnotherDay = tile({
  found: { snapshot: earlier[2], time: asked },
});

/** No snapshot within two weeks of the time. */
export const TileWithNoPhoto = tile({ found: null });

export const TileSearching = tile({ found: undefined });
