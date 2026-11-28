/*
 * Public API of @cadenway/ui/dialog (Dialog sheet of the Design System artifact).
 *
 * Explicit named exports only (.claude/rules/public-api.md).
 */

export { CwDialog } from './dialog.component';
export { CwDialogClose } from './dialog-close/dialog-close.directive';
export { CwDialogDescription } from './dialog-description/dialog-description.directive';
export { CwDialogFooter } from './dialog-footer/dialog-footer.component';
export { CwDialogHeader } from './dialog-header/dialog-header.component';
export { CwDialogTitle } from './dialog-title/dialog-title.directive';
export { CwDialogTrigger } from './dialog-trigger/dialog-trigger.directive';
export { CW_DIALOG_LABELS } from './dialog.constants';
export { provideCwDialogLabels } from './dialog.providers';
export type {
  CwDialogCloseReason,
  CwDialogHeaderVariant,
  CwDialogLabels,
  CwDialogPadding,
  CwDialogPlacement,
  CwDialogSize,
} from './dialog.types';
