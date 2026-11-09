/** Keep the composer popover inside the visible viewport without measuring its entrance animation. */
export function positionModelMenu(root: HTMLElement, menu: HTMLElement): () => void {
  const viewport = window.visualViewport
  const update = () => {
    const margin = 12
    const left = (viewport?.offsetLeft ?? 0) + margin
    const top = (viewport?.offsetTop ?? 0) + margin
    const width = Math.max(0, (viewport?.width ?? document.documentElement.clientWidth) - margin * 2)
    const height = Math.max(0, (viewport?.height ?? window.innerHeight) - margin * 2)
    const anchor = root.getBoundingClientRect()
    const bottom = anchor.top - 8
    const above = bottom - top
    menu.style.setProperty('--re-menu-width', `${width}px`)
    menu.style.setProperty('--re-menu-height', `${Math.min(480, above >= 120 ? Math.min(above, height) : height)}px`)

    // offsetWidth/Height exclude transforms, so repeated updates cannot accumulate
    // an animated scale or an earlier correction into the next position.
    const baseLeft = anchor.right - menu.offsetWidth
    const baseTop = bottom - menu.offsetHeight
    const x = Math.max(left, Math.min(baseLeft, left + width - menu.offsetWidth))
    const y = Math.max(top, Math.min(baseTop, top + height - menu.offsetHeight))
    menu.style.setProperty('--re-menu-x', `${x - baseLeft}px`)
    menu.style.setProperty('--re-menu-y', `${y - baseTop}px`)
  }

  update()
  const observer = new ResizeObserver(update)
  observer.observe(root)
  observer.observe(menu)
  window.addEventListener('resize', update)
  window.addEventListener('scroll', update, true)
  viewport?.addEventListener('resize', update)
  viewport?.addEventListener('scroll', update)
  return () => {
    observer.disconnect()
    window.removeEventListener('resize', update)
    window.removeEventListener('scroll', update, true)
    viewport?.removeEventListener('resize', update)
    viewport?.removeEventListener('scroll', update)
  }
}

/** Match the native menu's placement before its size observer handles the pane swap. */
export function positionNativeModelMenu(menu: HTMLElement): void {
  const { ownerDocument, style } = menu
  const view = ownerDocument.defaultView
  if (!view || !menu.id || !style.left || !style.top || style.visibility === 'hidden') return
  const trigger = ownerDocument.querySelector<HTMLButtonElement>(`button[aria-controls="${CSS.escape(menu.id)}"]`)
  if (!trigger) return

  const anchor = trigger.getBoundingClientRect()
  const margin = 12
  const gap = 8
  // Newer native menus use the shared anchored-position hook and desktop frame inset.
  const usesAnchoredPosition = style.getPropertyValue('--dsh-anchored-max-height') !== ''
  const viewport = usesAnchoredPosition ? view.visualViewport : null
  const viewportLeft = viewport?.offsetLeft ?? 0
  const viewportTop = viewport?.offsetTop ?? 0
  const root = ownerDocument.documentElement
  const width = viewport?.width ?? (usesAnchoredPosition ? root.clientWidth || view.innerWidth : view.innerWidth)
  const height = viewport?.height ?? (usesAnchoredPosition ? root.clientHeight || view.innerHeight : view.innerHeight)
  const clearance = usesAnchoredPosition
    ? Number.parseFloat(view.getComputedStyle(root).getPropertyValue('--dsh-frame-top-clearance'))
    : NaN
  const frameMargin = (root.hasAttribute('data-fullscreen') ? 0 : clearance) + 20
  const topMargin = Number.isNaN(clearance)
    ? margin
    : Math.max(margin, Math.min(frameMargin, anchor.top >= 0 ? anchor.bottom + gap : Infinity))

  const menuWidth = menu.offsetWidth
  const menuHeight = menu.offsetHeight
  const offsetForFixedPosition = viewport != null && CSS.supports('-webkit-backdrop-filter', 'none')
  const left = anchor.right - menuWidth + (offsetForFixedPosition ? viewportLeft : 0)
  const top = anchor.top - gap - menuHeight + (offsetForFixedPosition ? viewportTop : 0)
  style.left = `${Math.max(viewportLeft + margin, Math.min(left, viewportLeft + width - margin - menuWidth))}px`
  style.top = `${Math.max(viewportTop + topMargin, Math.min(top, viewportTop + height - margin - menuHeight))}px`
}
