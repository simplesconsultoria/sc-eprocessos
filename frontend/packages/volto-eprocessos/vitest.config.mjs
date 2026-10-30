import { defineConfig } from 'vitest/config';
import voltoVitestConfig from '@plone/volto/vitest.config.mjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const voltoRoot = path.resolve(__dirname, '../../core/packages/volto');

const aliases = {
  '@plone/volto': `${voltoRoot}/src`,
  // Volto's webpack maps the add-on's own name to its `src` folder.
  '@simplesconsultoria/volto-eprocessos': path.resolve(__dirname, './src'),
};

// Webpack, in Volto's build, also looks up bare imports (`react-intl`,
// `react-redux`, ...) in Volto's own node_modules. pnpm does not expose them
// to this package, so fall back to resolving them from Volto, as webpack does.
const resolveFromVolto = {
  name: 'resolve-from-volto',
  enforce: 'pre',
  async resolveId(source, importer, options) {
    if (
      !importer ||
      source.startsWith('.') ||
      source.startsWith('\0') ||
      path.isAbsolute(source) ||
      importer.startsWith(voltoRoot)
    ) {
      return null;
    }
    const resolved = await this.resolve(source, importer, {
      ...options,
      skipSelf: true,
    });
    if (resolved) {
      return resolved;
    }
    return this.resolve(source, path.join(voltoRoot, 'package.json'), {
      ...options,
      skipSelf: true,
    });
  },
};

export default defineConfig({
  ...voltoVitestConfig,
  resolve: { alias: aliases },
  test: {
    ...voltoVitestConfig.test,
    projects: [
      {
        plugins: [resolveFromVolto],
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
