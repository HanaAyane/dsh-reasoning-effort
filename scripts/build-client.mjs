import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const packageJson = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'))
const temporary = resolve(root, '.client-build', 'client.cjs')
const output = resolve(root, 'lib', 'client', 'index.js')

await mkdir(dirname(temporary), { recursive: true })
await mkdir(dirname(output), { recursive: true })

await build({
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
})

const compiled = await readFile(temporary, 'utf8')
const wrapped = `window.__ModuleLoader__.load({
  id: ${JSON.stringify(packageJson.name)},
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
${compiled}
    return module.exports;
  },
});
`

await writeFile(output, wrapped, 'utf8')
