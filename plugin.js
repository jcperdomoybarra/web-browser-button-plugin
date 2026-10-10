/**
 * browser-toggle — Hermes Desktop plugin.
 *
 * One button that does exactly what the Ctrl+Shift+L shortcut does: opens the
 * app's built-in browser pane, and hides it again on the next press.
 *
 * Reuses the app's native action: the click dispatches the chord of the
 * `view.showBrowser` keybind on the window, so the app's own listener runs
 * `toggleBrowserTab()` — the same path a physical Ctrl+Shift+L takes.
 *
 * WHERE IT LIVES: the `titleBar.right` slot, i.e. INSIDE the app's main right
 * cluster (the one that holds Settings / Layout / HUD mode). That cluster is
 * `-webkit-app-region: no-drag` and is reserved against the window-drag strip
 * of the side panes. The older `titleBar.tools.right` slot is a separate
 * cluster that is NOT reserved, so when a right-hand pane was open (e.g.
 * brand-lean) its drag strip covered the button: no hover, no tooltip, and a
 * click dragged the window.
 *
 * LANGUAGE: the tooltip text comes from the app's own translation of the
 * keybind (`t.keybinds.actions['view.showBrowser']`) through `useI18n`, so it
 * follows the active UI language and re-renders on a language switch.
 */
import { Button, Codicon, Tip, haptic, useI18n } from '@hermes/plugin-sdk'
import { jsx } from 'react/jsx-runtime'

const ID = 'browser-toggle'
const ACTION_ID = 'view.showBrowser'

function isMac(platform) {
  return /mac/i.test(String(platform ?? (globalThis.navigator ? navigator.platform : '')))
}

/** The shipped binding of `view.showBrowser` as a KeyboardEventInit. */
export function browserChordEventInit(platform) {
  const mac = isMac(platform)
  return { altKey: false, code: 'KeyL', ctrlKey: !mac, key: 'l', metaKey: mac, shiftKey: true }
}

/** Shortcut hint shown next to the label (display only). */
export function browserHint(platform) {
  return isMac(platform) ? '⌘⇧L' : 'Ctrl+Shift+L'
}

/** Press, then release, the shortcut's chord so the app runs the bound action. */
export function pressBrowserShortcut(platform) {
  const target = document.body || document.documentElement
  if (!target) return false
  const init = browserChordEventInit(platform)
  target.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init }))
  target.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: init.key }))
  return true
}

/** Localized label, falling back to the action id if the app has no string. */
export function browserLabel(t) {
  return t?.keybinds?.actions?.[ACTION_ID] ?? ACTION_ID
}

function BrowserToggleButton() {
  const { t } = useI18n()
  const label = browserLabel(t)

  const tip = jsx('span', {
    children: [label, jsx('span', { className: 'ms-2 opacity-55', children: browserHint() }, 'hint')]
  })

  return jsx(Tip, {
    label: tip,
    placement: 'toolbar',
    children: jsx(Button, {
      'aria-label': label,
      className:
        'text-muted-foreground/85 hover:bg-(--ui-control-hover-background) hover:text-foreground bg-transparent select-none',
      onClick: () => {
        haptic('tap')
        pressBrowserShortcut()
      },
      onPointerDown: event => event.stopPropagation(),
      size: 'icon-titlebar',
      type: 'button',
      variant: 'ghost',
      children: jsx(Codicon, { name: 'globe' })
    })
  })
}

export default {
  id: ID,
  name: 'Browser toggle',
  register(ctx) {
    ctx.register({ id: ID, area: 'titleBar.right', order: 100, render: BrowserToggleButton })
  }
}
