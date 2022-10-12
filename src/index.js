/**
 * @module vite-plugin-glsl
 * @description Import shader file chunks
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @version 0.5.1
 * @license MIT
 */

import { createFilter } from '@rollup/pluginutils';
import { transformWithEsbuild } from 'vite';
import watchShader from './watchShader.js';
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
 * 
 * @see {@link https://vitejs.dev/guide/api-plugin.html}
 * @description Imports, inlines and compresses GLSL shader chunk files.
 * 
 * @param {PluginOptions} options Plugin config object
 * 
 * @returns {Plugin} Vite plugin that converts shader code
 * @link https://github.com/UstymUkhman/vite-plugin-glsl
 */
export default function ({
    exclude = undefined,
    include = DEFAULT_SHADERS,
    defaultExtension = DEFAULT_EXTENSION,
    warnDuplicatedImports = true,
    compress = false,
    watch = true,
    root = '/'
  } = {}
) {
  let config;
  const filter = createFilter(include, exclude);
  const production = process.env.NODE_ENV === 'production';

  return {
    enforce: 'pre',
    name: 'vite-plugin-glsl',

    config (config) {
      if (!watch) return;
      config.server = config.server ?? {};
      config.server.watch = config.server.watch ?? {};
    },

    configureServer (server) {
      watch && watchShader(server, include, exclude, config.configFile);
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
        }), shader, {
          sourcemap: config.build.sourcemap && 'external',
          minifyWhitespace: production,
          loader: 'text',
          format: 'esm'
        }
      );
    }
  };
}
