import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { CW_DIALOG } from '../dialog.token';

/* Literal class strings (Dialog sheet and preview). In a `scrollable` dialog the footer stays in
   place below a rule. */
const CLASSES = {
  simple: 'flex justify-end gap-2',
  scrollable: 'flex items-center justify-end gap-2 border-t px-6 py-3',
} as const;

/**
 * The bottom of a `cw-dialog`: `outline` « Annuler » (`button[cwDialogClose]`), then the one
 * `default` action, whose label repeats the verb of the title.
 *
 * Projected last in the window, whatever its place in the content. A hint before the buttons takes
 * `class="mr-auto"`.
 */
@Component({
  selector: 'cw-dialog-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'classes()' },
  templateUrl: './dialog-footer.component.html',
})
export class CwDialogFooter {
  private readonly dialog = inject(CW_DIALOG, { optional: true });

  protected readonly classes = computed(() =>
    this.dialog?.scrollable() ? CLASSES.scrollable : CLASSES.simple,
  );
}
