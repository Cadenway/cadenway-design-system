---
'@cadenway/ui': minor
---

Add `@cadenway/ui/components/calendar-view`: `cw-calendar-view`, a generic calendar (`items` of any type, `trackBy`, `itemLabel`, `itemSpan`) with the item content given by `ng-template[cwCalendarItem]` (`CwCalendarItemDef`). Month view (six weeks from Monday, `maxPerDay` lines then « +n autres » and the day popover, bars across days) and week view (all-day row, `hours` in `slotMinutes` slots, blocks as tall as their duration, current time line); `showWeekends`; today marker; drag to reschedule with the CDK (`itemMove`, duration kept); `create` from « + », a double click on a slot or N; `open`; « Sans date » (`unscheduledOpen`); grid keyboard navigation (arrows, Home, End, Page Up, Page Down, T, M, S, N) and keyboard move announced through the CDK `LiveAnnouncer`; `readonly`.
