import type { FilterPattern } from '@rollup/pluginutils';

/**
 * @since 0.2.2
 * @typedef {Object}
 * @name LoadingOptions
 * @description Shader loading config object
 * 
 * @property {string}  defaultExtension      - Shader suffix when no extension is specified
 * @property {boolean} warnDuplicatedImports - Warn if the same chunk was imported multiple times
 * @property {boolean} compress              - Compress the resulting shader code
 * @property {boolean} watch                 - Recompile shader on chunk change
 * @property {string}  root                  - Directory for root imports
 */
export type LoadingOptions = {
  defaultExtension: string;
  warnDuplicatedImports: boolean;
  compress: boolean;
  watch: boolean;
  root: string;
};

/**
 * @typedef {Object}
 * @name PluginOptions
 * @extends LoadingOptions
 * @description Plugin config object
 * 
 * @property {FilterPattern} exclude - File paths/extensions to ignore
 * @property {FilterPattern} include - File paths/extensions to import
 * 
 * @default
 * {
 *   defaultExtension: DEFAULT_EXTENSION,
 *   warnDuplicatedImports: true,
 *   compress: false,
 *   watch: true,
 *   root: '/',
 *   exclude: undefined,
 *   include: DEFAULT_SHADERS
 * }
 */
export type PluginOptions = Partial<LoadingOptions> & {
  exclude?: FilterPattern;
  include?: FilterPattern;
};
