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
  CwCalendarDayMenuData,
  CwCalendarItemContext,
  CwCalendarItemMove,
  CwCalendarItemPlace,
  CwCalendarItemSchedule,
  CwCalendarKeyFn,
  CwCalendarSlotMinutes,
  CwCalendarSpan,
  CwCalendarSpanFn,
  CwCalendarViewLabels,
  CwCalendarViewProvidedLabels,
  CwCalendarViewMode,
  CwCalendarViewToolbar,
  CwCalendarViewVariant,
  CwCalendarWeekStart,
} from './calendar-view.types';

export { provideCwCalendarViewLabels } from './calendar-view.providers';
