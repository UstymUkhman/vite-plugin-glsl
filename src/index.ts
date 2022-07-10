/**
 * @module vite-plugin-glsl
 * @description Import shader file chunks
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @version 0.2.1
 * @license MIT
 */

import type { FilterPattern } from '@rollup/pluginutils';
import type { Plugin, ResolvedConfig } from 'vite';

import { createFilter } from '@rollup/pluginutils';
import { transformWithEsbuild } from 'vite';
import loadShader from './loadShader';

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
 * @type {Object}
 * @name PluginOptions
 * 
 * @property {FilterPattern} exclude         - File paths/extensions to ignore
 * @property {FilterPattern} include         - File paths/extensions to import
 * @property {string} defaultExtension       - Shader suffix when no extension is specified
 * @property {boolean} warnDuplicatedImports - Warn if the same chunk was imported multiple times
 * 
 * @default
 * {
 *   exclude: undefined,
 *   include: DEFAULT_SHADERS,
 *   defaultExtension: DEFAULT_EXTENSION,
 *   warnDuplicatedImports: true
 * }
 */
type PluginOptions = {
  exclude?: FilterPattern;
  include?: FilterPattern;
  defaultExtension?: string;
  warnDuplicatedImports?: boolean;
};

/**
 * @function
 * @name glsl
 *
 * @param {PluginOptions} options Plugin config object
 * 
 * @returns {Plugin} Vite plugin that converts shader code
 */
export default function (
  {
    exclude = undefined,
    include = DEFAULT_SHADERS,
    defaultExtension = DEFAULT_EXTENSION,
    warnDuplicatedImports = true
  }: PluginOptions = {}
): Plugin
{
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
      if (filter(shader)) return await transformWithEsbuild(
        loadShader(source, shader, defaultExtension, warnDuplicatedImports), shader, {
          sourcemap: config.build.sourcemap && 'external',
          minifyWhitespace: production,
          loader: 'text',
          format: 'esm'
        }
      );
    }
  };
}
