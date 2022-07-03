import { dirname, resolve, extname, posix, sep } from 'path';
import { emitWarning } from 'process';
import { readFileSync } from 'fs';

/**
 * @name recursiveChunk
 * @type {string}
 * 
 * @description Shader chunk path
 * that caused a recursion error
 */
let recursiveChunk = '';

/**
 * @const
 * @name allChunks
 * @type {readonly Set<string>}
 * 
 * @description List of all shader chunks,
 * it's used to track included files
 */
const allChunks: Set<string> = new Set();

/**
 * @const
 * @name include
 * @type {readonly RegExp}
 * 
 * @description RegEx to match GLSL
 * `#include` preprocessor instruction
 */
const include = /#include(\s+([^\s<>]+));?/gi;

/**
 * @const
 * @name dependentChunks
 * @type {readonly Map<string, string[]>}
 * 
 * @description Map of shaders that import other chunks, it's
 * used to track included files in order to avoid recursion
 * - Key: shader path that uses other chunks as dependencies
 * - Value: list of chunk paths included within the shader
 */
const dependentChunks: Map<string, string[]> = new Map();

/**
 * @function
 * @name resetSavedChunks
 * @description Clears "allChunks" & "dependentChunks"
 * lists and resets "recursiveChunk" path to empty
 * 
 * @returns {string} Copy of "recursiveChunk" path
 */
function resetSavedChunks (): string {
  const chunk = recursiveChunk;
  dependentChunks.clear();
  recursiveChunk = '';
  allChunks.clear();
  return chunk;
}

/**
 * @function
 * @name getRecursionCaller
 * @description Gets last chunk that caused a
 * recursion error from the "dependentChunks" list
 * 
 * @returns {string} Chunk path that started a recursion
 */
function getRecursionCaller (): string {
  const dependencies = [...dependentChunks.keys()];
  return dependencies[dependencies.length - 1];
}

/**
 * @function
 * @name checkDuplicatedImports
 * @description Checks if shader chunk was already included
 * 
 * @param {string} path Shader's absolute path
 * 
 * @throws {Warning} If shader chunk was already included
 */
function checkDuplicatedImports (path: string): void {
  if (!allChunks.has(path)) return;
  const caller = getRecursionCaller();

  emitWarning(`'${path}' was included multiple times.`, {
    code: 'vite-plugin-glsl',
    detail: 'Please avoid multiple imports of the same chunk in order to avoid' +
    ` recursions and optimize your shader length. Last import found in file '${caller}'.`
  });
}

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
    source = source.slice(0, source.indexOf('/*')) +
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
 * @description Checks if shader dependencies
 * have caused a recursion error or warning
 * 
 * @param {string}  path Shader's absolute path
 * @param {boolean} warn Check already included chunks
 * 
 * @returns {boolean} Import recursion has occurred
 */
function checkRecursiveImports (path: string, warn: boolean): boolean {
  warn && checkDuplicatedImports(path);
  return checkIncludedDependencies(path, path);
}

/**
 * @function
 * @name checkIncludedDependencies
 * @description Checks if included
 * chunks caused a recursion error
 * 
 * @param {string} path Current chunk absolute path
 * @param {string} root Main shader path that imports chunks
 * 
 * @returns {boolean} Included chunk started a recursion
 */
function checkIncludedDependencies (path: string, root: string): boolean {
  const dependencies = dependentChunks.get(path);
  let recursiveDependency = false;

  if (dependencies?.includes(root)) {
    recursiveChunk = root;
    return true;
  }

  dependencies?.forEach(dependency => recursiveDependency ||=
    checkIncludedDependencies(dependency, root)
  );

  return recursiveDependency;
}

/**
 * @function
 * @name loadChunks
 * @description Includes shader's dependencies
 * and removes comments from the source code
 *
 * @param {string}  source    Shader's source code
 * @param {string}  path      Shader's absolute path
 * @param {string}  extension Default shader extension
 * @param {boolean} warn      Check already included chunks
 *
 * @throws {Error}   If shader chunks started a recursion loop
 * @returns {string} Shader's source code without external chunks
 */
function loadChunks (source: string, path: string, extension: string, warn: boolean): string {
  const unixPath = path.split(sep).join(posix.sep);

  if (checkRecursiveImports(unixPath, warn)) {
    return recursiveChunk;
  }

  source = removeSourceComments(source);
  let directory = dirname(unixPath);
  allChunks.add(unixPath);

  if (include.test(source)) {
    dependentChunks.set(unixPath, []);
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

      const shaderPath = shader.split(sep).join(posix.sep);
      dependentChunks.get(unixPath)?.push(shaderPath);

      return loadChunks(
        readFileSync(shader, 'utf8'),
        shader, extension, warn
      );
    });
  }

  if (recursiveChunk) {
    const caller = getRecursionCaller();
    const recursiveChunk = resetSavedChunks();

    throw Error(
      `Recursion detected when importing '${recursiveChunk}' in '${caller}'.`
    );
  }

  return source.trim().replace(/(\r\n|\r|\n){3,}/g, '$1\n');
}

/**
 * @function
 * @name loadShader
 * @description Iterates through all external chunks
 * and includes them into the shader's source code
 *
 * @param {string} source    Shader's source code
 * @param {string} shader    Shader's absolute path
 * @param {string} extension Default shader extension
 * @param {boolean} warn     Check already included chunks
 *
 * @returns {string} Shader file with included chunks
 */
export default function (source: string, shader: string, extension: string, warn: boolean): string {
  resetSavedChunks();

  return loadChunks(
    source, shader, extension, warn
  );
}
