/**
 * Function ɵprefersReducedMotion
 *
 * @description
 * Whether the user asked the system to reduce motion. False where media queries do not exist
 * (server rendering, test DOMs), where nothing animates anyway.
 *
 * Shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 *
 * @param {Document} document - Document whose window supplies the media query.
 *
 * @returns {boolean} Whether the reduced-motion media query matches.
 */
export function ɵprefersReducedMotion(document: Document): boolean {
  const view: Window | null = document.defaultView;
  if (typeof view?.matchMedia !== 'function') return false;
  return view.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
