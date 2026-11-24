/*
 * Public API of @cadenway/ui/status-icon (mockup `StatutTache.dc.html`; no Design System sheet).
 *
 * Explicit named exports only (.claude/rules/public-api.md).
 */

export { CwStatusIcon } from './status-icon.component';
export { CW_STATUS_LABELS } from './status-icon.constants';
export { injectCwStatusLabels, provideCwStatusLabels } from './status-icon.providers';
export type { CwStatusIconSize, CwStatusKey, CwStatusLabels } from './status-icon.types';
