/*
 * Public API of @cadenway/ui/kbd (Kbd sheet of the Design System artifact).
 *
 * Explicit named exports only (.claude/rules/public-api.md).
 */

export { CwKbdGroup } from './kbd-group/kbd-group.directive';
export { CwKbd } from './kbd.directive';
export type { CwKbdSize, CwKbdVariant } from './kbd.types';
export { CwShortcut } from './shortcut/shortcut.component';

export { CW_KBD_LABELS } from './kbd.constants';
export { injectCwKbdLabels, provideCwKbdLabels } from './kbd.providers';
export type { CwKbdLabels } from './kbd.types';
