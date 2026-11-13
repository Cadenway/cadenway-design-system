import { Component, computed, contentChild, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCaretRightBold } from '@ng-icons/phosphor-icons/bold';

import { PAGE_HEADER_TABS } from './page-header-tabs.token';
import type { CwPageHeaderSize } from './page-header.types';

/* Literal class strings (Page Header sheet and preview of the Design System artifact). One DOM for
   both sizes: `compact` flattens the inner rows with `contents`, so every part becomes an item of a
   single 44 px row; its actions go last (`order-last`, see `CwPageHeaderActions`). */
const HOSTS: Record<CwPageHeaderSize, Record<'tabs' | 'plain', string>> = {
  default: {
    tabs: 'flex flex-col gap-2',
    // Sheet, "default sans onglets": « filet `border-b` sous l'en-tête (`pb-4`) ».
    plain: 'flex flex-col gap-2 border-b pb-4',
  },
  compact: {
    tabs: 'flex h-11 min-w-0 items-center gap-1.5 border-b',
    plain: 'flex h-11 min-w-0 items-center gap-1.5 border-b',
  },
};

const BREADCRUMBS: Record<CwPageHeaderSize, string> = {
  default: 'empty:hidden',
  compact: 'flex items-center empty:hidden',
};

const MAIN_ROWS: Record<CwPageHeaderSize, string> = {
  default: 'flex items-start justify-between gap-6',
  compact: 'contents',
};

const HEADINGS: Record<CwPageHeaderSize, string> = {
  default: 'grid min-w-0 gap-1',
  compact: 'contents',
};

const TITLE_ROWS: Record<CwPageHeaderSize, string> = {
  default: 'flex min-w-0 items-center gap-1',
  compact: 'contents',
};

/**
 * The header of a page (a list, a sprint, a space, a settings page), once per page: breadcrumb,
 * title, favorite, summary, actions, then the view tabs (Page Header sheet of the Design System
 * artifact).
 *
 * Project its parts; the header places them: a `cw-breadcrumb` or `nav[cwBreadcrumb]` first, then
 * `cw-page-header-title` and `cw-page-header-favorite`, `cw-page-header-description` under them,
 * `cw-page-header-actions` on the right, and `cw-page-header-tabs` at the bottom. `size="default"`
 * stacks three rows; without tabs it draws its own bottom rule. `size="compact"` puts everything on
 * one 44 px row (breadcrumb › title, favorite, views, actions) and drops the summary; give its
 * breadcrumb and its buttons their `sm` sizes. The parts read the size from the header. The title is
 * the page's single `h1`. Style hook: `data-size`.
 */
@Component({
  selector: 'cw-page-header',
  imports: [NgIcon],
  viewProviders: [provideIcons({ phosphorCaretRightBold })],
  host: {
    '[class]': 'classes()',
    '[attr.data-size]': 'size()',
  },
  templateUrl: './page-header.component.html',
})
export class CwPageHeader {
  /** Three rows (`default`) or one dense row (`compact`). */
  readonly size = input<CwPageHeaderSize>('default');

  private readonly tabs = contentChild(PAGE_HEADER_TABS);

  protected readonly classes = computed(() => HOSTS[this.size()][this.tabs() ? 'tabs' : 'plain']);
  protected readonly breadcrumbClasses = computed(() => BREADCRUMBS[this.size()]);
  protected readonly mainRowClasses = computed(() => MAIN_ROWS[this.size()]);
  protected readonly headingClasses = computed(() => HEADINGS[this.size()]);
  protected readonly titleRowClasses = computed(() => TITLE_ROWS[this.size()]);
}
