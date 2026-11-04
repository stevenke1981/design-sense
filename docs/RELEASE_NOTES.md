First release of design-sense.

- Skill `design-sense` with 19 design commands, 5 platform guides (web, Slint, Windows, social graphics, zh-TW typography), and PRODUCT.md / DESIGN.md templates.
- `design-sense check`: 46 deterministic rules for HTML, CSS, JSX/TSX, Vue, Svelte, Slint and SVG. It outputs text or JSON, uses P0–P3 severities, and supports a config file, ignore globs and inline suppressions.
- Adapters: Claude Code plugin with a fail-open PostToolUse hook, Cursor rule, AGENTS.md, Copilot and GEMINI.md snippets, and `install.mjs` with `--dry-run`.
- GitHub Action `stevenke1981/design-sense@v0.1.0`.

Verify the download: `sha256sum -c SHA256SUMS.txt` (or `Get-FileHash` on Windows).
