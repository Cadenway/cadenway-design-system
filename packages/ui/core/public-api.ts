/*
 * Public API of @cadenway/ui/core: the behaviors every brick shares.
 *
 * Explicit named exports only (.claude/rules/public-api.md). The `ɵ`-prefixed exports are shared
 * across the entry points of the package and are not public API: no consumer imports them.
 */

export { CwRipple } from './ripple.directive';
export { CwSwap } from './swap.directive';
export { ɵFOCUS, ɵFOCUS_FIELD, ɵFOCUS_FIELD_WITHIN, ɵFOCUS_INSET } from './focus.constants';
export { ɵmenuFrom, ɵpanelPositions } from './overlay-positions';
export type { ɵAlign, ɵListOrientation, ɵSide } from './core.types';
export { ɵnavigateList } from './list-navigation';
export { ɵprefersReducedMotion } from './reduced-motion';
