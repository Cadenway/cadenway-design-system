import { Component, computed, forwardRef, inject, type Signal } from '@angular/core';
import { provideCwTabs } from '@cadenway/ui/components/tabs';

import { CwPageHeader } from '../page-header.component';
import { PAGE_HEADER_TABS } from '../page-header-tabs.token';
import type { CwPageHeaderSize } from '../page-header.types';

/**
 * Constant HOSTS
 *
 * @description
 * Tab-row classes from the Page Header preview. In compact mode the header's bottom rule carries
 * the indicator and the tab elements fill the row, as required by the sheet.
 *
 * @type {Readonly<Record<CwPageHeaderSize, string>>}
 */
const HOSTS: Readonly<Record<CwPageHeaderSize, string>> = {
  default: 'mt-1 flex items-stretch',
  compact:
    'flex items-center self-stretch [&_cw-tabs]:self-stretch [&_cw-tabs-list]:h-full [&_cw-tabs-list]:border-b-0 [&_[cwTab]]:h-full',
};

/**
 * Constant ENDS
 *
 * @description
 * Classes for content following the tab list; standard layout extends the list's bottom rule.
 *
 * @type {Readonly<Record<CwPageHeaderSize, string>>}
 */
const ENDS: Readonly<Record<CwPageHeaderSize, string>> = {
  default: 'flex flex-1 items-center gap-1 border-b pl-4',
  compact: 'flex items-center gap-1 pl-3 empty:hidden',
};

/**
 * Class CwPageHeaderTabs
 * @class CwPageHeaderTabs
 *
 * @description
 * The view tabs of a `cw-page-header` (Liste · Tableau · Calendrier · Gantt · + Vue), always in the
 * Tabs `bar` variant (Page Header sheet: « les onglets en variante `bar` »).
 *
 * Project one `cw-tabs` with its `cw-tabs-list`: this part provides `provideCwTabs({ variant: 'bar'
 * })`, so the set needs no `variant`. Its tabs are `button[cwTab]` (views switched in place, as in
 * the mockup) or `a[cwTab]` links to routed views: the list is then a navigation, give each link
 * `[active]` from `routerLinkActive` (see `CwTab`); name the list « Vues » either way. Any other
 * content (the « + Vue » `ghost` `xs` button) goes after the tabs, outside the list. On a compact
 * header the tabs fill the row after a vertical separator.
 */
@Component({
  selector: 'cw-page-header-tabs',
  providers: [
    provideCwTabs({ variant: 'bar' }),
    { provide: PAGE_HEADER_TABS, useExisting: forwardRef(() => CwPageHeaderTabs) },
  ],
  host: { '[class]': 'classes()' },
  templateUrl: './page-header-tabs.component.html',
})
export class CwPageHeaderTabs {
  // #region Properties
  /**
   * Property header
   * @readonly
   *
   * @description
   * Parent header supplying the layout size, or null outside a header.
   *
   * @type {CwPageHeader | null}
   */
  private readonly header: CwPageHeader | null = inject(CwPageHeader, { optional: true });

  /**
   * Property compact
   * @readonly
   *
   * @description
   * Whether the parent uses the compact one-row header layout.
   *
   * @type {Signal<boolean>}
   */
  protected readonly compact: Signal<boolean> = computed(() => this.header?.size() === 'compact');

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Tab-row classes for the parent header layout.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(
    () => HOSTS[this.compact() ? 'compact' : 'default'],
  );

  /**
   * Property endClasses
   * @readonly
   *
   * @description
   * Classes for the content following the list in the parent header layout.
   *
   * @type {Signal<string>}
   */
  protected readonly endClasses: Signal<string> = computed(
    () => ENDS[this.compact() ? 'compact' : 'default'],
  );
  // #endregion
}
