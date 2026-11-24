/*
 * Public API of @cadenway/ui/calendar (Calendar sheet of the Design System artifact).
 *
 * Explicit named exports only (.claude/rules/public-api.md).
 */

export { CwCalendar } from './calendar.component';
export type {
  CwCalendarCaptionLayout,
  CwCalendarMode,
  CwCalendarSelection,
  CwDateDisabledFn,
  CwDateRange,
  CwWeekStart,
} from './calendar.types';

export { CW_CALENDAR_LABELS } from './calendar.constants';
export { provideCwCalendarLabels } from './calendar.providers';
export type { CwCalendarLabels } from './calendar.types';
