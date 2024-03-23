#version 300 es

#ifndef GL_FRAGMENT_PRECISION_HIGH
	precision mediump float;
#else
	precision highp float;
#endif

out vec4 fragColor;

#include /test/glsl/chunk0.frag

void main (void) {
  fragColor = chunkFn();
}
