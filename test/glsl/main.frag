precision highp float;

#include chunk0.frag;

out highp vec4 fragColor;

void main (void) {
  fragColor = chunkFn();
}
