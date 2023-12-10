#include './chunk2.wgsl';
#include "../chunk3.wgsl";

fn chunkRGB() -> vec3f {
  return vec3f(chunkRed(), chunkGreen(), 0.0);
}
