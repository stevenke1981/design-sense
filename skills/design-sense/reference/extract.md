# `extract`

**When:** Repeated literals or copy-pasted components should become tokens and shared components.

## Steps
1. Find repeated colors, sizes, radii, shadows and near-duplicates (e.g. #333 vs #343434).
2. Merge near-duplicates into one token; name by role (`text-muted`, `surface-raised`) not by value (`gray-3`).
3. Web: CSS custom properties in :root (+ dark theme block). Slint: `export global Theme { out property <color> … }`.
4. Replace literals with tokens in small commits; re-run the linter (`color/too-many`, `slint/hardcoded-colors`).
5. Extract a component only when used 3+ times with the same behaviour.

## Checks before you finish
- [ ] Visual output unchanged unless merging was intended
- [ ] No token used once
- [ ] Dark mode still works
- [ ] `design-sense check` run on changed files; P0–P2 fixed or explained

## Do
- Keep the token set small (≈8–12 colors)

## Don't
- Create abstractions for one-off layouts
