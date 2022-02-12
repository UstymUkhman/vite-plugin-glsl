/**
 * @module vite-plugin-glsl
 * @description Import shader file chunks
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @version 0.0.9
 * @license MIT
 */

import type { Plugin } from 'vite';
import loadShaders from './loadShaders';
import type { FilterPattern } from '@rollup/pluginutils';
import { createFilter, dataToEsm } from '@rollup/pluginutils';

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
  '**/*.vert', '**/*.frag',
  '**/*.vs', '**/*.fs',
  '**/*.glsl'
]);

/**
 * @function
 * @name glsl
 *
 * @param {FilterPattern} exclude RegExp | RegExp[] of file paths/extentions to ignore
 * @param {FilterPattern} include RegExp | RegExp[] of file paths/extentions to import
 * @param {string} defaultExtension Shader import suffix when no extension is specified
 *
 * @default
 *   exclude = undefined
 *   include = /\.(vs|fs|vert|frag|glsl)$/i
 *   defaultExtension = 'glsl'
 *
 * @returns {Plugin}
 */
export default function (
  exclude?: FilterPattern,
  include: FilterPattern = DEFAULT_SHADERS,
  defaultExtension = DEFAULT_EXTENSION
): Plugin {
  const filter = createFilter(include, exclude);

  return {
    enforce: 'pre',
    name: 'vite-plugin-glsl',

    transform (source, shader) {
      if (filter(shader)) {
        return dataToEsm(loadShaders(
          source, shader, defaultExtension
        ));
      }
    }
  };
}
