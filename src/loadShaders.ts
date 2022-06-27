import { dirname, resolve, extname, posix, sep } from 'path';
import { emitWarning } from 'process';
import { readFileSync } from 'fs';

/**
 * @type {string}
 * @name lastCaller
 * 
 * @description Last shader's absolute
 * path to include a new chunk
 */
let lastCaller = '';

/**
 * @const
 * @type {string[]}
 * @name shaderChunks
 * 
 * @description List of shader chunks, it's used to
 * track included files in order to avoid recursion
 */
const shaderChunks: string[] = [];

/**
 * @const
 * @name include
 * @type {readonly RegExp}
 * 
 * @description RegExp to match GLSL
 * `#include` preprocessor instruction
 */
const include = /#include(\s+([^\s<>]+));?/gi;

/**
 * @function
 * @name removeSourceComments
 * @description Removes comments from shader source
 * code in order to avoid including commented chunks
 *
 * @param {string} source Shader's source code
 *
 * @returns {string} Shader's source code without comments
 */
function removeSourceComments (source: string): string {
  if (source.includes('/*') && source.includes('*/')) {
    source.slice(0, source.indexOf('/*')) +
    source.slice(source.indexOf('*/') + 2, source.length);
  }

  const lines = source.split('\n');

  for (let l = lines.length; l--;)
    if (lines[l].includes('//'))
      lines[l] = lines[l].slice(0, lines[l].indexOf('//'));

  return lines.join('\n');
}

/**
 * @function
 * @name checkRecursiveImports
 * @description Checks if a shader chunk was already included
 *
 * @param {string} path Shader's absolute path
 *
 * @returns {string | false} Chunk path caused a recursion
 * or `false` if there were no import recursion
 */
 function checkRecursiveImports (path: string): string | false {
  const recursion = shaderChunks.includes(path);
  const caller = shaderChunks.at(-1) as string;

  if (!recursion) {
    lastCaller = caller;
    return false;
  }

  if (checkMultipleImports(path, caller)) {
    return false;
  }

  shaderChunks.splice(0);
  return caller;
}

/**
 * @function
 * @name checkMultipleImports
 * @description Checks if a shader chunk was already included
 *
 * @param {string} path   Shader's absolute path
 * @param {string} caller Chunk path who called `#include`
 *
 * @returns {boolean} Chunk import has already occurred
 */
function checkMultipleImports (path: string, caller: string): boolean {
  const sameCaller = path === lastCaller;
  if (!sameCaller) return false;

  emitWarning(`'${path}' was included multiple times.`, {
    code: 'vite-plugin-glsl',
    detail: 'Please avoid multiple imports of the same chunk in order to' +
    ` avoid unwanted recursions. Last import found in file '${caller}'.`
  });

  lastCaller = caller;
  return true;
}

/**
 * @function
 * @name loadChunk
 *
 * @param {string} source    Shader's source code
 * @param {string} path      Shader's absolute path
 * @param {string} extension Default shader extension
 *
 * @throws  {Error}  If import recursion was detected
 * @returns {string} Shader's source code without external chunks
 */
function loadChunk (source: string, path: string, extension: string): string {
  const unixPath = path.split(sep).join(posix.sep);
  const recursiveChunk = checkRecursiveImports(unixPath);

  if (recursiveChunk) {
    throw Error(`Recursion detected when importing '${unixPath}' in '${recursiveChunk}'.`);
  }

  source = removeSourceComments(source);
  let directory = dirname(unixPath);
  shaderChunks.push(unixPath);

  if (include.test(source)) {
    const currentDirectory = directory;

    source = source.replace(include, (_, chunkPath: string): string => {
      chunkPath = chunkPath.trim().replace(/^(?:"|')?|(?:"|')?;?$/gi, '');

      const directoryIndex = chunkPath.lastIndexOf('/');
      directory = currentDirectory;

      if (directoryIndex !== -1) {
        directory = resolve(directory, chunkPath.slice(0, directoryIndex + 1));
        chunkPath = chunkPath.slice(directoryIndex + 1, chunkPath.length);
      }

      let shader = resolve(directory, chunkPath);

      if (!extname(shader)) {
        shader = `${shader}.${extension}`;
      }

      return loadChunk(
        readFileSync(shader, 'utf8'),
        shader, extension
      );
    });
  }

  return source.trim().replace(/(\r\n|\r|\n){3,}/g, '$1\n');
}

/**
 * @function
 * @name loadShaders
 *
 * @param {string} source    Shader's source code
 * @param {string} shader    Shader's absolute path
 * @param {string} extension Default shader extension
 *
 * @returns {string} Shader file with included chunks
 */
export default function (source: string, shader: string, extension: string): string {
  return loadChunk(source, shader, extension);
}
