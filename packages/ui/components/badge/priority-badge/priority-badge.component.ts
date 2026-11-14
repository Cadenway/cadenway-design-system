import {
  booleanAttribute,
  Component,
  computed,
  input,
  type InputSignal,
  type InputSignalWithTransform,
  type Signal,
} from '@angular/core';
import {
  CW_PRIORITY_LABELS,
  CwPriorityIcon,
  type CwPriorityIconSize,
  type CwPriorityKey,
} from '@cadenway/ui/components/priority-icon';

import { BADGE_BASE } from '../badge.constants';
import type { CwBadgeSize } from '../badge.types';

/**
 * Constant PRIORITY_SIZES
 *
 * @description
 * Ghost badge dimensions with tighter padding, as shown in the Badge preview's priorities.
 *
 * @type {Record<CwBadgeSize, string>}
 */
const PRIORITY_SIZES: Record<CwBadgeSize, string> = {
  default: 'rounded-md px-1.5 py-0.5 text-xs',
  sm: 'h-[18px] px-1.5 text-[11px] leading-none',
};

/**
 * Constant PRIORITY_ICON_SIZES
 *
 * @description
 * Priority bar icon size corresponding to each badge height.
 *
 * @type {Record<CwBadgeSize, CwPriorityIconSize>}
 */
const PRIORITY_ICON_SIZES: Record<CwBadgeSize, CwPriorityIconSize> = { default: '4', sm: '3' };

/**
 * Constant PRIORITY_IMAGE_LABELS
 *
 * @description
 * French accessible names used when a priority badge is rendered without visible text.
 *
 * @type {Record<CwPriorityKey, string>}
 */
const PRIORITY_IMAGE_LABELS: Record<CwPriorityKey, string> = {
  urgente: 'Priorité urgente',
  haute: 'Priorité haute',
  moyenne: 'Priorité moyenne',
  basse: 'Priorité basse',
};

/**
 * Class CwPriorityBadge
 * @class CwPriorityBadge
 *
 * @description
 * The priority of a task as a `ghost` badge: the animated priority bars and their French word, the
 * word in `text-destructive` for `urgente` (Badge sheet, "Compositions Cadenway", with the product
 * keys of `@cadenway/ui/components/priority-icon`).
 *
 * `priority` is one of the four `CwPriorityKey`; an unknown key reads `moyenne`. `from` forwards a
 * previous priority so the bars morph after mounting. `label` replaces the word (`CW_PRIORITY_LABELS`
 * by default). With `showLabel` off, the word is not written and the badge becomes an image named
 * by `ariaLabel` (« Priorité haute » by default), also shown as its tooltip.
 */
@Component({
  selector: 'cw-priority-badge',
  imports: [CwPriorityIcon],
  host: {
    '[class]': 'classes()',
    '[attr.role]': 'showLabel() ? null : "img"',
    '[attr.aria-label]': 'showLabel() ? null : imageLabel()',
    '[attr.title]': 'showLabel() ? null : imageLabel()',
    '[attr.data-priority]': 'current()',
    '[attr.data-size]': 'size()',
  },
  templateUrl: './priority-badge.component.html',
})
export class CwPriorityBadge {
  // #region Properties
  /**
   * Property priority
   * @readonly
   *
   * @description
   * Required priority key; unknown runtime keys fall back to `moyenne`.
   *
   * @type {InputSignal<CwPriorityKey>}
   */
  public readonly priority: InputSignal<CwPriorityKey> = input.required<CwPriorityKey>();

  /**
   * Property from
   * @readonly
   *
   * @description
   * Previous priority for the initial icon morph, or null or undefined without a transition.
   *
   * @type {InputSignal<CwPriorityKey | null | undefined>}
   * @default undefined
   */
  public readonly from: InputSignal<CwPriorityKey | null | undefined> = input<
    CwPriorityKey | null | undefined
  >(undefined);

  /**
   * Property showLabel
   * @readonly
   *
   * @description
   * Whether the word is visible; when false the badge exposes an image with an accessible name.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @default true
   */
  public readonly showLabel: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  /**
   * Property label
   * @readonly
   *
   * @description
   * Replacement word for the priority; null or undefined uses the standard French label.
   *
   * @type {InputSignal<string | null | undefined>}
   * @default undefined
   */
  public readonly label: InputSignal<string | null | undefined> = input<string | null | undefined>(
    undefined,
  );

  /**
   * Property ariaLabel
   * @readonly
   *
   * @description
   * Accessible image name when the visible word is hidden; null or undefined uses the default name.
   *
   * @type {InputSignal<string | null | undefined>}
   * @default undefined
   */
  public readonly ariaLabel: InputSignal<string | null | undefined> = input<
    string | null | undefined
  >(undefined);

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
   * Validated priority key, falling back to `moyenne` for unknown runtime values.
   *
   * @type {Signal<CwPriorityKey>}
   */
  protected readonly current: Signal<CwPriorityKey> = computed<CwPriorityKey>(() =>
    Object.hasOwn(CW_PRIORITY_LABELS, this.priority()) ? this.priority() : 'moyenne',
  );

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Ghost badge and size classes, with the destructive text color for urgent priority.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(() => {
    const tone: string = this.current() === 'urgente' ? 'text-destructive' : 'text-foreground';
    return `${BADGE_BASE} border-transparent ${PRIORITY_SIZES[this.size()]} ${tone}`;
  });

  /**
   * Property iconSize
   * @readonly
   *
   * @description
   * Priority icon size corresponding to the selected badge size.
   *
   * @type {Signal<CwPriorityIconSize>}
   */
  protected readonly iconSize: Signal<CwPriorityIconSize> = computed(
    () => PRIORITY_ICON_SIZES[this.size()],
  );

  /**
   * Property text
   * @readonly
   *
   * @description
   * Custom label when supplied, otherwise the French word for the validated priority.
   *
   * @type {Signal<string>}
   */
  protected readonly text: Signal<string> = computed(
    () => this.label() ?? CW_PRIORITY_LABELS[this.current()],
  );

  /**
   * Property imageLabel
   * @readonly
   *
   * @description
   * Accessible image name and tooltip when the visible label is hidden.
   *
   * @type {Signal<string>}
   */
  protected readonly imageLabel: Signal<string> = computed(
    () => this.ariaLabel() ?? PRIORITY_IMAGE_LABELS[this.current()],
  );
  // #endregion
}
