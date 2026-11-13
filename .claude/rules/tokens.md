---
paths:
  - 'packages/tokens/**'
---

# Tokens

- Values come from the Design System artifact, `project/tokens.json` (version 17): light and dark
  under `[data-theme]`, semantic aliases declared once. Plus the 8 mockup hues (cornaline, indigo,
  azur, lagon, olive, rose, fuchsia, ardoise), absent from the artifact.
- `theme.css` only references `tokens.css`: `@theme inline` for colors, `@theme` for the text scale,
  radii, fonts, shadows, easings (`--ease-snap`, `--ease-spring`), animations and keyframes.
- Animation names of the artifact (`menu-in`, `item-in`, `pop-in`, `fade-in`, `ripple`, `spinner`)
  plus the mockup's behavior animations (`menu-out`, `pop-out`, `fade-out`, skeleton pulse,
  `row-in`, `row-out`); one global reduced-motion rule.
