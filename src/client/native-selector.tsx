import { cloneElement, isValidElement, useCallback, useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent, ReactElement, ReactNode, ReactPortal } from 'react'
import type { ModelSelection } from '@deepseek-ai/dsh-api-session-controller/types'
import type { ModelDirectory } from '@deepseek-ai/dsh-client-ui-model-selection/client'
import { restoreRememberedEffort } from './effort-selection.js'
import { positionNativeModelMenu } from './menu-position.js'

// DSH 0.2.1-rc.2 has no effort-pane extension point. Keep this small adapter
// isolated: the native registration retains its inject, locale, child slots,
// model search, selection, labels and portal positioning.
type NativeProps = {
  t: (key: string) => string
  locked: boolean
  directory: ModelDirectory['store']
  select: (selection: ModelSelection) => Promise<Awaited<ReturnType<ModelDirectory['select']>> | undefined>
  [key: string]: unknown
}
type ElementProps = { children?: ReactNode; [key: string]: unknown }

export function mapNativeTree(node: ReactNode, transform: (element: ReactElement<ElementProps>) => ReactNode): ReactNode {
  if (Array.isArray(node)) return node.map(child => mapNativeTree(child, transform))
  if (node && typeof node === 'object' && '$$typeof' in node && node.$$typeof === Symbol.for('react.portal')) {
    // Preserve the existing portal identity, target container and implementation.
    const portal = node as ReactPortal
    return { ...portal, children: mapNativeTree(portal.children, transform) }
  }
  if (!isValidElement<ElementProps>(node)) return node
  const replacement = transform(node)
  if (replacement !== node) return replacement
  if (node.props.children === undefined) return node
  const children = mapNativeTree(node.props.children, transform)
  return Array.isArray(children) ? cloneElement(node, {}, ...children) : cloneElement(node, {}, children)
}

export function wrapNativeSelector(Native: (props: NativeProps) => ReactNode, renderPanel: (props: NativeProps) => ReactNode) {
  return function NativeReasoningSelector(props: NativeProps) {
    const [effort, setEffort] = useState(false)
    const panelRef = useRef<HTMLDivElement>(null)
    const menuRef = useRef<HTMLElement | null>(null)
    const { directory, select } = props
    const selectModel = useCallback((selection: ModelSelection) =>
      select(restoreRememberedEffort(directory.getSnapshot(), selection)), [directory, select])
    // Always invoke the same native function, including all its hooks.
    const native = Native({ ...props, select: selectModel })
    let menuOpen = false
    const output = mapNativeTree(native, element => {
      if (element.props['aria-label'] !== props.t('menu.aria') || !Array.isArray(element.props.children)) return element
      const panes = element.props.children
      if (panes.length !== 3) return element
      menuOpen = true
      if (effort) return cloneElement(element, { role: 'group' },
        <div className="re-native-pane" ref={panelRef} tabIndex={-1} onBlur={event => {
          // Disabling the focused range during submission produces a blur with
          // no next target. Do not let the host interpret this as leaving the menu.
          // Outside clicks still close through the native document listener.
          if (event.relatedTarget === null) event.stopPropagation()
        }} onKeyDown={event => {
          if (event.key === 'Escape' || (event.key === 'Tab' && event.shiftKey && event.target === event.currentTarget)) {
            event.preventDefault(); event.stopPropagation(); setEffort(false)
          }
        }}>
          {renderPanel(props)}
        </div>)
      const root = panes[0]
      if (!isValidElement<{ children: ReactNode[] }>(root) || !Array.isArray(root.props.children)) return element
      const [modelRow, effortRow] = root.props.children
      if (!isValidElement<ElementProps>(modelRow)) return element
      const entry = { 'data-re-effort-entry': '', onClick: () => setEffort(true) }
      const row = isValidElement<ElementProps>(effortRow)
        ? cloneElement(effortRow, entry)
        : cloneElement(modelRow, { ...entry, key: 'reasoning-effort', ref: null, disabled: props.locked } as ElementProps,
            <span>{props.t('menu.effort')}</span>, <span aria-hidden="true">›</span>)
      return cloneElement(element, {
        onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
          if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
          const rows = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]:not(:disabled)'))
          if (rows.length === 0) return
          event.preventDefault(); event.stopPropagation()
          const index = rows.indexOf(event.target as HTMLButtonElement)
          rows[(index + (event.key === 'ArrowDown' ? 1 : rows.length - 1) + rows.length) % rows.length]?.focus()
        },
      }, cloneElement(root, {}, modelRow, row), panes[1], panes[2])
    })
    useLayoutEffect(() => {
      if (!menuOpen) {
        menuRef.current = null
        setEffort(false)
        return
      }
      const panel = panelRef.current
      const menu = panel?.closest<HTMLElement>('[id][aria-label]') ?? menuRef.current
      menuRef.current = panel ? menu : null
      if (menu) positionNativeModelMenu(menu)
      if (panel) panel.focus({ preventScroll: true })
      else menu?.querySelector<HTMLElement>('[data-re-effort-entry]')?.focus({ preventScroll: true })
    }, [menuOpen, effort])
    return output
  }
}
