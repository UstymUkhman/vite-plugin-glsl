import glsl from './src';
import { defineConfig } from 'vite';

export default defineConfig({
  build: { sourcemap: true },
  plugins: [glsl()],

  server: {
    port: 8080,
    open: true
  }
});
