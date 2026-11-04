# `animate`

**When:** Add, fix or remove motion.

## Steps
1. Each animation must explain something: where an item came from, what changed, that work is happening.
2. Durations 120–250 ms for UI, up to 400 ms for large movement; ease-out on enter, ease-in on exit.
3. Animate transform and opacity only (web); in Slint use `animate` on specific properties.
4. Respect reduced motion (web media query; desktop: provide a setting or keep motion minimal).
5. No motion on first paint that delays reading.

## Checks before you finish
- [ ] `a11y/reduced-motion`, `perf/transition-all` clean
- [ ] 60 fps on a modest machine
- [ ] `design-sense check` run on changed files; P0–P2 fixed or explained

## Do
- Prefer instant feedback over decorative motion

## Don't
- Loop animations in work tools
- Animate layout properties
