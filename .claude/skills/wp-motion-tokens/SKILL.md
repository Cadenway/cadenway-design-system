---
name: wp-motion-tokens
description: "The animation timings and easings of the mockup and how reduced motion disables them. Load it before any animation."
---

# Motion tokens

| Element | Duration | Easing |
| --- | --- | --- |
| Menu or popover open (`menu-bloom`) | 300 ms | `--ease-snap` |
| Menu options (stagger up to the 8th) | 420 ms | `--ease-spring` |
| Changing select label | 280 ms | cubic-bezier(.2, .9, .25, 1), 6 px slide, fade, 3 px blur |
| Status icon | immediate morph between layers | 0.12 to 0.26 s delays |

Everything stops under `prefers-reduced-motion: reduce`.
