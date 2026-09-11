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
