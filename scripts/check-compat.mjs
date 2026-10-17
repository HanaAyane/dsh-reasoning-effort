import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from 'esbuild'
import React from 'react'
import TestRenderer, { act } from 'react-test-renderer'

const root = resolve(import.meta.dirname, '..')
const temporary = resolve(root, '.client-build/tests')
await mkdir(temporary, { recursive: true })
async function compile(name, entry, extra = '') {
  const outfile = resolve(temporary, `${name}.mjs`)
  await build({
    stdin: { contents: await readFile(resolve(root, entry), 'utf8') + extra, resolveDir: resolve(root, entry, '..'), loader: entry.endsWith('tsx') ? 'tsx' : 'ts' },
    outfile, bundle: true, platform: 'node', format: 'esm', jsx: 'automatic',
    external: ['react', 'react/jsx-runtime'], loader: { '.md': 'text', '.png': 'dataurl' },
  })
  return import(pathToFileURL(outfile))
}
globalThis.window = { localStorage: { getItem: () => null } }
const host = await compile('host', 'src/index.ts')
const client = await compile('client', 'src/client/index.tsx', '\nexport { AdvancedModelSelect, makeAdaptationService };')

async function diagnose(declaration, levels, model = 'custom-model') {
  let route
  const entry = { id: model, ...(declaration === undefined ? {} : { reasoningEfforts: declaration }) }
  const services = {
    settings: { describe: () => [{ ns: 'llm-pi-ai', user: { providers: { custom: { models: [entry] } } } }], prepareDocument: async () => '/example/cordis.yml' },
    llm: { resolveModelInfo: async () => ({ reasoning: { efforts: levels.map(id => ({ id, name: id })) } }) },
    connection: { requestRejection: () => undefined },
    webServer: { register: value => { route = value; return () => {} } },
  }
  const ctx = { get: name => services[name], inject: (_, callback) => callback(ctx), effect: callback => callback() }
  host.apply(ctx)
  const handlers = {}
  let response
  const pending = route.handler({ method: 'POST', url: '/dsh-reasoning-effort/diagnose', headers: { 'content-type': 'application/json' }, on: (name, callback) => { handlers[name] = callback } }, {
    writeHead: code => assert.equal(code, 200), end: body => { response = JSON.parse(body).result.value },
  })
  handlers.data(Buffer.from(JSON.stringify({ type: 'client-request', rpcId: 'test', method: 'diagnose', payload: { provider: 'custom', model } })))
  handlers.end()
  await pending
  return response
}

test('explicitly disabled reasoning is not a missing declaration', async () => {
  assert.equal((await diagnose(false, [])).needsGuide, false)
})
test('custom level declarations are authoritative', async () => {
  assert.equal((await diagnose({ high: 'deep' }, ['high'], 'glm-5.2')).needsGuide, false)
})
test('undeclared reasoning still offers optional guidance', async () => {
  assert.equal((await diagnose(undefined, [])).needsGuide, true)
})

function store(initial) {
  let value = initial
  const listeners = new Set()
  return { getSnapshot: () => value, subscribe: callback => { listeners.add(callback); return () => listeners.delete(callback) }, set: next => { value = next; listeners.forEach(callback => callback()) } }
}
const t = key => key
const answer = current => ({ provider: 'custom', model: 'custom-model', userDeclared: true, needsGuide: false, current, reason: 'none', note: null, noteKey: null, warning: null, fieldBlock: null, entryHead: null, modelIndent: 10 })

test('same-model config invalidation refreshes diagnosis and ignores late old responses', async () => {
  const requests = []
  const adapt = client.makeAdaptationService({ call: () => new Promise(resolve => requests.push(resolve)) })
  const directory = store({ current: { provider: 'custom', model: 'custom-model' }, groups: [], failures: [], pending: null, status: 'ready', error: null })
  const props = { available: true, locked: false, directory, controller: {}, load: () => {}, select: async () => true, adapt, agentTutorial: () => '', t }
  let tree
  await act(async () => { tree = TestRenderer.create(React.createElement(client.AdvancedModelSelect, props)) })
  assert.equal(requests.length, 1)
  await act(async () => { adapt.invalidate() })
  assert.equal(requests.length, 2)
  await act(async () => { requests[1]({ ok: true, value: answer(['high']) }) })
  // Return the stale failed request last; it must not replace the new result.
  await act(async () => { requests[0]({ ok: false, error: { message: 'stale' } }) })
  // Open the menu; no DOM nodes are needed for this logic-only renderer.
  globalThis.document = { addEventListener() {}, removeEventListener() {} }
  await act(async () => { tree.root.findByProps({ className: 're-model-trigger' }).props.onClick() })
  assert.equal(tree.root.findAllByProps({ className: 're-adapt-desc' }).length, 1)
  assert.equal(JSON.stringify(tree.toJSON()).includes('guidance.unavailable'), false)
  // Another invalidation must hide old copy actions while the replacement is pending.
  await act(async () => { adapt.invalidate() })
  assert.equal(tree.root.findAllByProps({ className: 're-adapt-agent' }).length, 0)
  await act(async () => { tree.unmount() })
})

test('unavailable sessions neither load nor diagnose and render no selector', async () => {
  let calls = 0
  const directory = store({ current: { provider: 'custom', model: 'custom-model' }, groups: [], failures: [], pending: null, status: 'ready', error: null })
  const adapt = client.makeAdaptationService({ call: async () => { calls++; return { ok: true, value: answer([]) } } })
  let tree
  await act(async () => { tree = TestRenderer.create(React.createElement(client.AdvancedModelSelect, { available: false, directory, controller: {}, load: () => { calls++ }, select: async () => true, adapt, agentTutorial: () => '', t })) })
  assert.equal(tree.toJSON(), null)
  assert.equal(calls, 0)
  await act(async () => { tree.unmount() })
})

test('registered model seat guards subagent loading and selection at call time', async () => {
  let addressed = true
  let calls = 0
  let injection
  const events = new Map()
  const services = {
    modelDirectories: { directoryFor: () => ({ store: store({}), load: async () => { calls++ }, select: async () => { calls++; return { ok: true } } }) },
    sessions: { subagentAddress: () => addressed ? {} : undefined },
    connection: { rpc: { call: async () => ({ ok: true, value: null }) } },
    locale: { getLocale: () => ({ active: 'en' }) },
  }
  const ctx = {
    get: name => services[name],
    remote: { $on: (event, callback) => { events.set(event, callback); return () => events.delete(event) } },
    on: (event, callback) => { events.set(event, callback) },
    // DOM style/storage registration is outside this controller regression.
    effect: (callback, label) => { if (label.includes('updates')) return callback() },
    slots: { inject: (_, callback) => callback(), register: (options) => { if (options.name === 'conversation.input.model') injection = options.inject; return () => {} } },
  }
  client.apply(ctx)
  const hidden = injection('subagent')
  assert.equal(hidden.available, false)
  await hidden.load()
  assert.equal(await hidden.select({ provider: 'custom', model: 'custom-model' }), false)
  assert.equal(calls, 0)
  addressed = false
  const main = injection('main')
  assert.equal(main.available, true)
  await main.load()
  assert.equal(await main.select({ provider: 'custom', model: 'custom-model' }), true)
  assert.equal(calls, 2)
  // A changed address after injection still cannot submit a stale control.
  addressed = true
  assert.equal(await main.select({ provider: 'custom', model: 'custom-model' }), false)
  assert.equal(calls, 2)
  const revision = main.adapt.getSnapshot()
  events.get('settings/document-updated')()
  assert.equal(main.adapt.getSnapshot(), revision + 1)
})
