Premium templates: glass, metal, big radii, soft depth.

- `templates/premium/web/`: dashboard, landing and login pages with frosted glass (`backdrop-filter` with a tinted fallback), brushed silver/gold/titanium buttons, a radius and shadow token scale, dark and light themes, zh-TW font stack, reduced-motion support. No external dependencies.
- `templates/premium/slint/`: `tokens.slint` + `components.slint` (GlassPanel, MetalButton, GlassToggle, GlassSlider, GlassTabs, IconButton with tooltip) and a demo settings window. Slint has no backdrop blur, so glass is emulated with layered translucent gradients, a rim highlight and shadows. A small `render/` crate writes PNGs (Skia via a display, or the headless software renderer).
- `templates/premium/social/post.svg`: a 1080×1080 launch post in the same style.
- New skill reference `reference/premium-glass-metal.md`: glass and metal recipes, radius and shadow scales, do/don't, accessibility and `backdrop-filter` performance caveats. Linked from SKILL.md.
- Screenshots in `docs/images/premium/`; all templates pass `design-sense check` with 0 findings, enforced by a new test.
- The release zip now includes `templates/`.

Verify the download: `sha256sum -c SHA256SUMS.txt` (or `Get-FileHash` on Windows).
