import {
  Component,
  computed,
  contentChild,
  input,
  type InputSignal,
  type Signal,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCaretRightBold } from '@ng-icons/phosphor-icons/bold';

import { PAGE_HEADER_TABS } from './page-header-tabs.token';
import type { CwPageHeaderTabs } from './page-header-tabs/page-header-tabs.component';
import type { CwPageHeaderSize } from './page-header.types';

/**
 * Constant HOSTS
 *
 * @description
 * Literal Page Header sheet classes for each size and presence of tabs. The compact layout flattens
 * inner rows into a single 44-pixel row, while standard headers without tabs draw a bottom rule.
 *
 * @type {Record<CwPageHeaderSize, Record<'tabs' | 'plain', string>>}
 */
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

/**
 * Constant BREADCRUMBS
 *
 * @description
 * Breadcrumb-container classes for standard and compact headers.
 *
 * @type {Record<CwPageHeaderSize, string>}
 */
const BREADCRUMBS: Record<CwPageHeaderSize, string> = {
  default: 'empty:hidden',
  compact: 'flex items-center empty:hidden',
};

/**
 * Constant MAIN_ROWS
 *
 * @description
 * Main content row classes, flattened into the host row in compact mode.
 *
 * @type {Record<CwPageHeaderSize, string>}
 */
const MAIN_ROWS: Record<CwPageHeaderSize, string> = {
  default: 'flex items-start justify-between gap-6',
  compact: 'contents',
};

/**
 * Constant HEADINGS
 *
 * @description
 * Heading-container classes for standard stacked and compact layouts.
 *
 * @type {Record<CwPageHeaderSize, string>}
 */
const HEADINGS: Record<CwPageHeaderSize, string> = {
  default: 'grid min-w-0 gap-1',
  compact: 'contents',
};

/**
 * Constant TITLE_ROWS
 *
 * @description
 * Title and favorite row classes for each header size.
 *
 * @type {Record<CwPageHeaderSize, string>}
 */
const TITLE_ROWS: Record<CwPageHeaderSize, string> = {
  default: 'flex min-w-0 items-center gap-1',
  compact: 'contents',
};

/**
 * Class CwPageHeader
 * @class CwPageHeader
 *
 * @description
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
  // #region Properties
  /**
   * Property size
   * @readonly
   *
   * @description
   * Input selecting a three-row standard header or a single compact row.
   *
   * @type {InputSignal<CwPageHeaderSize>}
   * @default 'default'
   */
  public readonly size: InputSignal<CwPageHeaderSize> = input<CwPageHeaderSize>('default');

  /**
   * Property tabs
   * @readonly
   *
   * @description
   * Projected view tabs, or undefined when the header has no tabs.
   *
   * @type {Signal<CwPageHeaderTabs | undefined>}
   */
  private readonly tabs: Signal<CwPageHeaderTabs | undefined> = contentChild(PAGE_HEADER_TABS);

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Host layout classes for the selected size and presence of tabs.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(
    () => HOSTS[this.size()][this.tabs() ? 'tabs' : 'plain'],
  );

  /**
   * Property breadcrumbClasses
   * @readonly
   *
   * @description
   * Breadcrumb-container classes for the selected header size.
   *
   * @type {Signal<string>}
   */
  protected readonly breadcrumbClasses: Signal<string> = computed(() => BREADCRUMBS[this.size()]);

  /**
   * Property mainRowClasses
   * @readonly
   *
   * @description
   * Main content row classes for the selected header size.
   *
   * @type {Signal<string>}
   */
  protected readonly mainRowClasses: Signal<string> = computed(() => MAIN_ROWS[this.size()]);

  /**
   * Property headingClasses
   * @readonly
   *
   * @description
   * Heading-container classes for the selected header size.
   *
   * @type {Signal<string>}
   */
  protected readonly headingClasses: Signal<string> = computed(() => HEADINGS[this.size()]);

  /**
   * Property titleRowClasses
   * @readonly
   *
   * @description
   * Title and favorite row classes for the selected header size.
   *
   * @type {Signal<string>}
   */
  protected readonly titleRowClasses: Signal<string> = computed(() => TITLE_ROWS[this.size()]);
  // #endregion
}
