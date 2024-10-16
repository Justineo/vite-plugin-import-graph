import type { Plugin } from 'vite'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'

const PLUGIN_NAME = 'vite-plugin-import-graph'
const DEFAULT_FILENAME = 'import-graph.json'

interface PluginOptions {
  /**
   * The filename to write the import graph into.
   *
   * Relative paths are resolved from project root.
   *
   * @default 'import-graph.json'
   */
  filename?: string

  /**
   * Whether to output module IDs as absolute paths in the import graph.
   *
   * By default, module IDs are relative to project root.
   *
   * @default false
   */
  absoluteModuleIds?: boolean

  /**
   * Whether to add prefixes to virtual modules or npm packages.
   *
   * @default false
   */
  usePrefix?: boolean
}

function normalizeId(id: string, base?: string, prefix?: boolean): string {
  const [cleanId] = id.split('?')

  // Extract package name from paths containing 'node_modules'
  const index = id.lastIndexOf('node_modules/')
  if (index !== -1) {
    const packagePath = id.slice(index + 'node_modules/'.length)
    const segments = packagePath.split('/')

    // Handle scoped packages
    const packageName = segments[0][0] === '@' ? segments.slice(0, 2).join('/') : segments[0]
    return prefix ? `npm:${packageName}` : packageName
  }

  return cleanId[0] === '\0'
    ? prefix
      ? `virtual:${cleanId.slice(1)}`
      : cleanId
    : base
      ? `/${relative(base, cleanId)}`
      : cleanId
}

export default function (options: PluginOptions = {}): Plugin {
  const { filename = DEFAULT_FILENAME, absoluteModuleIds = false, usePrefix = false } = options

  let base: string
  let output: string

  const importGraph = new Map<string, Set<string>>()

  return {
    name: 'import-graph',

    configResolved({ root }) {
      base = root
      output = resolve(root, filename)
    },

    moduleParsed({ id, importedIds, dynamicallyImportedIds }) {
      const normalizedId = normalizeId(id, absoluteModuleIds ? undefined : base, usePrefix)
      let imports = importGraph.get(normalizedId)
      if (!imports) {
        importGraph.set(normalizedId, (imports = new Set()))
      }

      for (const importedId of [...importedIds, ...dynamicallyImportedIds]) {
        const normalizedImportedId = normalizeId(importedId, absoluteModuleIds ? undefined : base, usePrefix)
        if (normalizedImportedId !== normalizedId) {
          imports.add(normalizedImportedId)
        }
      }
    },

    buildEnd() {
      // Convert the import graph to a serializable format
      const graphObject: Record<string, string[]> = {}
      for (const [id, imports] of importGraph) {
        graphObject[id] = [...imports].sort() // Sort the imports for each module
      }

      // Sort the graphObject by keys
      const sortedGraphObject = Object.keys(graphObject)
        .sort()
        .reduce((acc, key) => {
          acc[key] = graphObject[key]
          return acc
        }, {} as Record<string, string[]>)

      // Output the import graph
      const dir = dirname(output)
      mkdirSync(dir, { recursive: true })
      writeFileSync(output, JSON.stringify(sortedGraphObject, null, 2), 'utf-8')

      // eslint-disable-next-line no-console
      console.log(
        `[${PLUGIN_NAME}] Import graph has been written to \`${filename}\``,
      )
    },
  }
}
