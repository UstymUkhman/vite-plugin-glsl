/// <reference types="./shaders" />
import shader from './glsl/main.frag';

const app = document.getElementById('app');
app.style.whiteSpace = 'pre-wrap';
app.textContent = shader;
