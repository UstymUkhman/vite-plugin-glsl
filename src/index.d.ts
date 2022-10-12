/**
 * @module vite-plugin-glsl
 * @description Import shader file chunks
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @version 0.5.1
 * @license MIT
 */

import type { PluginOptions } from './types.d';
import type { Plugin } from 'vite';

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
  compress,
  watch,
  root
}?: PluginOptions): Plugin;
