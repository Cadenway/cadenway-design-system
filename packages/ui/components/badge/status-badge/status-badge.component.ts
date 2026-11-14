import { Component, computed, input, type InputSignal, type Signal } from '@angular/core';
import {
  CW_STATUS_LABELS,
  CwStatusIcon,
  type CwStatusIconSize,
  type CwStatusKey,
} from '@cadenway/ui/components/status-icon';

import { BADGE_BASE, BADGE_SIZES, BADGE_VARIANTS } from '../badge.constants';
import type { CwBadgeSize } from '../badge.types';

/**
 * Constant STATUS_ICON_SIZES
 *
 * @description
 * Status icon size used by each badge height.
 *
 * @type {Record<CwBadgeSize, CwStatusIconSize>}
 */
const STATUS_ICON_SIZES: Record<CwBadgeSize, CwStatusIconSize> = { default: '3', sm: '3' };

/**
 * Class CwStatusBadge
 * @class CwStatusBadge
 *
 * @description
 * The status of a task as an `outline` badge: the animated status icon and its French word, always
 * both (Badge sheet, "Compositions Cadenway", with the product keys of `@cadenway/ui/components/status-icon`).
 *
 * `status` is one of the ten `CwStatusKey`; an unknown key reads `todo`. `from` forwards a previous
 * status so the icon morphs after mounting. `label` replaces the word (« En cours » by default, from
 * `CW_STATUS_LABELS`). The icon is `aria-hidden`: the word is the accessible text.
 */
@Component({
  selector: 'cw-status-badge',
  imports: [CwStatusIcon],
  host: {
    '[class]': 'classes()',
    '[attr.data-status]': 'current()',
    '[attr.data-size]': 'size()',
  },
  templateUrl: './status-badge.component.html',
})
export class CwStatusBadge {
  // #region Properties
  /**
   * Property status
   * @readonly
   *
   * @description
   * Required status key displayed by the badge; unknown runtime keys fall back to `todo`.
   *
   * @type {InputSignal<CwStatusKey>}
   */
  public readonly status: InputSignal<CwStatusKey> = input.required<CwStatusKey>();

  /**
   * Property from
   * @readonly
   *
   * @description
   * Previous status used for the icon's initial morph, or null or undefined without a transition.
   *
   * @type {InputSignal<CwStatusKey | null | undefined>}
   * @default undefined
   */
  public readonly from: InputSignal<CwStatusKey | null | undefined> = input<
    CwStatusKey | null | undefined
  >(undefined);

  /**
   * Property label
   * @readonly
   *
   * @description
   * Replacement text for the status; null or undefined uses the standard French label.
   *
   * @type {InputSignal<string | null | undefined>}
   * @default undefined
   */
  public readonly label: InputSignal<string | null | undefined> = input<string | null | undefined>(
    undefined,
  );

  /**
   * Property size
   * @readonly
   *
   * @description
   * Input selecting the badge height: 22 pixels by default or 18 pixels for `sm`.
   *
   * @type {InputSignal<CwBadgeSize>}
   * @default 'default'
   */
  public readonly size: InputSignal<CwBadgeSize> = input<CwBadgeSize>('default');

  /**
   * Property current
   * @readonly
   *
   * @description
   * Validated status key, falling back to `todo` when the supplied runtime key is unknown.
   *
   * @type {Signal<CwStatusKey>}
   */
  protected readonly current: Signal<CwStatusKey> = computed<CwStatusKey>(() =>
    Object.hasOwn(CW_STATUS_LABELS, this.status()) ? this.status() : 'todo',
  );

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Outline badge classes combined with the selected size.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(
    () => `${BADGE_BASE} ${BADGE_VARIANTS.outline} ${BADGE_SIZES[this.size()]}`,
  );

  /**
   * Property iconSize
   * @readonly
   *
   * @description
   * Status icon size corresponding to the current badge size.
   *
   * @type {Signal<CwStatusIconSize>}
   */
  protected readonly iconSize: Signal<CwStatusIconSize> = computed(
    () => STATUS_ICON_SIZES[this.size()],
  );

  /**
   * Property text
   * @readonly
   *
   * @description
   * Custom label when supplied, otherwise the French label for the validated status.
   *
   * @type {Signal<string>}
   */
  protected readonly text: Signal<string> = computed(
    () => this.label() ?? CW_STATUS_LABELS[this.current()],
  );
  // #endregion
}
