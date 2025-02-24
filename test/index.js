import GLSL from './glsl/main.frag';
import WGSL from './wgsl/main.wgsl';

const app = document.getElementById('app');

app.style.backgroundColor = '#222222';
app.style.fontFamily = 'monospace';
app.style.whiteSpace = 'pre-wrap';

app.style.color = '#bbbbbb';
app.style.padding = '16px';

app.textContent += '----- GLSL: -----\n\n';
app.textContent += GLSL;

app.textContent += '\n\n----- WGSL: -----\n\n';
app.textContent += WGSL;

console.info(`GLSL Shader Length: ${GLSL.length} characters.`);
console.info(`WGSL Shader Length: ${WGSL.length} characters.`);

if (import.meta.hot) {
  import.meta.hot.accept('/test/glsl/main.frag', ({ default: glsl }) => {
    console.clear();
    console.info('GLSL Shader Hot Module Replacement.');
    console.info(`GLSL Shader Length: ${glsl.length} characters.`);

    app.textContent = '----- GLSL: -----\n\n';
    app.textContent += glsl;
  });

  import.meta.hot.accept('/test/wgsl/main.wgsl', ({ default: wgsl }) => {
    console.clear();
    console.info('WGSL Shader Hot Module Replacement.');
    console.info(`WGSL Shader Length: ${wgsl.length} characters.`);

    app.textContent = '----- WGSL: -----\n\n';
    app.textContent += wgsl;
  });
}
