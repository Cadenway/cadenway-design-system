---
paths:
  - 'packages/ui/**'
---

# Bricks

- Use `cw-brick-recipes` for the secondary entry, declaration layout and artifact sheet. Include
  `ng-package.json`, `public-api.ts`, `public-api.spec.ts` and `<brick>.stories.ts` at the entry root.
  Use selector `cw-<brick>` or an attribute selector `[cw<Brick>]` on a native element
  (`button[cwButton]`). Classes have no suffix.
- Name the main declaration after its entry point. Use `templateUrl` and place other declarations in
  subfolders, including `<name>/<name>.directive.ts` and `<name>/<name>.service.ts`. Keep entry imports
  flat and put shared internals in `packages/ui/core/`.
- `@cadenway/ui/core` is split by concern: `a11y/`, `motion/`, `overlay/`, `styles/`, plus
  `core.types.ts`.
- Use the recipe's root types and constants files. At the root, use `<brick>.styles.ts` for class
  maps shared by declarations and `<name>.token.ts` for injection tokens. A class map used by one
  declaration stays in its file.
- Angular 22 practices (`node_modules/@angular/cli/src/commands/mcp/resources/best-practices.md`,
  the resource the Angular MCP serves): no `changeDetection: ChangeDetectionStrategy.OnPush` (the
  default in v22) and no `standalone: true`; services are `@Service()` (singleton) or
  `@Service({ autoProvided: false })` (provided by a component), never `@Injectable`; `inject()`,
  never constructor injection; `input()`, `output()`, `model()`, `computed()`, `linkedSignal()`;
  `host` object, never `@HostBinding`/`@HostListener`; `class` and `style` bindings, never
  `ngClass`/`ngStyle`; no `CommonModule`; native control flow; Signal Forms first. Templates stay
  in their own file (repository rule, over the "inline for small components" advice).
- Signal API; variants and sizes as inputs; no consumer-specific variant; no `class` input (the
  native `class` attribute serves layout only).
- Behavior from Angular Aria or the CDK; styling with literal Tailwind classes over
  `@cadenway/tokens`; no hex value.
- For the editable surface, follow the `cw-block-editor` recipe for headless Tiptap. Keep Tiptap
  and ProseMirror imports inside its secondary entry and use Aria or CDK for surrounding controls.
- Menus: width follows content (`max-w-sm`), check on the right of the selected option, automatic
  placement, close on outside click and Escape.
- Hover `bg-accent` without border; selected `bg-selected`; amethyste never as a fill; focus ring
  2 px amethyst on `focus-visible` (`FOCUS`, `FOCUS_INSET`, `FOCUS_FIELD`).

## Review example

For example, a menu used by one feature still exposes generic open, select and dismiss behavior.
Keep feature-specific decisions in that consumer. Verify keyboard selection, Escape and focus
return through the brick's public API.
