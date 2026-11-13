import { Component, computed, inject } from '@angular/core';

import { CwPageHeader } from '../page-header.component';

/**
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
  private readonly header = inject(CwPageHeader, { optional: true });

  protected readonly classes = computed(() =>
    this.header?.size() === 'compact' ? 'hidden' : 'block min-w-0',
  );
}
