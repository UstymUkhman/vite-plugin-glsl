const app = document.getElementById('app');

app.style.backgroundColor = '#222222';
app.style.fontFamily = 'monospace';
app.style.whiteSpace = 'pre-wrap';

app.style.color = '#bbbbbb';
app.style.padding = '16px';

const importShaders = () =>
  location.hash.slice(1) !== 'slang'
    ? Promise.all([import('./glsl/main.frag'), import('./wgsl/main.wgsl')])
      .then(([{ default: GLSL }, { default: WGSL }]) => {
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
      })
    : ~import('./slang/shader.slang').then(({ default: Slang }) => {
      console.info(`Slang Shader Length: ${Slang.length} characters.`);

      app.textContent += '----- Slang: -----\n\n';
      app.textContent += Slang;

      import.meta.hot?.accept('/test/slang/shader.slang', ({ default: slang }) => {
        console.clear();
        console.info('Slang Shader Hot Module Replacement.');
        console.info(`Slang Shader Length: ${slang.length} characters.`);

        app.textContent = '----- Slang: -----\n\n';
        app.textContent += slang;
      });
    });

~addEventListener('hashchange', importShaders)
  && importShaders();
