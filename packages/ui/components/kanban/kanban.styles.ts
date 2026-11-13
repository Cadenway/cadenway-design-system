import type { CwKanbanDensity } from './kanban.types';

/* Literal class strings (Kanban sheet and preview of the Design System artifact), so Tailwind finds
   them in the compiled package. Shared by the board and its cells; internal to the entry point. */

/** The frame of every card; the card template draws the fields inside it. */
export const CARD_BASE =
  'relative flex min-w-0 cursor-default border text-card-foreground outline-hidden select-none ' +
  'transition-[color,background-color,border-color,rotate] duration-150 ease-snap motion-reduce:transition-none ' +
  'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ' +
  'animate-item-in motion-reduce:animate-none';

/** Detailed cards stack their fields; compact cards are one 34 px line. */
export const CARD_DENSITIES: Record<CwKanbanDensity, string> = {
  detailed: 'flex-col gap-2 rounded-xl p-3',
  compact: 'h-[34px] flex-row items-center gap-2 rounded-lg px-2.5',
};

/** The tone of a card: at rest, selected (veil and stronger border), dimmed (settled, see-through). */
export type CardTone = 'rest' | 'selected' | 'dimmed' | 'grabbed';

/** The classes of each tone. */
export const CARD_TONES: Record<CardTone, string> = {
  rest: 'bg-card hover:bg-linear-to-b hover:from-hover hover:to-hover',
  selected: 'bg-card bg-linear-to-b from-selected to-selected border-foreground/40',
  // Dimmed without opacity: the column shows through, the template mutes the name (sheet, "États").
  dimmed: 'bg-transparent hover:bg-linear-to-b hover:from-hover hover:to-hover',
  // A card grabbed with Space looks lifted, as the pointer preview.
  grabbed: 'bg-card dark:bg-popover border-input rotate-1 shadow-lg motion-reduce:rotate-0',
};

/** The pointer preview: the lifted card following the pointer. */
export const PREVIEW =
  'flex min-w-0 border border-input bg-card text-card-foreground rotate-1 shadow-lg cursor-grabbing dark:bg-popover motion-reduce:rotate-0';

/** The drop indicators: a full-ink line between two cards, or a dashed ghost of a card's height. */
export const INDICATORS = {
  line: 'mx-1 h-0.5 shrink-0 rounded-full bg-foreground',
  ghostDetailed: 'h-24 shrink-0 rounded-xl border-2 border-dashed border-line-control',
  ghostCompact: 'h-[34px] shrink-0 rounded-lg border-2 border-dashed border-line-control',
} as const;

/** The counter beside a column or lane name: muted, grenat when over the limit. */
export const COUNTER = 'text-xs font-medium whitespace-nowrap tabular-nums text-muted-foreground';
/** The counter of a column over its limit. */
export const COUNTER_OVER = 'text-xs font-medium whitespace-nowrap tabular-nums text-grenat-text';

/** The `ghost` `icon-xs` buttons of a column header, on `canvas`. */
export const HEADER_BUTTON =
  'relative isolate inline-flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground outline-hidden ' +
  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas [&_ng-icon]:[--ng-icon__size:0.875rem]';
