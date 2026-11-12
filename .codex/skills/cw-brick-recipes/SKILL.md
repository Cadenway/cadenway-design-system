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
| `cw-block-editor`, `cw-markdown` | `value = model<string>()` (Markdown); `source` | Aria Toolbar |
| `cw-status-icon` | `status`, `from?`, `milestone`, `size` (3, 3.5, 4, 5) | SVG layers animated between states |
| `cw-priority-icon` | `priority`, `from?`, `size` | SVG bars |
