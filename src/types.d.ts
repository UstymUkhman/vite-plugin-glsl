/** @typedef {string | string[]} GlobPattern */
export type GlobPattern = string | string[];

/**
 * @default false
 * @typedef {boolean | ((shader: string) => string)} Compress
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
 * @typedef {Object} LoadingOptions
 * @description Shader loading config object
 * 
 * @property {boolean}  warnDuplicatedImports   Warn if the same chunk was imported multiple times
 * @property {boolean}  removeDuplicatedImports Automatically remove an already imported chunk
 * @property {string}   defaultExtension        Shader suffix when no extension is specified
 * @property {Compress} compress                Compress output shader code
 * @property {string}   root                    Directory for root imports
 */
export type LoadingOptions = {
  warnDuplicatedImports: boolean;
  removeDuplicatedImports: boolean;
  defaultExtension: string;
  compress: Compress;
  root: string;
};

/**
 * @since 0.2.0
 * @extends LoadingOptions
 * @typedef {Object} PluginOptions
 * @description Plugin config object
 * 
 * @property {GlobPattern} include Glob pattern(s array) to import
 * @property {GlobPattern} exclude Glob pattern(s array) to ignore
 * @property {boolean}     watch   Recompile shader on change
 * 
 * @default {
 *   exclude: undefined,
 *   include: DEFAULT_SHADERS,
 *   warnDuplicatedImports: true,
 *   removeDuplicatedImports: false,
 *   defaultExtension: DEFAULT_EXTENSION,
 *   compress: false,
 *   watch: true,
 *   root: '/'
 * }
 */
export type PluginOptions = Partial<LoadingOptions> & {
  include?: GlobPattern;
  exclude?: GlobPattern;
  watch?: boolean;
};

/**
 * @since 1.1.2
 * @typedef {Object} LoadingOutput
 * 
 * @returns {LoadingOutput} Loaded, parsed (and compressed)
 * shader output and Map of shaders that import other chunks
 * 
 * @property {Map<string, string[]>} dependentChunks Map of shaders that import other chunks
 * @property {string}                outputShader    Shader file with included chunks
 */
export type LoadingOutput = {
  dependentChunks: Map<string, string[]>;
  outputShader: string;
};
