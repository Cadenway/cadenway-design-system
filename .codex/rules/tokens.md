---
paths:
  - 'packages/tokens/**'
---

# Tokens

- Follow `cw-tokens-and-theme` for artifact values, dual themes and the eight extra mockup hues.
  Declare semantic aliases once.
- `tokens.css` and `theme.css` are entry files that import the partials of `src/` (`fonts`, `scale`,
  `light`, `dark`; `theme/colors`, `easing`, `elevation`, `motion`, `base`): edit the partial, keep
  the public paths `@cadenway/tokens/tokens.css` and `theme.css` stable.
- `theme.css` only references `tokens.css`: `@theme inline` for colors, `@theme` for the text scale,
  radii, fonts, shadows, easings (`--ease-snap`, `--ease-spring`), animations and keyframes.
- Use the artifact and mockup animation names from `cw-motion-tokens` and one global
  reduced-motion rule.
