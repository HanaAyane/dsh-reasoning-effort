import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from 'esbuild'
import vm from 'node:vm'
import * as jsxRuntime from 'react/jsx-runtime'
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
const storage = new Map()
globalThis.window = {
  localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
  addEventListener() {}, removeEventListener() {},
  matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
}
const host = await compile('host', 'src/index.ts')
const nativeAdapter = await compile('native-selector', 'src/client/native-selector.tsx')
const effortSelection = await compile('effort-selection', 'src/client/effort-selection.ts')
const client = await compile('client', 'src/client/index.tsx', `
export { AdvancedModelSelect, NativeEffortPanel, CSS, drawRadiation, makeAdaptationService, wrapNativeSelector, enabledStore }
export { detectModelFamily, parseRunnerPreference } from './runners.js'
`)

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
  assert.equal(tree.root.findAllByProps({ className: 're-settings-guide' }).length, 0)
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
    on: (event, callback) => { events.set(event, callback); return () => events.delete(event) },
    // DOM style/storage registration is outside this controller regression.
    effect: (callback, label) => { if (label.includes('updates')) return callback() },
    slots: { spec: () => undefined, inject: (_, callback) => callback(), register: (options) => { if (options.name === 'conversation.input.model') injection = options.inject; return () => {} } },
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


test('custom-model settings instructions are immediate and copy actions stay under advanced', async () => {
  for (const needsGuide of [true, false]) {
    const value = { ...answer([]), needsGuide, reason: 'missing', matched: false, expected: [], entryPath: 'models', entryLine: '- id: custom-model', settingsPath: null }
    const adapt = client.makeAdaptationService({ call: async () => ({ ok: true, value }) })
    const directory = store({ current: { provider: 'custom', model: 'custom-model' }, groups: [], failures: [], pending: null, status: 'ready', error: null })
    let tree
    await act(async () => { tree = TestRenderer.create(React.createElement(client.AdvancedModelSelect, { available: true, locked: false, directory, controller: {}, load: () => {}, select: async () => true, adapt, agentTutorial: () => '', t })) })
    globalThis.document = { addEventListener() {}, removeEventListener() {} }
    await act(async () => { tree.root.findByProps({ className: 're-model-trigger' }).props.onClick() })
    if (!needsGuide) {
      assert.equal(tree.root.findAllByProps({ className: 're-settings-guide' }).length, 0)
      assert.equal(tree.root.findAllByType('details').length, 0)
      await act(async () => { tree.unmount() })
      continue
    }
    const guide = tree.root.findByProps({ className: 're-settings-guide' })
    assert.equal(guide.findByProps({ className: 're-settings-path' }).children[0], 'guidance.settings.path')
    const markup = JSON.stringify(tree.toJSON())
    assert.ok(markup.indexOf('re-effort-unavailable') < markup.indexOf('re-settings-guide'))
    assert.equal(tree.root.findAllByProps({ className: 're-advanced' }).length, 0)
    assert.equal(tree.root.findAllByProps({ className: 're-adapt-open' }).length, 0)
    const advanced = tree.root.findByType('details')
    assert.equal(advanced.props.open, undefined)
    assert.equal(advanced.findAllByProps({ className: 're-adapt-agent' }).length, 1)
    assert.equal(advanced.findAllByProps({ className: 're-adapt-apply' }).length, needsGuide ? 1 : 0)
    await act(async () => { tree.unmount() })
  }
})


