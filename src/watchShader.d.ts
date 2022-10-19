import type { GlobPattern } from './types.d';
import type { ViteDevServer } from 'vite';

/**
 * @function
 * @since 0.5.0
 * @name watchShader
 * @description Adds included chunk files extensions
 * to the internal chokidar watcher to trigger hot reloading
 * 
 * @param {ViteDevServer} server     Vite development server config object
 * @param {GlobPattern}   include    Glob pattern(s array) to import
 * @param {GlobPattern}   exclude    Glob pattern(s array) to ignore
 * @param {string}        configFile Vite configuration file path
 * 
 * @returns {function} Watcher cleanup callback on server shutdown
 */
export default function (
  server: ViteDevServer, include: GlobPattern, exclude: GlobPattern, configFile: string
): () => unknown;
