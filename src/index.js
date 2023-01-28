/**
 * @module vite-plugin-glsl
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description Import, inline (and compress) GLSL shader files
 * @version 1.1.2
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
  let config = undefined;
  let server;
  const filter = createFilter(include, exclude);
  const prod = process.env.NODE_ENV === 'production';

  return {
    enforce: 'pre',
    name: 'vite-plugin-glsl',

    configureServer(_server) {
      server = _server;
    },

    configResolved (resolvedConfig) {
      config = resolvedConfig;
    },

    async transform (source, shader) {
      if (!filter(shader)) return;

      const result = loadShader(source, shader, {
        warnDuplicatedImports,
        defaultExtension,
        compress,
        root
      });

      // use shader path as id
      const id = shader;
      // flatten all recursive dependencies 
      const deps = Array.from(result.deps.values()).flat();

      // dev
      if (server) {
        // server only logic for handling GLSL #include dependency hmr
        const { moduleGraph } = server
        const thisModule = moduleGraph.getModuleById(id)
        if (thisModule) {
          const isSelfAccepting = true;
          if (deps) {
            // record deps in the module graph so edits to the #include file
            // can trigger main import to hot update
            const depModules = new Set();
            for (const file of deps) {
              depModules.add(moduleGraph.createFileOnlyEntry(file));
            }
            moduleGraph.updateModuleInfo(
              thisModule,
              depModules,
              null,
              // The root proxy module is self-accepting and should not
              // have an explicit accept list
              new Set(),
              null,
              isSelfAccepting,
              false,
            )
          } else {
            thisModule.isSelfAccepting = isSelfAccepting
          }
        }
      }

      return await transformWithEsbuild(
        result.code,
        shader, {
          sourcemap: config.build.sourcemap && 'external',
          loader: 'text', format: 'esm',
          minifyWhitespace: prod
        }
      );
    }
  };
}
