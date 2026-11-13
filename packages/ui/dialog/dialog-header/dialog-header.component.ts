import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { CW_DIALOG } from '../dialog.token';

/* Literal class strings (Dialog sheet and preview). The header leaves room for the close button at
   the top right; in a `scrollable` dialog it stays in place above a rule. */
const CLASSES = {
  simple: 'flex flex-col gap-2',
  simpleWithClose: 'flex flex-col gap-2 pr-6',
  scrollable: 'flex flex-col gap-2 border-b px-6 py-4',
  scrollableWithClose: 'flex flex-col gap-2 border-b py-4 pr-12 pl-6',
} as const;

/**
 * The top of a `cw-dialog`: its `h2[cwDialogTitle]` (required) and `p[cwDialogDescription]`.
 *
 * Projected first in the window, whatever its place in the content.
 */
@Component({
  selector: 'cw-dialog-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'classes()' },
  templateUrl: './dialog-header.component.html',
})
export class CwDialogHeader {
  private readonly dialog = inject(CW_DIALOG, { optional: true });

  protected readonly classes = computed(() => {
    const scrollable = this.dialog?.scrollable() ?? false;
    const withClose = this.dialog?.showClose() ?? false;
    if (scrollable) return withClose ? CLASSES.scrollableWithClose : CLASSES.scrollable;
    return withClose ? CLASSES.simpleWithClose : CLASSES.simple;
  });
}
