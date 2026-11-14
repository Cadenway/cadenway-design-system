/* Literal class strings shared by the parts of `cw-autocomplete` (Autocomplete sheet and preview of
   the Design System artifact), so Tailwind finds them in the compiled package. */

/**
 * Constant OPTION
 *
 * @description
 * Classes for a suggestion row.
 *
 * @type {string}
 */
export const OPTION: string =
  'relative flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-hidden select-none transition-colors hover:bg-accent data-highlighted:bg-selected aria-disabled:pointer-events-none aria-disabled:opacity-50 motion-reduce:transition-none [&_ng-icon]:shrink-0 [&_ng-icon]:[--ng-icon__size:1rem]';

/**
 * Constant OPTION_ENTER
 *
 * @description
 * Entrance animation classes for a suggestion.
 *
 * @type {string}
 */
export const OPTION_ENTER: string = 'animate-item-in motion-reduce:animate-none';

/**
 * Constant MARK
 *
 * @description
 * Classes for highlighted query text.
 *
 * @type {string}
 */
export const MARK: string = 'font-semibold text-foreground';

/**
 * Constant GROUP_TITLE
 *
 * @description
 * Classes for a suggestion group title.
 *
 * @type {string}
 */
export const GROUP_TITLE: string = 'block px-2 py-1.5 text-xs font-medium text-muted-foreground';

/**
 * Constant EMPTY
 *
 * @description
 * Classes for an empty suggestions message.
 *
 * @type {string}
 */
export const EMPTY: string = 'block px-2 py-3 text-center text-sm text-muted-foreground';
