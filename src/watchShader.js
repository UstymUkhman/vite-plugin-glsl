import { createFilter } from '@rollup/pluginutils';
import { utimes } from 'fs';

function debounce (cb, delay = 500, leading = true) {
  let timeout;

  return () => {
    clearTimeout(timeout);
    if (leading && !timeout) cb();
    timeout = setTimeout(cb, delay);
  };
};

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
export default function (server, include, exclude, configFile) {
  const updateTimestamp = debounce((now = Date.now() / 1e3) =>
    utimes(configFile, now, now, () => {})
  );

  const filter = createFilter(include, exclude);

  server.watcher.add(include);

  server.watcher.on('change', file => {
    if (!filter(file)) return;
    updateTimestamp();
  });

  return () => server.watcher.unwatch(include);
}
