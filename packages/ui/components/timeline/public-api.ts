/*
 * Public API of @cadenway/ui/timeline (Timeline sheet of the Design System artifact).
 *
 * Explicit named exports only (.claude/rules/public-api.md).
 */

export { CwTimelineBarDef } from './timeline-bar/timeline-bar.directive';
export { CwTimelineToolbar } from './timeline-toolbar/timeline-toolbar.directive';
export { CwTimeline } from './timeline.component';
export type {
  CwDependency,
  CwMilestone,
  CwTimelineAssignee,
  CwTimelineBarContext,
  CwTimelineConflict,
  CwTimelineGroup,
  CwTimelineItem,
  CwTimelineItemChange,
  CwTimelineRange,
  CwTimelineScale,
  CwTimelineSchedule,
} from './timeline.types';