test('delayed model diagnosis preserves teaching and hides stale configuration', async () => {
  const requests = []
  const adapt = client.makeAdaptationService({ call: (_channel, _method, payload) => new Promise(resolve => requests.push({ payload, resolve })) })
  const initial = { current: { provider: 'custom', model: 'model-a' }, groups: [], failures: [], pending: null, status: 'ready', error: null }
  const directory = store(initial)
  let tree
  await act(async () => { tree = TestRenderer.create(React.createElement(client.AdvancedModelSelect, { available: true, locked: false, directory, controller: {}, load: () => {}, select: async () => true, adapt, agentTutorial: () => '', t })) })
  globalThis.document = { addEventListener() {}, removeEventListener() {} }
  await act(async () => { tree.root.findByProps({ className: 're-model-trigger' }).props.onClick() })
  const guide = tree.root.findByProps({ className: 're-settings-guide' })
  const disclosure = tree.root.findByType('details')
  const resolveRequest = async (req, userDeclared = true) => {
    await act(async () => { req.resolve({ ok: true, value: { ...answer([]), ...req.payload, userDeclared, needsGuide: userDeclared, reason: 'missing', matched: false, expected: [], entryPath: 'models', entryLine: '- id: test', settingsPath: null, fieldBlock: req.payload.model } }) })
  }
  const pending = () => {
    assert.equal(tree.root.findByProps({ className: 're-settings-guide' }), guide)
    assert.equal(tree.root.findByType('details'), disclosure)
    assert.equal(tree.root.findAllByProps({ className: 're-adapt-agent' }).length, 0)
    assert.equal(tree.root.findAllByProps({ className: 're-adapt-yaml' }).length, 0)
    assert.ok(JSON.stringify(tree.toJSON()).includes('guidance.checking'))
  }
  pending()
  await resolveRequest(requests[0])
  await act(async () => { directory.set({ ...initial, current: { provider: 'custom', model: 'model-b' } }) })
  pending()
  await act(async () => { directory.set({ ...initial, current: { provider: 'custom', model: 'model-c' } }) })
  await resolveRequest(requests[1], false) // A late response must not hide the teaching.
  pending()
  await resolveRequest(requests[2])
  assert.equal(tree.root.findByProps({ className: 're-adapt-yaml' }).children[0], 'model-c')
  await act(async () => { adapt.invalidate() })
  pending()
  await act(async () => { requests[3].resolve({ ok: false, error: { message: 'offline' } }) })
  assert.equal(tree.root.findByProps({ className: 're-settings-guide' }), guide)
  assert.equal(tree.root.findByType('details'), disclosure)
  assert.equal(tree.root.findAllByProps({ className: 're-adapt-agent' }).length, 0)
  assert.ok(JSON.stringify(tree.toJSON()).includes('guidance.unavailable'))
  await act(async () => { adapt.invalidate() })
  await resolveRequest(requests[4], false)
  assert.equal(tree.root.findAllByProps({ className: 're-settings-guide' }).length, 0)
  await act(async () => { tree.unmount() })
})


test('runtime adapter restores the original registration on disable and disposal', () => {
  const original = () => null
  const entry = { component: original, locale: 'model', children: { 'conversation.input.model.label': {} } }
  let dispose
  let notifications = 0
  const ctx = {
    get: name => ({ modelDirectories: { directoryFor: () => ({}) }, sessions: { subagentAddress: () => undefined } })[name],
    on: () => () => {}, effect: () => {},
    slots: {
      entries: () => [entry],
      inject: (name, fn) => { const off = fn(); if (name === 'conversation.input.model') dispose = off },
      register: () => { notifications++; return () => {} },
    },
  }
  client.apply(ctx)
  assert.notEqual(entry.component, original)
  client.enabledStore.set(false, false)
  assert.equal(entry.component, original)
  client.enabledStore.set(true, false)
  assert.notEqual(entry.component, original)
  dispose()
  assert.equal(entry.component, original)
  assert.ok(notifications >= 4)
})

