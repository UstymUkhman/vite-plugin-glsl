#include 'chunk2.frag';
@import ../chunk3.frag;

highp vec3 chunkRGB () {
  return vec3(chunkRed(), chunkGreen(), 0.0);
}
