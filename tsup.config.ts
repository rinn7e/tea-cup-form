import { defineConfig } from 'tsup'

export default defineConfig({
  dts: true,
  outDir: 'lib',
  entry: ['src/index.tsx', 'src/update.ts'],
  format: ['cjs', 'esm'],
})
