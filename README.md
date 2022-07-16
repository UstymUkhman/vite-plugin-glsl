# Vite Plugin GLSL #

> Import shader file chunks

![GitHub repo size](https://img.shields.io/github/repo-size/UstymUkhman/vite-plugin-glsl)
![GitHub package.json version](https://img.shields.io/github/package-json/v/UstymUkhman/vite-plugin-glsl?color=brightgreen)
![GitHub](https://img.shields.io/github/license/UstymUkhman/vite-plugin-glsl)

*Inspired by [threejs-glsl-loader](https://github.com/MONOGRID/threejs-glsl-loader#readme) and [vite-plugin-string](https://github.com/aweikalee/vite-plugin-string), compatible with [three.js](https://threejs.org/) and [lygia](https://github.com/patriciogonzalezvivo/lygia).*

## Installation ##

```sh
npm i vite-plugin-glsl --save-dev
# or
yarn add vite-plugin-glsl --dev
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

## Default Options ##

```js
glsl({
  exclude: undefined,                         // File paths/extensions to ignore
  include: /\.(glsl|wgsl|vert|frag|vs|fs)$/i, // File paths/extensions to import
  defaultExtension: 'glsl',                   // Shader suffix when no extension is specified
  warnDuplicatedImports: true,                // Warn if the same chunk was imported multiple times
  compress: false                             // Compress the resulting shader code
})
```

## What it does ##

Imports, inlines (and compresses) shader chunks within `GLSL` files relative to their directory.

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

- Starting from `v0.0.7` this plugin supports optional single and double quotation marks around file names.

- Starting from `v0.0.9` this plugin supports optional semicolons at the end of `#include` statements.

- Starting from `v0.1.0` this plugin supports WebGPU shaders with `.wgsl` extension.

- Starting from `v0.1.2` this plugin generates sourcemaps using vite esbuild when the `sourcemap` [option](https://github.com/UstymUkhman/vite-plugin-glsl/blob/main/vite.config.js#L5) is set to `true`.

- Starting from `v0.1.5` this plugin warns about duplicated chunks imports and throws an error when a recursive loop occurres.

- Starting from `v0.2.0` this plugin uses a config object as a single argument to `glsl` function and allows to disable import warnings with the `warnDuplicatedImports` param set to `false`.

- Starting from `v0.2.2` this plugin supports `compress` option to optimize output shader length. You might consider setting this to `true` in production environment.

- Starting from `v0.3.0` this plugin is pure [ESM](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules). Consider updating your project to an ESM module by adding `"type": "module"` in your `package.json` or consult [this](https://github.com/UstymUkhman/vite-plugin-glsl/issues/16) issue for possible workarounds.

**Note:** When used with [three.js](https://github.com/mrdoob/three.js) r0.99 and higher, it's possible to include shader chunks as specified in the [documentation](https://threejs.org/docs/index.html?q=Shader#api/en/materials/ShaderMaterial), those imports will be ignored by `vite-plugin-glsl` since they are handled internally by the library itself:

```glsl
precision highp float;

#include <common>

vec3 randomVec3 (const in vec2 uv) {
  return vec3(
    rand(uv * 0.1), rand(uv * 2.5), rand(uv)
  );
}
```
