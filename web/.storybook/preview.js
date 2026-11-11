import React from 'react';

import 'ui/global.css';
import { montserrat } from 'ui/font';

/** @type {import('@storybook/nextjs-vite').Preview} */
const preview = {
  // The same font as the site (see pages/_app.js). `display: contents` gives
  // the wrapper no box, so it does not change the layout, and the pictures
  // from `pnpm visuals` crop to the story.
  decorators: [
    (Story) => (
      <div className={montserrat.className} style={{ display: 'contents' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color|fill)$/i,
      },
    },
  },
};

export default preview;
