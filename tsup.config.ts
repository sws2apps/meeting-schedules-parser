import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/browser/index.ts'],
    dts: { resolve: true, only: true, compilerOptions: { ignoreDeprecations: '6.0' } },
    format: ['esm'], // Ensure ESM output
    clean: true,
    outDir: 'dist',
  },
  {
    entry: ['src/node/index.ts'],
    dts: { resolve: true, only: true, compilerOptions: { ignoreDeprecations: '6.0' } },
    format: ['esm'], // Ensure ESM output
    clean: true,
    outDir: 'dist/node',
  },
]);
