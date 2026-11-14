---
'@cadenway/ui': minor
---

Add the `@cadenway/ui/components/toolbar` entry point: `cw-toolbar` (`ariaLabel` required, `size` `default` or `sm`, `overflowLabel` « Plus d’options »; output `overflowChange`), `cw-toolbar-group`, `cw-toolbar-separator`, `cw-toolbar-spacer`, `[cwToolbarItem]` (`overflowLabel`, `overflowIcon`, `pinned`) and `cw-toolbar-overflow`. The `[cwToolbarItem]` controls share one Tab stop with ← → (in a loop), Home and End navigation; when the width runs short, the non-pinned ones move from the last into a « Plus » `cw-menu`.
