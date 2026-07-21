import test from 'node:test';
import assert from 'node:assert/strict';
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
