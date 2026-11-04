# `adapt`

**When:** Make the design work on other sizes, densities, inputs or platforms.

## Steps
1. List targets: phone, tablet, laptop, 4K desktop at 150–200%, touch vs mouse vs keyboard.
2. Reflow, don't shrink: change layout at breakpoints; keep touch targets ≥44px (web) / ≥24px with spacing (desktop mouse).
3. Images and icons: SVG or 2× assets; Slint `@image-url` with SVG for crisp scaling.
4. Platform conventions: Windows menu bar & shortcuts (Ctrl), macOS (⌘, menu in top bar), Linux varies.
5. Test with OS font scaling and high contrast mode.

## Checks before you finish
- [ ] No clipped text at 200% scaling
- [ ] Keyboard-only path works
- [ ] `design-sense check` run on changed files; P0–P2 fixed or explained

## Do
- Use native dialogs and shortcuts where users expect them

## Don't
- Assume 96 DPI
