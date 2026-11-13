import { Directive } from '@angular/core';

/**
 * Marks the consumer's own menu of a `cw-checklist-item` (a `cwButton` with `[cwMenuTriggerFor]`:
 * Assigner, Définir une échéance…), which then replaces the item's default menu (Checklist sheet of
 * the Design System artifact). It shows on hover and focus, where the default menu would.
 */
@Directive({
  selector: '[cwChecklistItemMenu]',
})
export class CwChecklistItemMenu {}
