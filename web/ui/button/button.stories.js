import React from 'react';

import { Button } from '.';

const meta = {
  title: 'UI/Button',
  component: Button,
  args: {
    children: 'Lagre',
    loading: false,
    block: false,
  },
  argTypes: {
    as: { table: { disable: true } },
  },
};

export default meta;

export const Primary = { args: { primary: true } };

export const Clean = { args: { clean: true } };

export const Danger = { args: { danger: true } };

export const Loading = { args: { loading: true } };

export const Block = {
  args: { block: true },
  parameters: { layout: 'padded' },
};

export const Sizes = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button {...args} tiny>
        Tiny
      </Button>
      <Button {...args} small>
        Small
      </Button>
      <Button {...args}>Medium</Button>
      <Button {...args} large>
        Large
      </Button>
      <Button {...args} xlarge>
        XLarge
      </Button>
    </div>
  ),
};