for (const reasoning of [undefined, { efforts: [{ id: 'high', name: 'High' }] }, { efforts: [{ id: 'low', name: 'Low' }, { id: 'high', name: 'High' }] }]) {
test(`native selector offers the appropriate control for effort count ${reasoning?.efforts.length ?? 0}`, async () => {
  storage.clear()
  const original = await readFile(resolve(root, 'node_modules/@deepseek-ai/dsh-client-ui-model-selection/lib/client.js'))
  const source = original.toString('utf8')
  const nativeDocument = { querySelector: () => ({}), addEventListener() {}, removeEventListener() {}, body: {}, activeElement: null }
  const primitives = new Proxy({
    rankByName: (models, query) => models.filter(model => model.name.toLowerCase().includes(query.toLowerCase())),
    observeStickyMenuGroups: () => () => {},
    MenuSurface: React.forwardRef(({ children, ...props }, ref) => React.createElement('div', { ...props, ref }, children)),
    MenuGroup: ({ children }) => React.createElement('section', null, children),
  }, { get: (target, key) => target[key] ?? key })
  let NativeSelect
  vm.runInNewContext(source.replace('exports.ModelDirectory = ModelDirectory;', 'exports.TestModelSelect = ModelSelect; exports.ModelDirectory = ModelDirectory;'), {
    window: { __ModuleLoader__: { load: ({ factory }) => {
      NativeSelect = factory(name => ({ react: React, 'react/jsx-runtime': jsxRuntime, 'react-dom': { createPortal: node => node }, '@deepseek-ai/cordis': { Service: class {} }, '@deepseek-ai/dsh-client-store': {}, '@deepseek-ai/dsh-client-ui-primitives': primitives })[name]).TestModelSelect
    } }, addEventListener() {}, removeEventListener() {} },
    document: nativeDocument, queueMicrotask, console,
    HTMLInputElement: class {}, HTMLButtonElement: class {}, Node: class {},
  })
  const models = Array.from({ length: 5 }, (_, i) => ({ id: `model-${i}`, name: `Model ${i}`, reasoning }))
  const initial = { current: { provider: 'custom', model: 'model-0' }, groups: [{ id: 'custom', name: 'Custom', models }], failures: [], pending: null, status: 'ready', error: null }
  const directory = store(initial)
  const adapt = client.makeAdaptationService({ call: async () => ({ ok: true, value: { ...answer([]), model: 'model-0' } }) })
  const selections = []
  const modelSwitches = []
  const props = {
    locked: false, available: true, directory, load: () => {}, t,
    select: async target => {
      modelSwitches.push({ ...target })
      directory.set({ ...directory.getSnapshot(), current: target })
      return { ok: true }
    },
    renderSlot: (_name, _owner, opts) => opts?.fallback,
  }
  // Exercise production registration/injection, not just the tree adapter.
  // A real directory load publishes snapshots observed by the native parent.
  let loads = 0
  const controller = { store: directory, select: async target => {
    selections.push(target)
    directory.set({ ...directory.getSnapshot(), current: target })
    return { ok: true }
  }, load: async () => {
    loads++
    if (loads < 20) directory.set({ ...directory.getSnapshot() })
    return directory.getSnapshot()
  } }
  const entry = { component: NativeSelect, locale: 'model', children: { 'conversation.input.model.label': {} } }
  let dispose
  client.apply({
    get: name => ({ modelDirectories: { directoryFor: () => controller }, sessions: { subagentAddress: () => undefined } })[name],
    locale: { bind: () => t }, on: () => () => {}, effect: () => {},
    slots: { entries: () => [entry], register: () => () => {},
      inject: (name, fn) => { const off = fn(); if (name === 'conversation.input.model') dispose = off },
    },
  })
  NativeSelect = entry.component
  let tree
  await act(async () => { tree = TestRenderer.create(React.createElement(NativeSelect, props)) })
  await act(async () => { tree.root.findByProps({ 'aria-haspopup': 'menu' }).props.onClick() })
  const row = name => tree.root.findAllByType('button').find(button => button.findAll(node => node.children.includes(name)).length > 0)
  await act(async () => { row('menu.effort').props.onClick() })
  assert.ok(loads <= 2, `opening effort triggered ${loads} loads`)
  const openingLoads = loads
  await act(async () => { directory.set({ ...directory.getSnapshot() }) })
  assert.equal(loads, openingLoads, 'parent snapshot updates must not reload the panel')
  assert.equal(tree.root.findAllByProps({ className: 're-native-effort' }).length, 1)
  assert.equal(tree.root.findAllByProps({ className: 're-model-trigger' }).length, 0)
  assert.equal(tree.root.findAllByProps({ className: 're-model-row' }).length, 0)
  assert.equal(tree.root.findAllByProps({ className: 're-native-back' }).length, 0)
  if (reasoning) {
    const single = reasoning.efforts.length === 1
    if (single) {
      assert.equal(tree.root.findByProps({ type: 'range' }).props['aria-valuetext'], 'model.defaultEffort')
      assert.equal(tree.root.findByProps({ className: 're-effort-tick is-selected' }).props.title, 'model.defaultEffort')
      assert.equal(tree.root.findAllByProps({ className: 're-effort-unavailable' }).length, 0)
      assert.equal(tree.root.findAllByProps({ className: 're-settings-guide' }).length, 0)
    }
    const pane = tree.root.findByProps({ className: 're-native-pane' })
    let blurStopped = false
    pane.props.onBlur({ relatedTarget: null, stopPropagation: () => { blurStopped = true } })
    assert.equal(blurStopped, true, 'disabling the range must not dismiss the native menu')
    blurStopped = false
    pane.props.onBlur({ relatedTarget: {}, stopPropagation: () => { blurStopped = true } })
    assert.equal(blurStopped, false, 'focus moving outside must reach the native handler')
    await act(async () => { tree.root.findByProps({ type: 'range' }).props.onChange({ currentTarget: { value: '1' } }) })
    assert.equal(tree.root.findAllByProps({ className: 're-native-effort' }).length, 1)
    assert.deepEqual(tree.root.findByProps({ className: 're-effort-name' }).children, ['High'])
    assert.equal(tree.root.findByProps({ className: 're-effort-ticks' }).findAllByType('span').length, 2)
    assert.equal(tree.root.findByProps({ className: 're-effort-tick is-selected' }).props.title, 'High')
    if (single) {
      await act(async () => { tree.root.findByProps({ type: 'range' }).props.onChange({ currentTarget: { value: '0' } }) })
      assert.equal(tree.root.findByProps({ className: 're-effort-tick is-selected' }).props.title, 'model.defaultEffort')
      assert.deepEqual(selections, [
        { provider: 'custom', model: 'model-0', reasoningEffort: 'high' },
        { provider: 'custom', model: 'model-0' },
      ])
      await act(async () => { tree.root.findByProps({ type: 'range' }).props.onChange({ currentTarget: { value: '1' } }) })
    }
  }
  const panel = tree.root.findByProps({ className: 're-native-effort' })
  let stopped = false
  panel.props.onKeyDown({ key: 'ArrowRight', stopPropagation: () => { stopped = true } })
  assert.equal(stopped, true)
  stopped = false
  panel.props.onKeyDown({ key: 'Escape', stopPropagation: () => { stopped = true } })
  assert.equal(stopped, false)
  await act(async () => { tree.root.findByProps({ className: 're-native-pane' }).props.onKeyDown({ key: 'Escape', preventDefault() {}, stopPropagation() {} }) })
  assert.equal(tree.root.findAllByProps({ className: 're-native-effort' }).length, 0)
  await act(async () => { row('menu.model').props.onClick() })
  const search = tree.root.findByProps({ role: 'searchbox' })
  await act(async () => { search.props.onChange({ currentTarget: { value: 'Model 3' }, target: { value: 'Model 3' } }) })
  assert.equal(tree.root.findAllByProps({ role: 'menuitemradio' }).length, 1)
  if (reasoning) {
    await act(async () => { tree.root.findByProps({ role: 'menuitemradio' }).props.onClick() })
    await act(async () => { search.props.onChange({ currentTarget: { value: 'Model 0' }, target: { value: 'Model 0' } }) })
    await act(async () => { tree.root.findByProps({ role: 'menuitemradio' }).props.onClick() })
    assert.deepEqual(modelSwitches, [
      { provider: 'custom', model: 'model-3' },
      { provider: 'custom', model: 'model-0', reasoningEffort: 'high' },
    ])
  }
  await act(async () => { tree.unmount() })
  dispose()
})
}

