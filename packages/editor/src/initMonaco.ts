import "./__pre";
import * as monaco from "monaco-editor";
// @ts-ignore
self.MonacoEnvironment = {
  getWorker(_moduleId: string, label: string) {
    if (label === "json") {
      return new Worker("monaco-editor/esm/vs/language/json/json.worker", {
        type: "module",
      });
    }
    if (label === "css") {
      return new Worker("monaco-editor/esm/vs/language/css/css.worker", {
        type: "module",
      });
    }
    if (label === "html") {
      return new Worker("monaco-editor/esm/vs/language/html/html.worker", {
        type: "module",
      });
    }
    if (label === "typescript") {
      return new Worker("monaco-editor/esm/vs/language/typescript/ts.worker", {
        type: "module",
      });
    }
    return new Worker("monaco-editor/esm/vs/editor/editor.worker.js", {
      type: "module",
    });
  },
};

monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
  noSemanticValidation: true,
  noSyntaxValidation: true, // This line disables errors in jsx tags like <div>, etc.
});
const compilerOptions: monaco.languages.typescript.CompilerOptions = {
  allowJs: true,
  allowSyntheticDefaultImports: true,
  alwaysStrict: true,
  esModuleInterop: true,
  forceConsistentCasingInFileNames: true,
  isolatedModules: true,
  jsx: monaco.languages.typescript.JsxEmit.React,
  module: monaco.languages.typescript.ModuleKind.ESNext,
  moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
  noEmit: true,
  resolveJsonModule: true,
  strict: true,
  target: monaco.languages.typescript.ScriptTarget.ESNext,
  paths: {
    "*": ["*", "*.native", "*.ios", "*.android"],
  },
};

monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
  compilerOptions
);

const extraLib = `
"declare module '*';
`;

monaco.languages.typescript.typescriptDefaults.addExtraLib(
  extraLib,
  "decls.d.ts"
);
