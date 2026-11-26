---
'@cadenway/ui': minor
---

Add the planning hooks the webapp board, calendar and Gantt views need, every one additive and off by default:

- `cw-kanban`: `addRequest` (`CwKanbanAddRequest`: `column`, `lane`) on « + », the footer, the empty-column button and N, with `quickAdd=false` to turn the inline quick add off; `cardMenu` and `columnMenu` take a `cw-menu` opened by a right click, Shift + F10 or the Menu key, on the item or the `CwKanbanColumn` (`data()`); the `ng-template[cwKanbanColumnMenu]` header slot (`CwKanbanColumnMenuDef`, `CwKanbanColumnMenuContext`); `loading` draws a column skeleton. New optional `loading` text.
- `cw-calendar-view`: outside items (an undated side panel) are scheduled by dropping them on a day from a `cdkDropList` connected to `dropListIds()`, or with the keyboard through `scheduleWithKeyboard(data, label)`; both emit `itemSchedule` (`CwCalendarItemSchedule`: `data`, `date`, `allDay`). `dayMenu` takes a `cw-menu` opened on a day or slot with a `CwCalendarDayMenuData`; `loading` draws a grid skeleton. New optional `loading` and `scheduled` texts.
- `cw-timeline`: `showDuration` adds a duration column; `ng-template[cwTimelineName]` (`CwTimelineNameDef`, `CwTimelineNameContext`) replaces the name cell content; `fit()` fits the scale and window to the dated items; `milestoneDisplay="lines"` (`CwTimelineMilestoneDisplay`) draws full-height milestone lines with a ruler marker; `showOffWindow` marks bars outside the window with a chip that brings them into view (also Enter on the row); `loading` draws a skeleton and an empty timeline shows the `empty` text. New optional `durationHeader`, `duration`, `reveal`, `fitted`, `loading` and `empty` texts.

The new texts default to French, from the mockup (`App.dc.html`) where it has the wording; the label constants are now typed `Required<…>`.
