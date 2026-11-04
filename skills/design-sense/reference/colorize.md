# `colorize`

**When:** Create or fix a palette, contrast, or dark mode.

## Steps
1. Start from one brand hue; derive neutrals slightly tinted toward it.
2. Define roles: background, surface, text, text-muted, border, accent, accent-text, success, warning, danger, focus.
3. Check contrast: text ≥4.5:1, large text/icons ≥3:1, focus ring ≥3:1 against both neighbours.
4. Dark mode: not inverted — lower surface contrast, desaturate accents, avoid pure #000 / #fff.
5. Never encode meaning by color alone; add icon or text.

## Checks before you finish
- [ ] `a11y/contrast` and `a11y/gray-on-color` clean
- [ ] Tokens used, not literals
- [ ] `design-sense check` run on changed files; P0–P2 fixed or explained

## Do
- Test colors on real content and both themes

## Don't
- Default to violet/blue gradients
- Put gray text on saturated backgrounds
