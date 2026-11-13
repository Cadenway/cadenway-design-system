---
paths:
  - 'packages/ui/src/lib/**'
---

# Bricks

- One folder per brick: `<brick>.ts`, `<brick>.html`, specs, stories; selector `cw-<brick>` (or an
  attribute selector `[cw<Brick>]` for directives such as `button[cwButton]`).
- Signal API; variants as inputs; no consumer-specific variant.
- Behavior from Angular Aria or the CDK; styling with Tailwind over `@cadenway/tokens`; no hex value.
- One exception, the editor engine: the editable surface of `cw-block-editor` is driven by Tiptap,
  headless, behind the secondary entry point `@cadenway/ui/block-editor`. No other brick imports
  `@tiptap/*` or `prosemirror-*`. The toolbar, menus and popovers around the surface still take
  their behavior from Angular Aria or the CDK, and every style still comes from the tokens.
- Menus: width follows content (`max-w-sm`), check on the right of the selected option, automatic
  placement, close on outside click and Escape.
- Hover `bg-muted` without border; selected violet; focus ring 2 px.
