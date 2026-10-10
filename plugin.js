/**
 * browser-toggle — Hermes Desktop plugin.
 *
 * One button that does exactly what the Ctrl+Shift+L shortcut does: opens the
 * app's built-in browser pane, and hides it again on the next press. Nothing
 * else — no pane, no backend, no own browser.
 *
 * HOW THE NATIVE ACTION IS REUSED (no browser is reimplemented here)
 * ------------------------------------------------------------------
 * The shortcut is a keybind action: `view.showBrowser`, shipped default
 * `mod+shift+l` (apps/desktop/src/lib/keybinds/actions.ts), whose handler is
 * `toggleBrowserTab()` (apps/desktop/src/app/hooks/use-keybinds.ts →
 * apps/desktop/src/store/preview.ts). The plugin SDK has no door that runs a
 * keybind action by id, so this button feeds the app's OWN dispatcher: it
 * dispatches the shortcut's chord on the window, and the app's capture-phase
 * keydown listener resolves it and runs `toggleBrowserTab()` — the same code
 * path a physical Ctrl+Shift+L takes. The app itself uses the same trick for
 * its F12 hook (use-keybinds.ts dispatches synthetic KeyboardEvents).
 *
 * THE BUTTON ITSELF is a `titleBar.tools.right` contribution, so the app
 * renders it with its own TitlebarToolButton: same 24×24 box, same codicon
 * glyph size, same hover and same tooltip (label + the live ⌘/Ctrl⇧L hint
 * coming from `actionId`) as the neighbouring Settings / Layout / HUD mode
 * buttons in the top-right titlebar cluster.
 *
 * Styling: none of our own — size, radius and colors come from the app's
 * `Button size="icon-titlebar"`; the glyph is the app's own browser icon
 * (codicon `globe`, the exact glyph the command palette uses for
 * "Toggle browser" (localized)), which paints with the inherited `currentColor`.
 */
import { Codicon, haptic, translateNow } from '@hermes/plugin-sdk'
import { jsx } from 'react/jsx-runtime'

const ID = 'browser-toggle'
const ACTION_ID = 'view.showBrowser'
// The app's own translated "Toggle browser" string (commandCenter.toggleBrowser),
// so the label follows the active UI language. Resolved at read time, never cached.
const LABEL_KEY = 'commandCenter.toggleBrowser'

export function browserLabel() {
  return translateNow(LABEL_KEY)
}

/**
 * The shipped binding of `view.showBrowser` as a KeyboardEventInit.
 *
 * `mod` is Cmd on macOS and Ctrl everywhere else (combo.ts folds Ctrl into
 * `mod` off macOS), so the chord has to be platform-shaped or the combo index
 * would never match. The base token is the unshifted `l`.
 */
export function browserChordEventInit(platform) {
  const mac = /mac/i.test(String(platform ?? (globalThis.navigator ? navigator.platform : '')))
  return {
    altKey: false,
    code: 'KeyL',
    ctrlKey: !mac,
    key: 'l',
    metaKey: mac,
    shiftKey: true
  }
}

/**
 * Press, then release, the shortcut's chord — the app's keybind listener runs
 * the bound action exactly as it would for a physical keypress.
 *
 * The paired keyup matters: modifier-driven chrome (the layout glyph's held-⌘
 * morph, `useModifierHeld`) tracks Ctrl on keydown and clears it on keyup, so
 * a click that only fakes the keydown would leave that morph stuck on.
 *
 * Returns true when the chord was dispatched.
 */
export function pressBrowserShortcut(platform) {
  const target = document.body || document.documentElement
  if (!target) return false

  const init = browserChordEventInit(platform)

  target.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init }))
  target.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: init.key }))

  return true
}

export default {
  id: ID,
  name: 'Browser toggle',
  register(ctx) {
    ctx.register({
      id: ID,
      area: 'titleBar.tools.right',
      order: 100,
      data: {
        id: ID,
        actionId: ACTION_ID,
        icon: jsx(Codicon, { name: 'globe' }),
        get label() {
          return browserLabel()
        },
        onSelect: () => {
          haptic('tap')
          pressBrowserShortcut()
        }
      }
    })
  }
}
