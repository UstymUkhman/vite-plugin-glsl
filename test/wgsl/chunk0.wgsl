#include utils/chunk1.wgsl;

fn chunkFn() -> vec4f {
  return vec4f(chunkRGB(), 1.0);
}
