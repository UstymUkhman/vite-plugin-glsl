/**
 * @module vite-plugin-glsl
 * @description Import shader file chunks
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @version 0.3.0
 * @license MIT
 */

import type { Plugin } from 'vite';
import type { PluginOptions } from './types.d';

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
  exclude,
  include,
  defaultExtension,
  warnDuplicatedImports,
  compress
}?: PluginOptions): Plugin;
