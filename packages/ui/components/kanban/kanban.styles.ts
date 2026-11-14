import type { CwKanbanDensity } from './kanban.types';

/* Literal class strings (Kanban sheet and preview of the Design System artifact), so Tailwind finds
   them in the compiled package. Shared by the board and its cells; internal to the entry point. */

/**
 * Constant CARD_BASE
 *
 * @description
 * The frame of every card; the card template draws the fields inside it.
 *
 * @type {string}
 */
export const CARD_BASE: string =
  'relative flex min-w-0 cursor-default border text-card-foreground outline-hidden select-none ' +
  'transition-[color,background-color,border-color,rotate] duration-150 ease-snap motion-reduce:transition-none ' +
  'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ' +
  'animate-item-in motion-reduce:animate-none';

/**
 * Constant CARD_DENSITIES
 *
 * @description
 * Detailed cards stack their fields; compact cards are one 34 px line.
 *
 * @type {Record<CwKanbanDensity, string>}
 */
export const CARD_DENSITIES: Record<CwKanbanDensity, string> = {
  detailed: 'flex-col gap-2 rounded-xl p-3',
  compact: 'h-[34px] flex-row items-center gap-2 rounded-lg px-2.5',
};

/**
 * Type CardTone
 *
 * @description
 * The tone of a card: at rest, selected (veil and stronger border), dimmed (settled, see-through).
 *
 * @type {'rest' | 'selected' | 'dimmed' | 'grabbed'}
 */
export type CardTone = 'rest' | 'selected' | 'dimmed' | 'grabbed';

/**
 * Constant CARD_TONES
 *
 * @description
 * The classes of each tone.
 *
 * @type {Record<CardTone, string>}
 */
export const CARD_TONES: Record<CardTone, string> = {
  rest: 'bg-card hover:bg-linear-to-b hover:from-hover hover:to-hover',
  selected: 'bg-card bg-linear-to-b from-selected to-selected border-foreground/40',
  // Dimmed without opacity: the column shows through, the template mutes the name (sheet, "États").
  dimmed: 'bg-transparent hover:bg-linear-to-b hover:from-hover hover:to-hover',
  // A card grabbed with Space looks lifted, as the pointer preview.
  grabbed: 'bg-card dark:bg-popover border-input rotate-1 shadow-lg motion-reduce:rotate-0',
};

/**
 * Constant PREVIEW
 *
 * @description
 * The pointer preview: the lifted card following the pointer.
 *
 * @type {string}
 */
export const PREVIEW: string =
  'flex min-w-0 border border-input bg-card text-card-foreground rotate-1 shadow-lg cursor-grabbing dark:bg-popover motion-reduce:rotate-0';

/**
 * Constant INDICATORS
 *
 * @description
 * The drop indicators: a full-ink line between two cards, or a dashed ghost of a card's height.
 *
 * @type {{ readonly line: "mx-1 h-0.5 shrink-0 rounded-full bg-foreground"; readonly ghostDetailed: "h-24 shrink-0 rounded-xl border-2 border-dashed border-line-control"; readonly ghostCompact: "h-[34px] shrink-0 rounded-lg border-2 border-dashed border-line-control"; }}
 */
export const INDICATORS: {
  readonly line: 'mx-1 h-0.5 shrink-0 rounded-full bg-foreground';
  readonly ghostDetailed: 'h-24 shrink-0 rounded-xl border-2 border-dashed border-line-control';
  readonly ghostCompact: 'h-[34px] shrink-0 rounded-lg border-2 border-dashed border-line-control';
} = {
  line: 'mx-1 h-0.5 shrink-0 rounded-full bg-foreground',
  ghostDetailed: 'h-24 shrink-0 rounded-xl border-2 border-dashed border-line-control',
  ghostCompact: 'h-[34px] shrink-0 rounded-lg border-2 border-dashed border-line-control',
} as const;

/**
 * Constant COUNTER
 *
 * @description
 * The counter beside a column or lane name: muted, grenat when over the limit.
 *
 * @type {string}
 */
export const COUNTER: string =
  'text-xs font-medium whitespace-nowrap tabular-nums text-muted-foreground';
/**
 * Constant COUNTER_OVER
 *
 * @description
 * The counter of a column over its limit.
 *
 * @type {string}
 */
export const COUNTER_OVER: string =
  'text-xs font-medium whitespace-nowrap tabular-nums text-grenat-text';

/**
 * Constant HEADER_BUTTON
 *
 * @description
 * The `ghost` `icon-xs` buttons of a column header, on `canvas`.
 *
 * @type {string}
 */
export const HEADER_BUTTON: string =
  'relative isolate inline-flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground outline-hidden ' +
  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas [&_ng-icon]:[--ng-icon__size:0.875rem]';
