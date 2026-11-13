import { Component, computed, inject } from '@angular/core';

import { CwPageHeader } from '../page-header.component';
import type { CwPageHeaderSize } from '../page-header.types';

/* Literal class strings (Page Header sheet and preview of the Design System artifact): the title
   style `text-2xl font-semibold tracking-tight`, `text-sm font-semibold` on the compact row. A
   leading icon sits in the line before the text. The default title wraps (an inline edit inside
   needs room for its hover fill and focus ring); the compact one shares its single row with the
   views and the actions, so it truncates. */
const HEADINGS: Record<CwPageHeaderSize, string> = {
  default:
    'min-w-0 text-2xl font-semibold tracking-tight [&>ng-icon]:me-2 [&>ng-icon]:align-[-0.125em]',
  compact: 'min-w-0 truncate text-sm font-semibold [&>ng-icon]:me-1.5 [&>ng-icon]:align-[-0.125em]',
};

/**
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
  private readonly header = inject(CwPageHeader, { optional: true });

  protected readonly headingClasses = computed(() => HEADINGS[this.header?.size() ?? 'default']);
}
