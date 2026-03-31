const error = ({  type, message  }) =>
  console.error(`${type} error:`, message);

import Slang from './slang-wasm.js';

const slang = await Slang();
const globalSession = slang.createGlobalSession();

const target = slang.getCompileTargets().find(
  // 'GLSL' target is also supported, but output
  // version is 4.5, which is not valid on the web.
  ({ name }) => name === 'WGSL'
)?.value;

export default {
  include: ['**/*.slang'],
  importKeyword: 'import',
  defaultExtension: 'slang',

  minify: async (shader, session) => {
    session = globalSession.createSession(target);

    const module = session.loadModuleFromSource(
      shader, 'main', './test/slang/main.slang'
    );

    !module && error(slang.getLastError());

    const modules = Array.from({ length: module.getDefinedEntryPointCount() }).map((_, ep) => {
      const componentType = session.createCompositeComponentType(
        [module.getDefinedEntryPoint(ep), 1]
      );

      const { name, stage } = componentType.getLayout(0).toJsonObject().entryPoints[0];
      const stageId = stage === 'vertex' ? 1 : stage === 'fragment' ? 5 : 6;

      return module.findAndCheckEntryPoint(name, stageId);
    });

    modules.unshift(module);

    shader = session.createCompositeComponentType(modules).link().getTargetCode(0);

    !shader.length && error(slang.getLastError());

    return shader;
  }
};
