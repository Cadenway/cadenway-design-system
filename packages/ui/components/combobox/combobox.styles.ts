/* Literal class strings shared by the parts of `cw-combobox` (Combobox sheet and preview of the
   Design System artifact), so Tailwind finds them in the compiled package. */

/**
 * Constant OPTION
 *
 * @description
 * Classes for a selectable option row.
 *
 * @type {string}
 */
export const OPTION: string =
  'relative flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-hidden select-none transition-colors hover:bg-accent data-highlighted:bg-selected aria-disabled:pointer-events-none aria-disabled:opacity-50 motion-reduce:transition-none [&_ng-icon]:shrink-0 [&_ng-icon]:[--ng-icon__size:1rem]';

/**
 * Constant OPTION_ENTER
 *
 * @description
 * Entrance animation classes for an option.
 *
 * @type {string}
 */
export const OPTION_ENTER: string = 'animate-item-in motion-reduce:animate-none';

/**
 * Constant GROUP_TITLE
 *
 * @description
 * Classes for an option group title.
 *
 * @type {string}
 */
export const GROUP_TITLE: string = 'block px-2 py-1.5 text-xs font-medium text-muted-foreground';

/**
 * Constant EMPTY
 *
 * @description
 * Classes for an empty search message.
 *
 * @type {string}
 */
export const EMPTY: string = 'block px-2 py-5 text-center text-sm text-muted-foreground';
