/**
 * @module vite-plugin-glsl
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description Import, inline (and compress) GLSL shader files
 * @version 1.3.3
 * @license MIT
 */

import { createFilter } from '@rollup/pluginutils';
import { transformWithEsbuild } from 'vite';
import loadShader from './loadShader.js';
import { spglslAngleCompile } from 'spglsl';

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
 * @param {import('./types').PluginOptions} options Plugin config object
 * 
 * @returns {import('vite').Plugin} Vite plugin that converts shader code
 */
export default function ({
    include = DEFAULT_SHADERS,
    exclude = undefined,
    warnDuplicatedImports = true,
    removeDuplicatedImports = false,
    defaultExtension = DEFAULT_EXTENSION,
    compress = false,
    watch = true,
    root = '/',
    spglslOptions = undefined
  } = {}
) {
  let sourcemap = false;
  const filter = createFilter(include, exclude);
  const prod = process.env.NODE_ENV === 'production';

  return {
    enforce: 'pre',
    name: 'vite-plugin-glsl',

    configResolved (resolvedConfig) {
      sourcemap = resolvedConfig.build.sourcemap;
    },

    async transform (source, shader) {
      if (!filter(shader)) return;

      const { dependentChunks, outputShader } = loadShader(source, shader, {
        removeDuplicatedImports,
        warnDuplicatedImports,
        defaultExtension,
        compress,
        root
      });

      let processedOutput = outputShader;
      const is_glsl = shader.endsWith("glsl") || shader.endsWith("vert") || shader.endsWith("frag");
      if (is_glsl && spglslOptions) {
        const spglslOutput = await spglslAngleCompile({
          compileMode: "Optimize",
          mangle: spglslOptions.mangle,
          mainSourceCode: outputShader,
          minify: spglslOptions.minify,
          optimize: spglslOptions.optimize
        });
        processedOutput = spglslOutput.output;
      }

      watch && !prod && Array.from(dependentChunks.values())
        .flat().forEach(chunk => this.addWatchFile(chunk));

      return await transformWithEsbuild(processedOutput, shader, {
        sourcemap: sourcemap && 'external',
        loader: 'text', format: 'esm',
        minifyWhitespace: prod
      });
    }
  };
}
