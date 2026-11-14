import {
  Component,
  computed,
  inject,
  input,
  model,
  type InputSignal,
  type ModelSignal,
  type Signal,
} from '@angular/core';
import { CwButton } from '@cadenway/ui/components/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorStarBold } from '@ng-icons/phosphor-icons/bold';
import { phosphorStarFill } from '@ng-icons/phosphor-icons/fill';

import { CwPageHeader } from '../page-header.component';

/**
 * Constant ICON_OFF
 *
 * @description
 * Muted star color and hover color for an inactive favorite, set through the icon color variable.
 *
 * @type {string}
 */
const ICON_OFF: string =
  '[--ng-icon__color:var(--muted-foreground)] [button:hover>&]:[--ng-icon__color:var(--foreground)]';
/**
 * Constant ICON_ON
 *
 * @description
 * Foreground icon color for the active favorite star.
 *
 * @type {string}
 */
const ICON_ON: string = '[--ng-icon__color:var(--foreground)]';

/**
 * Class CwPageHeaderFavorite
 * @class CwPageHeaderFavorite
 *
 * @description
 * The favorite toggle next to the title of a `cw-page-header`: a `ghost` icon button with a star.
 *
 * `[(favorite)]` is the state; a click (or Enter, Space) flips it. Its accessible name stays
 * « Favori » (`ariaLabel`) whatever the state, which `aria-pressed` carries (Page Header sheet,
 * "Accessibilité"). `icon-sm` on a default header, `icon-xs` on a compact one. Style hook on the
 * button: `data-state="on|off"`.
 */
@Component({
  selector: 'cw-page-header-favorite',
  imports: [CwButton, NgIcon],
  viewProviders: [provideIcons({ phosphorStarBold, phosphorStarFill })],
  host: {
    class: 'inline-flex shrink-0',
    '[attr.data-state]': 'favorite() ? "on" : "off"',
  },
  templateUrl: './page-header-favorite.component.html',
})
export class CwPageHeaderFavorite {
  // #region Properties
  /**
   * Property favorite
   * @readonly
   *
   * @description
   * Two-way model indicating whether the current page is a favorite.
   *
   * @type {ModelSignal<boolean>}
   * @default false
   */
  public readonly favorite: ModelSignal<boolean> = model(false);

  /**
   * Property ariaLabel
   * @readonly
   *
   * @description
   * Fixed accessible name of the toggle; its state is exposed separately through `aria-pressed`.
   *
   * @type {InputSignal<string>}
   * @default 'Favori'
   */
  public readonly ariaLabel: InputSignal<string> = input('Favori');

  /**
   * Property header
   * @readonly
   *
   * @description
   * Parent header supplying the button size, or null outside a header.
   *
   * @type {CwPageHeader | null}
   */
  private readonly header: CwPageHeader | null = inject(CwPageHeader, { optional: true });

  /**
   * Property buttonSize
   * @readonly
   *
   * @description
   * Icon-button size matched to the parent header's standard or compact layout.
   *
   * @type {Signal<'icon-xs' | 'icon-sm'>}
   */
  protected readonly buttonSize: Signal<'icon-xs' | 'icon-sm'> = computed(() =>
    this.header?.size() === 'compact' ? 'icon-xs' : 'icon-sm',
  );

  /**
   * Property iconClasses
   * @readonly
   *
   * @description
   * Star icon color classes for the current favorite state.
   *
   * @type {Signal<string>}
   */
  protected readonly iconClasses: Signal<string> = computed(() =>
    this.favorite() ? ICON_ON : ICON_OFF,
  );
  // #endregion

  // #region Methods
  /**
   * Method toggle
   * @method toggle
   *
   * @description
   * Flips the two-way favorite model when the user activates the button.
   */
  protected toggle(): void {
    this.favorite.update((favorite) => !favorite);
  }
  // #endregion
}
