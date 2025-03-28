import type { LoadingOptions, LoadingOutput } from './types.d';

/**
 * @function
 * @name loadShader
 * @description Iterates through all external chunks, includes them
 * into the shader's source code and optionally minifies the output
 * 
 * @param {string}         source  Shader's source code
 * @param {string}         shader  Shader's absolute path
 * @param {LoadingOptions} options Configuration object to define:
 * 
 *  - Warn if the same chunk was imported multiple times
 *  - Automatically remove an already imported chunk
 *  - Shader suffix when no extension is specified
 *  - Directory for root imports
 *  - Minify output shader code
 * 
 * @returns {Promise<LoadingOutput>} Loaded, parsed (and minified)
 * shader output and Map of shaders that import other chunks
 */
export default async function (
  source: string, shader: string,
  options: LoadingOptions
): Promise<LoadingOutput>;
