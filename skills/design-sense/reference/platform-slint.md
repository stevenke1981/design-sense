# Slint desktop notes

## Structure & layout
- Build with `HorizontalLayout` / `VerticalLayout` / `GridLayout`; give elements `min-width`/`preferred-width` and use `horizontal-stretch` instead of fixed sizes.
- Always set `min-width` and `min-height` on the main `Window` so it cannot collapse. Frameless popups (`no-frame: true`) may use fixed sizes.
- Long lists: `ListView` / `for` over a `VecModel` driven from Rust; don't rebuild the model on every tick.
- Keep bindings cheap; heavy work goes to Rust (threads + `slint::invoke_from_event_loop`) to keep idle CPU at ~0%.

## Theme
- Put every color in one `export global Theme { out property <color> … }` (the linter flags literals outside a global). Add a `dark` flag and switch values there.
- Std widgets follow the chosen style (`fluent`, `material`, `cupertino`, `cosmic`, `native`); pick one explicitly (e.g. `SLINT_STYLE=fluent` or in `build.rs` via `slint_build::CompilerConfiguration::with_style`) so Windows and Linux look the same.

## Fonts & CJK
- Set `default-font-family` on the Window. For zh-TW on Windows use `"Microsoft JhengHei UI"`; Slint does not take a CSS-like list, so implement the fallback chain in Rust: check installed fonts in order *Microsoft JhengHei UI → Microsoft YaHei UI → PMingLiU → SimSun* (or bundle Noto Sans TC with `import "font.ttf";`) and pass the first found as an `in property <string> ui-font`.
- No `font-italic: true` on CJK text. Body text ≥13px for CJK in dense UIs; 11–12px only for secondary labels.

## Rendering on Windows (the transparency trap)
- With the software renderer, partial redraws of windows with transparent/rounded backgrounds can leave see-through holes or a dark rectangle behind popups. Use the **Skia** renderer on Windows (`slint = { features = ["renderer-skia"] }` and select it with `SLINT_BACKEND=winit-skia` or `BackendSelector`) for transparent, rounded or overlay windows. Skia adds ~15 MB to the exe; keep the software/femtovg renderer on platforms that don't need it.
- Test indicator/overlay windows on a real Windows machine; CI VMs without GPUs may hide the bug.

## Controls
- **Icon-only buttons need a tooltip and a name.** Slint has no built-in tooltip: build a small `Tooltip` component shown when `TouchArea.has-hover` is true for ~500 ms, and set `accessible-label`. The linter checks `slint/icon-button-tooltip`.
- Custom clickable components: `accessible-role: button`, `accessible-label`, a `FocusScope` handling Enter/Space, and a visible focus state.
- Use SVG icons (`@image-url("icons/x.svg")`) with `colorize: Theme.icon;` so they follow the theme and stay sharp at any DPI. Avoid emoji/Unicode symbols — many are missing from Windows UI fonts.

## Menu bars
- Slint ≥1.10 has `MenuBar { Menu { title: "檔案(&F)"; MenuItem { title: "開啟…"; activated => {…} } } }` inside `Window`; on macOS it maps to the system menu. Follow Windows order: 檔案 / 編輯 / 檢視 / 工具 / 說明, show shortcuts (Ctrl+O), use "…" for items that open dialogs.

## DPI
- Slint units are logical px; `1px` scales with the OS factor. Test at 100%, 150%, 200% and when moving between monitors with different scaling. Use `phx` only for hairlines that must stay one physical pixel.
