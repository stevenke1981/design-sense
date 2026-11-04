# `audit`

**When:** Technical quality review: accessibility, responsiveness, performance, i18n, robustness.

## Steps
1. Run `design-sense check <ui dirs> --json` and group findings by rule.
2. Keyboard: tab through every control; focus visible; no traps; Esc closes dialogs.
3. Screen reader names for icon buttons, images, inputs; heading outline.
4. Contrast for text, icons, focus rings, placeholder, disabled states.
5. Resize: 320px wide, 1920px wide; desktop window at minimum size; 100/150/200% scaling.
6. Content stress: long zh-TW strings, long English words, empty data, 1,000 rows.
7. Report as a table: issue · severity P0–P3 · location · fix.

## Checks before you finish
- [ ] Every P0/P1 has a fix or an explicit owner decision
- [ ] Untested areas are listed as untested
- [ ] `design-sense check` run on changed files; P0–P2 fixed or explained

## Do
- Re-run the linter after fixes and show the delta

## Don't
- Claim WCAG compliance from a linter run alone
