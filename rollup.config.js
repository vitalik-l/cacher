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
      file: pkg.main,
      format: 'cjs',
    },
    {
      name: 'ksh',
      file: pkg.browser,
      format: 'umd',
    },
  ],
  plugins: [typescript({ exclude: '**/*.test.ts' }), terser()],
};
