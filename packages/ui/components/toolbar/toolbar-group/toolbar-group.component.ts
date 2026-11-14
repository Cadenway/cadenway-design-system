import { Component, ElementRef, inject, input, type InputSignal } from '@angular/core';

/**
 * Class CwToolbarGroup
 * @class CwToolbarGroup
 *
 * @description
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
  // #region Properties
  /**
   * Property ariaLabel
   * @readonly
   *
   * @description
   * Accessible name of the group.
   *
   * @type {InputSignal<string>}
   */
  public readonly ariaLabel: InputSignal<string> = input('');

  /**
   * Property ɵelement
   * @readonly
   *
   * @description
   * Group element hidden by the toolbar when empty.
   * @internal
   *
   * @type {HTMLElement}
   */
  public readonly ɵelement: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  // #endregion
}
