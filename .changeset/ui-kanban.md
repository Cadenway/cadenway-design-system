---
'@cadenway/ui': minor
---

Add `@cadenway/ui/components/kanban`: `cw-kanban`, a generic board (`columns`, `items` of any type, `trackBy`, `groupBy`, `itemLabel`, optional `lanes` and `swimlaneBy`) with the card content given by `ng-template[cwKanbanCard]` (`CwKanbanCardDef`), the empty-column text by `ng-template[cwKanbanEmpty]` and the lane marker by `ng-template[cwKanbanLaneMarker]`. CDK drag-drop between columns and swimlanes with a full-ink line or a dashed ghost as drop indicator and a lifted `rotate-1 shadow-lg` preview; work-in-progress limits (« 3/2 », « Limite de 2 dépassée », `wipExceeded`); foldable columns and swimlanes; the quick add (`created`, Enter keeps it open); `detailed` and `compact` densities; selection with Ctrl; keyboard move (Space, arrows, Space, Escape) announced through the CDK `LiveAnnouncer`; `moved` and `open` outputs; `readonly`.
