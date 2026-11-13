/**
 * The `animation-delay`, in ms, of the row at `index` of an opening list (`animate-item-in`): 60 ms,
 * then 30 ms more per row, the twelfth row and those after it at 390 ms (cw-motion-tokens, the
 * menu previews). For rows whose position is only known at run time; static panels use the
 * `[&>*:nth-child(n)]:[animation-delay:…]` classes instead.
 *
 * Shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 */
export function ɵenterDelay(index: number): number {
  return 60 + 30 * Math.min(Math.max(index, 0), 11);
}
