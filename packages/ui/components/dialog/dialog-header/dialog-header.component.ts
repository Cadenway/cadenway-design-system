import { Component, computed, inject, type Signal } from '@angular/core';

import { CW_DIALOG, type CwDialogContext } from '../dialog.token';

/* Literal class strings (Dialog sheet and preview). The header leaves room for the close button at
   the top right; in a `scrollable` dialog it stays in place above a rule. */
/**
 * Constant CLASSES
 *
 * @description
 * Layout classes for the dialog header.
 *
 * @type {typeof CLASSES}
 */
const CLASSES: Readonly<
  Record<'simple' | 'simpleWithClose' | 'scrollable' | 'scrollableWithClose', string>
> = {
  simple: 'flex flex-col gap-2',
  simpleWithClose: 'flex flex-col gap-2 pr-6',
  scrollable: 'flex flex-col gap-2 border-b px-6 py-4',
  scrollableWithClose: 'flex flex-col gap-2 border-b py-4 pr-12 pl-6',
} as const;

/**
 * Component CwDialogHeader
 *
 * @description
 * The top of a `cw-dialog`: its `h2[cwDialogTitle]` (required) and `p[cwDialogDescription]`.
 *
 * Projected first in the window, whatever its place in the content.
 */
@Component({
  selector: 'cw-dialog-header',
  host: { '[class]': 'classes()' },
  templateUrl: './dialog-header.component.html',
})
export class CwDialogHeader {
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
  protected readonly classes: Signal<string> = computed(() => {
    const scrollable: boolean = this.dialog?.scrollable() ?? false;
    const withClose: boolean = this.dialog?.showClose() ?? false;
    if (scrollable) return withClose ? CLASSES.scrollableWithClose : CLASSES.scrollable;
    return withClose ? CLASSES.simpleWithClose : CLASSES.simple;
  });
  // #endregion
}
