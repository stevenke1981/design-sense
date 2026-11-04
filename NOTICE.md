# NOTICE

design-sense
Copyright 2026 Ke Sheng Da (stevenke1981)

Licensed under the Apache License, Version 2.0 (see `LICENSE`).

## Relationship to pbakaus/impeccable

This project was inspired by **Impeccable** by Paul Bakaus
(https://github.com/pbakaus/impeccable, Apache License 2.0).
We studied its public structure — the idea of a design skill with named
commands (critique, audit, polish, bolder, quieter, …), the PRODUCT.md /
DESIGN.md context-file convention, and a deterministic "anti-slop" detector —
and then **rewrote everything from scratch in our own structure and words**.

- No text, code, images, logo or branding were copied from Impeccable.
- The command names (e.g. `critique`, `audit`, `polish`, `bolder`, `quieter`,
  `distill`, `typeset`, `colorize`, `layout`, `animate`, `harden`, `clarify`,
  `adapt`, `optimize`, `onboard`, `shape`, `init`, `document`, `extract`) are
  reused as a vocabulary, modified from pbakaus/impeccable (Apache-2.0).
  Their definitions, steps and checklists here are original.
- The PRODUCT.md / DESIGN.md file-name convention is adopted from
  pbakaus/impeccable (Apache-2.0); our templates are original.
- The detector (`lib/`, `bin/`) and all 40+ rules are an independent
  implementation in dependency-free Node.js.
- Changes vs. the original: added Slint desktop, Windows desktop, social
  graphics and Traditional Chinese (zh-TW/CJK) guidance; removed the live
  browser "apply" mode and anything that launches other agents, downloads
  binaries or makes network calls.

Impeccable itself credits ehmo/platform-design-skills (MIT) for its iOS /
Android references. design-sense does not include iOS/Android references and
contains no content from that project.
