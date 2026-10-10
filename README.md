# browser-toggle

Hermes Desktop plugin: one button that opens/closes the built-in browser —
exactly what the `Ctrl+Shift+L` shortcut does (`view.showBrowser` →
`toggleBrowserTab()`). Nothing else.

- Deployed at: `~/.hermes/desktop-plugins/browser-toggle/plugin.js`
- Area: `titleBar.tools.right` — the top-right titlebar cluster that also holds
  Settings / Layout / **HUD mode**. The app renders the contribution with its
  own `TitlebarToolButton`, so box (24×24), glyph size (13.9px), hover, colors
  and tooltip come from the app itself.
- Icon: codicon `globe` — the same glyph the command palette uses for
  "Alternar navegador"; it paints with the inherited `currentColor`.
- Trigger: dispatches the shortcut's own chord on the window, so the app's
  capture-phase keybind listener runs the native `view.showBrowser` action.
  No browser logic of our own, no `eval`, no DOM scraping of core UI.
- Styling: none written by us; `Button size="icon-titlebar"` supplies size,
  radius and hover out of `var(--ui-*)` tokens.

## Layout

- `plugin.js` — source of truth (plain ESM, no build step).
- `SHA256SUMS` — source vs deployed copy.

## Verify

```bash
node --check plugin.js            # syntax (ESM; run on a .mjs copy)
sha256sum -c SHA256SUMS           # source vs deployed
cmp plugin.js ~/.hermes/desktop-plugins/browser-toggle/plugin.js
```

Static admission lint (repo's own): `hermes_cli/plugin_validate_desktop.py`
→ `desktop_surface_findings` returns `[]`.

## Install status

| Machine | Deployed | sha256 | Live check (CDP) |
|---|---|---|---|
| ProDesk (Linux Mint) | `~/.hermes/desktop-plugins/browser-toggle/plugin.js` | `b220e0b9fa841c1d986265635e32e8b1ba3ac868b5da9548b51e774e41d92f39` | passed |
| ThinkPad 2900 (Omarchy) | same path | `b220e0b9…2f39` (identical) | passed |

Live checks (throwaway instance + CDP, temp `HERMES_HOME`, nothing of the real
setup written): button present next to HUD mode with the same classes/size;
trusted mouse click toggles the browser pane open→closed; trusted
`Ctrl+Shift+L` toggles it the same way; hover tooltip reads
"Alternar navegador Ctrl+Shift+L".
