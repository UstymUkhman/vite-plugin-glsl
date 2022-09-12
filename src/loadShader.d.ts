import type { LoadingOptions } from './types.d';

/**
 * @function
 * @name loadShader
 * @description Iterates through all external chunks
 * and includes them into the shader's source code
 * 
 * @param {string} source Shader's source code
 * @param {string} shader Shader's absolute path
 * @param {LoadingOptions} options Configuration object to define:
 *  - default shader extension when no extension is specified
 *  - warn if the same chunk was imported multiple times
 *  - whether compress the resulting shader code
 *  - directory for chunk imports from root
 * 
 * @returns {string} Shader file with included chunks
 */
export default function (source: string, shader: string, options: LoadingOptions): string;
