/*
 * Public API of @cadenway/ui/core: the behaviors every brick shares.
 *
 * Explicit named exports only (.claude/rules/public-api.md). The `ɵ`-prefixed exports are shared
 * across the entry points of the package and are not public API: no consumer imports them.
 */

export { CwRipple } from './motion/ripple.directive';
export { CwSwap } from './motion/swap.directive';
export { ɵFOCUS, ɵFOCUS_FIELD, ɵFOCUS_FIELD_WITHIN, ɵFOCUS_INSET } from './styles/focus.constants';
export { ɵmenuFrom, ɵpanelPositions } from './overlay/overlay-positions';
export type { ɵAlign, ɵListOrientation, ɵSide } from './core.types';
export { ɵnavigateList } from './a11y/list-navigation';
export { ɵprefersReducedMotion } from './a11y/reduced-motion';
