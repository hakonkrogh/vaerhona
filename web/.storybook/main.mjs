// Storybook shows each component on its own, with made-up data, so a design
// can be changed without running the whole site. Stories sit next to their
// component, in files named *.stories.js. Run `pnpm storybook`.

import { fileURLToPath } from 'node:url';

// The same import paths as jsconfig.json gives Next.js, such as 'core/date'.
const fromRoot = (dir) => fileURLToPath(new URL(`../${dir}`, import.meta.url));

/** @type {import('@storybook/nextjs-vite').StorybookConfig} */
const config = {
  stories: ['../ui/**/*.stories.js', '../modules/**/*.stories.js'],
  // Runs the components as Next.js would: next/link, next/image, next/font
  // and next/router work, and CSS modules and image imports load.
  framework: '@storybook/nextjs-vite',
  // The photos and icons the site serves from /static.
  staticDirs: ['../public'],
  core: {
    disableTelemetry: true,
  },
  async viteFinal(viteConfig) {
    const { mergeConfig } = await import('vite');

    return mergeConfig(viteConfig, {
      resolve: {
        alias: {
          core: fromRoot('core'),
          modules: fromRoot('modules'),
          ui: fromRoot('ui'),
        },
      },
      // The components are .js files with JSX in them, as Next.js allows.
      // Vite reads them as JSX already, but its first scan for packages
      // does not.
      optimizeDeps: {
        rolldownOptions: {
          moduleTypes: { '.js': 'jsx' },
        },
      },
    });
  },
};

export default config;
