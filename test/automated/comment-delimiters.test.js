import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import loadShader from '../../src/loadShader.js';

// Comment delimiters must be interpreted in lexical context. In particular,
// a */ inside a line comment must not close a later block comment.
test('loadShader ignores block-comment delimiters inside line comments', async () => {
  const source = [
    '// */',
    '',
    '/* block comment */',
    'void main() {}'
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

  assert.equal(outputShader, 'void main() {}');
});

test('loadShader rejects unterminated block comments', async () => {
  const source = [
    'precision highp float;',
    '',
    '/* unterminated comment',
    'void main() {}'
  ].join('\n');

  await assert.rejects(loadShader(source, '/virtual/shader.frag', {
    removeDuplicatedImports: false,
    warnDuplicatedImports: true,
    defaultExtension: 'glsl',
    importKeywords: ['#include'],
    onComplete: undefined,
    minify: false,
    root: '/'
  }));
});

test('loadShader only removes triple-slash comments containing imports', async () => {
  const source = [
    '#include chunk3.frag /// preserved documentation',
    '/// #include missing.frag',
    'void main() {}'
  ].join('\n');
  // Provide a properly formatted path so that chunk3.frag will resolve correctly
  const shader = fileURLToPath(new URL('../glsl/main.frag', import.meta.url));

  const { outputShader } = await loadShader(source, shader, {
    removeDuplicatedImports: false,
    warnDuplicatedImports: true,
    defaultExtension: 'glsl',
    importKeywords: ['#include'],
    onComplete: undefined,
    minify: false,
    root: '/'
  });

  assert.match(outputShader, /\/\/\/ preserved documentation/);
  assert.doesNotMatch(outputShader, /missing\.frag/);
});
