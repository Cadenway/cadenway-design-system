import { Component, ElementRef, inject, input } from '@angular/core';

/**
 * A family of controls of a `cw-toolbar`, such as Filtrer, Trier, Grouper (Toolbar sheet of the
 * Design System artifact): `role="group"` named by `ariaLabel`, 4 px between its controls.
 *
 * The group hides itself when every control in it moved into the « Plus » menu.
 */
@Component({
  selector: 'cw-toolbar-group',
  host: {
    role: 'group',
    class: 'flex shrink-0 items-center gap-1',
    '[attr.aria-label]': 'ariaLabel() || null',
  },
  templateUrl: './toolbar-group.component.html',
})
export class CwToolbarGroup {
  /** Accessible name of the group (« Affichage »). */
  readonly ariaLabel = input('');

  /** The group element; the toolbar hides it when it is empty. Not public API. */
  readonly ɵelement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
}
