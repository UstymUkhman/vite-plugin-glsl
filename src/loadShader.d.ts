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
 *  - warn if the same chunk was imported multiple times
 *  - default shader extension when no extension is specified
 *  - whether (and how) to compress output shader code
 *  - directory for chunk imports from root
 * 
 * @returns {LoadingOutput} Loaded, parsed (and compress)
 * shader output and Map of shaders that import other chunks
 */
export default function (
  source: string,
  shader: string,
  options: LoadingOptions
): LoadingOutput;
