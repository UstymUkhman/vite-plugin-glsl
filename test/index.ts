/// <reference types="./shaders" />
import shader from './glsl/main.frag';

const app = document.getElementById('app') as HTMLElement;

app.style.fontFamily = 'monospace';
app.style.whiteSpace = 'pre-wrap';
app.textContent = shader;
