/**
 * @module vite-plugin-glsl
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description Import, inline (and compress) GLSL shader files
 * @version 1.1.0
 * @license MIT
 */

import { createFilter } from '@rollup/pluginutils';
import { transformWithEsbuild } from 'vite';
import loadShader from './loadShader.js';

/**
 * @const
 * @default
 * @readonly
 * @type {string}
 */
const DEFAULT_EXTENSION = 'glsl';

/**
 * @const
 * @default
 * @readonly
 * @type {readonly RegExp[]}
 */
const DEFAULT_SHADERS = Object.freeze([
  '**/*.glsl', '**/*.wgsl',
  '**/*.vert', '**/*.frag',
  '**/*.vs', '**/*.fs'
]);

/**
 * @function
 * @name glsl
 * @description Plugin entry point to import,
 * inline, (and compress) GLSL shader files
 * 
 * @see {@link https://vitejs.dev/guide/api-plugin.html}
 * @link https://github.com/UstymUkhman/vite-plugin-glsl
 * 
 * @param {PluginOptions} options Plugin config object
 * 
 * @returns {Plugin} Vite plugin that converts shader code
 */
export default function ({
    include = DEFAULT_SHADERS,
    exclude = undefined,
    warnDuplicatedImports = true,
    defaultExtension = DEFAULT_EXTENSION,
    compress = false,
    watch = true,
    root = '/'
  } = {}
) {
  let config = undefined;
  const filter = createFilter(include, exclude);
  const prod = process.env.NODE_ENV === 'production';

  return {
    enforce: 'pre',
    name: 'vite-plugin-glsl',

    config (config) {
      if (!watch) return;
      config.server = config.server ?? {};
      config.server.watch = config.server.watch ?? {};
    },

    configResolved (resolvedConfig) {
      config = resolvedConfig;
    },

    async transform (source, shader) {
      if (filter(shader)) return await transformWithEsbuild(
        loadShader(source, shader, {
          warnDuplicatedImports,
          defaultExtension,
          compress,
          root
        }),
        shader, {
          sourcemap: config.build.sourcemap && 'external',
          minifyWhitespace: prod,
          loader: 'text',
          format: 'esm'
        }
      );
    },

    handleHotUpdate ({ file, server }) {
      filter(file) && server.restart();
    }
  };
}
