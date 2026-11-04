# `init`

**When:** Create or refresh PRODUCT.md — the product's who/why/voice — so every later design decision has context.

## Steps
1. Look for existing facts: README, landing copy, package metadata, app store text.
2. Copy `templates/PRODUCT.md` to the project root.
3. Fill only what you can source; ask the user short questions for the rest (audience, top 3 jobs, tone, things to avoid, competitors they admire/hate).
4. Keep it under ~80 lines; it is read on every task.

## Checks before you finish
- [ ] No invented metrics, customers or claims
- [ ] Tone described with do/don't examples, not adjectives only
- [ ] Language and locale stated (e.g. zh-TW primary, English secondary)
- [ ] `design-sense check` run on changed files; P0–P2 fixed or explained

## Do
- Quote the user's own words
- Mark unknowns as TODO

## Don't
- Fill gaps with plausible marketing filler
- Put visual tokens here (those belong in DESIGN.md)
