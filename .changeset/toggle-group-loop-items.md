---
'@cadenway/ui': patch
---

Fix NG0950 in `cw-toggle-group` when its items come from a `@for` and the item that is on is not the first one rendered. The group placed its Tab stop by reading the required `value` of every item from the host bindings of the first item, before Angular had set the inputs of the next ones. Items now report when their `value` is set (`CwToggleGroupItem.hasValue`), and until then the group treats them as off. Selection, roving tabindex and keyboard behavior are unchanged.
