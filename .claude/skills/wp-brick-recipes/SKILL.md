---
name: wp-brick-recipes
description: "The API and behavior of each @waypoint/ui brick as the integration guide defines it, with the Angular Aria or CDK primitive underneath. Load it before building or changing a brick."
---

# Brick recipes

| Brick | API | Primitive |
| --- | --- | --- |
| `button[wpButton]` | `variant`: primary, outline, ghost, destructive; `size`: sm (28 px), md (32 px) | — |
| `wp-split-button` | `label`, `next`, `advance` output, projected menu | Aria Menu |
| `wp-select` | `value = model()`, `options`, `placeholder` | Aria Select (Combobox + Listbox) |
| `wp-combobox` | `value = model()`, `suggest: (text) => T[]` | Aria Combobox |
| `wp-menu`, `[wpMenuTrigger]`, `[wpContextMenu]` | items, separators, submenus, checkbox and radio items | Aria Menu |
| `wp-popover` | projected content, non-modal dialog | CDK Overlay |
| `wp-dialog` | `size`: md, lg, 2xl; `title` | CDK Dialog |
| `wp-confirm-dialog` | `title`, `text`, `cta`, `items?`, `typeName?` | CDK Dialog (alertdialog) |
| `wp-toast` | `title`, `desc`, `undo?`, `openId?`; 6 s | — |
| `wp-tabs` | `selected = model()` | Aria Tabs |
| `wp-choice-chips`, `wp-switch`, `wp-checkbox` | `value`/`checked = model()`; checkbox `indeterminate` | Aria Listbox / — |
| `wp-date-picker` | `value = model<string \| null>()`, `shortcuts` | Aria Grid |
| `wp-avatar`, `wp-avatar-stack` | `person`, `size`, `presence?`; `max` (5 then "+ n") | — |
| `wp-meter` | `value`, `max`, `segments?`; warning ≥ 80 %, critical ≥ 90 % | — |
| `wp-skeleton`, `wp-empty-state`, `wp-error-panel` | shape; icon, title, text; title, text, code, `retry` | — |
| `wp-block-editor`, `wp-markdown` | `value = model<string>()` (Markdown); `source` | Aria Toolbar |
| `wp-status-icon` | `status`, `from?`, `milestone`, `size` (3, 3.5, 4, 5) | SVG layers animated between states |
| `wp-priority-icon` | `priority`, `from?`, `size` | SVG bars |