test('effort memory validates provider, catalog and explicit defaults', async () => {
  storage.clear()
  const route = { provider: 'custom', model: 'same-id' }
  const otherProvider = { ...route, provider: 'other' }
  const high = { id: 'high', name: 'High' }
  const low = { id: 'low', name: 'Low' }
  const initial = { current: route, status: 'ready', error: null, failures: [], pending: null,
    groups: [route, otherProvider].map(({ provider, model }) => ({ id: provider,
      models: [{ id: model, reasoning: { efforts: [high] } }] })) }
  const directory = store(initial)
  const controller = { store: directory, load: async () => directory.getSnapshot(),
    select: async target => { directory.set({ ...initial, current: target }); return { ok: true } } }
  const signal = new AbortController().signal
  const highSelection = { ...route, reasoningEffort: 'high' }
  await effortSelection.selectEffort(controller, highSelection, signal, t)
  const restore = effortSelection.restoreRememberedEffort
  const away = { ...initial, current: otherProvider }
  assert.deepEqual(restore(away, route), highSelection)
  assert.deepEqual(restore(directory.getSnapshot(), otherProvider), otherProvider)
  assert.deepEqual(restore(directory.getSnapshot(), route), route, 'do not override a same-model change')
  const changedCatalog = { ...away, groups: [{ id: route.provider,
    models: [{ id: route.model, reasoning: { defaultEffort: 'low', efforts: [low] } }] }] }
  const newDefault = { ...route, reasoningEffort: 'low' }
  assert.deepEqual(restore(changedCatalog, newDefault), newDefault)

  await effortSelection.selectEffort(controller, route, signal, t)
  assert.deepEqual(restore(away, route), route, 'explicit Default replaces a remembered effort')
  await assert.rejects(effortSelection.selectEffort({ ...controller,
    select: async () => ({ ok: false, error: { code: 'rejected', message: 'test rejection' } }) }, highSelection, signal, t))
  assert.deepEqual(restore(away, route), route, 'failed selection does not overwrite Default')
})


test('embedded slider selects the current route and respects the native lock', async () => {
  const efforts = [{ id: 'low', name: 'Low' }, { id: 'high', name: 'High' }]
  const initial = { current: { provider: 'custom', model: 'reasoner', reasoningEffort: 'low' }, groups: [{ id: 'custom', name: 'Custom', models: [{ id: 'reasoner', name: 'Reasoner', reasoning: { efforts } }] }], failures: [], pending: null, status: 'ready', error: null }
  const directory = store(initial)
  const selected = []
  const controller = {
    store: directory, load: async () => directory.getSnapshot(),
    select: async target => { selected.push(target); directory.set({ ...initial, current: target }); return { ok: true } },
  }
  const adapt = client.makeAdaptationService({ call: async () => ({ ok: true, value: { ...answer(['low', 'high']), model: 'reasoner' } }) })
  const props = { available: true, locked: false, directory, controller, load: () => {}, select: async () => true, adapt, agentTutorial: () => '', t }
  let tree
  await act(async () => { tree = TestRenderer.create(React.createElement(client.NativeEffortPanel, props)) })
  const range = tree.root.findByProps({ type: 'range' })
  await act(async () => { range.props.onKeyDown({ key: 'ArrowRight', currentTarget: { value: '0' }, preventDefault() {} }) })
  assert.deepEqual(selected, [{ provider: 'custom', model: 'reasoner', reasoningEffort: 'high' }])
  await act(async () => { tree.update(React.createElement(client.NativeEffortPanel, { ...props, locked: true })) })
  assert.equal(tree.root.findByProps({ type: 'range' }).props.disabled, true)
  await act(async () => { tree.root.findByProps({ type: 'range' }).props.onKeyDown({ key: 'ArrowLeft', currentTarget: { value: '1' }, preventDefault() {} }) })
  assert.equal(selected.length, 1)
  await act(async () => { tree.unmount() })
})

