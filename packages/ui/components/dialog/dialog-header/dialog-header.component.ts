import { Component, computed, inject, input, type InputSignal, type Signal } from '@angular/core';

import { CW_DIALOG, type CwDialogContext } from '../dialog.token';
import type { CwDialogHeaderVariant } from '../dialog.types';

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
  Record<
    'simple' | 'simpleWithClose' | 'scrollable' | 'scrollableWithClose' | 'bar' | 'barWithClose',
    string
  >
> = {
  simple: 'flex flex-col gap-2',
  simpleWithClose: 'flex flex-col gap-2 pr-6',
  scrollable: 'flex flex-col gap-2 border-b px-6 py-4',
  scrollableWithClose: 'flex flex-col gap-2 border-b py-4 pr-12 pl-6',
  // Mockup App.dc.html, task creation and detail: a wrapping row over a rule, a 16 px title. The
  // side padding sits behind `:where()` so the consumer's `px-5` (task creation) wins.
  bar: 'flex flex-wrap items-center gap-2 border-b py-3 [:where(&)]:px-4 [&>h2]:text-base',
  barWithClose:
    'flex flex-wrap items-center gap-2 border-b py-3 [:where(&)]:px-4 pr-12 [&>h2]:text-base',
} as const;

/**
 * Component CwDialogHeader
 *
 * @description
 * The top of a `cw-dialog`: its `h2[cwDialogTitle]` (required) and `p[cwDialogDescription]`.
 *
 * Projected first in the window, whatever its place in the content. `variant="bar"` lays it out as
 * a row over a rule (the task creation and detail headers of the mockup `App.dc.html`): put it in a
 * `scrollable` dialog or one with `padding="none"`. Its side padding (16 px) yields to a `px-*`
 * class of the consumer.
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
   * Property variant
   * @readonly
   *
   * @description
   * `default` stacks the title and description; `bar` is a wrapping row over a rule.
   *
   * @type {InputSignal<CwDialogHeaderVariant>}
   */
  public readonly variant: InputSignal<CwDialogHeaderVariant> =
    input<CwDialogHeaderVariant>('default');

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
    if (this.variant() === 'bar') return withClose ? CLASSES.barWithClose : CLASSES.bar;
    if (scrollable) return withClose ? CLASSES.scrollableWithClose : CLASSES.scrollable;
    return withClose ? CLASSES.simpleWithClose : CLASSES.simple;
  });
  // #endregion
}
