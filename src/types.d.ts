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
 */
export type LoadingOptions = {
  defaultExtension: string;
  warnDuplicatedImports: boolean;
  compress: boolean;
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
 *   exclude: undefined,
 *   include: DEFAULT_SHADERS
 * }
 */
export type PluginOptions = Partial<LoadingOptions> & {
  exclude?: FilterPattern;
  include?: FilterPattern;
};
