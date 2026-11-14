import {
  Component,
  computed,
  contentChildren,
  input,
  numberAttribute,
  type InputSignal,
  type InputSignalWithTransform,
  type Signal,
} from '@angular/core';
import { CwMenu, CwMenuItem } from '@cadenway/ui/components/menu';

import { CwBreadcrumbEllipsis } from './breadcrumb-ellipsis/breadcrumb-ellipsis.component';
import { CwBreadcrumbSeparator } from './breadcrumb-separator/breadcrumb-separator.component';
import { CwBreadcrumbSlot } from './breadcrumb-slot/breadcrumb-slot.directive';
import { CW_BREADCRUMB_ITEM, type BreadcrumbItemHandle } from './breadcrumb.token';
import type { CwBreadcrumbSeparatorStyle, CwBreadcrumbSize } from './breadcrumb.types';

/**
 * Constant LIST
 *
 * @description
 * Literal breadcrumb list layout and text classes for each supported size.
 *
 * @type {Record<CwBreadcrumbSize, string>}
 */
const LIST: Record<CwBreadcrumbSize, string> = {
  default: 'flex flex-wrap items-center gap-1.5 text-sm break-words text-muted-foreground',
  sm: 'flex flex-wrap items-center gap-1 text-xs break-words text-muted-foreground',
};

/**
 * Class CwBreadcrumb
 * @class CwBreadcrumb
 *
 * @description
 * Where the current page sits: space › list › task, every level clickable except the last
 * (Breadcrumb sheet of the Design System artifact).
 *
 * Put it on a `<nav>` and write the levels flat inside it: `a[cwBreadcrumbLink]` (or a
 * `button[cwBreadcrumbLink]` level with a menu), then one `span[cwBreadcrumbPage]` last. The trail
 * lays them out as an ordered list, one `li` per level, with decorative separators between them
 * (`separator`); anything else written inside is not displayed. Past `maxItems` levels it folds
 * the middle ones: the first level, « … », then the last two. « … » opens a `cw-menu` of the hidden
 * levels named « Niveaux masqués » (`ellipsisLabel`); choosing one clicks the hidden link.
 *
 * `ariaLabel` names the navigation (« Fil d'Ariane »); give each trail of a page its own name.
 * `data-size` sits on the `nav`.
 */
@Component({
  selector: 'nav[cwBreadcrumb]',
  imports: [CwBreadcrumbSlot, CwBreadcrumbSeparator, CwBreadcrumbEllipsis, CwMenu, CwMenuItem],
  host: {
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.data-size]': 'size()',
  },
  templateUrl: './breadcrumb.component.html',
})
export class CwBreadcrumb {
  // #region Properties
  /**
   * Property size
   * @readonly
   *
   * @description
   * Input selecting the text and separator size.
   *
   * @type {InputSignal<CwBreadcrumbSize>}
   * @default 'default'
   */
  public readonly size: InputSignal<CwBreadcrumbSize> = input<CwBreadcrumbSize>('default');

  /**
   * Property separator
   * @readonly
   *
   * @description
   * Input selecting the decorative mark between breadcrumb levels.
   *
   * @type {InputSignal<CwBreadcrumbSeparatorStyle>}
   * @default 'chevron'
   */
  public readonly separator: InputSignal<CwBreadcrumbSeparatorStyle> =
    input<CwBreadcrumbSeparatorStyle>('chevron');

  /**
   * Property maxItems
   * @readonly
   *
   * @description
   * Input setting the level count above which the middle levels collapse into an ellipsis menu.
   *
   * @type {InputSignalWithTransform<number, unknown>}
   * @default 4
   */
  public readonly maxItems: InputSignalWithTransform<number, unknown> = input(4, {
    transform: numberAttribute,
  });

  /**
   * Property ariaLabel
   * @readonly
   *
   * @description
   * Accessible name of the navigation landmark.
   *
   * @type {InputSignal<string>}
   * @default "Fil d'Ariane"
   */
  public readonly ariaLabel: InputSignal<string> = input("Fil d'Ariane");

  /**
   * Property ellipsisLabel
   * @readonly
   *
   * @description
   * Accessible name of the ellipsis trigger and its hidden-level menu.
   *
   * @type {InputSignal<string>}
   * @default 'Niveaux masqués'
   */
  public readonly ellipsisLabel: InputSignal<string> = input('Niveaux masqués');

  /**
   * Property items
   * @readonly
   *
   * @description
   * Ordered query of projected breadcrumb levels, including descendants.
   *
   * @type {Signal<readonly BreadcrumbItemHandle[]>}
   */
  protected readonly items: Signal<readonly BreadcrumbItemHandle[]> = contentChildren(
    CW_BREADCRUMB_ITEM,
    { descendants: true },
  );

  /**
   * Property listClasses
   * @readonly
   *
   * @description
   * Computed list layout and text classes for the selected size.
   *
   * @type {Signal<string>}
   */
  protected readonly listClasses: Signal<string> = computed(() => LIST[this.size()]);

  /**
   * Property collapsed
   * @readonly
   *
   * @description
   * Whether middle levels are folded, keeping the first and final two visible.
   *
   * @type {Signal<boolean>}
   */
  protected readonly collapsed: Signal<boolean> = computed(() => {
    const count: number = this.items().length;
    return count > 3 && count > this.maxItems();
  });

  /**
   * Property hiddenItems
   * @readonly
   *
   * @description
   * Middle levels included in the ellipsis menu, or an empty list when not collapsed.
   *
   * @type {Signal<BreadcrumbItemHandle[]>}
   */
  protected readonly hiddenItems: Signal<BreadcrumbItemHandle[]> = computed(() =>
    this.collapsed() ? this.items().slice(1, -2) : [],
  );
  // #endregion

  // #region Methods
  /**
   * Method isHidden
   * @method isHidden
   *
   * @description
   * Checks whether a projected level is hidden in the collapsed trail.
   *
   * @param {number} index - Zero-based index of the projected level.
   *
   * @returns {boolean} Whether the level belongs to the folded middle section.
   */
  protected isHidden(index: number): boolean {
    return this.collapsed() && index >= 1 && index < this.items().length - 2;
  }
  // #endregion
}
