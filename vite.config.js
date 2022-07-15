import glsl from './src/index.mjs';
import { defineConfig } from 'vite';

export default defineConfig({
  build: { sourcemap: true },
  plugins: [glsl()],

  server: {
    port: 8080,
    open: false
  }
});
