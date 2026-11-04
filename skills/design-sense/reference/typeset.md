# `typeset`

**When:** Fonts, sizes, line-height, measure, or CJK text look wrong.

## Steps
1. Choose at most two families; define a size scale and use only those sizes.
2. Body: Latin 16px/1.5; zh-TW 15–17px/1.7. Desktop UI: 12–14px base (Windows 9pt ≈ 12px).
3. Measure: 60–75 Latin characters, 30–40 CJK characters per line.
4. Headings: tighter leading (1.1–1.3), slight negative tracking for Latin only.
5. For CJK read `zh-tw-typography.md`: font stack, no italic, punctuation, line breaking.
6. Use tabular numerals for tables and changing numbers.

## Checks before you finish
- [ ] Linter clean for type/* and cjk/*
- [ ] No font size outside the scale
- [ ] Text never touches its container edge
- [ ] `design-sense check` run on changed files; P0–P2 fixed or explained

## Do
- Set font stacks with explicit CJK fallbacks

## Don't
- Use more than 3 weights
- Use ALL CAPS for CJK-adjacent labels expecting it to look like Latin
