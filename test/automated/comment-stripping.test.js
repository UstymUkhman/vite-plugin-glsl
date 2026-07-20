import test from 'node:test';
import assert from 'node:assert/strict';
import loadShader from '../../src/loadShader.js';

/**
 * All block comments must be stripped from shader output, not just the
 * first one. Any that leak through can carry backticks, breaking the
 * `transformWithOxc` path (see oxc-backtick.test.js), and can also hide
 * `#include` directives or code from later chunk-import parsing.
 */
test('loadShader removes every block comment, not just the first one', async () => {
  const source = [
    'precision highp float;',
    '',
    '/**',
    ' * First comment block.',
    ' */',
    'uniform float foo;',
    '',
    '/**',
    ' * Second comment block that should ALSO be removed.',
    ' */',
    'void main() {',
    '  gl_FragColor = vec4(1.0);',
    '}',
    ''
  ].join('\n');

  const { outputShader } = await loadShader(source, '/virtual/shader.frag', {
    removeDuplicatedImports: false,
    warnDuplicatedImports: true,
    defaultExtension: 'glsl',
    importKeywords: ['#include'],
    onComplete: undefined,
    minify: false,
    root: '/'
  });

  assert.doesNotMatch(
    outputShader, /First comment block/,
    'the first block comment should be removed'
  );

  assert.doesNotMatch(
    outputShader, /Second comment block/,
    'the second (and any subsequent) block comment should also be removed'
  );
});
