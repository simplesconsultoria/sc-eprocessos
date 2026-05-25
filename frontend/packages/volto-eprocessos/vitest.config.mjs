import { defineConfig } from 'vitest/config';
import voltoVitestConfig from '@plone/volto/vitest.config.mjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const voltoRoot = path.resolve(__dirname, '../../core/packages/volto');

const aliases = {
  '@plone/volto': `${voltoRoot}/src`,
};

export default defineConfig({
  ...voltoVitestConfig,
  resolve: { alias: aliases },
  test: {
    ...voltoVitestConfig.test,
    projects: [
      {
        test: {
          name: 'volto-eprocessos',
          root: __dirname,
          isolate: true,
          globals: true,
          environment: 'jsdom',
          setupFiles: [
            `${voltoRoot}/test-setup-globals.js`,
            `${voltoRoot}/test-setup-config.jsx`,
            `${voltoRoot}/test-addons-loader.js`,
          ],
          globalSetup: `${voltoRoot}/global-test-setup.js`,
        },
        resolve: { alias: aliases },
      },
    ],
  },
});
