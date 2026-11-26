import { Directive, TemplateRef, inject, input, type InputSignal } from '@angular/core';

import type { CwActivityEntry, CwActivityEntryContext } from '../activity-feed.types';

/**
 * Directive CwActivitySummaryDef
 *
 * @description
 * Replaces the drawing of the `summary` segments of each entry, after the actor's name: `<ng-template cwActivitySummary let-entry let-data="data">` inside a `cw-activity-feed`, for content that is more than text (mockup `App.dc.html`, list activity: « from A to B » with status icons). The template renders inline in the summary line, which wraps. `cwActivitySummaryOf` only types the context from the feed's entries; it renders nothing.
 */
@Directive({ selector: 'ng-template[cwActivitySummary]' })
export class CwActivitySummaryDef<T> {
  // #region Properties
  /**
   * Property cwActivitySummaryOf
   *
   * @description
   * The entries of the feed, for type inference only.
   *
   * @type {InputSignal<readonly CwActivityEntry<T>[] | undefined>}
   * @readonly
   */
  public readonly cwActivitySummaryOf: InputSignal<readonly CwActivityEntry<T>[] | undefined> =
    input<readonly CwActivityEntry<T>[]>();

  /**
   * Property template
   *
   * @description
   * The template stamped in place of the summary segments.
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
   * @param {CwActivitySummaryDef<T>} _dir - Directive instance used by the template checker.
   * @param {unknown} _ctx - Unknown template context to narrow.
   * @returns {ctx is CwActivityEntryContext<T>} Whether the context has the declared template type.
   */
  public static ngTemplateContextGuard<T>(
    _dir: CwActivitySummaryDef<T>,
    _ctx: unknown,
  ): _ctx is CwActivityEntryContext<T> {
    return true;
  }
  // #endregion
}
