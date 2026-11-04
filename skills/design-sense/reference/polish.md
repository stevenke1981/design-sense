# `polish`

**When:** Final pass before shipping; small, careful improvements without redesign.

## Steps
1. Run the linter; fix all P0–P2.
2. Align everything to the spacing scale; fix off-by-one alignments and optical centering of icons.
3. Check every interactive state (hover, focus-visible, pressed, disabled, loading).
4. Tighten copy: consistent capitalisation/punctuation, full-width punctuation in zh-TW (，。：「」).
5. Check edges: truncation with tooltips, wrapping, long numbers, empty states.
6. Check dark mode / high-contrast if supported.

## Checks before you finish
- [ ] No layout shift between states
- [ ] Same thing looks the same everywhere
- [ ] Nothing outside the task's scope changed
- [ ] `design-sense check` run on changed files; P0–P2 fixed or explained

## Do
- Make many tiny fixes, each verifiable

## Don't
- Sneak in a new visual direction
