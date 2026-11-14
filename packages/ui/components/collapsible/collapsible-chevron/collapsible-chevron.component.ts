import { Component, computed, inject, input, type InputSignal, type Signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCaretDownBold, phosphorCaretRightBold } from '@ng-icons/phosphor-icons/bold';

import { CwCollapsible } from '../collapsible.component';
import type { CwCollapsibleChevronDirection } from '../collapsible.types';

/**
 * Constant ICONS
 *
 * @description
 * Caret icon names for the two closed chevron directions in the Collapsible sheet.
 *
 * @type {Record<CwCollapsibleChevronDirection, string>}
 */
const ICONS: Record<CwCollapsibleChevronDirection, string> = {
  down: 'phosphorCaretDownBold',
  right: 'phosphorCaretRightBold',
};

/**
 * Constant BASE
 *
 * @description
 * Shared chevron layout and 300 ms rotation transition, disabled for reduced motion.
 *
 * @type {string}
 */
const BASE: string =
  'inline-flex shrink-0 transition-transform duration-300 ease-snap motion-reduce:transition-none';

/**
 * Constant DIRECTIONS
 *
 * @description
 * Size and open-state rotation classes for down and right chevrons.
 *
 * @type {Record<CwCollapsibleChevronDirection, string>}
 */
const DIRECTIONS: Record<CwCollapsibleChevronDirection, string> = {
  down: '[--ng-icon__size:1rem] data-[state=open]:rotate-180',
  right: 'text-muted-foreground [--ng-icon__size:0.875rem] data-[state=open]:rotate-90',
};

/**
 * Class CwCollapsibleChevron
 * @class CwCollapsibleChevron
 *
 * @description
 * The arrow of a collapsible trigger, which turns with the state of its `cw-collapsible`
 * (Collapsible sheet of the Design System artifact).
 *
 * `down` (default) points down and turns 180° when open; `right` points right and turns 90°, the
 * group row's chevron, placed before the row's label. Decorative: `aria-hidden`, the trigger's
 * `aria-expanded` carries the state.
 */
@Component({
  selector: 'cw-collapsible-chevron',
  imports: [NgIcon],
  providers: [provideIcons({ phosphorCaretDownBold, phosphorCaretRightBold })],
  host: {
    'aria-hidden': 'true',
    '[class]': 'classes()',
    '[attr.data-state]': 'collapsible.state()',
  },
  templateUrl: './collapsible-chevron.component.html',
})
export class CwCollapsibleChevron {
  // #region Properties
  /**
   * Property direction
   * @readonly
   *
   * @description
   * Input selecting the arrow direction while the block is closed.
   *
   * @type {InputSignal<CwCollapsibleChevronDirection>}
   * @default 'down'
   */
  public readonly direction: InputSignal<CwCollapsibleChevronDirection> =
    input<CwCollapsibleChevronDirection>('down');

  /**
   * Property collapsible
   * @readonly
   *
   * @description
   * Parent block whose state controls the chevron rotation.
   *
   * @type {CwCollapsible}
   */
  protected readonly collapsible: CwCollapsible = inject(CwCollapsible);

  /**
   * Property icon
   * @readonly
   *
   * @description
   * Icon name corresponding to the selected closed direction.
   *
   * @type {Signal<string>}
   */
  protected readonly icon: Signal<string> = computed(() => ICONS[this.direction()]);

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Computed base, size and rotation classes for the selected direction.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(
    () => `${BASE} ${DIRECTIONS[this.direction()]}`,
  );
  // #endregion
}
