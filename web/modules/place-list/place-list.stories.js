import PlaceList from '.';
import PlaceListItem from './list-item';

// Photos from public/static/snapshots, so the stories need no network.
const photo = (name) => `/static/snapshots/${name}.jpg`;

const PLACES = [
  {
    cuid: 'place-1',
    name: 'veggli',
    lastSnapshot: {
      date: '2026-11-10T11:58:00.000Z',
      image: photo('cj4x48kzg0003zk2yfqi2pxgh'),
    },
  },
  {
    cuid: 'place-2',
    name: 'hytta',
    lastSnapshot: {
      date: '2026-11-09T07:12:00.000Z',
      image: photo('cj5fbqw0v00002n2yslw52cni'),
    },
  },
  {
    cuid: 'place-3',
    name: 'fjellet',
    lastSnapshot: {
      date: '2025-03-02T14:30:00.000Z',
      image: photo('cj5jiy9uj0000412yzmzwln8u'),
    },
  },
];

const meta = {
  title: 'Modules/Place list',
  component: PlaceList,
  parameters: { layout: 'fullscreen' },
  args: { places: PLACES },
};

export default meta;

export const List = {};

export const OneItem = {
  render: (args) => (
    <ul style={{ listStyle: 'none', padding: 20, maxWidth: 360 }}>
      <PlaceListItem {...args} />
    </ul>
  ),
  args: PLACES[0],
};