test('each detected family has its own track colors and sprite frame count', async () => {
  const gradients = new Map(['dark', 'light', 'fill', 'peak'].map(mode => [mode, new Set()]))
  const longerCycles = new Set(['deepseek', 'openai', 'claude', 'grok', 'kimi', 'glm', 'minimax'])
  for (const [family, model] of [
    ['deepseek', 'deepseek-v4'], ['openai', 'gpt-5-codex'], ['claude', 'anthropic.claude-sonnet'],
    ['gemini', 'google/gemini-3'], ['kimi', 'moonshot/kimi-k2.5'], ['glm', 'glm-5'],
    ['qwen', 'Qwen3.5-Max'], ['minimax', 'MiniMax-M2'], ['grok', 'x-ai/grok-4-fast'],
  ]) {
    assert.equal(client.detectModelFamily(model, 'Other model', 'openrouter'), family)
    const sprite = await readFile(resolve(root, 'assets', 'runners', `${family}.png`))
    const frames = longerCycles.has(family) ? 16 : 8
    assert.equal(sprite.readUInt32BE(16), 80 * frames, `${family} sprite width`)
    assert.equal(sprite.readUInt32BE(20), 110, `${family} sprite height`)
    const runnerStyle = client.CSS.split(`[data-re-runner="${family}"] {`)[1]?.split('}')[0]
    assert.match(runnerStyle, new RegExp(`--re-runner-frames: ${frames};`))
    const declarations = client.CSS.split(`.re-effort[data-re-theme="${family}"] {`)[1]?.split('}')[0]
    for (const [mode, seen] of gradients) {
      const color = declarations?.match(new RegExp(`--re-track-${mode}: ([^;]+);`))?.[1]
      assert.ok(color && !seen.has(color), `${family} needs a distinct ${mode} track color`)
      seen.add(color)
    }
  }
  const winterSprite = await readFile(resolve(root, 'assets', 'runners', 'deepseek-winter.png'))
  assert.equal(winterSprite.readUInt32BE(16), 1280)
  assert.equal(winterSprite.readUInt32BE(20), 110)
  assert.match(client.CSS.split('[data-re-runner="deepseek-winter"] {')[1]?.split('}')[0], /--re-runner-frames: 16;/u)
  assert.equal(client.detectModelFamily('openai/claude-sonnet', 'GPT alias', 'openai'), 'claude')
  assert.equal(client.detectModelFamily('custom-model', '通义千问旗舰版', 'openai'), 'qwen')
  assert.equal(client.detectModelFamily('custom-model', undefined, 'moonshotai'), 'kimi')
  assert.equal(client.detectModelFamily('custom-model', undefined, 'xai'), 'grok')
  assert.equal(client.detectModelFamily('gptish-custom', undefined, 'openrouter'), 'deepseek')
  assert.equal(client.parseRunnerPreference(null), 'auto')
  assert.equal(client.parseRunnerPreference('true'), 'auto')
  assert.equal(client.parseRunnerPreference('false'), 'off')
  assert.equal(client.parseRunnerPreference('claude'), 'claude')
  assert.equal(client.parseRunnerPreference('deepseek-winter'), 'deepseek-winter')
})

