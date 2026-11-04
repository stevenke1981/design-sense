# `optimize`

**When:** UI is slow, janky, or the bundle/binary is too big.

## Steps
1. Measure first: Lighthouse/Performance panel for web; frame time, CPU idle and memory for desktop.
2. Web: lazy-load below-the-fold images, set width/height, subset fonts, avoid layout thrash, cut unused CSS/JS.
3. Slint: avoid binding loops and heavy pure functions in bindings; use models for long lists (ListView), keep images sized; choose renderer per platform (see platform-slint.md).
4. Idle should be ~0% CPU: no timers or animations running when nothing changes.
5. Re-measure and report numbers before/after.

## Checks before you finish
- [ ] Numbers reported, not adjectives
- [ ] `perf/*` linter rules clean
- [ ] `design-sense check` run on changed files; P0–P2 fixed or explained

## Do
- Fix the biggest measured cost first

## Don't
- Optimise without a baseline
