/*
 * Public API of @cadenway/ui/banner (Banner sheet of the Design System artifact).
 *
 * Explicit named exports only (.claude/rules/public-api.md).
 */

export { CwBannerActions } from './banner-actions/banner-actions.component';
export { CwBanner } from './banner.component';
export type { CwBannerPlacement, CwBannerTone } from './banner.types';

export { CW_BANNER_LABELS } from './banner.constants';
export { provideCwBannerLabels } from './banner.providers';
export type { CwBannerLabels } from './banner.types';