test('dragging paints a longer trail in the active theme behind the thumb', () => {
  const previousDocument = globalThis.document
  const frame = { progress: 0.75, time: 100, waveTime: 200, particleDistance: 30, dragAmount: 1, family: 'claude', chibi: true }
  const paint = (isDark, dragAmount, family = frame.family) => {
    const strokes = []
    globalThis.document = { body: { hasAttribute: () => isDark } }
    const gradient = () => ({ stops: [], addColorStop(at, color) { this.stops.push([at, color]) } })
    const context = {
      clearRect() {}, save() {}, beginPath() {}, rect() {}, clip() {}, restore() {},
      createLinearGradient: gradient, createRadialGradient: gradient,
      fillRect(x, y, width, height) {
        if (width > 28 && height <= 3) strokes.push({ end: x + width, width, colors: this.fillStyle.stops })
      },
    }
    client.drawRadiation(context, 240, 30, { ...frame, dragAmount, family })
    return strokes
  }
  try {
    assert.deepEqual(paint(true, 0), [])
    const dark = paint(true, 1)
    const light = paint(false, 1)
    assert.equal(dark[0].width, 90)
    assert.equal(dark[0].end, 172)
    assert.ok(dark.every(stroke => stroke.end <= 172))
    assert.match(dark[0].colors[0][1], /255 143 73/u)
    assert.match(light[0].colors[0][1], /192 72 21/u)
    assert.match(paint(true, 1, 'grok')[0].colors[0][1], /255 197 74/u)
    assert.match(paint(false, 1, 'grok')[0].colors[0][1], /198 130 21/u)
    assert.ok(paint(true, 0.5)[0].width < dark[0].width)
  } finally {
    if (previousDocument === undefined) delete globalThis.document
    else globalThis.document = previousDocument
  }
})

test('the settings preview shares the live theme and keeps its effort local', async () => {
  const settingsSlot = 'settings.section'
  let registration
  const services = { modelDirectories: {}, sessions: {}, locale: { bind: () => t } }
  client.apply({
    get: key => services[key],
    effect: () => {},
    locale: services.locale,
    slots: {
      inject: (key, callback) => { if (key === settingsSlot) callback() },
      register: (options, component) => { registration = { options, component } },
    },
  })
  assert.equal(registration.options.name, settingsSlot)
  assert.equal(registration.options.label(), 'settings.effort.title')

  const efforts = [{ id: 'low', name: 'Low' }, { id: 'high', name: 'High' }]
  const first = { provider: 'openrouter', model: 'anthropic/claude-sonnet', reasoningEffort: 'low' }
  const next = { ...first, model: 'openai/gpt-5-codex' }
  const grok = { ...first, model: 'x-ai/grok-4-fast' }
  const snapshot = {
    current: first, status: 'ready', error: null, pending: null, failures: [],
    groups: [{ id: first.provider, models: [first, next, grok].map(({ model }) => ({ id: model, name: model, reasoning: { efforts } })) }],
  }
  const directory = store(snapshot)
  let selections = 0
  const controller = {
    store: directory,
    load: async () => directory.getSnapshot(),
    select: async () => { selections++; throw new Error('Unexpected model selection') },
  }
  function useSessions(selector) {
    const { current } = React.useSyncExternalStore(directory.subscribe, directory.getSnapshot)
    return selector({
      byId: { session: { id: 'session', retainedBy: { mainView: 1 } } },
      projectionsBySession: { session: { values: { modelSelection: { next: current } } } },
    })
  }
  const fishPlaybackRates = []
  const createNodeMock = element => element.props.className === 're-effort-knob' ? {
    getAnimations: () => [{
      animationName: 're-runner-cycle',
      updatePlaybackRate: rate => fishPlaybackRates.push(rate),
    }],
  } : null
  let tree
  await act(async () => {
    tree = TestRenderer.create(React.createElement(React.Fragment, null,
      React.createElement(registration.component, { t, useSessions }),
      React.createElement(client.NativeEffortPanel, {
        available: true, controller, directory, load: () => {}, adapt: null, t,
      }),
    ), { createNodeMock })
  })
  const choose = value => act(async () => tree.root.findByProps({ type: 'radio', value }).props.onChange())
  const liveInput = () => tree.root.findByProps({ type: 'range', 'aria-label': 'effort.label' })
  const previewInput = () => tree.root.findByProps({ type: 'range', 'aria-label': 'settings.preview.title' })
  const slider = () => liveInput().parent.parent.props
  const preview = () => previewInput().parent.parent.props
  try {
    assert.equal(tree.root.findAllByProps({ type: 'radio' }).length, 12)
    assert.equal(slider()['data-re-runner'], 'claude')
    assert.equal(slider()['data-re-theme'], 'claude')
    assert.equal(preview()['data-re-theme'], 'claude')
    await choose('deepseek')
    assert.equal(preview()['data-re-runner'], 'deepseek')
    await choose('deepseek-winter')
    assert.equal(slider()['data-re-runner'], 'deepseek-winter')
    assert.equal(slider()['data-re-theme'], 'deepseek')
    assert.equal(preview()['data-re-runner'], 'deepseek-winter')
    assert.equal(preview()['data-re-theme'], 'deepseek')
    assert.equal(storage.get('dsh-reasoning-effort.chibi-thumb'), 'deepseek-winter')
    const beforeDrag = [...storage]
    const previewTrack = {
      getBoundingClientRect: () => ({ left: 0, width: 100 }),
      focus() {},
      setPointerCapture() {},
    }
    const pointer = { currentTarget: previewTrack, pointerId: 1, button: 0, preventDefault() {} }
    await act(async () => { previewInput().props.onPointerDown({ ...pointer, clientX: 45 }) })
    assert.equal(fishPlaybackRates.at(-1), 720 / 420)
    await act(async () => { previewInput().props.onPointerMove({ ...pointer, clientX: 85 }) })
    assert.equal(previewInput().props.value, 1.7)
    assert.match(preview().className, /is-dragging/u)
    await act(async () => { previewInput().props.onPointerUp({ ...pointer, clientX: 85 }) })
    assert.equal(fishPlaybackRates.at(-1), 1)
    assert.equal(previewInput().props.value, 2)
    assert.equal(previewInput().props['aria-valuetext'], 'level.high')
    assert.doesNotMatch(preview().className, /is-dragging/u)
    await act(async () => { previewInput().props.onKeyDown({ key: 'Home', preventDefault() {} }) })
    assert.equal(previewInput().props.value, 0)
    assert.equal(liveInput().props.value, 0)
    assert.equal(directory.getSnapshot().current.reasoningEffort, 'low')
    assert.equal(selections, 0)
    assert.deepEqual([...storage], beforeDrag)
    await choose('kimi')
    assert.equal(slider()['data-re-runner'], 'kimi')
    assert.equal(slider()['data-re-theme'], 'kimi')
    assert.equal(preview()['data-re-runner'], 'kimi')
    assert.equal(preview()['data-re-theme'], 'kimi')
    assert.equal(storage.get('dsh-reasoning-effort.chibi-thumb'), 'kimi')
    await act(async () => directory.set({ ...snapshot, current: next }))
    assert.equal(slider()['data-re-runner'], 'kimi')
    assert.equal(slider()['data-re-theme'], 'kimi')
    await choose('auto')
    assert.equal(slider()['data-re-runner'], 'openai')
    assert.equal(slider()['data-re-theme'], 'openai')
    assert.equal(preview()['data-re-theme'], 'openai')
    await choose('kimi')
    await choose('off')
    assert.equal(slider()['data-re-runner'], undefined)
    assert.equal(slider()['data-re-theme'], 'openai')
    assert.equal(preview()['data-re-runner'], undefined)
    assert.equal(preview()['data-re-theme'], 'openai')
    assert.equal(storage.get('dsh-reasoning-effort.chibi-thumb'), 'false')
    await choose('auto')
    await act(async () => directory.set({ ...snapshot, current: grok }))
    assert.equal(slider()['data-re-runner'], 'grok')
    assert.equal(slider()['data-re-theme'], 'grok')
    assert.equal(preview()['data-re-runner'], 'grok')
  } finally {
    await choose('auto')
    await act(async () => { tree.unmount() })
    storage.delete('dsh-reasoning-effort.chibi-thumb')
  }
})


