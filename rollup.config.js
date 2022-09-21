import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.module,
      format: 'es',
    },
    {
      name: 'ksh',
      file: pkg.browser,
      format: 'umd',
    },
  ],
  plugins: [typescript(), terser()],
};
