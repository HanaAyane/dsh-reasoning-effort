import { readFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
import ts from 'typescript'

const runtimeFiles = [
  new URL('../src/client/index.tsx', import.meta.url),
  new URL('../src/index.ts', import.meta.url),
  new URL('../src/knowledge.ts', import.meta.url),
]

const hardcodedCopy = [
  /\p{Script=Han}/u,
  /['"`](?:Reasoning effort|Select model|Loading models|No models available|Content to paste|Copy field block)/u,
]

const violations = []
for (const file of runtimeFiles) {
  const source = await readFile(file, 'utf8')
  const lines = source.split(/\r?\n/u)
  for (const [index, line] of lines.entries()) {
    if (hardcodedCopy.some((pattern) => pattern.test(line))) {
      violations.push(`${file.pathname}:${index + 1}: ${line.trim()}`)
    }
  }
}

if (violations.length > 0) {
  throw new Error(`Runtime product copy must live in src/client/locales.ts:\n${violations.join('\n')}`)
}

const localesFile = new URL('../src/client/locales.ts', import.meta.url)
const localesSource = await readFile(localesFile, 'utf8')
const transpiled = ts.transpileModule(localesSource, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  fileName: localesFile.pathname,
}).outputText
const localeModule = await import(`data:text/javascript;base64,${Buffer.from(transpiled).toString('base64')}`)
const { en, zh } = localeModule

assert.deepEqual(Object.keys(en).sort(), Object.keys(zh).sort(), 'English and Chinese keys must match')
for (const key of Object.keys(zh)) {
  const placeholders = (text) => [...text.matchAll(/\{([A-Za-z][A-Za-z0-9]*)\}/gu)]
    .map((match) => match[1])
    .sort()
  assert.deepEqual(placeholders(en[key]), placeholders(zh[key]), `${key} placeholders must match`)
}

console.log('Runtime product copy is locale-owned and both dictionaries match.')
