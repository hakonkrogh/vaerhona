import React from 'react';

import * as icons from '.';

// The older icons in modules/icons. They take width, height and fill.

const meta = {
  title: 'Modules/Icons',
  parameters: { layout: 'padded' },
  args: { size: 40, fill: '#000000' },
  argTypes: {
    size: { control: { type: 'range', min: 12, max: 160, step: 2 } },
    fill: { control: 'color' },
  },
};

export default meta;

export const All = {
  render: ({ size, fill }) => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: 24,
      }}
    >
      {Object.entries(icons).map(([name, Icon]) => (
        <figure
          key={name}
          style={{ margin: 0, display: 'grid', justifyItems: 'center', gap: 8 }}
        >
          <Icon width={`${size}px`} height={`${size}px`} fill={fill} />
          <figcaption style={{ fontSize: 12, color: '#666' }}>
            {name}
          </figcaption>
        </figure>
      ))}
    </div>
  ),
};
