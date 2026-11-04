<!-- design-sense:start -->
## Design (design-sense)

Before finishing any change to UI files (HTML/CSS/JSX/TSX/Vue/Svelte/.slint/SVG) or social images, follow the design-sense skill: read PRODUCT.md / DESIGN.md if present, load the matching reference in `.design-sense/skills/design-sense/reference/` (platform-web, platform-slint, platform-windows, social-graphics, zh-tw-typography), then run `node .design-sense/bin/design-sense.mjs check <changed files>` and fix P0–P2 findings (or suppress with a `design-sense-disable-next-line <rule> — reason` comment). Named design commands (critique, audit, polish, bolder, quieter, distill, typeset, colorize, layout, animate, harden, clarify, adapt, optimize, onboard, shape, init, document, extract) are defined in `.design-sense/skills/design-sense/reference/<command>.md`.
<!-- design-sense:end -->
