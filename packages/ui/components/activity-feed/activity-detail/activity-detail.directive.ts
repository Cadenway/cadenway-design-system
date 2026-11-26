import { Directive, TemplateRef, inject, input, type InputSignal } from '@angular/core';

import type { CwActivityEntry, CwActivityEntryContext } from '../activity-feed.types';

/**
 * Directive CwActivityDetailDef
 *
 * @description
 * Content drawn under the summary and the quote of each entry: `<ng-template cwActivityDetail let-entry let-data="data">` inside a `cw-activity-feed` (mockup `App.dc.html`, list activity: the task chip that opens the task). `cwActivityDetailOf` only types the context from the feed's entries; it renders nothing.
 */
@Directive({ selector: 'ng-template[cwActivityDetail]' })
export class CwActivityDetailDef<T> {
  // #region Properties
  /**
   * Property cwActivityDetailOf
   *
   * @description
   * The entries of the feed, for type inference only.
   *
   * @type {InputSignal<readonly CwActivityEntry<T>[] | undefined>}
   * @readonly
   */
  public readonly cwActivityDetailOf: InputSignal<readonly CwActivityEntry<T>[] | undefined> =
    input<readonly CwActivityEntry<T>[]>();

  /**
   * Property template
   *
   * @description
   * The template stamped under each entry.
   *
   * @type {TemplateRef<CwActivityEntryContext<T>>}
   * @readonly
   */
  public readonly template: TemplateRef<CwActivityEntryContext<T>> =
    inject<TemplateRef<CwActivityEntryContext<T>>>(TemplateRef);
  // #endregion

  // #region Methods
  /**
   * Method ngTemplateContextGuard
   *
   * @description
   * Types the `let-` variables of the template for the compiler.
   *
   * @param {CwActivityDetailDef<T>} _dir - Directive instance used by the template checker.
   * @param {unknown} _ctx - Unknown template context to narrow.
   * @returns {ctx is CwActivityEntryContext<T>} Whether the context has the declared template type.
   */
  public static ngTemplateContextGuard<T>(
    _dir: CwActivityDetailDef<T>,
    _ctx: unknown,
  ): _ctx is CwActivityEntryContext<T> {
    return true;
  }
  // #endregion
}
