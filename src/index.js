/**
 * @module vite-plugin-glsl
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description Import, inline (and minify) GLSL/WGSL shader files
 * @version 1.5.1
 * @license MIT
 */

import { createFilter } from '@rollup/pluginutils';
import { transformWithEsbuild } from 'vite';
import loadShader from './loadShader.js';

/**
 * @function
 * @name glsl
 * @description Plugin entry point to import,
 * inline, (and minify) GLSL/WGSL shader files
 * 
 * @see {@link https://vitejs.dev/guide/api-plugin.html}
 * @link https://github.com/UstymUkhman/vite-plugin-glsl
 * 
 * @param {import('./types').PluginOptions} options Plugin config object
 * 
 * @returns {import('vite').Plugin} Vite plugin that converts shader code
 */
export default function ({
    include = Object.freeze([
      '**/*.glsl', '**/*.wgsl',
      '**/*.vert', '**/*.frag',
      '**/*.vs', '**/*.fs'
    ]),
    exclude = undefined,
    defaultExtension = 'glsl',
    warnDuplicatedImports = true,
    removeDuplicatedImports = false,
    importKeyword = '#include',
    minify = false,
    watch = true,
    root = '/'
  } = {}
) {
  let sourcemap = false;
  const filter = createFilter(include, exclude);
  const prod = process.env.NODE_ENV === 'production';

  return {
    enforce: 'pre',
    name: 'vite-plugin-glsl',

    configResolved (resolvedConfig) {
      sourcemap = resolvedConfig.build.sourcemap;
    },

    async transform (source, shader) {
      if (!filter(shader)) return;

      const { dependentChunks, outputShader } = await loadShader(source, shader, {
        removeDuplicatedImports,
        warnDuplicatedImports,
        defaultExtension,
        importKeyword,
        minify, root
      });

      watch && !prod && Array.from(dependentChunks.values())
        .flat().forEach(chunk => this.addWatchFile(chunk));

      return await transformWithEsbuild(outputShader, shader, {
        sourcemap: sourcemap && 'external',
        loader: 'text', format: 'esm',
        minifyWhitespace: prod
      });
    }
  };
}
