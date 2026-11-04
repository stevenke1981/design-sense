# DESIGN.md
<!-- The design system as it exists in code. Generated/updated by the `document` command. -->

## Surface type
<sell | work | read> — <one line on what that means here>

## Color tokens
| Role | Light | Dark | Defined in |
|---|---|---|---|
| background | | | |
| surface | | | |
| text | | | |
| text-muted | | | |
| border | | | |
| accent | | | |
| danger / warning / success | | | |
| focus ring | | | |

## Typography
- Families: <Latin> + <CJK fallback chain>
- Scale (px): 12 / 14 / 16 / 20 / 28 / 40
- Line-height: body <1.5 Latin / 1.7 CJK>, headings <1.2>

## Spacing, radius, elevation, motion
- Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48
- Radius: <e.g. 6px controls, 10px panels>
- Shadows: <…>
- Motion: <durations, easing, reduced-motion policy>

## Components
| Component | File | Variants / states |
|---|---|---|

## Platform notes
- <e.g. Slint: Skia renderer on Windows; default-font-family from Rust; Window min 640×420>

## Drift / known issues
- <one-off values, linter findings to fix>
