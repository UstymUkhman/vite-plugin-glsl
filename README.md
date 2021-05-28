# Vite Plugin GLSL #

> Import shader file chunks

*Inspired by [threejs-glsl-loader](https://github.com/MONOGRID/threejs-glsl-loader#readme) and [vite-plugin-string](https://github.com/aweikalee/vite-plugin-string).*

## Installation ##

```sh
npm install vite-plugin-glsl --save-dev
# or
yarn add vite-plugin-glsl --dev
```

## Usage ##

```ts
// vite.config.js
import glsl from 'vite-plugin-glsl';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [glsl()]
});
```

## Default Options ##

```ts
glsl(
  exclude = undefined,                    // RegExp | RegExp[] of file paths/extentions to ignore
  include = /\.(vs|fs|vert|frag|glsl)$/i, // RegExp | RegExp[] of file paths/extentions to import
  defaultExtension = 'glsl'               // Shader import suffix when no extension is specified
)
```

## What it does ##

Recursively imports and inlines shader chunks
within `GLSL` files relative to its directory.

### Example ###

```
project-folder
├── src/
│   ├── glsl/
│   │   ├── chunk0.frag
│   │   ├── chunk3.frag
│   │   ├── main.frag
│   │   ├── main.vert
│   │   └── utils/
│   │       ├── chunk1.glsl
│   │       └── chunk2.frag
│   └── main.ts
├── vite.config.js
└── package.json
```

```ts
// main.ts
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

#include utils/chunk1; // vite-plugin-glsl will automatically add ".glsl" extension

highp vec4 chunkFn () {
  return vec4(chunkRGB(), 1.0);
}
```

```glsl
// utils/chunk1.glsl

// We're in "utils" directory now
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

**Note:** When used with [three.js](https://github.com/mrdoob/three.js) r0.99 and higher, it's possible to include shader chunks as specified in the documentation,
and those imports will be ignored by `vite-plugin-glsl` since they are handled internally by the library itself:

```glsl
precision highp float;

#include <common>

vec3 randomVec3 (const in vec2 uv) {
  return vec3(
    rand(uv * 0.1), rand(uv * 2.5), rand(uv)
  );
}
```
