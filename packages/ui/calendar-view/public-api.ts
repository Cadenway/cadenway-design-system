/*
 * Public API of @cadenway/ui/calendar-view (Calendar View sheet of the Design System artifact).
 *
 * Explicit named exports only (.claude/rules/public-api.md).
 */

export { CwCalendarItemDef } from './calendar-item-def/calendar-item-def.directive';
export { CwCalendarView } from './calendar-view.component';
export { CW_CALENDAR_VIEW_LABELS } from './calendar-view.constants';
export type {
  CwCalendarCreate,
  CwCalendarItemContext,
  CwCalendarItemMove,
  CwCalendarItemPlace,
  CwCalendarKeyFn,
  CwCalendarSlotMinutes,
  CwCalendarSpan,
  CwCalendarSpanFn,
  CwCalendarViewLabels,
  CwCalendarViewMode,
  CwCalendarWeekStart,
} from './calendar-view.types';
