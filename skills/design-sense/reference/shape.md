# `shape`

**When:** Plan a screen or feature before writing UI code.

## Steps
1. Write one sentence: who uses this, in what situation, to finish what.
2. List the content and actions in priority order; mark the single primary action.
3. Sketch the structure in text (regions top→bottom / left→right) for the narrowest and widest size.
4. Name the states: empty, loading, partial, error, success, permission denied, offline.
5. Pick components from DESIGN.md first; only then propose new ones.
6. Show the plan and get a yes before building anything large.

## Checks before you finish
- [ ] Exactly one primary action per view
- [ ] Every state above has a plan
- [ ] Plan fits the surface's job (sell / work / read)
- [ ] `design-sense check` run on changed files; P0–P2 fixed or explained

## Do
- Ask for real content samples (longest name, typical list length)
- Reuse existing patterns in the app

## Don't
- Start from a generic hero + 3 feature cards
- Design only the happy path
