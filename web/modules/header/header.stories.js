import Header from '.';

const meta = {
  title: 'Modules/Header',
  component: Header,
  parameters: { layout: 'fullscreen' },
  args: { title: 'Værhøna' },
};

export default meta;

export const FrontPage = {};

export const PlacePage = { args: { title: 'Veggli' } };
