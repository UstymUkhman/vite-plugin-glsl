/// <reference types="./shaders" />
import shader from './glsl/main.frag';

const app = document.getElementById('app') as HTMLElement;

app.style.backgroundColor = '#222';
app.style.fontFamily = 'monospace';
app.style.whiteSpace = 'pre-wrap';

app.style.padding = '16px';
app.style.color = '#bbb';
app.textContent = shader;
