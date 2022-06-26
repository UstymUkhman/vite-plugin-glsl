/**
 * @module vite-plugin-glsl
 * @description Import shader file chunks
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @version 0.1.3
 * @license MIT
 */

import type { FilterPattern } from '@rollup/pluginutils';
import type { Plugin, ResolvedConfig } from 'vite';

import { createFilter } from '@rollup/pluginutils';
import { transformWithEsbuild } from 'vite';
import loadShaders from './loadShaders';

/**
 * @const
 * @default
 * @type {string}
 */
 const DEFAULT_EXTENSION = 'glsl';

/**
 * @const
 * @default
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
 * @param {FilterPattern} exclude   RegExp | RegExp[] of file paths/extentions to ignore
 * @param {FilterPattern} include   RegExp | RegExp[] of file paths/extentions to import
 * @param {string} defaultExtension Shader import suffix when no extension is specified
 *
 * @default
 *   exclude = undefined
 *   include = /\.(glsl|wgsl|vert|frag|vs|fs)$/i
 *   defaultExtension = 'glsl'
 *
 * @returns {Plugin}
 */
export default function (
  exclude?: FilterPattern,
  include: FilterPattern = DEFAULT_SHADERS,
  defaultExtension = DEFAULT_EXTENSION
): Plugin {
  let config: ResolvedConfig;

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
          loadShaders(source, shader, defaultExtension), shader, {
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
