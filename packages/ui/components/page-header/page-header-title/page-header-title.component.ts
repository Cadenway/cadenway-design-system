import { Component, computed, inject, type Signal } from '@angular/core';

import { CwPageHeader } from '../page-header.component';
import type { CwPageHeaderSize } from '../page-header.types';

/**
 * Constant HEADINGS
 *
 * @description
 * Title and leading-icon classes from the Page Header sheet. Standard titles wrap; compact titles
 * truncate to share their row with views and actions.
 *
 * @type {Record<CwPageHeaderSize, string>}
 */
const HEADINGS: Record<CwPageHeaderSize, string> = {
  default:
    'min-w-0 text-2xl font-semibold tracking-tight [&>ng-icon]:me-2 [&>ng-icon]:align-[-0.125em]',
  compact: 'min-w-0 truncate text-sm font-semibold [&>ng-icon]:me-1.5 [&>ng-icon]:align-[-0.125em]',
};

/**
 * Class CwPageHeaderTitle
 * @class CwPageHeaderTitle
 *
 * @description
 * The title of a `cw-page-header`: renders the page's single `h1` around its content.
 *
 * Project the text, or a `cw-inline-edit` for a title that can be renamed (Page Header sheet,
 * « Titre »). Its size follows the header's.
 */
@Component({
  selector: 'cw-page-header-title',
  host: { class: 'block min-w-0' },
  templateUrl: './page-header-title.component.html',
})
export class CwPageHeaderTitle {
  // #region Properties
  /**
   * Property header
   * @readonly
   *
   * @description
   * Parent header supplying the title size, or null outside a header.
   *
   * @type {CwPageHeader | null}
   */
  private readonly header: CwPageHeader | null = inject(CwPageHeader, { optional: true });

  /**
   * Property headingClasses
   * @readonly
   *
   * @description
   * Heading classes for the parent size, using standard styling without a parent.
   *
   * @type {Signal<string>}
   */
  protected readonly headingClasses: Signal<string> = computed(
    () => HEADINGS[this.header?.size() ?? 'default'],
  );
  // #endregion
}