test('native model options remain usable with or without a native effort row', async () => {
  for (const hasEffort of [true, false]) {
    let toggles = 0
    const options = React.createElement('button', { type: 'button', role: 'switch', onClick: () => { toggles++ } }, 'Enable agent teamwork')
    const extraPane = React.createElement('aside', { 'data-native-pane': '' })
    const Native = () => React.createElement('div', { 'aria-label': 'menu.aria' },
      React.createElement(React.Fragment, null,
        React.createElement('button', { role: 'menuitem' }, 'menu.model'),
        hasEffort && React.createElement('button', { role: 'menuitem' }, 'menu.effort'),
        options),
      false,
      false,
      ...(!hasEffort ? [extraPane] : []))
    const Wrapped = nativeAdapter.wrapNativeSelector(Native, () => 'Effort panel')
    const props = { t, locked: false, directory: store({}), select: async () => undefined }
    let tree
    await act(async () => { tree = TestRenderer.create(React.createElement(Wrapped, props)) })
    const toggle = () => tree.root.findByProps({ role: 'switch' })
    assert.equal(toggle().children[0], 'Enable agent teamwork')
    assert.equal(tree.root.findAllByProps({ 'data-native-pane': '' }).length, hasEffort ? 0 : 1)
    await act(async () => { toggle().props.onClick() })
    assert.equal(toggles, 1)
    await act(async () => { tree.root.findByProps({ 'data-re-effort-entry': '' }).props.onClick() })
    const pane = tree.root.findByProps({ className: 're-native-pane' })
    assert.deepEqual(pane.children, ['Effort panel'])
    await act(async () => { pane.props.onKeyDown({ key: 'Escape', preventDefault() {}, stopPropagation() {} }) })
    assert.equal(toggle().children[0], 'Enable agent teamwork')
    await act(async () => { tree.unmount() })
  }
})


