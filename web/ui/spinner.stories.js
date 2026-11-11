import { Spinner } from './spinner';

const meta = {
  title: 'UI/Spinner',
  component: Spinner,
  args: { size: '50px', thickness: 3, gap: 4, color: '#00628b' },
  argTypes: {
    thickness: { control: { type: 'range', min: 1, max: 8, step: 1 } },
    gap: { control: { type: 'range', min: 1, max: 5, step: 1 } },
    speed: { control: 'inline-radio', options: [undefined, 'fast', 'slow'] },
    color: { control: 'color' },
  },
};

export default meta;

export const Default = {};

export const Fast = { args: { speed: 'fast' } };

export const Slow = { args: { speed: 'slow' } };
