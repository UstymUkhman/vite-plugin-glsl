/**
 * @module vite-plugin-glsl
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description Import, inline (and compress) GLSL shader files
 * @version 1.2.1
 * @license MIT
 */

import { createFilter } from '@rollup/pluginutils';
import { transformWithEsbuild } from 'vite';
import loadShader from './loadShader.js';

/**
 * @const
 * @default
 * @readonly
 * @type {string}
 */
const DEFAULT_EXTENSION = 'glsl';

/**
 * @const
 * @default
 * @readonly
 * @type {readonly RegExp[]}
 */
const DEFAULT_SHADERS = Object.freeze([
  '**/*.glsl', '**/*.wgsl',
  '**/*.vert', '**/*.frag',
  '**/*.vs', '**/*.fs'
]);

/**
 * @function
 * @name glsl
 * @description Plugin entry point to import,
 * inline, (and compress) GLSL shader files
 * 
 * @see {@link https://vitejs.dev/guide/api-plugin.html}
 * @link https://github.com/UstymUkhman/vite-plugin-glsl
 * 
 * @param {PluginOptions} options Plugin config object
 * 
 * @returns {Plugin} Vite plugin that converts shader code
 */
export default function ({
    include = DEFAULT_SHADERS,
    exclude = undefined,
    warnDuplicatedImports = true,
    defaultExtension = DEFAULT_EXTENSION,
    compress = false,
    watch = true,
    root = '/'
  } = {}
) {
  let server = undefined, config = undefined;
  const filter = createFilter(include, exclude);
  const prod = process.env.NODE_ENV === 'production';

  return {
    enforce: 'pre',
    name: 'vite-plugin-glsl',

    configureServer (devServer) {
      server = devServer;
    },

    configResolved (resolvedConfig) {
      config = resolvedConfig;
    },

    async transform (source, shader) {
      if (!filter(shader)) return;

      const { dependentChunks, outputShader } = loadShader(source, shader, {
        warnDuplicatedImports,
        defaultExtension,
        compress,
        root
      });

      const { moduleGraph } = server ?? {};
      const module = moduleGraph?.getModuleById(shader);
      const chunks = Array.from(dependentChunks.values()).flat();

      if (watch && module && !prod) {
        if (!chunks.length) module.isSelfAccepting = true;

        else {
          const imported = new Set();

          chunks.forEach(chunk => imported.add(
            moduleGraph.createFileOnlyEntry(chunk)
          ));

          moduleGraph.updateModuleInfo(
            module, imported, null,
            new Set(), null, true
          );
        }
      }

      return await transformWithEsbuild(outputShader, shader, {
        sourcemap: config.build.sourcemap && 'external',
        loader: 'text', format: 'esm',
        minifyWhitespace: prod
      });
    }
  };
}
