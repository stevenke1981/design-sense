# `document`

**When:** Write DESIGN.md describing the design system as it actually exists in code.

## Steps
1. Scan CSS variables / Tailwind config / Slint globals / theme files for colors, type, spacing, radii, shadows, motion.
2. Count how often each value is used; the frequent ones are the real tokens, the rare ones are drift.
3. List components with file paths and their variants/states.
4. Copy `templates/DESIGN.md` and fill it with what you found; add a 'Drift' section for inconsistent one-offs.
5. Run `design-sense check` on the UI folder and summarise top findings in DESIGN.md's 'Known issues'.

## Checks before you finish
- [ ] Every token has a value and where it is defined
- [ ] Components link to files
- [ ] Platform notes (Slint renderer, fonts, DPI) included for desktop apps
- [ ] `design-sense check` run on changed files; P0–P2 fixed or explained

## Do
- Describe what is, then propose what should be in a separate section

## Don't
- Document an aspirational system that the code does not use
