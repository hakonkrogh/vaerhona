import React from 'react';

import Layout from '.';

const meta = {
  title: 'Modules/Layout',
  component: Layout,
  parameters: { layout: 'fullscreen' },
  args: {
    title: 'Værhøna',
    loading: false,
    children: <p style={{ padding: 20 }}>The page goes here.</p>,
  },
};

export default meta;

export const Default = {};

export const Loading = { args: { loading: true } };
