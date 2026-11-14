import { Component, computed, inject, type Signal } from '@angular/core';

import { CW_DIALOG, type CwDialogContext } from '../dialog.token';

/* Literal class strings (Dialog sheet and preview). In a `scrollable` dialog the footer stays in
   place below a rule. */
/**
 * Constant CLASSES
 *
 * @description
 * Layout classes for the dialog footer.
 *
 * @type {Readonly<Record<'simple' | 'scrollable', string>>}
 */
const CLASSES: Readonly<Record<'simple' | 'scrollable', string>> = {
  simple: 'flex justify-end gap-2',
  scrollable: 'flex items-center justify-end gap-2 border-t px-6 py-3',
} as const;

/**
 * Component CwDialogFooter
 *
 * @description
 * The bottom of a `cw-dialog`: `outline` « Annuler » (`button[cwDialogClose]`), then the one
 * `default` action, whose label repeats the verb of the title.
 *
 * Projected last in the window, whatever its place in the content. A hint before the buttons takes
 * `class="mr-auto"`.
 */
@Component({
  selector: 'cw-dialog-footer',
  host: { '[class]': 'classes()' },
  templateUrl: './dialog-footer.component.html',
})
export class CwDialogFooter {
  // #region Properties
  /**
   * Property dialog
   * @readonly
   *
   * @description
   * Parent dialog context when present.
   *
   * @type {CwDialogContext | null}
   */
  private readonly dialog: CwDialogContext | null = inject(CW_DIALOG, { optional: true });

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Classes derived from the dialog layout.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(() =>
    this.dialog?.scrollable() ? CLASSES.scrollable : CLASSES.simple,
  );
  // #endregion
}
