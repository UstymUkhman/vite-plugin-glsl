import { dirname, resolve, extname, posix, sep } from 'path';
import { readFileSync } from 'fs';

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
 * @name checkRecursiveImport
 * @description Checks if a shader chunk was already included
 *
 * @param {string} path Shader's absolute path
 *
 * @returns {string | false} Chunk path caused a recursion
 * or `false` if there were no import recursion
 */
 function checkRecursiveImport (path: string): string | false {
  const recursion = shaderChunks.includes(path);
  const caller = shaderChunks.at(-1) as string;
  recursion && shaderChunks.splice(0);
  return recursion && caller;
}

/**
 * @function
 * @name loadChunk
 *
 * @param {string} source    Shader's source code
 * @param {string} path      Shader's absolute path
 * @param {string} extension Default shader extension
 *
 * @returns {string} Shader's source code without external chunks
 */
function loadChunk (source: string, path: string, extension: string): string {
  const unixPath = path.split(sep).join(posix.sep);
  const recursiveChunk = checkRecursiveImport(unixPath);

  if (recursiveChunk) {
    throw Error(`recursion detected when importing '${unixPath}' in '${recursiveChunk}'.`);
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
