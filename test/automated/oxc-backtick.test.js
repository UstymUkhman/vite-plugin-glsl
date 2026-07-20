import test from 'node:test';
import assert from 'node:assert/strict';
import glsl from '../../src/index.js';

/**
 * Shader source passed to `transformWithOxc` (Vite >= 7) must not contain
 * unescaped backticks, since the plugin wraps it in a JS template literal.
 * A stray backtick (e.g. from an incompletely stripped comment) would
 * close that literal early and break the build with a PARSE_ERROR.
 */
test('transform does not throw when a non-first block comment contains a backtick', async () => {
  const plugin = await glsl();
  plugin.configResolved({ build: { sourcemap: false } });

  const source = [
    'precision highp float;',
    '',
    '/**',
    ' * First comment block (no backticks here).',
    ' */',
    'uniform float foo;',
    '',
    '/**',
    ' * Second comment block referencing `localId` and `globalId`.',
    ' */',
    'void main() {',
    '  gl_FragColor = vec4(1.0);',
    '}',
    ''
  ].join('\n');

  const context = { addWatchFile () {} };

  const result = await plugin.transform.handler.call(context, source, '/virtual/shader.frag');

  assert.ok(result, 'transform should return a result');
  const code = typeof result === 'string' ? result : result.code;
  assert.match(code, /export default/, 'output should export the shader source');
});
