import { _IdGenerator } from '@angular/cdk/a11y';
import { booleanAttribute, Component, inject, input } from '@angular/core';

/**
 * The heading of a part of a `cw-menu`: the object's key (CAD-482), a group's name (Afficher,
 * Grouper par): DropdownMenu sheet of the Design System artifact.
 *
 * Small muted text, not focusable. Inside a `cw-menu-group` or a `cw-menu-radio-group` it names the
 * group (`aria-labelledby`). `inset` aligns it with checkbox and radio items (`pl-8`).
 */
@Component({
  selector: 'cw-menu-label',
  host: {
    // Text only: not an item of the menu (preview: `role="presentation"`); its id names its group.
    role: 'presentation',
    class: 'block px-2 py-1.5 text-xs font-medium text-muted-foreground',
    '[class.pl-8]': 'inset()',
    '[attr.id]': 'id',
  },
  templateUrl: './menu-label.component.html',
})
export class CwMenuLabel {
  /** Left padding of checkbox and radio items, to align with them. */
  readonly inset = input(false, { transform: booleanAttribute });

  /** Id of the label, which names its group. */
  readonly id = inject(_IdGenerator).getId('cw-menu-label-');
}