test('portal traversal retains the original target and key while replacing menu children', () => {
  const target = { nodeType: 1 }
  const portal = { $$typeof: Symbol.for('react.portal'), key: 'native-menu', containerInfo: target, implementation: null,
    children: React.createElement('div', { 'aria-label': 'native' }, 'original') }
  const result = nativeAdapter.mapNativeTree(portal, element => element.props['aria-label'] === 'native'
    ? React.cloneElement(element, {}, 'plugin') : element)
  assert.equal(result.containerInfo, target)
  assert.equal(result.key, portal.key)
  assert.equal(result.$$typeof, portal.$$typeof)
  assert.equal(result.children.props.children, 'plugin')
  assert.equal(portal.children.props.children, 'original')
})


test('embedded pane with levels never flashes tutorial while diagnosis is pending', async () => {
  let finish
  const adapt = client.makeAdaptationService({ call: () => new Promise(resolve => { finish = resolve }) })
  const directory = store({ current: { provider: 'custom', model: 'custom-model', reasoningEffort: 'low' },
    groups: [{ id: 'custom', models: [{ id: 'custom-model', reasoning: { efforts: [{ id: 'low', name: 'Low' }, { id: 'high', name: 'High' }] } }] }],
    failures: [], pending: null, status: 'ready', error: null })
  const props = { available: true, locked: false, directory, controller: { store: directory, load: async () => {} }, load: () => {}, select: async () => true, adapt, agentTutorial: () => '', t }
  let tree
  await act(async () => { tree = TestRenderer.create(React.createElement(client.NativeEffortPanel, props)) })
  assert.equal(tree.root.findAllByProps({ className: 're-settings-guide' }).length, 0)
  assert.equal(tree.root.findAllByProps({ type: 'range' }).length, 1)
  await act(async () => { finish({ ok: true, value: { ...answer(['low', 'high']), userDeclared: true, needsGuide: false } }) })
  assert.equal(tree.root.findAllByType('details').length, 0)
  assert.equal(tree.root.findAllByProps({ className: 're-settings-guide' }).length, 0)
  await act(async () => { tree.unmount() })
})


test('embedded pane waits for diagnosis before showing the tutorial', async () => {
  const requests = []
  const adapt = client.makeAdaptationService({ call: () => new Promise(resolve => requests.push(resolve)) })
  const directory = store({ current: { provider: 'custom', model: 'custom-model' },
    groups: [], failures: [], pending: null, status: 'ready', error: null })
  const props = { available: true, locked: false, directory, controller: { store: directory, load: async () => {} }, load: () => {}, select: async () => true, adapt, agentTutorial: () => '', t }
  let tree
  await act(async () => { tree = TestRenderer.create(React.createElement(client.NativeEffortPanel, props)) })
  const guides = () => tree.root.findAllByProps({ className: 're-settings-guide' }).length
  assert.equal(guides(), 0)
  await act(async () => { requests[0]({ ok: true, value: answer([]) }) })
  assert.equal(guides(), 0)
  await act(async () => { adapt.invalidate() })
  assert.equal(guides(), 0)
  await act(async () => { requests[1]({ ok: true, value: { ...answer([]), needsGuide: true, reason: 'missing' } }) })
  assert.equal(guides(), 1)
  await act(async () => { tree.unmount() })
})


test('single named provider default stays the only choice', async () => {
  const current = { provider: 'custom', model: 'group' }
  const initial = { current, groups: [{ id: current.provider, models: [{ id: current.model, reasoning: { defaultEffort: 'high', efforts: [{ id: 'high', name: 'High' }] } }] }],
    failures: [], pending: null, status: 'ready', error: null }
  const directory = store(initial)
  const selections = []
  const props = { available: true, locked: false, directory, controller: {}, load: () => {}, adapt: null, agentTutorial: () => '', t,
    select: async target => { selections.push(target); directory.set({ ...initial, current: target }); return true } }
  let tree
  await act(async () => { tree = TestRenderer.create(React.createElement(client.NativeEffortPanel, props)) })
  const option = name => tree.root.findAllByType('button').find(button => button.findAll(node => node.children.includes(name)).length > 0)
  assert.equal(tree.root.findAllByProps({ className: 're-effort-unavailable' }).length, 0)
  assert.equal(tree.root.findAllByProps({ className: 're-settings-guide' }).length, 0)
  assert.equal(tree.root.findAllByProps({ type: 'range' }).length, 0)
  assert.equal(option('model.defaultEffort'), undefined)
  assert.equal(option('High').props['aria-pressed'], true)
  await act(async () => { option('High').props.onClick() })
  assert.deepEqual(selections, [])
  await act(async () => { tree.unmount() })
})
