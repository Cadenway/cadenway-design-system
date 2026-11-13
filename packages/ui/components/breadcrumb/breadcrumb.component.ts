import { Component, computed, contentChildren, input, numberAttribute } from '@angular/core';
import { CwMenu, CwMenuItem } from '@cadenway/ui/components/menu';

import { CwBreadcrumbEllipsis } from './breadcrumb-ellipsis/breadcrumb-ellipsis.component';
import { CwBreadcrumbSeparator } from './breadcrumb-separator/breadcrumb-separator.component';
import { CwBreadcrumbSlot } from './breadcrumb-slot/breadcrumb-slot.directive';
import { CW_BREADCRUMB_ITEM } from './breadcrumb.token';
import type { CwBreadcrumbSeparatorStyle, CwBreadcrumbSize } from './breadcrumb.types';

/* Literal class strings (Breadcrumb sheet and preview of the Design System artifact). */
const LIST: Record<CwBreadcrumbSize, string> = {
  default: 'flex flex-wrap items-center gap-1.5 text-sm break-words text-muted-foreground',
  sm: 'flex flex-wrap items-center gap-1 text-xs break-words text-muted-foreground',
};

/**
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
  // A component on a native element (attribute selector), as its sheet requires: the element keeps
  // its navigation landmark. The lint rule only knows element selectors.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'nav[cwBreadcrumb]',
  imports: [CwBreadcrumbSlot, CwBreadcrumbSeparator, CwBreadcrumbEllipsis, CwMenu, CwMenuItem],
  host: {
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.data-size]': 'size()',
  },
  templateUrl: './breadcrumb.component.html',
})
export class CwBreadcrumb {
  /** Text and separator size: `sm` above a Page Header title. */
  readonly size = input<CwBreadcrumbSize>('default');
  /** Mark between the levels. */
  readonly separator = input<CwBreadcrumbSeparatorStyle>('chevron');
  /** Past this many levels, the middle ones fold into « … ». */
  readonly maxItems = input(4, { transform: numberAttribute });
  /** Accessible name of the navigation. */
  readonly ariaLabel = input("Fil d'Ariane");
  /** Accessible name of « … » and of the menu of the hidden levels. */
  readonly ellipsisLabel = input('Niveaux masqués');

  protected readonly items = contentChildren(CW_BREADCRUMB_ITEM, { descendants: true });
  protected readonly listClasses = computed(() => LIST[this.size()]);

  /** Whether the middle levels fold: the first and the last two stay. */
  protected readonly collapsed = computed(() => {
    const count = this.items().length;
    return count > 3 && count > this.maxItems();
  });

  protected readonly hiddenItems = computed(() =>
    this.collapsed() ? this.items().slice(1, -2) : [],
  );

  protected isHidden(index: number): boolean {
    return this.collapsed() && index >= 1 && index < this.items().length - 2;
  }
}
