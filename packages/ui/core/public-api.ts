/*
 * Public API of @cadenway/ui/core: the behaviors every brick shares.
 *
 * Explicit named exports only (.claude/rules/public-api.md). The `ɵ`-prefixed exports are shared
 * across the entry points of the package and are not public API: no consumer imports them.
 */

export { CwRipple } from './motion/ripple.directive';
export { CwSwap } from './motion/swap.directive';
export { ɵafterExitAnimation } from './motion/exit-animation';
export type { ɵExitAnimationOptions } from './motion/exit-animation';
export { ɵenterDelay } from './motion/enter-delay';
export { ɵFOCUS, ɵFOCUS_FIELD, ɵFOCUS_FIELD_WITHIN, ɵFOCUS_INSET } from './styles/focus.constants';
export { ɵmenuFrom, ɵpanelPositions, ɵplacementOf } from './overlay/overlay-positions';
export { ɵConnectedPanel } from './overlay/connected-panel.service';
export type { ɵConnectedPanelConfig } from './overlay/connected-panel.service';
export { ɵModalOverlay } from './overlay/modal-overlay.service';
export type { ɵModalOverlayConfig } from './overlay/modal-overlay.service';
export { ɵPanelStack } from './overlay/panel-stack.service';
export type { ɵStackedPanel } from './overlay/panel-stack.service';
export type { ɵAlign, ɵListOrientation, ɵPlacement, ɵSide } from './core.types';
export { ɵnavigateList } from './a11y/list-navigation';
export { ɵprefersReducedMotion } from './a11y/reduced-motion';
export {
  ɵaddDays,
  ɵaddMonths,
  ɵdayKey,
  ɵdaysBetween,
  ɵdaysInMonth,
  ɵisoWeek,
  ɵsameDay,
  ɵsameMonth,
  ɵstartOfDay,
  ɵstartOfMonth,
  ɵstartOfWeek,
} from './dates/dates';
export { ɵextensionOf, ɵformatFileSize } from './format/files';
export { ɵfold } from './format/text';
