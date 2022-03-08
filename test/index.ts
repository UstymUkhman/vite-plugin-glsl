/// <reference types="./shaders" />
import shader from './glsl/main.frag';

const app = document.getElementById('app');

app.style.fontFamily = 'monospace';
app.style.whiteSpace = 'pre-wrap';
app.textContent = shader;
