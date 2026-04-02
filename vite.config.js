// import slang from './vite.slang.js';
import { defineConfig } from 'vite';
import glsl from './src/index.js';

export default ({ mode }) => defineConfig({
  plugins: [glsl(/* slang(mode) */)],
  build: { sourcemap: true },

  server: {
    open: false,
    port: 8080
  }
});
