import { Component, input, type InputSignal } from '@angular/core';
import { CwButton } from '@cadenway/ui/components/button';
import { type CwMenu, CwMenuTriggerFor } from '@cadenway/ui/components/menu';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorDotsThreeBold } from '@ng-icons/phosphor-icons/bold';

/**
 * Class CwBreadcrumbEllipsis
 * @class CwBreadcrumbEllipsis
 *
 * @description
 * The « … » of a folded breadcrumb: a `ghost` `icon-xs` button that opens the menu of the hidden
 * levels (Breadcrumb sheet of the Design System artifact, anatomy 4).
 *
 * `menu` is the `cw-menu` to open; the button is its trigger (`aria-haspopup="menu"`,
 * `aria-expanded`, `data-state="open|closed"`, `bg-selected` while open) and names it, so the menu
 * reads « Niveaux masqués » too. Enter, Space and ↓ open the menu on its first level.
 * `nav[cwBreadcrumb]` draws it when it folds; it is exported for a trail laid out by hand.
 */
@Component({
  selector: 'cw-breadcrumb-ellipsis',
  imports: [CwButton, CwMenuTriggerFor, NgIcon],
  providers: [provideIcons({ phosphorDotsThreeBold })],
  host: { class: 'inline-flex' },
  templateUrl: './breadcrumb-ellipsis.component.html',
})
export class CwBreadcrumbEllipsis {
  // #region Properties
  /**
   * Property menu
   * @readonly
   *
   * @description
   * Required menu containing the hidden breadcrumb levels.
   *
   * @type {InputSignal<CwMenu>}
   */
  public readonly menu: InputSignal<CwMenu> = input.required<CwMenu>();

  /**
   * Property label
   * @readonly
   *
   * @description
   * Accessible name of the ellipsis button and the menu it opens.
   *
   * @type {InputSignal<string>}
   * @default 'Niveaux masqués'
   */
  public readonly label: InputSignal<string> = input('Niveaux masqués');
  // #endregion
}
