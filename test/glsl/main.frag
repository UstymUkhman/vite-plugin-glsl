precision highp float;

#include /test/glsl/chunk0.frag

out highp vec4 fragColor;

/*
* multilines comments
*/

// one line comment

void main (void) {
  fragColor = chunkFn();
}
