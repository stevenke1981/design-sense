# premium-glass-metal — glass, metal, big radii, soft depth

Use when the brief asks for a "premium / 高級 / 質感" look: frosted glass,
brushed metal, rounded corners, layered shadows. Working templates (web, Slint,
SVG social post) live in the repo under `templates/premium/`; screenshots in
`docs/images/premium/`. This file is the recipe so you can rebuild the look
without them.

## When it fits, when it doesn't
- Fits: landing heroes, login/onboarding, a hero card on a dashboard, settings
  panels, launch posts. One app with a strong brand moment.
- Doesn't fit: dense data tables, editors, long reading. There, glass costs
  readability and GPU time for no gain. Use it on 1–3 surfaces per screen, not
  every box (`slop/glass-everywhere`).
- Glass only reads as glass when there is something colorful behind it. On a
  flat gray page it just looks like a dirty card. Put 2–3 soft color glows in
  the background first.

## Background (do this first)
- Dark: near-black navy base + 3 radial glows (teal, amber, coral at ~25–45%
  alpha), placed off-canvas so only their falloff shows.
- Light: pale blue-gray base, same glows at lower alpha.
- Add a 4–6% noise layer on large gradients to stop banding.
- Avoid the violet→blue gradient default (`slop/purple-blue-gradient`). Pick a
  palette from the product, not from the trend.

## Glass recipe (web)
```css
.glass {
  background: linear-gradient(145deg, rgb(255 255 255 / .14), rgb(255 255 255 / .03) 55%),
              rgb(16 24 38 / .62);                 /* tinted base: carries contrast */
  border: 1px solid rgb(255 255 255 / .16);         /* rim */
  border-radius: 26px;
  box-shadow: 0 2px 6px rgb(0 0 0 / .35), 0 18px 40px -12px rgb(0 0 0 / .55),
              inset 0 1px 0 rgb(255 255 255 / .28); /* top specular line */
  backdrop-filter: blur(22px) saturate(160%);
}
@supports not (backdrop-filter: blur(1px)) { .glass { background-color: #0d1522; } }
```
Layers, in order: tinted base → diagonal white sheen → 1px rim (brighter at top-left)
→ inner top highlight → two-part shadow (tight contact + wide ambient).

## Glass recipe (Slint, no blur available)
Slint has no backdrop blur. Emulate it, and say so in the code:
1. `background:` translucent tint (`#101826a0` dark / `#ffffffb0` light).
2. Child `Rectangle` with `@linear-gradient(145deg, white 14% → white 2% → transparent)`.
3. Child `Rectangle` with `border-width: 1px; border-color: #ffffff2e`.
4. 1px top line that fades out at both ends (keep it inside the corner radius).
5. `drop-shadow-blur: 28px; drop-shadow-offset-y: 10px; drop-shadow-color: #0000008c`.
Put text on that tinted base, never directly over the background glows.
The software renderer does not clip gradients to `border-radius`; check the look
with Skia or FemtoVG.

## Metal recipe
Metal = a vertical 4-stop gradient with a dark "horizon" just below the middle,
plus a bevel (light top edge, dark bottom edge).

| Metal | Stops (0 / 38 / 52 / 100%) | Ink |
|---|---|---|
| Silver | `#f7f9fc` `#d5dbe4` `#aab3c0` `#e3e8ef` | `#15181d` |
| Gold | `#fff1c9` `#f0c65a` `#b8862a` `#f5d684` | `#2a1c02` |
| Titanium | `#8a94a3` `#4d5664` `#2e3540` `#6b7584` | `#f6f8fb` |

- Bevel: `inset 0 1px 0 rgb(255 255 255 / .85), inset 0 -1px 0 rgb(0 0 0 / .28)`.
- Brushed: add `repeating-linear-gradient(90deg, rgb(255 255 255/.035) 0 1px, rgb(0 0 0/.025) 1px 3px)` on top. Keep it subtle; strong stripes look cheap.
- Hover: lift 1px, larger shadow, `filter: brightness(1.06)`. Pressed: sink 1px,
  flip the bevel (inset dark top), reverse the gradient.
- One gold (primary) per view. Silver for secondary, titanium for dark actions.

## Radius scale
`8 / 12 / 18 / 26 / 34 px` (xs → xl) and `999px` for true pills.
- Nested radius = outer radius − padding (a 26px card with 8px inset → 18px child).
- Buttons 12px, inputs 12px, cards 26px, modals/login 34px. Don't pill everything
  (`slop/pill-overuse`).

## Shadow scale
- s1 contact: `0 1px 2px α.35, 0 4px 12px α.25`
- s2 card: `0 2px 6px α.35, 0 18px 40px -12px α.55`
- s3 raised: `0 6px 16px α.35, 0 40px 80px -24px α.7`
Light theme: same geometry, slate color at ¼ the alpha.

## Do / don't
- Do: one focal glass surface, strong type hierarchy, real content.
- Do: give every glass surface an opaque-enough tint that text passes 4.5:1 even
  if blur is off.
- Do: tokens for every color, radius and shadow; dark/light by swapping tokens.
- Don't: glass on glass on glass (`slop/nested-cards`), gradient text, emoji icons.
- Don't: gray text on the colored glows; put it on the tint.
- Don't: use metal for body surfaces. Metal is for small controls: buttons, knobs,
  toggles, a logo coin.

## Accessibility
- Measure contrast against the *tint over the darkest/lightest glow it can sit on*,
  not against the page base. Keep secondary text ≥ 4.5:1 (e.g. `#c3ccda` dark,
  `#334155` light).
- Text on metal: check the stop under the text (the horizon band), not the top
  highlight. Titanium with white ink fails on its light top edge, so center labels.
- Focus: 2px accent outline with 3px offset; glass rims are not focus rings.
- `prefers-reduced-motion: reduce` → drop lifts and shine animations.
- Gold/amber as *text* in the light theme needs a darker shade (`#8a5a12`).

## Performance
- `backdrop-filter` re-blurs everything behind the element on every frame that
  changes. Keep blurred surfaces few, not huge, and not inside scrolling lists.
- Avoid animating elements that have backdrop-filter, or the content behind them.
- `background-attachment: fixed` + blur can be slow on mobile; drop it under 960px
  if scrolling janks.
- Big blur radii (> 30px) cost more and rarely look better.
- Slint: many large drop shadows cost fill rate on the software renderer; prefer
  Skia on Windows.
