# `layout`

**When:** Spacing, alignment, grid or responsive structure is off.

## Steps
1. Pick a spacing scale (4/8/12/16/24/32/48/64) and snap everything to it.
2. Group related items tightly, separate groups widely (proximity beats borders).
3. Align to a few strong edges; avoid centered paragraphs.
4. Web: fluid widths (max-width + %), grid/flex with min sizes, test 320–1920px.
5. Slint: layouts (HorizontalLayout/VerticalLayout/GridLayout) with min/preferred sizes; set Window min-width/min-height.
6. Check overflow: long strings, translated text (zh-TW is shorter, German longer), large font settings.

## Checks before you finish
- [ ] No horizontal scroll at 320px
- [ ] Window usable at its minimum size
- [ ] Linter clean for layout/*
- [ ] `design-sense check` run on changed files; P0–P2 fixed or explained

## Do
- Use stretch factors and min sizes instead of fixed sizes

## Don't
- Use fixed pixel widths for containers
- Nest cards to create sections
