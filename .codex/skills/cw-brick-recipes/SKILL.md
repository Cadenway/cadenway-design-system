---
name: cw-brick-recipes
description: "The API and behavior of each @cadenway/ui brick as the integration guide defines it, with the Angular Aria or CDK primitive underneath. Load it before building or changing a brick."
---

# Brick recipes

| Brick | API | Primitive |
| --- | --- | --- |
| `button[cwButton]` | `variant`: primary, outline, ghost, destructive; `size`: sm (28 px), md (32 px) | — |
| `cw-split-button` | `label`, `next`, `advance` output, projected menu | Aria Menu |
| `cw-select` | `value = model()`, `options`, `placeholder` | Aria Select (Combobox + Listbox) |
| `cw-combobox` | `value = model()`, `suggest: (text) => T[]` | Aria Combobox |
| `cw-menu`, `[cwMenuTrigger]`, `[cwContextMenu]` | items, separators, submenus, checkbox and radio items | Aria Menu |
| `cw-popover` | projected content, non-modal dialog | CDK Overlay |
| `cw-dialog` | `size`: md, lg, 2xl; `title` | CDK Dialog |
| `cw-confirm-dialog` | `title`, `text`, `cta`, `items?`, `typeName?` | CDK Dialog (alertdialog) |
| `cw-toast` | `title`, `desc`, `undo?`, `openId?`; 6 s | — |
| `cw-tabs` | `selected = model()` | Aria Tabs |
| `cw-choice-chips`, `cw-switch`, `cw-checkbox` | `value`/`checked = model()`; checkbox `indeterminate` | Aria Listbox / — |
| `cw-date-picker` | `value = model<string \| null>()`, `shortcuts` | Aria Grid |
| `cw-avatar`, `cw-avatar-stack` | `person`, `size`, `presence?`; `max` (5 then "+ n") | — |
| `cw-meter` | `value`, `max`, `segments?`; warning ≥ 80 %, critical ≥ 90 % | — |
| `cw-skeleton`, `cw-empty-state`, `cw-error-panel` | shape; icon, title, text; title, text, code, `retry` | — |
| `cw-block-editor` | `value = model<string>()` (Markdown) | Tiptap engine; Aria Toolbar |
| `cw-markdown` | `source` (Markdown) | `marked` tokens rendered by an Angular template |
| `cw-status-icon` | `status`, `from?`, `milestone`, `size` (3, 3.5, 4, 5) | SVG layers animated between states |
| `cw-priority-icon` | `priority`, `from?`, `size` | SVG bars |

## `cw-block-editor`

- Engine: Tiptap, headless (`@tiptap/core` over `@tiptap/pm`). It ships no style: every style is
  Tailwind over `@cadenway/tokens`. This is the one exception to "Behavior from Angular Aria or the
  CDK" (`rules/bricks.md`): the editable surface, its schema, selection, history and input rules
  belong to the engine; the toolbar, menus and popovers around it stay on Aria and the CDK.
- Secondary entry point `@cadenway/ui/block-editor`, with its own `ng-package.json` and
  `public-api.ts`: a consumer that only displays Markdown never loads the engine. Nothing outside
  that entry point imports `@tiptap/*` or `prosemirror-*`.
- Extensions: `@tiptap/starter-kit` is the base. In Tiptap 3 it already registers Link and
  Underline: configure them through `StarterKit.configure({ link, underline })`, never add
  `@tiptap/extension-link` or `@tiptap/extension-underline` as a dependency or register them a
  second time. `@tiptap/extension-list` holds the list nodes (bullet, ordered, task),
  `@tiptap/extensions` the utilities (placeholder, character count, focus, trailing node), and
  `@tiptap/suggestion` the suggestion menus such as mentions, positioned with `@floating-ui/dom`
  (its required peer).
- Storage stays Markdown: `@tiptap/markdown` parses `value` and serializes the document back.
- The `@tiptap/*` packages pin each other to one exact version: they move together.

## `cw-markdown`

- `marked` only tokenizes (`marked.lexer`). An Angular template renders the token tree, one branch
  per token type. No `innerHTML`, no `bypassSecurityTrust*`, no `marked.parse()`: an `html` token is
  never injected into the page.
- Same grammar as the editor: `cw-markdown` owns the `marked` instance and the editor receives it
  through `Markdown.configure({ marked })`, so one parser reads everything. `@tiptap/markdown` still
  depends on an older major of `marked`, which stays installed next to ours until Tiptap moves (the
  catalog in `pnpm-workspace.yaml` states the range). Its `marked` option is typed against that
  older major: our instance works at run time but TypeScript refuses it (TS2322), so the editor
  passes it through one documented cast, in one place, removed when the two majors meet.
- Shared `__underline__` rule: CommonMark reads `__text__` as strong; Cadenway reads and writes it
  as underline, and bold is `**text**` only. The rule is one `marked` inline extension, defined once
  next to `cw-markdown` and given to the editor through `Markdown.configure({ marked })`. Out of the
  box Tiptap does the opposite on both sides (Underline writes `<u>…</u>`, Bold accepts `__`): the
  editor overrides both so that what it saves is what `cw-markdown` displays.
