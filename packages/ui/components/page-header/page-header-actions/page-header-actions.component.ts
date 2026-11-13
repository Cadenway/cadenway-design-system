import { Component, computed, inject } from '@angular/core';

import { CwPageHeader } from '../page-header.component';
import type { CwPageHeaderSize } from '../page-header.types';

/* Literal class strings (Page Header preview of the Design System artifact). On the compact row the
   actions go last and to the right, after the view tabs that follow them in the DOM. */
const ACTIONS: Record<CwPageHeaderSize, string> = {
  default: 'flex shrink-0 items-center gap-2',
  compact: 'order-last ml-auto flex shrink-0 items-center gap-1.5',
};

/**
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
  private readonly header = inject(CwPageHeader, { optional: true });

  protected readonly classes = computed(() => ACTIONS[this.header?.size() ?? 'default']);
}
