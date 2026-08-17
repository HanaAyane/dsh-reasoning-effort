/**
 * Build script for the DSH client bundle.
 * 
 * > 🤖 AI-assisted notice: This project includes modifications reviewed and
 * >   refined with AI assistance. The macOS compatibility adaptations
 * >   (documentation, build verification) were AI-assisted.
 * >   本项目的 macOS 适配修改由 AI 辅助完成。
 * > （是 DeepSeek 写的喵～支持 DeepSeek Harenss 喵～）
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build, context } from 'esbuild'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const packageJson = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'))
const temporary = resolve(root, '.client-build', 'client.cjs')
const output = resolve(root, 'lib', 'client', 'index.js')

await mkdir(dirname(temporary), { recursive: true })
await mkdir(dirname(output), { recursive: true })

const wrap = (compiled) => `window.__ModuleLoader__.load({
  id: ${JSON.stringify(packageJson.name)},
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
${compiled}
    return module.exports;
  },
});
`

/** After every esbuild emit, rewrite lib/client/index.js with the loader wrapper. */
const wrapPlugin = {
  name: 'wrap-module-loader',
  setup(buildApi) {
    buildApi.onEnd(async (result) => {
      if (result.errors.length > 0) return
      const compiled = await readFile(temporary, 'utf8')
      await writeFile(output, wrap(compiled), 'utf8')
    })
  },
}

const common = {
  entryPoints: [resolve(root, 'src', 'client', 'index.tsx')],
  outfile: temporary,
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: 'es2022',
  jsx: 'automatic',
  sourcemap: false,
  legalComments: 'none',
  loader: {
    '.png': 'dataurl',
  },
  external: [
    'react',
    'react/jsx-runtime',
    '@deepseek-ai/*',
  ],
  plugins: [wrapPlugin],
}

if (process.argv.includes('--watch')) {
  const ctx = await context(common)
  await ctx.rebuild()
  await ctx.watch()
  console.log('watching src/client → lib/client/index.js (wrapped)')
} else {
  await build(common)
}
