# Web platform notes

- **Structure:** semantic HTML first (`header/nav/main/section/footer`, real `<button>` and `<a href>`), one `h1`, no skipped levels.
- **Responsive:** `<meta name="viewport" content="width=device-width, initial-scale=1">`; never disable zoom. Containers use `max-width` + `width:100%`; test 320, 768, 1280, 1920 px.
- **Tokens:** CSS custom properties in `:root`, dark theme via `@media (prefers-color-scheme: dark)` or a `[data-theme]` attribute. Tailwind: put tokens in the theme config, not arbitrary values.
- **Focus:** keep outlines or replace with a visible `:focus-visible` ring (≥3:1 contrast, ≥2px).
- **Motion:** wrap non-essential animation in `@media (prefers-reduced-motion: no-preference)`; Tailwind `motion-safe:`.
- **Images:** `alt`, `width`/`height` (or `aspect-ratio`), `loading="lazy"` below the fold, modern formats (WebP/AVIF) with fallback.
- **Fonts:** `font-display: swap`, subset CJK webfonts (they are 5–20 MB unsubsetted) or rely on system CJK fonts.
- **Forms:** visible `<label>`, `autocomplete` attributes, error text linked by `aria-describedby`, don't submit on Enter while an IME is composing (`event.isComposing`).
- **Heights:** `min-height: 100dvh` instead of `100vh` on mobile.
