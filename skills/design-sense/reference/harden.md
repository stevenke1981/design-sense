# `harden`

**When:** Make UI survive real-world content and failures.

## Steps
1. Empty, loading (skeleton or spinner after 300 ms), error with retry, partial data, offline.
2. Long content: zh-TW without spaces, long URLs, 40-char names, huge numbers, 0 and negative values.
3. Input: validation messages next to fields, preserved values on error, paste handling, IME composition (don't submit on Enter while composing).
4. Limits: file too large, permission denied (e.g. writing into Program Files), disk full, timeouts.
5. Desktop: multi-monitor, DPI change while running, window restore off-screen.

## Checks before you finish
- [ ] Every async action has loading + error state
- [ ] No silent failures
- [ ] IME-safe text inputs
- [ ] `design-sense check` run on changed files; P0–P2 fixed or explained

## Do
- Show what happened and what to do next

## Don't
- Show raw error codes or stack traces to users
