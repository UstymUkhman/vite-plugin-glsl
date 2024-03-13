import type { LoadingOptions, LoadingOutput } from './types.d';

/**
 * @function
 * @name loadShader
 * @description Iterates through all external chunks, includes them
 * into the shader's source code and optionally compresses the output
 * 
 * @param {string}         source  Shader's source code
 * @param {string}         shader  Shader's absolute path
 * @param {LoadingOptions} options Configuration object to define:
 * 
 *  - Warn if the same chunk was imported multiple times
 *  - Shader suffix when no extension is specified
 *  - Compress output shader code
 *  - Directory for root imports
 * 
 * @returns {LoadingOutput} Loaded, parsed (and compressed)
 * shader output and Map of shaders that import other chunks
 */
export default function (
  source: string,
  shader: string,
  options: LoadingOptions
): LoadingOutput;
