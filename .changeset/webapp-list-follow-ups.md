---
'@cadenway/ui': minor
---

Add the follow-ups the webapp list view needs, every one additive:

- `cw-data-table`: `groups` declares groups (`CwGroupDef`: `value`, optional `label` and `count`) with `groupBy`; they render in order before the undeclared values, even without a loaded row (and instead of the empty state), and their header reads the declared count. `nearEnd` fires in `virtual` mode when the rendered window comes within `nearEndThreshold` lines (10 by default) of the last line, once per approach. `rowClass` adds the consumer's motion or state classes to a row, such as `animate-row-in`. `phoneLayout="grid"` keeps a compact grid of the first data column and the `phoneColumns` under its header below 768 px (`cards` stays the default). `addRow` ends each open group with an « Ajouter une tâche » row that emits `rowAdd` with the group value; its label is the new optional `addRow` text of `provideCwDataTableTexts`. New types `CwGroupDef` and `CwDataTablePhoneLayout`.
- `cw-tabs`: a tab or panel created by a `@for` in the same change that makes it active no longer throws NG0950; the set ignores it until its `value` is bound.
- `cw-popover`: `size="xl"` (384 px) and `padding="none"`, which hands the inner spacing to the content (the inbox panel of the mockup). New type `CwPopoverPadding`.
- `cw-avatar`: the `dnd` (« ne pas déranger », a bar across the dot) and `invisible` (a faded dot) presences, read through the new optional `dnd` and `invisible` labels of `provideCwAvatarLabels`.
