# Vite Plugin GLSL #

> Import, inline (and compress) GLSL shader files

![npm](https://img.shields.io/npm/dt/vite-plugin-glsl?style=flat-square)
![GitHub package.json version](https://img.shields.io/github/package-json/v/UstymUkhman/vite-plugin-glsl?color=brightgreen&style=flat-square)
![GitHub](https://img.shields.io/github/license/UstymUkhman/vite-plugin-glsl?color=brightgreen&style=flat-square)

_Inspired by [threejs-glsl-loader](https://github.com/MONOGRID/threejs-glsl-loader) and [vite-plugin-string](https://github.com/aweikalee/vite-plugin-string), compatible with [Babylon.js](https://www.babylonjs.com/), [three.js](https://threejs.org/) and [lygia](https://github.com/patriciogonzalezvivo/lygia)._

## Installation ##

```sh
npm i vite-plugin-glsl --save-dev
# or
yarn add vite-plugin-glsl --dev
# or
pnpm add -D vite-plugin-glsl
```

## Usage ##

```js
// vite.config.js
import glsl from 'vite-plugin-glsl';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [glsl()]
});
```

### With TypeScript ###

Add extension declarations to your [`types`](https://www.typescriptlang.org/tsconfig#types) in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": [
      "vite-plugin-glsl/ext"
    ]
  }
}
```

or as a [package dependency directive](https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html#-reference-types-) to your global types:

```ts
/// <reference types="vite-plugin-glsl/ext" />
```

## Default Options ##

```js
glsl({
  include: [                   // Glob pattern, or array of glob patterns to import
    '**/*.glsl', '**/*.wgsl',
    '**/*.vert', '**/*.frag',
    '**/*.vs', '**/*.fs'
  ],
  exclude: undefined,          // Glob pattern, or array of glob patterns to ignore
  warnDuplicatedImports: true, // Warn if the same chunk was imported multiple times
  defaultExtension: 'glsl',    // Shader suffix when no extension is specified
  compress: false,             // Compress output shader code
  watch: true,                 // Recompile shader on change
  root: '/'                    // Directory for root imports
})
```

### Example ###

```
root
├── src/
│   ├── glsl/
│   │   ├── chunk0.frag
│   │   ├── chunk3.frag
│   │   ├── main.frag
│   │   ├── main.vert
│   │   └── utils/
│   │       ├── chunk1.glsl
│   │       └── chunk2.frag
│   └── main.js
├── vite.config.js
└── package.json
```

```js
// main.js
import fragment from './glsl/main.frag';
```

```glsl
// main.frag
precision highp float;

#include chunk0.frag;

out highp vec4 fragColor;

void main (void) {
  fragColor = chunkFn();
}
```

```glsl
// chunk0.frag

// ".glsl" extension will be added automatically:
#include utils/chunk1;

highp vec4 chunkFn () {
  return vec4(chunkRGB(), 1.0);
}
```

```glsl
// utils/chunk1.glsl

#include chunk2.frag;
#include ../chunk3.frag;

highp vec3 chunkRGB () {
  return vec3(chunkRed(), chunkGreen(), 0.0);
}
```

```glsl
// utils/chunk2.frag

highp float chunkRed () {
  return 0.0;
}
```

```glsl
// chunk3.frag

highp float chunkGreen () {
  return 0.8;
}
```

Will result in:

```glsl
// main.frag
precision highp float;

highp float chunkRed () {
  return 0.0;
}

highp float chunkGreen () {
  return 0.8;
}

highp vec3 chunkRGB () {
  return vec3(chunkRed(), chunkGreen(), 0.0);
}

highp vec4 chunkFn () {
  return vec4(chunkRGB(), 1.0);
}

out highp vec4 fragColor;

void main (void) {
  fragColor = chunkFn();
}
```

## Change Log ##

- Starting from `v1.2.0` this plugin is fully compatible with `vite^5.0.0`.

- Starting from `v1.1.1` this plugin has a complete TypeScript support. Check "Usage" > "With TypeScript" for more info.

- Starting from `v1.0.0` this plugin is fully compatible with `vite^4.0.0`.

- Starting from `v0.5.4` this plugin supports custom `compress` callback function to optimize output shader length after all shader chunks have been included.

- Starting from `v0.5.0` this plugin supports shaders hot reloading when `watch` option is set to `true`.

- Starting from `v0.4.0` this plugin supports chunk imports from project root and `root` option to override the default root directory.

- Starting from `v0.3.0` this plugin is pure [ESM](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules). Consider updating your project to an ESM module by adding `"type": "module"` in your `package.json` or consult [this](https://github.com/UstymUkhman/vite-plugin-glsl/issues/16) issue for possible workarounds.

- Starting from `v0.2.2` this plugin supports `compress` option to optimize output shader length. You might consider setting this to `true` in production environment.

- Starting from `v0.2.0` this plugin uses a config object as a single argument to `glsl` function and allows to disable import warnings with the `warnDuplicatedImports` param set to `false`.

- Starting from `v0.1.5` this plugin warns about duplicated chunks imports and throws an error when a recursive loop occurres.

- Starting from `v0.1.2` this plugin generates sourcemaps using vite esbuild when the `sourcemap` [option](https://github.com/UstymUkhman/vite-plugin-glsl/blob/main/vite.config.js#L5) is set to `true`.

- Starting from `v0.1.0` this plugin supports WebGPU shaders with `.wgsl` extension.

- Starting from `v0.0.9` this plugin supports optional semicolons at the end of `#include` statements.

- Starting from `v0.0.7` this plugin supports optional single and double quotation marks around file names.

### Note: ###

When used with [three.js](https://github.com/mrdoob/three.js) r0.99 and higher, it's possible to include shader chunks as specified in the [documentation](https://threejs.org/docs/index.html?q=Shader#api/en/materials/ShaderMaterial), those imports will be ignored by `vite-plugin-glsl` since they are handled internally by the library itself:

```glsl
precision highp float;

#include <common>

vec3 randVec3 (const in vec2 uv) {
  return vec3(
    rand(uv * 0.1), rand(uv * 2.5), rand(uv)
  );
}
```
