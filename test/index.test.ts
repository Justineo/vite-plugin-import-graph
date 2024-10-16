import { execSync } from 'node:child_process'
import { existsSync, readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { build } from 'vite'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import importGraphPlugin from '../src/index'

const resolvePath = (path: string) => fileURLToPath(new URL(path, import.meta.url))

const projectRoot = resolvePath('fixtures/foo')
const outDir = join(projectRoot, 'dist')

beforeAll(() => {
  execSync('pnpm install', { cwd: projectRoot, stdio: 'inherit' })
})

afterAll(() => {
  rmSync(join(projectRoot, 'node_modules'), { recursive: true, force: true })
  rmSync(join(projectRoot, 'package-lock.json'), { force: true })
})

interface TestCase {
  description: string
  pluginOptions: Record<string, any>
  outputPath: string
  cleanupPath?: string
  customAssertion?: (graphJSON: string) => void
}

// Define your test cases
const testCases: TestCase[] = [
  {
    description: 'should handle default options correctly',
    pluginOptions: {},
    outputPath: join(projectRoot, 'import-graph.json'),
  },
  {
    description: 'should handle `absoluteModuleIds` correctly',
    pluginOptions: { absoluteModuleIds: true },
    outputPath: join(projectRoot, 'import-graph.json'),
    customAssertion: (graphJSON: string) => {
      const graph = JSON.parse(graphJSON)
      const indexKey = Object.keys(graph).find(id => id.endsWith('/index.html'))
      expect(indexKey).to.equal(join(projectRoot, 'index.html'))
    },
  },
  {
    description: 'should handle `filename` correctly',
    pluginOptions: { filename: 'foo/graph.json' },
    outputPath: join(projectRoot, 'foo/graph.json'),
    cleanupPath: join(projectRoot, 'foo'),
  },
  {
    description: 'should handle `usePrefix` correctly',
    pluginOptions: { usePrefix: true },
    outputPath: join(projectRoot, 'import-graph.json'),
  },
]

describe('basic functionalities', () => {
  for (const { description, pluginOptions, outputPath, cleanupPath, customAssertion } of testCases) {
    it(description, async () => {
      rmSync(cleanupPath || outputPath, { recursive: true, force: true })

      await build({
        root: projectRoot,
        build: {
          outDir,
          rollupOptions: {
            plugins: [importGraphPlugin(pluginOptions)],
          },
        },
      })

      expect(existsSync(outputPath)).toEqual(true)
      const graphJSON = readFileSync(outputPath, 'utf-8')

      if (!customAssertion) {
        expect(graphJSON).toMatchSnapshot()
      }
      else {
        customAssertion(graphJSON)
      }

      rmSync(cleanupPath || outputPath, { recursive: true, force: true })
      rmSync(outDir, { recursive: true, force: true })
    })
  }
})
