---
'@cadenway/ui': minor
---

Add the `@cadenway/ui/context-menu` entry point: `[cwContextMenuTriggerFor]` opens a `cw-menu` from `@cadenway/ui/menu` at the pointer on a right click or a 500 ms long press, and on the focused element with Shift + F10 or the Menu key (`cwContextMenuData`, `cwContextMenuDisabled`; outputs `opened`, `closed`; `data-state="open|closed"` on the element). Editable fields keep the browser's menu.
