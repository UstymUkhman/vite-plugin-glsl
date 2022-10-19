import { createFilter } from '@rollup/pluginutils';
import { utimes } from 'fs';

/**
 * @const
 * @name delay
 * @type {number}
 * 
 * @description Minimal delay
 * between saving the same file
 */
const delay = 500.0;

/**
 * @function
 * @since 0.5.2
 * @name debounce
 * @description Delays invoking the callback function until
 * after "delay" time have elapsed since the last function call
 * 
 * @param {function} cb    Callback function to invoke
 * @param {boolean}  first Forces the function to be invoked immediately
 * 
 * @returns {function} Debounced function that invoke the callback
 */
function debounce (cb, first) {
  let timeout;

  return (...args) => {
    first && !timeout && cb(...args);

    if (!first) {
      clearTimeout(timeout);
      timeout = setTimeout(() => cb(...args), delay);
    }
  };
}

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
export default function (server, include, exclude, configFile) {
  let lastUpdate = Date.now();

  const filter = createFilter(include, exclude);

  const updateTimestamp = (now = Date.now()) =>
    debounce((now, ts = now / 1e3) =>
      utimes(configFile, ts, ts, () => lastUpdate = now)
    , now - delay > lastUpdate)(now);

  server.watcher.add(include);

  server.watcher.on('change', file =>
    filter(file) && updateTimestamp()
  );

  return () => server.watcher.unwatch(include);
}
