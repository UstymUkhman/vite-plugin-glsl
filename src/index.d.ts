import type { PluginOptions } from './types.d';
import type { Plugin } from 'vite';

/**
 * @function
 * @name glsl
 * @description Plugin entry point to update dev server to watch
 * shader files and import, inline (and compress) chunk files
 * 
 * @see {@link https://vitejs.dev/guide/api-plugin.html}
 * @link https://github.com/UstymUkhman/vite-plugin-glsl
 * 
 * @param {PluginOptions} options Plugin config object
 * 
 * @returns {Plugin} Vite plugin that converts shader code
 */
export default function ({
  exclude,
  include,
  warnDuplicatedImports,
  defaultExtension,
  compress,
  watch,
  root
}?: PluginOptions): Plugin;
