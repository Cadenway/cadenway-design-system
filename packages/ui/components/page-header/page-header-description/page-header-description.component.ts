import { Component, computed, inject, type Signal } from '@angular/core';

import { CwPageHeader } from '../page-header.component';

/**
 * Class CwPageHeaderDescription
 * @class CwPageHeaderDescription
 *
 * @description
 * The one-line, figured summary under the title of a `cw-page-header` (« 12 – 26 nov. · 18 tâches
 * ouvertes · 68 % terminé »).
 *
 * Rendered as a muted paragraph; hidden on a `compact` header, whose single row has no summary (Page
 * Header sheet, "Variantes").
 */
@Component({
  selector: 'cw-page-header-description',
  host: { '[class]': 'classes()' },
  templateUrl: './page-header-description.component.html',
})
export class CwPageHeaderDescription {
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
   * Property classes
   * @readonly
   *
   * @description
   * Hides the summary in compact layout and displays it otherwise.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(() =>
    this.header?.size() === 'compact' ? 'hidden' : 'block min-w-0',
  );
  // #endregion
}
