/*
 * Public API of @cadenway/ui/core: the behaviors every brick shares.
 *
 * Explicit named exports only (.claude/rules/public-api.md). The `ɵ`-prefixed exports are shared
 * across the entry points of the package and are not public API: no consumer imports them.
 */

export { CwRipple } from './ripple';
export { CwSwap } from './swap';
export { ɵFOCUS, ɵFOCUS_FIELD, ɵFOCUS_FIELD_WITHIN, ɵFOCUS_INSET } from './focus';
export { ɵmenuFrom, ɵpanelPositions } from './overlay-positions';
export type { ɵAlign, ɵSide } from './overlay-positions';
export { ɵprefersReducedMotion } from './reduced-motion';
