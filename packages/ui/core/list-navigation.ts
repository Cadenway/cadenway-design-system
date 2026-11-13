import type { ListKeyManager, ListKeyManagerOption } from '@angular/cdk/a11y';

import type { ɵListOrientation } from './core.types';

/**
 * Moves the active item of a CDK list key manager from a keyboard event, read by `event.key`.
 *
 * The CDK manager reads the legacy `keyCode`, which synthetic events (tests, assistive tools,
 * remapped keyboards) often leave at 0; this keeps arrow, Home and End navigation reliable. Arrows
 * follow the orientation (left and right swap in a right-to-left layout), Home and End go to the
 * first and last enabled item. Returns whether the key was handled; the caller prevents the default
 * action then. Shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 */
export function ɵnavigateList(
  manager: ListKeyManager<ListKeyManagerOption>,
  event: KeyboardEvent,
  orientation: ɵListOrientation,
  rtl = false,
): boolean {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return false;
  const horizontal = orientation !== 'vertical';
  const vertical = orientation !== 'horizontal';
  switch (event.key) {
    case 'ArrowDown':
      if (!vertical) return false;
      manager.setNextItemActive();
      return true;
    case 'ArrowUp':
      if (!vertical) return false;
      manager.setPreviousItemActive();
      return true;
    case 'ArrowRight':
      if (!horizontal) return false;
      if (rtl) manager.setPreviousItemActive();
      else manager.setNextItemActive();
      return true;
    case 'ArrowLeft':
      if (!horizontal) return false;
      if (rtl) manager.setNextItemActive();
      else manager.setPreviousItemActive();
      return true;
    case 'Home':
      manager.setFirstItemActive();
      return true;
    case 'End':
      manager.setLastItemActive();
      return true;
    default:
      return false;
  }
}
