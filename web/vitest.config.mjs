import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// The same import paths as jsconfig.json gives Next.js, such as 'core/date'.
const fromRoot = (dir) => fileURLToPath(new URL(`./${dir}`, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      core: fromRoot('core'),
      modules: fromRoot('modules'),
    },
  },
});
