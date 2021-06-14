import path from 'path';
import { readFileSync } from 'fs';

/**
 * @function
 * @name removeSourceComments
 * @description Removes comments from shader source
 * code in order to avoid including commented chunks
 *
 * @param {string} source Shader source code
 *
 * @returns {string} Shader source code without comments
 */
function removeSourceComments (source: string): string {
  if (source.includes('/*') && source.includes('*/')) {
    source.slice(0, source.indexOf('/*')) +
    source.slice(source.indexOf('*/') + 2, source.length);
  }

  const lines = source.split('\n');

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('//')) {
      lines[i] = lines[i].slice(0, lines[i].indexOf('//'));
    }
  }

  return lines.join('\n');
}

/**
 * @function
 * @name loadChunk
 *
 * @param {string} source Shader source code
 * @param {string} shader Shader filename full path
 * @param {string} extension Default shader extension
 *
 * @returns {string} Shader source code without external chunks
 */
function loadChunk (source: string, shader: string, directory: string, extension: string): string {
  const include = /#include(\s+([^\s<>]+))/;
  source = removeSourceComments(source);

  if (include.test(source)) {
    const currentDirectory = directory;

    source = source.replace(/#include (.*);/ig, (match: string, chunkPath: string): string => {
      const directoryIndex = chunkPath.trim().lastIndexOf('/');
      directory = currentDirectory;

      if (directoryIndex !== -1) {
        directory = path.resolve(directory, chunkPath.slice(0, directoryIndex + 1));
        chunkPath = chunkPath.slice(directoryIndex + 1, chunkPath.length);
      }

      shader = path.resolve(directory, chunkPath);

      if (!path.extname(shader)) {
        shader = `${shader}.${extension}`;
      }

      return loadChunk(
        readFileSync(shader, 'utf8'), shader,
        path.dirname(shader), extension
      );
    });
  }

  return source.trim().replace(/(\r\n|\r|\n){3,}/g, '$1\n');
}

/**
 * @function
 * @name loadShaders
 *
 * @param {string} source Shader source code
 * @param {string} shader Shader file to load
 * @param {string} extension Default shader extension
 *
 * @returns {string} Shader file with included chunks
 */
export default function (source: string, shader: string, extension: string): string {
  return loadChunk(source, shader, path.dirname(shader), extension);
}
