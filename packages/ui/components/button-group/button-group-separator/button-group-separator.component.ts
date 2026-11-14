import { Component, computed, inject, type Signal } from '@angular/core';

import { CwButtonGroup } from '../button-group.component';
import type { CwButtonGroupOrientation } from '../button-group.types';

/**
 * Constant SEPARATOR
 *
 * @description
 * Separator classes for each group direction. A sibling selector uses the previous button's variant
 * to choose a light gap after a default button or a border-colored rule otherwise.
 *
 * @type {Record<CwButtonGroupOrientation, string>}
 */
const SEPARATOR: Record<CwButtonGroupOrientation, string> = {
  horizontal: 'w-px shrink-0 self-stretch bg-input [[data-variant=default]+&]:bg-background/25',
  vertical: 'h-px shrink-0 self-stretch bg-input [[data-variant=default]+&]:bg-background/25',
};

/**
 * Class CwButtonGroupSeparator
 * @class CwButtonGroupSeparator
 *
 * @description
 * A 1 px rule between two buttons of a `cw-button-group`, required between two `default` buttons
 * (the split button), useless between `outline` buttons.
 *
 * `role="separator"`, oriented across its group (`aria-orientation="vertical"` in a horizontal
 * group).
 */
@Component({
  selector: 'cw-button-group-separator',
  host: {
    role: 'separator',
    '[class]': 'classes()',
    '[attr.aria-orientation]': 'across()',
  },
  templateUrl: './button-group-separator.component.html',
})
export class CwButtonGroupSeparator {
  // #region Properties
  /**
   * Property group
   * @readonly
   *
   * @description
   * Parent group supplying the orientation, or null outside a group.
   *
   * @type {CwButtonGroup | null}
   */
  private readonly group: CwButtonGroup | null = inject(CwButtonGroup, { optional: true });

  /**
   * Property across
   * @readonly
   *
   * @description
   * Separator orientation perpendicular to the parent group; vertical without a parent.
   *
   * @type {Signal<CwButtonGroupOrientation>}
   */
  protected readonly across: Signal<CwButtonGroupOrientation> = computed(() =>
    this.group?.orientation() === 'vertical' ? 'horizontal' : 'vertical',
  );

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Rule classes corresponding to the separator's orientation.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(() =>
    this.across() === 'vertical' ? SEPARATOR.horizontal : SEPARATOR.vertical,
  );
  // #endregion
}
