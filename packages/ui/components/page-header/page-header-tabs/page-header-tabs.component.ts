import { Component, computed, forwardRef, inject } from '@angular/core';
import { provideCwTabs } from '@cadenway/ui/components/tabs';

import { CwPageHeader } from '../page-header.component';
import { PAGE_HEADER_TABS } from '../page-header-tabs.token';

/* Literal class strings (Page Header preview of the Design System artifact). Default: the views
   row under the title; the list draws its own rule, the end area continues it to the right edge,
   so the rule spans the header without restyling the tabs. Compact ("Compact avec vues"): after a
   vertical separator, the tabs fill the row's height and lose their rule, the header's own bottom
   rule carries the indicator. That is the one place where this brick reaches into the Tabs brick's
   elements (by tag and `cwTab` attribute), as the sheet's compact row requires. */
const HOSTS = {
  default: 'mt-1 flex items-stretch',
  compact:
    'flex items-center self-stretch [&_cw-tabs]:self-stretch [&_cw-tabs-list]:h-full [&_cw-tabs-list]:border-b-0 [&_[cwTab]]:h-full',
} as const;

const ENDS = {
  default: 'flex flex-1 items-center gap-1 border-b pl-4',
  compact: 'flex items-center gap-1 pl-3 empty:hidden',
} as const;

/**
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
  private readonly header = inject(CwPageHeader, { optional: true });

  protected readonly compact = computed(() => this.header?.size() === 'compact');
  protected readonly classes = computed(() => HOSTS[this.compact() ? 'compact' : 'default']);
  protected readonly endClasses = computed(() => ENDS[this.compact() ? 'compact' : 'default']);
}
