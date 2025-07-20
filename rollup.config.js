import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy';

const config = [
  {
    input: 'src/browser/index.ts',
    output: [
      {
        sourcemap: true,
        file: 'dist/index.js',
        format: 'es',
      },
    ],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false, // Let tsup handle type declarations
      }),
      nodeResolve(),
      commonjs(),
      json(),
      terser(),
      copy({
        targets: [
          {
            src: 'node_modules/sql.js/dist/sql-wasm.wasm',
            dest: 'dist',
          },
        ],
      }),
    ],
    external: ['jszip', 'path-browserify', 'sql.js', 'pako'],
  },
  {
    input: 'src/node/index.ts',
    output: [
      {
        sourcemap: false,
        file: 'dist/node/index.cjs',
        format: 'cjs',
      },
    ],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false, // Let tsup handle type declarations
      }),
      commonjs(),
      json(),
      terser(),
    ],
    external: ['jszip', 'node-html-parser', 'path', 'fs/promises', 'sql.js', 'pako'],
  },
  {
    input: 'src/node/index.ts',
    output: [
      {
        sourcemap: true,
        file: 'dist/node/index.js',
        format: 'es',
      },
    ],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false, // Let tsup handle type declarations
      }),
      commonjs(),
      json(),
      terser(),
    ],
    external: ['jszip', 'node-html-parser', 'path', 'fs/promises', 'sql.js', 'pako'],
  },
];

export default config;
