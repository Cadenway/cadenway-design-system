/*
 * Public API of @cadenway/ui/sheet (Sheet sheet of the Design System artifact).
 *
 * Explicit named exports only (.claude/rules/public-api.md).
 */

export { CwSheet } from './sheet.component';
export { CwSheetBody } from './sheet-body/sheet-body.component';
export { CwSheetClose } from './sheet-close/sheet-close.directive';
export { CwSheetDescription } from './sheet-description/sheet-description.directive';
export { CwSheetFooter } from './sheet-footer/sheet-footer.component';
export { CwSheetHeader } from './sheet-header/sheet-header.component';
export { CwSheetTitle } from './sheet-title/sheet-title.directive';
export { CwSheetTrigger } from './sheet-trigger/sheet-trigger.directive';
export { CW_SHEET_LABELS } from './sheet.constants';
export { provideCwSheetLabels } from './sheet.providers';
export type { CwSheetCloseReason, CwSheetLabels, CwSheetSide, CwSheetSize } from './sheet.types';
