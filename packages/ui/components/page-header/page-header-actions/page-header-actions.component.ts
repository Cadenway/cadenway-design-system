import { Component, computed, inject, type Signal } from '@angular/core';

import { CwPageHeader } from '../page-header.component';
import type { CwPageHeaderSize } from '../page-header.types';

/**
 * Constant ACTIONS
 *
 * @description
 * Action layout by header size; compact actions move to the right after the view tabs.
 *
 * @type {Record<CwPageHeaderSize, string>}
 */
const ACTIONS: Record<CwPageHeaderSize, string> = {
  default: 'flex shrink-0 items-center gap-2',
  compact: 'order-last ml-auto flex shrink-0 items-center gap-1.5',
};

/**
 * Class CwPageHeaderActions
 * @class CwPageHeaderActions
 *
 * @description
 * The actions of a `cw-page-header`, on the right: an avatar group, an `outline` button (Partager),
 * the one `default` action (Créer une tâche), then a `ghost` « … » for the rest (Page Header sheet,
 * « Actions »; at most three visible).
 *
 * Project the buttons; on a `compact` header give them their `sm` sizes (`sm`, `icon-sm`).
 */
@Component({
  selector: 'cw-page-header-actions',
  host: { '[class]': 'classes()' },
  templateUrl: './page-header-actions.component.html',
})
export class CwPageHeaderActions {
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
   * Computed action layout classes, using standard layout without a parent.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(
    () => ACTIONS[this.header?.size() ?? 'default'],
  );
  // #endregion
}
