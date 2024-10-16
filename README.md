# vite-plugin-import-graph

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

A Vite plugin that records your project's module import graph in a JSON file.

## Usage

1. npm install

  ```bash
  npm i -D vite-plugin-import-graph # pnpm add -D vite-plugin-import-graph
  ```

2. Add to your `vite.config.js` or `vite.config.ts`:

  ```ts
  // vite.config.ts
  import { defineConfig } from 'vite'
  import importGraph from 'vite-plugin-import-graph'

  export default defineConfig({
    plugins: [
      importGraph({
        filename: 'import-graph.json',
        absoluteModuleIds: false,
        usePrefix: false,
      })
    ]
  })
  ```

## Options

- `filename` (default: `'import-graph.json'`): The filename to write the import graph into. Relative paths are resolved from project root.
- `absoluteModuleIds` (default: `false`): Whether to output module IDs as absolute paths in the import graph. By default, module IDs are relative to project root.
- `usePrefix` (default: `false`): Whether to add prefixes to virtual modules or npm packages. Currently supported prefixes:

  - `npm:`: npm packages
  - `virtual:`: virtual modules

## Output

The import graph is written to the specified file in JSON format. The keys are module IDs and the values are arrays of imported module IDs.

```json
{
  "/src/main.ts": [
    "/src/foo.ts",
    "/src/bar.ts"
  ],
  "/src/foo.ts": [
    "/src/bar.ts",
    "lodash"
  ],
  "/src/bar.ts": [],
  "lodash": []
}
```

## License

[MIT](./LICENSE) License © 2024-Present [GU Yiling](https://github.com/Justineo)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/vite-plugin-import-graph?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/vite-plugin-import-graph
[npm-downloads-src]: https://img.shields.io/npm/dm/vite-plugin-import-graph?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/vite-plugin-import-graph
[bundle-src]: https://img.shields.io/bundlephobia/minzip/vite-plugin-import-graph?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=vite-plugin-import-graph
[license-src]: https://img.shields.io/github/license/Justineo/vite-plugin-import-graph.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/Justineo/vite-plugin-import-graph/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/vite-plugin-import-graph
