---
name: design-sense
description: Use whenever you create, edit, review or restyle anything a person will look at — web UI (HTML, CSS, React/TSX/JSX, Vue, Svelte, Tailwind), Slint desktop UI (.slint), Windows desktop apps, or social-media images/cards — and when the user asks to critique, audit, polish, simplify, make bolder/quieter, fix typography, color, layout, motion, copy, accessibility, responsiveness, zh-TW/CJK text, or document a design system (PRODUCT.md, DESIGN.md). Gives a shared design vocabulary (named commands) and a deterministic local linter (`design-sense check`). Skip for backend-only work.
license: Apache-2.0
---

# design-sense

A working vocabulary for interface design plus a linter that catches the
mistakes models make most. Treat it as a senior designer sitting next to you:
opinions first, then checks, then proof.

## Always (every UI task, even small ones)

1. **Read context.** If `PRODUCT.md` or `DESIGN.md` exists at the project root,
   read them before touching UI. If they don't exist and the task is more than a
   one-line fix, suggest `init` (product) / `document` (design system) — do not
   invent brand facts.
2. **Pick the surface's job.** Decide which one applies and design for it:
   - *Sell* (landing, pricing, campaign, social post): one message, strong
     focal point, real content/imagery.
   - *Work* (app, dashboard, editor, settings, desktop tool): density,
     predictability, keyboard, native conventions; brand only in details.
   - *Read* (docs, articles, help): measure 60–75 Latin chars / 30–40 CJK
     chars, generous leading, clear outline.
3. **Load the platform reference** that matches the files you touch:
   web → `reference/platform-web.md`; `.slint` → `reference/platform-slint.md`;
   any Windows app → `reference/platform-windows.md`; images for posts →
   `reference/social-graphics.md`; any Chinese text → `reference/zh-tw-typography.md`.
4. **Run the linter on what you changed** before you say you are done:
   `node <this-skill-dir>/../../bin/design-sense.mjs check <changed files>`
   (or `design-sense check …` / `npx --no-install design-sense check …` if
   installed; inside an installed project use `node .design-sense/bin/design-sense.mjs check`).
   Fix P0/P1, fix P2 unless the brief says otherwise, mention P3 you left.
   If a rule is wrong for this case, suppress it on that line with a reason:
   `/* design-sense-disable-next-line rule/id — reason */`.
5. **Look at it.** If you can render (browser screenshot, `slint-viewer`,
   app screenshot), check the real result at the real size — narrow window,
   wide window, 150% DPI, dark mode if supported. Say what you could not check.

## Defaults that beat the generic look

- One accent color, used sparingly; neutrals tinted toward it. No violet→blue
  gradients unless the brand asks.
- Type does the hierarchy: 2 families max, a clear size scale (e.g. 12/14/16/20/28/40),
  weight and spacing before color and boxes.
- Fewer containers. A list with dividers beats a grid of cards; never a card in a card.
- Icons are SVG with one stroke width, never emoji; icon-only controls get a tooltip
  and an accessible name.
- Every interactive thing has hover, focus-visible, active, disabled, loading states.
- Real copy: concrete verbs and numbers, not "seamless", "unlock", "supercharge".
- Motion is short (150–250 ms), purposeful, and respects reduced-motion.
- The brief wins: if the user pins a style, follow it even if a rule here disagrees.

## Commands

The user (or you) can name a command; load its reference and follow it.
With no command, infer the closest one from the request.

| Command | Use when | Reference |
|---|---|---|
| `shape` | planning a new screen/feature before code | reference/shape.md |
| `init` | write PRODUCT.md (who, why, voice) | reference/init.md |
| `document` | write DESIGN.md from existing code | reference/document.md |
| `extract` | pull repeated values/components into tokens | reference/extract.md |
| `critique` | honest design review with priorities | reference/critique.md |
| `audit` | technical checks: a11y, responsive, perf, i18n | reference/audit.md |
| `polish` | last pass before shipping | reference/polish.md |
| `bolder` | design is timid/forgettable | reference/bolder.md |
| `quieter` | design is loud/noisy | reference/quieter.md |
| `distill` | too much stuff; reduce to essentials | reference/distill.md |
| `typeset` | fix fonts, scale, rhythm, CJK text | reference/typeset.md |
| `colorize` | build or repair a palette, contrast, dark mode | reference/colorize.md |
| `layout` | spacing, grid, alignment, responsive structure | reference/layout.md |
| `animate` | add or fix motion | reference/animate.md |
| `harden` | errors, empty/long/RTL/CJK content, offline, limits | reference/harden.md |
| `clarify` | labels, microcopy, error messages | reference/clarify.md |
| `adapt` | other screen sizes, DPI, input types, platforms | reference/adapt.md |
| `optimize` | rendering speed, bundle/binary size, jank | reference/optimize.md |
| `onboard` | first-run, empty states, teaching the UI | reference/onboard.md |

## Linter

`design-sense check <paths>` — 46 rules, P0 (broken) … P3 (taste). `--json` for
machines, `--fail-on P1` (default) sets the exit code, `design-sense explain <id>`
explains a rule. Config: `.design-sense.json` `{ "rules": {"id": "off"|"P2"}, "ignore": ["glob"] }`.
The linter is a floor, not the goal: zero findings does not mean good design.

## Safety

This skill never needs network access, global installs, or launching other
agents. Don't add any of those on its behalf.
