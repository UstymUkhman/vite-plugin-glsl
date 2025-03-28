import type { PluginOptions } from './types.d';
import type { Plugin } from 'vite';

/**
 * @function
 * @name glsl
 * @description Plugin entry point to import,
 * inline, (and minify) GLSL/WGSL shader files
 * 
 * @see {@link https://vitejs.dev/guide/api-plugin.html}
 * @link https://github.com/UstymUkhman/vite-plugin-glsl
 * 
 * @param {PluginOptions} options Plugin config object
 * 
 * @returns {Plugin} Vite plugin that converts shader code
 */
export default function ({
  include, exclude,
  warnDuplicatedImports,
  removeDuplicatedImports,
  defaultExtension,
  minify,
  watch,
  root
}?: PluginOptions): Plugin;
