import type { ViteDevServer } from 'vite';
import type { FilterPattern } from '@rollup/pluginutils';

/**
 * @function
 * @since 0.5.0
 * @name watchShader
 * @description Adds included chunk files extensions
 * to the internal chokidar watcher to trigger hot reloading
 * 
 * @param {ViteDevServer} server     Vite development server config object
 * @param {FilterPattern} include    File paths/extensions to import
 * @param {FilterPattern} exclude    File paths/extensions to ignore
 * @param {string}        configFile Vite configuration file path
 * 
 * @returns {function} Watcher cleanup callback on server shutdown
 */
export default function (
  server: ViteDevServer, include: FilterPattern, exclude: FilterPattern, configFile: string
): () => unknown;
