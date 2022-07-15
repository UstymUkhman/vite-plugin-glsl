/**
 * @module vite-plugin-glsl
 * @description Import shader file chunks
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @version 0.2.3
 * @license MIT
 */

import { createFilter } from '@rollup/pluginutils';
import { transformWithEsbuild } from 'vite';
import loadShader from './loadShader.mjs';

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
 * @see {@link vite-plugin-glsl/src/types.d.ts}
 * @param {PluginOptions} options Plugin config object
 * 
 * @returns {Plugin} Vite plugin that converts shader code
 * @link https://vitejs.dev/guide/api-plugin.html
 */
export default function ({
    exclude = undefined,
    include = DEFAULT_SHADERS,
    defaultExtension = DEFAULT_EXTENSION,
    warnDuplicatedImports = true,
    compress = false
  } = {}
) {
  let config;
  const filter = createFilter(include, exclude);
  const production = process.env.NODE_ENV === 'production';

  return {
    enforce: 'pre',
    name: 'vite-plugin-glsl',

    configResolved (resolvedConfig) {
      config = resolvedConfig;
    },

    async transform (source, shader) {
      if (filter(shader)) {
        return await transformWithEsbuild(
          loadShader(source, shader, {
            warnDuplicatedImports,
            defaultExtension,
            compress
          }), shader, {
            sourcemap: config.build.sourcemap && 'external',
            minifyWhitespace: production,
            loader: 'text',
            format: 'esm'
          }
        );
      }
    }
  };
}
