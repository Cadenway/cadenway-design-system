---
name: cw-motion-tokens
description: "The animation timings and easings of the Design System artifact, the mockup animations that carry behavior, and how reduced motion disables them. Load it before any animation."
---

# Motion tokens

Source: the [Design System artifact](https://claude.ai/artifact/Xrfx4ccwixnRpFgVYvrCcZ), README
section "Mouvement" and `project/tailwind/cadenway.css`; the mockup (`docs/maquette/source/styles/app.css`)
for the animations that carry behavior. Easing `--ease-snap` = `cubic-bezier(0.16, 1, 0.3, 1)`: no
bounce, reveal by mask and blur.

| Element | Animation | Duration |
| --- | --- | --- |
| Menus, Select, Combobox, Popover (opens from the trigger corner through `--menu-from`) | `animate-menu-in` | 300 ms, `ease-snap` |
| Items of a menu or list (rows, Kanban cards, results, toasts) | `animate-item-in`, 60 ms then +30 ms per item, twelve at most | 340 ms |
| Dialog, Alert Dialog, command palette, Tooltip | `animate-pop-in`; backdrop `animate-fade-in` | 260 ms / 200 ms |
| Closing a menu, a dialog, a backdrop | `menu-out`, `pop-out`, `fade-out` (mockup) | 240 / 180 / 180 ms |
| Collapsibles (Accordion, Collapsible, Sidebar spaces) | `grid-rows-[0fr]` → `grid-rows-[1fr]` + fade, chevron rotates | 300 ms |
| Buttons | `animate-ripple` from the contact point | 550 ms, `cubic-bezier(0.2, 0, 0, 1)` |
| Spinner | `animate-spinner` + `animate-spinner-arc` | 1.4 s |
| Skeleton | pulse (mockup `cw-sk`) | 1.6 s |
| Select label that changes | `CwSwap`: 6 px slide up, fade, 3 px blur | 280 ms, `cubic-bezier(.2, .9, .25, 1)` |
| Task moving to another group | `row-out` then `row-in`, 460 ms after the click | 240 / 460 ms |
| Status and priority icons | layer morphs; delays 0.12 to 0.26 s (status), 60 and 120 ms (priority bars) | `ease-snap` and `--ease-spring` (`linear()` spring of the mockup) |
| Light / dark switch | View Transition, circle from the button, 8 px blur | 700 ms |
| Stacked toasts | folded stack (−8 px, 96 % per rank), unfolds on hover | 300 ms, `ease-snap` |

- Animate `transform` and `opacity` only; a shadow changes level at once.
- `prefers-reduced-motion: reduce` turns everything off (`motion-reduce:animate-none`,
  `motion-reduce:transition-none`, the global rule of `@cadenway/tokens`); changes are immediate.
  The spinner keeps a slow rotation without the arc; the ripple is not created.
