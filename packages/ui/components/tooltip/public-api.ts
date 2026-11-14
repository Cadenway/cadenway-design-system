/*
 * Public API of @cadenway/ui/tooltip (Tooltip sheet of the Design System artifact).
 *
 * Explicit named exports only (.claude/rules/public-api.md).
 */

export { CwTooltip } from './tooltip.directive';
export { provideCwTooltip } from './tooltip.providers';
export type {
  CwTooltipAlign,
  CwTooltipConfig,
  CwTooltipContent,
  CwTooltipSide,
} from './tooltip.types';
