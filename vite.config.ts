import glsl from './src';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [glsl()],

  server: {
    host: '0.0.0.0',
    port: 8080,
    open: true
  }
});
