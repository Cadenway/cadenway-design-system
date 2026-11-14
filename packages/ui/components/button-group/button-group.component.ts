import {
  Component,
  computed,
  contentChildren,
  input,
  type InputSignal,
  type Signal,
} from '@angular/core';

import type { CwButtonGroupOrientation } from './button-group.types';

/**
 * Constant WELDED
 *
 * @description
 * Literal classes joining adjacent controls and preserving the focused control's complete ring.
 *
 * @type {Record<CwButtonGroupOrientation, string>}
 */
const WELDED: Record<CwButtonGroupOrientation, string> = {
  horizontal:
    'flex w-fit items-stretch [&>*]:focus-visible:z-10 [&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none',
  vertical:
    'flex w-fit flex-col items-stretch [&>*]:focus-visible:z-10 [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:last-child)]:rounded-b-none',
};

/**
 * Constant NESTED
 *
 * @description
 * Layout classes spacing nested groups instead of welding their controls together.
 *
 * @type {Record<CwButtonGroupOrientation, string>}
 */
const NESTED: Record<CwButtonGroupOrientation, string> = {
  horizontal: 'flex w-fit items-center gap-2',
  vertical: 'flex w-fit flex-col items-start gap-2',
};

/**
 * Class CwButtonGroup
 * @class CwButtonGroup
 *
 * @description
 * Welds two to four related buttons into one block: the split « Créer une tâche ▾ » button, Filtrer
 * / Trier / Grouper, the sprint navigation (Button Group sheet of the Design System artifact).
 *
 * Project `button[cwButton]` of one variant and one size (an `input[cwInput]`, a
 * `cw-button-group-text` or a `cw-button-group-separator` may join them). The host is a
 * `role="group"` named by the required `ariaLabel`; every button stays its own Tab stop (this is not
 * a toolbar: no arrow keys). A group of `cw-button-group` children spaces them by 8 px instead of
 * welding them. Style hook: `data-orientation`.
 */
@Component({
  selector: 'cw-button-group',
  host: {
    role: 'group',
    '[class]': 'classes()',
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.data-orientation]': 'orientation()',
  },
  templateUrl: './button-group.component.html',
})
export class CwButtonGroup {
  // #region Properties
  /**
   * Property orientation
   * @readonly
   *
   * @description
   * Input selecting the group's direction; its separator takes the opposite orientation.
   *
   * @type {InputSignal<CwButtonGroupOrientation>}
   * @default 'horizontal'
   */
  public readonly orientation: InputSignal<CwButtonGroupOrientation> =
    input<CwButtonGroupOrientation>('horizontal');

  /**
   * Property ariaLabel
   * @readonly
   *
   * @description
   * Required accessible name for the group.
   *
   * @type {InputSignal<string>}
   */
  public readonly ariaLabel: InputSignal<string> = input.required<string>();

  /**
   * Property nested
   * @readonly
   *
   * @description
   * Projected child groups; their presence selects spaced rather than welded layout.
   *
   * @type {Signal<readonly CwButtonGroup[]>}
   */
  private readonly nested: Signal<readonly CwButtonGroup[]> = contentChildren(CwButtonGroup);

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Computed layout classes for the selected orientation and nesting state.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(() =>
    this.nested().length > 0 ? NESTED[this.orientation()] : WELDED[this.orientation()],
  );
  // #endregion
}
