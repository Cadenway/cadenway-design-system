import { _IdGenerator } from '@angular/cdk/a11y';
import {
  booleanAttribute,
  Component,
  inject,
  input,
  type InputSignalWithTransform,
} from '@angular/core';

/**
 * Component CwMenuLabel
 *
 * @description
 * The heading of a part of a `cw-menu`: the object's key (CAD-482), a group's name (Afficher, Grouper par): DropdownMenu sheet of the Design System artifact. Small muted text, not focusable. Inside a `cw-menu-group` or a `cw-menu-radio-group` it names the group (`aria-labelledby`). `inset` aligns it with checkbox and radio items (`pl-8`).
 */
@Component({
  selector: 'cw-menu-label',
  host: {
    role: 'presentation',
    class: 'block px-2 py-1.5 text-xs font-medium text-muted-foreground',
    '[class.pl-8]': 'inset()',
    '[attr.id]': 'id',
  },
  templateUrl: './menu-label.component.html',
})
export class CwMenuLabel {
  // #region Properties
  /**
   * Property inset
   *
   * @description
   * Left padding of checkbox and radio items, to align with them.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly inset: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property id
   *
   * @description
   * Id of the label, which names its group.
   *
   * @type {string}
   * @readonly
   */
  public readonly id: string = inject(_IdGenerator).getId('cw-menu-label-');
  // #endregion
}
