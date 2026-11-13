import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * The keyboard shortcut of a menu item, pushed to the right in muted text: `F2`, `Ctrl D`,
 * `Suppr` (DropdownMenu sheet of the Design System artifact). Write the same shortcuts as the
 * context menu and the command palette.
 *
 * The text is part of the item's accessible name; set `aria-keyshortcuts` on the item too
 * (`aria-keyshortcuts="F2"`) so assistive technologies know the key.
 */
@Component({
  selector: 'cw-menu-shortcut',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ml-auto pl-4 text-xs text-muted-foreground' },
  templateUrl: './menu-shortcut.component.html',
})
export class CwMenuShortcut {}
