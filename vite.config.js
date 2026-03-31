// import slang from './vite.slang.js';
import { defineConfig } from 'vite';
import glsl from './src/index.js';

export default defineConfig({
  build: { sourcemap: true },
  plugins: [glsl(/* slang */)],

  server: {
    open: false,
    port: 8080
  }
});
