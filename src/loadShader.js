import { dirname, resolve, extname, posix, sep } from 'path';
import { emitWarning, cwd } from 'process';
import { readFileSync } from 'fs';
import { platform } from 'os';

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
const allChunks = new Set();

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
const dependentChunks = new Map();

/**
 * @const
 * @name duplicatedChunks
 * @type {readonly Map<string, string[]>}
 * 
 * @description Map of duplicated shader
 * imports, used by warning messages
 */
const duplicatedChunks = new Map();

/**
 * @function
 * @name resetSavedChunks
 * @description Clears all lists of saved chunks
 * and resets "recursiveChunk" path to empty
 * 
 * @returns {string} Copy of "recursiveChunk" path
 */
function resetSavedChunks () {
  const chunk = recursiveChunk;
  duplicatedChunks.clear();
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
function getRecursionCaller () {
  const dependencies = [...dependentChunks.keys()];
  return dependencies[dependencies.length - 1];
}

/**
 * @function
 * @name checkDuplicatedImports
 * @description Checks if shader chunk was already included
 * and adds it to the "duplicatedChunks" list if yes
 * 
 * @param {string} path Shader's absolute path
 * 
 * @throws {Warning} If shader chunk was already included
 */
function checkDuplicatedImports (path) {
  const caller = getRecursionCaller();

  const chunks = duplicatedChunks.get(caller) ?? [];
  if (chunks.includes(path)) return;

  chunks.push(path);
  duplicatedChunks.set(caller, chunks);

  emitWarning(`'${path}' was included multiple times.`, {
    code: 'vite-plugin-glsl',
    detail: 'Please avoid multiple imports of the same chunk in order to avoid' +
    ` recursions and optimize your shader length.\nDuplicated import found in file '${caller}'.`
  });
}

/**
 * @function
 * @name removeSourceComments
 * @description Removes comments from shader source
 * code in order to avoid including commented chunks
 * 
 * @param {string}  source  Shader's source code
 * @param {string}  keyword Keyword to import chunks
 * @param {boolean} triple  Remove comments starting with `///`
 * 
 * @returns {string} Shader's source code without comments
 */
function removeSourceComments (source, keyword, triple = false) {
  const pattern = new RegExp(String.raw`${keyword}(\s+([^\s<>]+));?`, 'gi');

  if (source.includes('/*') && source.includes('*/')) {
    source = source.slice(0, source.indexOf('/*')) +
    source.slice(source.indexOf('*/') + 2, source.length);
  }

  const lines = source.split('\n');

  for (let l = lines.length; l--; ) {
    const index = lines[l].indexOf('//');

    if (index > -1) {
      if (lines[l][index + 2] === '/' && !pattern.test(lines[l]) && !triple) continue;
      lines[l] = lines[l].slice(0, lines[l].indexOf('//'));
    }
  }

  return lines.join('\n');
}

/**
 * @function
 * @name checkRecursiveImports
 * @description Checks if shader dependencies
 * have caused a recursion error or warning
 * ignoring duplicate chunks if required
 * 
 * @param {string}  path    Shader's absolute path
 * @param {string}  lowPath Shader's lowercase path
 * @param {boolean} warn    Check already included chunks
 * @param {boolean} ignore  Ignore already included chunks
 * 
 * @returns {boolean | null} Import recursion has occurred
 * or chunk was ignored because of `ignore` argument
 */
function checkRecursiveImports (path, lowPath, warn, ignore) {
  if (allChunks.has(lowPath)) {
    if (ignore) return null;
    warn && checkDuplicatedImports(path);
  }

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
function checkIncludedDependencies (path, root) {
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
 * @name minifyShader
 * @description Minifies shader source code by
 * removing unnecessary whitespace and empty lines
 * 
 * @param {string}  shader  Shader code with included chunks
 * @param {boolean} newLine Flag to require a new line for the code
 * 
 * @returns {string} Minified shader's source code
 */
function minifyShader (shader, newLine = false) {
  return shader.replace(/\\(?:\r\n|\n\r|\n|\r)|\/\*.*?\*\/|\/\/(?:\\(?:\r\n|\n\r|\n|\r)|[^\n\r])*/g, '')
    .split(/\n+/).reduce((result, line) => {
      line = line.trim().replace(/\s{2,}|\t/, ' ');

      if (/@(vertex|fragment|compute)/.test(line) || line.endsWith('return')) line += ' ';

      if (line[0] === '#') {
        newLine && result.push('\n');
        result.push(line, '\n');
        newLine = false;
      }

      else {
        !line.startsWith('{') && result.length && result[result.length - 1].endsWith('else') && result.push(' ');
        result.push(line.replace(/\s*({|}|=|\*|,|\+|\/|>|<|&|\||\[|\]|\(|\)|\-|!|;)\s*/g, '$1'));
        newLine = true;
      }

      return result;
    }, []).join('').replace(/\n+/g, '\n');
}

/**
 * @function
 * @name loadChunks
 * @description Includes shader's dependencies
 * and removes comments from the source code
 * 
 * @param {string}  source  Shader's source code
 * @param {string}  path    Shader's absolute path
 * @param {Options} options Shader loading config object
 * 
 * @throws {Error} If shader chunks started a recursion loop
 * 
 * @returns {string} Shader's source code without external chunks
 */
function loadChunks (source, path, options) {
  const { importKeyword, warnDuplicatedImports, removeDuplicatedImports } = options;
  const pattern = new RegExp(String.raw`${importKeyword}(\s+([^\s<>]+));?`, 'gi');
  const unixPath = path.split(sep).join(posix.sep);

  const chunkPath = platform() === 'win32' &&
    unixPath.toLocaleLowerCase() || unixPath; 

  const recursion = checkRecursiveImports(
    unixPath, chunkPath,
    warnDuplicatedImports,
    removeDuplicatedImports
  );

  if (recursion) return recursiveChunk;
  else if (recursion === null) return '';

  source = removeSourceComments(source);
  let directory = dirname(unixPath);
  allChunks.add(chunkPath);

  if (pattern.test(source)) {
    dependentChunks.set(unixPath, []);
    const currentDirectory = directory;
    const ext = options.defaultExtension;

    source = source.replace(pattern, (_, chunkPath) => {
      chunkPath = chunkPath.trim().replace(/^(?:"|')?|(?:"|')?;?$/gi, '');

      if (!chunkPath.indexOf('/')) {
        const base = cwd().split(sep).join(posix.sep);
        chunkPath = base + options.root + chunkPath;
      }

      const directoryIndex = chunkPath.lastIndexOf('/');
      directory = currentDirectory;

      if (directoryIndex !== -1) {
        directory = resolve(directory, chunkPath.slice(0, directoryIndex + 1));
        chunkPath = chunkPath.slice(directoryIndex + 1, chunkPath.length);
      }

      let shader = resolve(directory, chunkPath);
      if (!extname(shader)) shader = `${shader}.${ext}`;

      const shaderPath = shader.split(sep).join(posix.sep);
      dependentChunks.get(unixPath)?.push(shaderPath);

      return loadChunks(
        readFileSync(shader, 'utf8'),
        shader, options
      );
    });
  }

  if (recursiveChunk) {
    const caller = getRecursionCaller();
    const recursiveChunk = resetSavedChunks();

    throw new Error(
      `Recursion detected when importing "${recursiveChunk}" in "${caller}".`
    );
  }

  return source.trim().replace(/(\r\n|\r|\n){3,}/g, '$1\n');
}

/**
 * @function
 * @name loadShader
 * @description Iterates through all external chunks, includes them
 * into the shader's source code and optionally minifies the output
 * 
 * @typedef {import('./types').LoadingOptions} Options
 * @typedef {import('./types').LoadingOutput} Output
 * 
 * @param {string}  source  Shader's source code
 * @param {string}  shader  Shader's absolute path
 * @param {Options} options Configuration object to define:
 * 
 *  - Shader suffix to use when no extension is specified
 *  - Warn if the same chunk was imported multiple times
 *  - Automatically remove an already imported chunk
 *  - Keyword used to import shader chunks
 *  - Directory for root imports
 *  - Minify output shader code
 * 
 * @returns {Promise<Output>} Loaded, parsed (and minified)
 * shader output and Map of shaders that import other chunks
 */
export default async function (source, shader, options) {
  const { minify, ...config } = options;

  resetSavedChunks();

  let output = loadChunks(source, shader, config);
  output = minify ? removeSourceComments(output, options.importKeyword, true) : output;

  return {
    dependentChunks,
    outputShader: minify
      ? typeof minify !== 'function'
      ? minifyShader(output)
      : await minify(output)
      : output
  };
}
