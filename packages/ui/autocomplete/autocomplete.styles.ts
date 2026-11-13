/* Literal class strings shared by the parts of `cw-autocomplete` (Autocomplete sheet and preview of
   the Design System artifact), so Tailwind finds them in the compiled package. */

/** A suggestion: hover veil, `bg-selected` when highlighted, 50 % when disabled. */
export const OPTION =
  'relative flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-hidden select-none transition-colors hover:bg-accent data-highlighted:bg-selected aria-disabled:pointer-events-none aria-disabled:opacity-50 motion-reduce:transition-none [&_ng-icon]:shrink-0 [&_ng-icon]:[--ng-icon__size:1rem]';

/** The entrance of a suggestion when the panel opens; its delay is set per row (60 ms then +30 ms). */
export const OPTION_ENTER = 'animate-item-in motion-reduce:animate-none';

/** The typed part of a suggestion's label (`highlight`). */
export const MARK = 'font-semibold text-foreground';

/** The title of a group of suggestions. */
export const GROUP_TITLE = 'block px-2 py-1.5 text-xs font-medium text-muted-foreground';

/** The message of a search without suggestion. */
export const EMPTY = 'block px-2 py-3 text-center text-sm text-muted-foreground';

/** The entrance delay of the row at `index`: 60 ms, then 30 ms more per row, twelve rows at most. */
export function enterDelay(index: number): number {
  return 60 + 30 * Math.min(Math.max(index, 0), 11);
}

/** A text without accents nor case, to find the typed part in a label. */
export function fold(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}
