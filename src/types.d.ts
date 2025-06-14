/** @typedef {string | string[]} GlobPattern */
export type GlobPattern = string | string[];

/** @typedef {string | string[]} Callback */
type Callback = (shader: string) => string;

/**
 * @default false
 * @typedef {boolean | Callback | Promise<Callback>} Minify
 * 
 * @description Boolean value or custom callback
 * function/promise to optimize output shader length
 * 
 * @param {string} shader Shader code with included chunks
 * 
 * @returns {string} Minified shader's source code
 */
type Minify = boolean | Callback | Promise<Callback>;

/**
 * @typedef {Object} LoadingOptions
 * @description Shader loading config object
 * 
 * @property {string}  defaultExtension        Shader suffix to use when no extension is specified
 * @property {boolean} warnDuplicatedImports   Warn if the same chunk was imported multiple times
 * @property {boolean} removeDuplicatedImports Automatically remove an already imported chunk
 * @property {string}  importKeyword           Keyword used to import shader chunks
 * @property {Minify}  minify                  Minify output shader code
 * @property {string}  root                    Directory for root imports
 */
export type LoadingOptions = {
  warnDuplicatedImports: boolean;
  removeDuplicatedImports: boolean;
  defaultExtension: string;
  importKeyword: string;
  minify: Minify;
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
 *   include: Object.freeze([
 *     '**\/*.glsl', '**\/*.wgsl',
 *     '**\/*.vert', '**\/*.frag',
 *     '**\/*.vs', '**\/*.fs'
 *   ]),
 *   exclude: undefined,
 *   defaultExtension: 'glsl',
 *   warnDuplicatedImports: true,
 *   removeDuplicatedImports: false,
 *   importKeyword: '#include',
 *   minify: false,
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
 * @returns {LoadingOutput} Loaded, parsed (and minified)
 * shader output and Map of shaders that import other chunks
 * 
 * @property {Map<string, string[]>} dependentChunks Map of shaders that import other chunks
 * @property {string}                outputShader    Shader file with included chunks
 */
export type LoadingOutput = {
  dependentChunks: Map<string, string[]>;
  outputShader: string;
};
