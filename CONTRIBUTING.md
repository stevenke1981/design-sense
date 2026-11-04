# Contributing

- Node ≥ 18, no dependencies. Run `npm test`.
- New rule: add metadata in `lib/rules.mjs`, logic in `lib/detector.mjs`, a triggering case in `test/fixtures/bad.*` (and keep `good.*` clean), then regenerate the README table with `node scripts/gen-rules-table.mjs`.
- Every rule must be explainable in one sentence and come with a concrete fix. Prefer missing a case over a noisy rule.
- Keep the linter and hooks offline, read-only and fail-open.
