precision highp float;

#include /test/glsl/chunk0.frag

out highp vec4 fragColor;

void main (void) {
  fragColor = chunkFn();
}
