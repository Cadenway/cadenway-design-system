import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  type InputSignal,
  type Signal,
} from '@angular/core';

import { CwInputGroup } from '../input-group.component';
import type { CwInputGroupAddonAlign, CwInputGroupSize } from '../input-group.types';

/**
 * Constant BASE
 *
 * @description
 * Shared layout and text classes for addons.
 *
 * @type {string}
 */
const BASE: string =
  'flex shrink-0 cursor-text items-center text-muted-foreground select-none [&_ng-icon]:[--ng-icon__size:1rem]';

/**
 * Constant ALIGNS
 *
 * @description
 * Addon layout classes for each position around the field.
 *
 * @type {Record<CwInputGroupAddonAlign, string>}
 */
const ALIGNS: Record<CwInputGroupAddonAlign, string> = {
  'inline-start': 'h-full gap-1.5 text-sm',
  'inline-end': 'h-full gap-1.5 text-sm',
  // The row above a text area: « En réponse à … » and its cancel button.
  'block-start':
    'h-auto w-full justify-between gap-1.5 border-b px-2.5 py-1.5 text-xs [&>button]:-my-1 [&>button]:-me-1.5',
  'block-end': 'h-auto w-full gap-1 px-1.5 pb-1.5 text-sm',
};

/**
 * Constant PADDINGS
 *
 * @description
 * Inline padding classes by group size and addon side.
 *
 * @type {Record<CwInputGroupSize, Record<'inline-start' | 'inline-end', string>>}
 */
const PADDINGS: Record<CwInputGroupSize, Record<'inline-start' | 'inline-end', string>> = {
  sm: {
    'inline-start': 'ps-2.5 has-[>button]:ps-1',
    'inline-end': 'pe-2.5 has-[>button]:pe-1 has-[>kbd]:pe-1',
  },
  default: {
    'inline-start': 'ps-2.5 has-[>button]:ps-1',
    'inline-end': 'pe-2.5 has-[>button]:pe-1 has-[>kbd]:pe-1.5',
  },
  lg: {
    'inline-start': 'ps-3 has-[>button]:ps-1.5',
    'inline-end': 'pe-2.5 has-[>button]:pe-1.5 has-[>kbd]:pe-1.5',
  },
};

/**
 * Class CwInputGroupAddon
 * @class CwInputGroupAddon
 *
 * @description
 * A complement of the field in a `cw-input-group`: an icon, a prefix or suffix, a key cap, a
 * counter, a spinner, buttons (Input Group sheet).
 *
 * `align` places it before (`inline-start`, default) or after (`inline-end`) the field, or as a row
 * above (`block-start`) or below (`block-end`) a text area; write it at that place in the markup.
 * In `muted-foreground`; a click outside its buttons focuses the field. Mark decorative icons
 * `aria-hidden`, announce a counter or a loading text with `aria-live="polite"`.
 */
@Component({
  selector: 'cw-input-group-addon',
  host: {
    '[class]': 'classes()',
    '[attr.data-align]': 'align()',
    '(click)': 'focusField($event)',
  },
  templateUrl: './input-group-addon.component.html',
})
export class CwInputGroupAddon {
  // #region Properties
  /**
   * Property align
   * @readonly
   *
   * @description
   * Position of the addon around the field.
   *
   * @type {InputSignal<CwInputGroupAddonAlign>}
   */
  public readonly align: InputSignal<CwInputGroupAddonAlign> =
    input<CwInputGroupAddonAlign>('inline-start');

  /**
   * Property group
   * @readonly
   *
   * @description
   * Optional parent supplying the group size.
   *
   * @type {CwInputGroup | null}
   */
  private readonly group: CwInputGroup | null = inject(CwInputGroup, { optional: true });

  /**
   * Property element
   * @readonly
   *
   * @description
   * Native addon host used to locate its field.
   *
   * @type {HTMLElement}
   */
  private readonly element: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Addon layout and padding classes for its position and group size.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(() => {
    const align: CwInputGroupAddonAlign = this.align();
    const size: CwInputGroupSize = this.group?.size() ?? 'default';
    const padding: string =
      align === 'inline-start' || align === 'inline-end' ? PADDINGS[size][align] : '';
    return `${BASE} ${ALIGNS[align]} ${padding}`;
  });
  // #endregion

  // #region Methods
  /**
   * Method focusField
   * @method focusField
   *
   * @description
   * Focuses the field when a noninteractive part of the addon is clicked.
   *
   * @param {MouseEvent} event - Click used to determine whether an interactive element was targeted.
   */
  protected focusField(event: MouseEvent): void {
    const target: EventTarget | null = event.target;
    if (target instanceof Element && target.closest('button, a, input, textarea')) return;
    this.element
      .closest('cw-input-group')
      ?.querySelector<HTMLElement>('input:not([type=hidden]), textarea')
      ?.focus();
  }
  // #endregion
}
