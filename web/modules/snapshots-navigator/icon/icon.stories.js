import React from 'react';

import Icon from '.';

// The buttons that switch between photo, compare and chart on a place page.

const TYPES = ['image', 'image-compare', 'graph', 'compass'];

const meta = {
  title: 'Modules/Snapshots navigator/Icon',
  component: Icon,
  args: { type: 'image', label: 'Bilde', selected: false },
  argTypes: {
    type: { control: 'inline-radio', options: TYPES },
  },
};

export default meta;

export const Single = {};

export const Selected = { args: { selected: true } };

export const All = {
  render: ({ selected }) => (
    <div style={{ display: 'flex', gap: 24 }}>
      {TYPES.map((type) => (
        <Icon key={type} type={type} label={type} selected={selected} />
      ))}
    </div>
  ),
};
