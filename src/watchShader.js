import { createFilter } from '@rollup/pluginutils';
import { utimes } from 'fs';

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
 * @returns {function} Watcher cleanup on server shutdown
 */
export default function (server, include, exclude, configFile) {
  const filter = createFilter(include, exclude);

  server.watcher.add(include);

  server.watcher.on('change', file => {
    if (!filter(file)) return;
    const now = Date.now() / 1e3;
    utimes(configFile, now, now, () => void 0);
  });

  return () => server.watcher.unwatch(include);
}
