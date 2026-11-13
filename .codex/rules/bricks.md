---
paths:
  - 'packages/ui/**'
---

# Bricks

- One folder per brick, `packages/ui/<brick>/`, which is its secondary entry point
  `@cadenway/ui/<brick>`: `ng-package.json`, `public-api.ts`, `<brick>.ts`, `<brick>.html`, specs,
  stories. Selector `cw-<brick>`, or an attribute selector `[cw<Brick>]` for a directive on a native
  element (`button[cwButton]`); classes `Cw<Brick>`.
- API, variants, sizes and states come from the brick's sheet in the Design System artifact
  (`project/components/<Name>/README.md`); the mockup settles behavior and copy.
- Signal API; variants and sizes as inputs; no consumer-specific variant; no `class` input (the
  native `class` attribute serves layout only).
- Behavior from Angular Aria or the CDK; styling with literal Tailwind classes over
  `@cadenway/tokens`; no hex value.
- One exception, the editor engine: the editable surface of `cw-block-editor` is driven by Tiptap,
  headless, behind the secondary entry point `@cadenway/ui/block-editor`. No other brick imports
  `@tiptap/*` or `prosemirror-*`. The toolbar, menus and popovers around the surface still take
  their behavior from Angular Aria or the CDK, and every style still comes from the tokens.
- Menus: width follows content (`max-w-sm`), check on the right of the selected option, automatic
  placement, close on outside click and Escape.
- Hover `bg-accent` without border; selected `bg-selected`; amethyste never as a fill; focus ring
  2 px amethyst on `focus-visible` (`FOCUS`, `FOCUS_INSET`, `FOCUS_FIELD`).
