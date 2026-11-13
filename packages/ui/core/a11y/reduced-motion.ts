/**
 * Whether the user asked the system to reduce motion. False where media queries do not exist
 * (server rendering, test DOMs), where nothing animates anyway.
 *
 * Shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 */
export function ɵprefersReducedMotion(document: Document): boolean {
  const view = document.defaultView;
  if (typeof view?.matchMedia !== 'function') return false;
  return view.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
