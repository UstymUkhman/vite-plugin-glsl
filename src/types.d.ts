/**
 * @const
 * @readonly
 * @typedef {string | string[]}
 */
export type GlobPattern = string | string[];

/**
 * @const
 * @readonly
 * @default false
 * @typedef {boolean | ((shader: string) => string)}
 * 
 * @description Boolean value or custom callback
 * function to optimize output shader length
 * 
 * @param {string} shader Shader code with included chunks
 * 
 * @returns {string} Compressed shader's source code
 */
type Compress = boolean | ((shader: string) => string);

/**
 * @typedef {Object}
 * @name LoadingOptions
 * @description Shader loading config object
 * 
 * @property {boolean}  warnDuplicatedImports Warn if the same chunk was imported multiple times
 * @property {string}   defaultExtension      Shader suffix when no extension is specified
 * @property {Compress} compress              Compress output shader code
 * @property {boolean}  watch                 Recompile shader on change
 * @property {string}   root                  Directory for root imports
 */
export type LoadingOptions = {
  warnDuplicatedImports: boolean;
  defaultExtension: string;
  compress: Compress;
  watch: boolean;
  root: string;
};

/**
 * @typedef {Object}
 * @name LoadingResult
 * @description Output of the loaded and processed shader
 * 
 * @property {string}                 code   Shader file with included chunks
 * @property {Map<string, string[]>}  deps   Map of shaders that import other chunks
 */
export type LoadingResult = {
  code: string;
  deps?: Record<string, string[]>;
};

/**
 * @since 0.2.0
 * @typedef {Object}
 * @name PluginOptions
 * @extends LoadingOptions
 * @description Plugin config object
 * 
 * @property {GlobPattern} Glob pattern(s array) to import
 * @property {GlobPattern} Glob pattern(s array) to ignore
 * 
 * @default {
 *   exclude: undefined,
 *   include: DEFAULT_SHADERS,
 *   warnDuplicatedImports: true,
 *   defaultExtension: DEFAULT_EXTENSION,
 *   compress: false,
 *   watch: true,
 *   root: '/'
 * }
 */
export type PluginOptions = Partial<LoadingOptions> & {
  include?: GlobPattern;
  exclude?: GlobPattern;
};
