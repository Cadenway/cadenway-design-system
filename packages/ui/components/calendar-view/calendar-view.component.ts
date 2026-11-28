import { LiveAnnouncer, _IdGenerator } from '@angular/cdk/a11y';
import {
  CdkDrag,
  CdkDragPlaceholder,
  CdkDragPreview,
  CdkDropList,
  CdkDropListGroup,
  type CdkDragDrop,
  type CdkDragEnter,
} from '@angular/cdk/drag-drop';
import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  linkedSignal,
  model,
  numberAttribute,
  output,
  signal,
  type TemplateRef,
  type InputSignalWithTransform,
  type InputSignal,
  type ModelSignal,
  type OutputEmitterRef,
  type WritableSignal,
  type Signal,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorCalendarBlankBold,
  phosphorCaretLeftBold,
  phosphorCaretRightBold,
} from '@ng-icons/phosphor-icons/bold';

import { CwButton } from '@cadenway/ui/components/button';
import type { CwMenu } from '@cadenway/ui/components/menu';
import { CwSkeleton } from '@cadenway/ui/components/skeleton';
import {
  ɵContextMenuGesture,
  type ɵContextMenuRequest,
  ɵFOCUS_INSET,
  ɵLOCALE,
  ɵaddMonths,
  ɵdayKey,
  ɵdaysBetween,
  ɵsameDay,
  ɵsameMonth,
  ɵstartOfDay,
  ɵstartOfMonth,
  ɵstartOfWeek,
} from '@cadenway/ui/core';
import {
  CwToggleGroup,
  CwToggleGroupItem,
  type CwToggleGroupValue,
} from '@cadenway/ui/components/toggle-group';

import type { CwCalendarViewProvidedLabels } from './calendar-view.types';
import { getProvidedLabels } from './calendar-view.constants';
import { CalendarDayPart } from './calendar-day/calendar-day.component';
import { CwCalendarItemDef } from './calendar-item-def/calendar-item-def.directive';
import {
  CALENDAR_VIEW,
  type BarView,
  type BlockView,
  type CalendarViewHost,
  type Cursor,
  type DayView,
  type DropData,
  type ItemView,
} from './calendar-view.token';
import { CALENDAR_VIEW_LABELS } from './calendar-view-labels.token';
import { addDays, atMinutes, formatTime, minutesOf } from './calendar-view.dates';
import type {
  CwCalendarCreate,
  CwCalendarDayMenuData,
  CwCalendarItemContext,
  CwCalendarItemMove,
  CwCalendarItemPlace,
  CwCalendarItemSchedule,
  CwCalendarKeyFn,
  CwCalendarSlotMinutes,
  CwCalendarSpan,
  CwCalendarSpanFn,
  CwCalendarViewLabels,
  CwCalendarViewMode,
  CwCalendarViewToolbar,
  CwCalendarViewVariant,
  CwCalendarWeekStart,
} from './calendar-view.types';

/* Literal class strings (Calendar View sheet and preview of the Design System artifact), so
   Tailwind finds them in the compiled package. */
/**
 * Constant CELL
 *
 * @description
 * Classes for a month day cell. Its 76 px fit two lines; a week whose fullest day uses more
 * takes its height from `defaultHeight`.
 *
 * @type {string}
 */
const CELL: string =
  'group/day flex h-[76px] min-w-0 flex-col gap-0.5 overflow-hidden p-1 transition-colors motion-reduce:transition-none ' +
  ɵFOCUS_INSET;

/**
 * Constant OUTLINED_CELL
 *
 * @description
 * Classes for a month day of the `outlined` variant (mockup App.dc.html: `min-h-24 gap-1 p-1.5`).
 * Its height is set per week from the lines its fullest day uses (`outlinedHeight`), at least
 * these 96 px, so every line fits and the bars across days keep their fixed line positions.
 *
 * @type {string}
 */
const OUTLINED_CELL: string =
  'group/day flex h-24 min-w-0 flex-col gap-1 overflow-hidden p-1.5 transition-colors motion-reduce:transition-none ' +
  ɵFOCUS_INSET;

/**
 * Constant OUTLINED_OUTSIDE
 *
 * @description
 * Surface of a day of another month in the `outlined` variant (mockup App.dc.html).
 *
 * @type {string}
 */
const OUTLINED_OUTSIDE: string = 'bg-muted text-muted-foreground';

/**
 * Constant OUTLINED_NUMBERS
 *
 * @description
 * Day number classes of the `outlined` variant: a 24 px circle, filled in ink for today.
 *
 * @type {Record<'today' | 'outside' | 'plain', string>}
 */
const OUTLINED_NUMBERS: Record<'today' | 'outside' | 'plain', string> = {
  today:
    'inline-flex size-6 items-center justify-center rounded-full bg-foreground text-xs font-medium tabular-nums text-background',
  outside:
    'inline-flex size-6 items-center justify-center rounded-full text-xs font-medium tabular-nums text-muted-foreground',
  plain:
    'inline-flex size-6 items-center justify-center rounded-full text-xs font-medium tabular-nums text-foreground',
};

/**
 * Constant HEADS
 *
 * @description
 * Classes for the row of the day number and « + », by variant.
 *
 * @type {Record<CwCalendarViewVariant, string>}
 */
const HEADS: Record<CwCalendarViewVariant, string> = {
  default: 'flex h-5 shrink-0 items-center justify-between pl-1',
  outlined: 'flex h-6 shrink-0 items-center justify-between',
};

/**
 * Constant SPACERS
 *
 * @description
 * Classes for a line kept for a bar, as tall as an item of the variant.
 *
 * @type {Record<CwCalendarViewVariant, string>}
 */
const SPACERS: Record<CwCalendarViewVariant, string> = {
  default: 'h-5 shrink-0',
  outlined: 'h-[26px] shrink-0',
};

/**
 * Constant ALL_DAY_CELL
 *
 * @description
 * Classes for an all-day week cell.
 *
 * @type {string}
 */
const ALL_DAY_CELL: string =
  'group/day flex h-11 min-w-0 flex-col gap-0.5 overflow-hidden p-0.5 transition-colors motion-reduce:transition-none ' +
  ɵFOCUS_INSET;

/**
 * Constant CELL_TONES
 *
 * @description
 * Cell classes for rest and drop target states.
 *
 * @type {{ readonly rest: "hover:bg-accent"; readonly target: "bg-selected"; }}
 */
const CELL_TONES: { readonly rest: 'hover:bg-accent'; readonly target: 'bg-selected' } = {
  rest: 'hover:bg-accent',
  target: 'bg-selected',
} as const;

/**
 * Type Edges
 *
 * @description
 * Border edges drawn for a calendar cell.
 *
 * @type {'both' | 'right' | 'bottom' | 'left' | 'none'}
 */
type Edges = 'both' | 'right' | 'bottom' | 'left' | 'none';
/**
 * Constant CELL_EDGES
 *
 * @description
 * Border classes by cell edge.
 *
 * @type {Record<Edges, string>}
 */
const CELL_EDGES: Record<Edges, string> = {
  both: 'border-r border-b',
  right: 'border-r',
  bottom: 'border-b',
  left: 'border-l',
  none: '',
};

/**
 * Constant NUMBERS
 *
 * @description
 * Day number classes by state.
 *
 * @type {{ readonly today: "text-xs font-semibold tabular-nums text-primary"; readonly outside: "text-xs tabular-nums text-muted-foreground"; readonly plain: "text-xs font-medium tabular-nums"; }}
 */
const NUMBERS: {
  readonly today: 'text-xs font-semibold tabular-nums text-primary';
  readonly outside: 'text-xs tabular-nums text-muted-foreground';
  readonly plain: 'text-xs font-medium tabular-nums';
} = {
  today: 'text-xs font-semibold tabular-nums text-primary',
  outside: 'text-xs tabular-nums text-muted-foreground',
  plain: 'text-xs font-medium tabular-nums',
} as const;

/**
 * Constant COLUMNS
 *
 * @description
 * Grid classes for five or seven visible days.
 *
 * @type {{ readonly 5: "grid grid-cols-5"; readonly 7: "grid grid-cols-7"; }}
 */
const COLUMNS: { readonly 5: 'grid grid-cols-5'; readonly 7: 'grid grid-cols-7' } = {
  5: 'grid grid-cols-5',
  7: 'grid grid-cols-7',
} as const;

/**
 * Constant PILL
 *
 * @description
 * Classes for an item pill, without its position: `itemView` adds `relative`, or `BAR_POSITION`
 * for a bar across days (both set `position`, and the later `relative` would win in the
 * stylesheet).
 *
 * @type {string}
 */
const PILL: string =
  'isolate flex h-5 min-w-0 shrink-0 items-center gap-1 overflow-hidden rounded-sm px-1 text-left text-xs transition-colors ' +
  'hover:bg-linear-to-b hover:from-hover hover:to-hover animate-item-in motion-reduce:animate-none [&_ng-icon]:[--ng-icon__size:0.75rem] ' +
  ɵFOCUS_INSET;

/**
 * Constant OUTLINED_PILL
 *
 * @description
 * Item chip classes of the `outlined` month (mockup App.dc.html: `rounded-md border bg-card px-1.5
 * py-1 text-xs`, 26 px), without its position, which `itemView` adds as for `PILL`.
 *
 * @type {string}
 */
const OUTLINED_PILL: string =
  'isolate flex h-[26px] min-w-0 shrink-0 items-center gap-1.5 overflow-hidden rounded-md border px-1.5 text-left text-xs transition-colors ' +
  'hover:bg-linear-to-b hover:from-hover hover:to-hover animate-item-in motion-reduce:animate-none [&_ng-icon]:[--ng-icon__size:0.75rem] ' +
  ɵFOCUS_INSET;

/**
 * Constant BAR_POSITION
 *
 * @description
 * Position of a bar across days: on its line from the row, out of the flow of its first day. A
 * bar is in the DOM of its first day's drop list but covers the next days, and the CDK checks the
 * element under the pointer (`elementFromPoint`) to find the list a drag is over; during a drag,
 * while the CDK marks its day as dragging or receiving (own items and outside items alike), the
 * bar lets the pointer through to the day beneath. It stays clickable otherwise.
 *
 * @type {string}
 */
const BAR_POSITION: string =
  'absolute in-[.cdk-drop-list-dragging]:pointer-events-none in-[.cdk-drop-list-receiving]:pointer-events-none';

/**
 * Constant OUTLINED_PILL_TONES
 *
 * @description
 * Surface of an `outlined` chip at rest and while held.
 *
 * @type {Record<'rest' | 'grabbed', string>}
 */
const OUTLINED_PILL_TONES: Record<'rest' | 'grabbed', string> = {
  rest: 'bg-card',
  grabbed: 'cursor-grabbing bg-popover shadow-lg rotate-1 motion-reduce:rotate-0',
};

/**
 * Constant PILL_TONES
 *
 * @description
 * Item pill classes by drag state.
 *
 * @type {{ readonly rest: "bg-muted dark:bg-secondary"; readonly grabbed: "cursor-grabbing bg-popover shadow-lg rotate-1 motion-reduce:rotate-0"; }}
 */
const PILL_TONES: {
  readonly rest: 'bg-muted dark:bg-secondary';
  readonly grabbed: 'cursor-grabbing bg-popover shadow-lg rotate-1 motion-reduce:rotate-0';
} = {
  rest: 'bg-muted dark:bg-secondary',
  grabbed: 'cursor-grabbing bg-popover shadow-lg rotate-1 motion-reduce:rotate-0',
} as const;

/**
 * Constant PREVIEW
 *
 * @description
 * Classes for a drag preview.
 *
 * @type {string}
 */
const PREVIEW: string =
  'flex h-5 min-w-0 items-center gap-1 overflow-hidden rounded-sm bg-popover px-1 text-xs shadow-lg rotate-1 cursor-grabbing motion-reduce:rotate-0 [&_ng-icon]:[--ng-icon__size:0.75rem]';

/**
 * Constant GHOST
 *
 * @description
 * Classes for a drag placeholder.
 *
 * @type {string}
 */
const GHOST: string = 'h-5 shrink-0 rounded-sm border-2 border-dashed border-line-control';

/**
 * Constant MORE
 *
 * @description
 * Classes for the hidden-items control.
 *
 * @type {string}
 */
const MORE: string =
  'relative isolate flex h-5 w-fit shrink-0 items-center overflow-hidden rounded-sm px-1 text-xs font-medium tabular-nums text-muted-foreground transition-colors hover:bg-accent hover:text-foreground ' +
  'outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

/**
 * Constant OUTLINED_ADD
 *
 * @description
 * The 24 px « + » of an `outlined` day (mockup App.dc.html: `size-6 rounded-md`).
 *
 * @type {string}
 */
const OUTLINED_ADD: string =
  'relative isolate flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-md text-muted-foreground opacity-0 transition-colors hover:bg-accent hover:text-foreground ' +
  'group-hover/day:opacity-100 group-focus-within/day:opacity-100 focus-visible:opacity-100 [&_ng-icon]:[--ng-icon__size:0.875rem] ' +
  'outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

/**
 * Constant ADD
 *
 * @description
 * Classes for a day create control.
 *
 * @type {string}
 */
const ADD: string =
  'relative isolate flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-sm text-muted-foreground opacity-0 transition-colors hover:bg-accent hover:text-foreground ' +
  'group-hover/day:opacity-100 group-focus-within/day:opacity-100 focus-visible:opacity-100 [&_ng-icon]:[--ng-icon__size:0.875rem] ' +
  'outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

/**
 * Constant ROW
 *
 * @description
 * Classes for an item row.
 *
 * @type {string}
 */
const ROW: string =
  'relative isolate flex w-full min-w-0 items-center gap-2 overflow-hidden rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent [&_ng-icon]:[--ng-icon__size:1rem] ' +
  ɵFOCUS_INSET;

/**
 * Constant BLOCK
 *
 * @description
 * Classes for a timed item block.
 *
 * @type {string}
 */
const BLOCK: string =
  'absolute inset-x-[3px] z-10 isolate flex flex-col items-start overflow-hidden rounded-md px-1.5 py-1 text-left text-xs leading-4 transition-colors ' +
  'hover:bg-linear-to-b hover:from-hover hover:to-hover animate-item-in motion-reduce:animate-none [&_ng-icon]:[--ng-icon__size:0.75rem] ' +
  ɵFOCUS_INSET;

/**
 * Constant SLOT
 *
 * @description
 * Classes for a week time slot.
 *
 * @type {string}
 */
const SLOT: string =
  'relative min-w-0 transition-colors motion-reduce:transition-none ' + ɵFOCUS_INSET;

/**
 * Constant HOUR
 *
 * @description
 * Classes for the hour gutter.
 *
 * @type {string}
 */
const HOUR: string =
  'absolute top-0.5 right-2 text-[11px] leading-none whitespace-nowrap text-muted-foreground tabular-nums';

/**
 * Constant ADD_ROW
 *
 * @description
 * Classes for the day popover add row.
 *
 * @type {string}
 */
const ADD_ROW: string = `${ROW} text-muted-foreground hover:text-foreground`;

/**
 * Constant SLOT_HEIGHTS
 *
 * @description
 * Slot height classes by duration.
 *
 * @type {Record<CwCalendarSlotMinutes, string>}
 */
const SLOT_HEIGHTS: Record<CwCalendarSlotMinutes, string> = {
  15: 'h-2.5',
  30: 'h-5',
  60: 'h-10',
};

/**
 * Constant HOUR_HEIGHT
 *
 * @description
 * One hour is 40 px in the week view (sheet, "Tailles").
 *
 * @type {40}
 */
const HOUR_HEIGHT: 40 = 40;
/**
 * Constant WEEKS_SHOWN
 *
 * @description
 * Number of weeks shown in the month grid.
 *
 * @type {6}
 */
const WEEKS_SHOWN: 6 = 6;
/**
 * Constant MONTH_TOP
 *
 * @description
 * First line of a month cell under its number (`p-1` + `h-5` + `gap-0.5`), then 22 px a line.
 *
 * @type {26}
 */
const MONTH_TOP: 26 = 26;
/**
 * Constant WEEK_TOP
 *
 * @description
 * Top offset for all-day bars in week cells.
 *
 * @type {2}
 */
const WEEK_TOP: 2 = 2;
/**
 * Constant LINE
 *
 * @description
 * Height of one item line.
 *
 * @type {22}
 */
const LINE: 22 = 22;

/**
 * Constant OUTLINED_TOP
 *
 * @description
 * Top of the first bar line in an `outlined` month day: 6 px of padding, the 24 px number row and
 * the 4 px gap.
 *
 * @type {34}
 */
const OUTLINED_TOP: 34 = 34;

/**
 * Constant OUTLINED_LINE
 *
 * @description
 * Distance between two bar lines of an `outlined` month: a 26 px chip and the 4 px gap.
 *
 * @type {30}
 */
const OUTLINED_LINE: 30 = 30;

/**
 * Function outlinedHeight
 *
 * @description
 * Height of an `outlined` month day holding `lines` item lines: the first line's top (6 px of
 * padding, the 24 px number row, the 4 px gap), the lines and their gaps, the 6 px bottom
 * padding; 96 px for two lines, the mockup's `min-h-24`.
 *
 * @param {number} lines - Item lines used by the fullest day of the week, at most `maxPerDay`.
 * @returns {number} Height in pixels.
 */
function outlinedHeight(lines: number): number {
  return Math.max(96, OUTLINED_TOP + lines * OUTLINED_LINE - 4 + 6);
}

/**
 * Function defaultHeight
 *
 * @description
 * Height of a month day of the `default` variant holding `lines` item lines: the first line's
 * top (26 px), the 20 px lines 22 px apart, the 4 px bottom padding; at least the sheet's 76 px,
 * which two lines fit.
 *
 * @param {number} lines - Item lines used by the fullest day of the week, at most `maxPerDay`.
 * @returns {number} Height in pixels.
 */
function defaultHeight(lines: number): number {
  return Math.max(76, MONTH_TOP + lines * LINE - 2 + 4);
}

/**
 * Interface Entry
 *
 * @description
 * An item with its resolved span.
 */
interface Entry<T> {
  // #region Properties
  /**
   * Property id
   *
   * @description
   * Stable item identifier.
   *
   * @type {string}
   * @readonly
   */
  readonly id: string;

  /**
   * Property item
   *
   * @description
   * Source item.
   *
   * @type {T}
   * @readonly
   */
  readonly item: T;

  /**
   * Property label
   *
   * @description
   * Displayed or accessible label.
   *
   * @type {string}
   * @readonly
   */
  readonly label: string;

  /**
   * Property span
   *
   * @description
   * Dates and all-day state of the item.
   *
   * @type {CwCalendarSpan}
   * @readonly
   */
  readonly span: CwCalendarSpan;
  // #endregion
}

/**
 * Interface SlotCell
 *
 * @description
 * One time slot of a week day.
 */
interface SlotCell {
  // #region Properties
  /**
   * Property key
   *
   * @description
   * Stable key of the day or slot.
   *
   * @type {string}
   * @readonly
   */
  readonly key: string;

  /**
   * Property date
   *
   * @description
   * Date of the cell.
   *
   * @type {Date}
   * @readonly
   */
  readonly date: Date;

  /**
   * Property label
   *
   * @description
   * Displayed or accessible label.
   *
   * @type {string}
   * @readonly
   */
  readonly label: string;

  /**
   * Property tabStop
   *
   * @description
   * Whether the cell is the keyboard tab stop.
   *
   * @type {boolean}
   * @readonly
   */
  readonly tabStop: boolean;

  /**
   * Property target
   *
   * @description
   * Whether the cell is the active drop target.
   *
   * @type {boolean}
   * @readonly
   */
  readonly target: boolean;

  /**
   * Property cellClass
   *
   * @description
   * Classes applied to the cell.
   *
   * @type {string}
   * @readonly
   */
  readonly cellClass: string;

  /**
   * Property drop
   *
   * @description
   * Drop target data for the cell.
   *
   * @type {DropData}
   * @readonly
   */
  readonly drop: DropData;

  /**
   * Property blocks
   *
   * @description
   * Timed item blocks in the slot.
   *
   * @type {readonly BlockView[]}
   * @readonly
   */
  readonly blocks: readonly BlockView[];

  /**
   * Property now
   *
   * @description
   * Position of the current time marker.
   *
   * @type {number | null}
   * @readonly
   */
  readonly now: number | null;
  // #endregion
}

/**
 * Interface SlotRow
 *
 * @description
 * One row of time slots in the week grid.
 */
interface SlotRow {
  // #region Properties
  /**
   * Property minutes
   *
   * @description
   * Minutes since midnight.
   *
   * @type {number}
   * @readonly
   */
  readonly minutes: number;

  /**
   * Property label
   *
   * @description
   * Shown on the hours only; every row still reads its time.
   *
   * @type {boolean}
   * @readonly
   */
  readonly label: boolean;

  /**
   * Property time
   *
   * @description
   * Formatted time of the slot.
   *
   * @type {string}
   * @readonly
   */
  readonly time: string;

  /**
   * Property cells
   *
   * @description
   * Day cells in the slot row.
   *
   * @type {readonly SlotCell[]}
   * @readonly
   */
  readonly cells: readonly SlotCell[];
  // #endregion
}

/**
 * Interface WeekHeader
 *
 * @description
 * Display data for a week day header.
 */
interface WeekHeader {
  // #region Properties
  /**
   * Property key
   *
   * @description
   * Stable key of the day or slot.
   *
   * @type {string}
   * @readonly
   */
  readonly key: string;

  /**
   * Property short
   *
   * @description
   * Short weekday label.
   *
   * @type {string}
   * @readonly
   */
  readonly short: string;

  /**
   * Property long
   *
   * @description
   * Accessible weekday label.
   *
   * @type {string}
   * @readonly
   */
  readonly long: string;

  /**
   * Property number
   *
   * @description
   * Displayed day number.
   *
   * @type {string}
   * @readonly
   */
  readonly number: string;

  /**
   * Property today
   *
   * @description
   * Whether the day is today.
   *
   * @type {boolean}
   * @readonly
   */
  readonly today: boolean;
  // #endregion
}

/**
 * Function cellKey
 *
 * @description
 * Builds a stable key for a day or time slot.
 *
 * @param {Date} date - Date used by the operation.
 * @param {number | null} slot - Time slot, or null for an all-day position.
 * @returns {string} Stable cell key.
 */
function cellKey(date: Date, slot: number | null): string {
  return `${String(ɵdayKey(date))}:${slot === null ? 'day' : String(slot)}`;
}

/**
 * Function parseCellKey
 *
 * @description
 * Reads the day and slot back from a cell key (`cellKey`).
 *
 * @param {string} key - Cell key, `20261118:day` or `20261118:540`.
 * @returns {{ date: Date; slot: number | null }} Day (at its start) and slot minutes, or null.
 */
function parseCellKey(key: string): { date: Date; slot: number | null } {
  const [day = '0', slot = 'day']: string[] = key.split(':');
  const value: number = Number(day);
  const date: Date = new Date(
    Math.floor(value / 10000),
    (Math.floor(value / 100) % 100) - 1,
    value % 100,
  );
  return { date, slot: slot === 'day' ? null : Number(slot) };
}

/**
 * Interface Grab
 *
 * @description
 * A keyboard move in progress: a calendar item, or an outside item placed through
 * `scheduleWithKeyboard`.
 */
interface Grab {
  // #region Properties
  /**
   * Property id
   *
   * @description
   * Identifier of the calendar item; empty for an outside item.
   *
   * @type {string}
   * @readonly
   */
  readonly id: string;

  /**
   * Property from
   *
   * @description
   * Cell the move started from.
   *
   * @type {Cursor}
   * @readonly
   */
  readonly from: Cursor;

  /**
   * Property external
   *
   * @description
   * The outside item, its name for announcements and the element to focus again on Escape.
   *
   * @type {{ readonly data: unknown; readonly label: string; readonly origin: HTMLElement | null } | undefined}
   * @readonly
   */
  readonly external?: {
    readonly data: unknown;
    readonly label: string;
    readonly origin: HTMLElement | null;
  };
  // #endregion
}

/**
 * Constant SKELETON_WEEKS
 *
 * @description
 * Rows of the loading skeleton: five weeks, as the mockup's « Chargement du calendrier ».
 *
 * @type {number}
 */
const SKELETON_WEEKS: number = 5;

/**
 * Function capitalize
 *
 * @description
 * Capitalizes the first character of a label.
 *
 * @param {string} text - Text to capitalize.
 * @returns {string} Text with its first character capitalized.
 */
function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Function toSlot
 *
 * @description
 * Normalizes a slot duration to an allowed value.
 *
 * @param {unknown} value - Value to normalize or select.
 * @returns {CwCalendarSlotMinutes} Supported slot duration.
 */
function toSlot(value: unknown): CwCalendarSlotMinutes {
  const minutes: number = numberAttribute(value, 30);
  return minutes === 15 || minutes === 60 ? minutes : 30;
}

/**
 * Component CwCalendarView
 *
 * @description
 * The calendar of a list, a sprint or « Mes tâches »: each item on its day, in a month grid or a week of hourly slots, moved from day to day or slot to slot (Calendar View sheet of the Design System artifact). Generic: `items` are any `T`; `trackBy` gives an item's id, `itemLabel` its name, `itemSpan` when it happens (`null`: not drawn, count it in `unscheduledCount`). The calendar draws the frames (pill, bar across days, hourly block, popover row) and their states; the content comes from `ng-template[cwCalendarItem]` (`CwCalendarItemDef`). A `[cwCalendarActions]` element is projected at the end of the header (« Créer une tâche »). Month view: six weeks from `weekStartsOn` (Monday), `maxPerDay` lines a day then « +n autres », which opens the day in a popover; items over several days are one bar across the week, reserving the first line of the days they cover. Week view: an all-day row, then the `hours` range in slots of `slotMinutes`, blocks as tall as their duration, and the current time on today's column. `showWeekends=false` drops Saturday and Sunday. `view` and `date` (the day shown) are models; `today` marks the current day (`aria-current="date"`). A drop (CDK drag-drop, or Space, arrows and Space) moves the item at once and emits `itemMove` with its new span, duration kept; any new `items` resets the calendar. « + » on a day, a double click on a slot, N and « Ajouter une tâche » of the popover emit `create`; a click or Enter on an item emits `open`; « Sans date » emits `unscheduledOpen`. Outside items (undated tasks of a side panel) are scheduled by dropping them on a day: give their `cdkDropList` `[cdkDropListConnectedTo]="calendar.dropListIds()"`, or call `scheduleWithKeyboard(data, label)` from them (the arrows choose the day, Space or Enter drop, Escape cancels and focuses the item again); both emit `itemSchedule` with the data and the day. `dayMenu` takes a `cw-menu` opened by a right click on a day or slot, or Shift + F10 and the Menu key on a focused cell, with a `CwCalendarDayMenuData` as the menu's `data()`; every action of the menu must also exist in a visible control (WCAG 2.1.1). `loading` replaces the grid with a skeleton named by the `loading` text. `readonly` turns off dragging and creation. Keyboard (`role="grid"`, one focusable cell): arrows move by a day or a week (in the week view, up and down by a slot), Home and End go to the ends of the week, Page Up and Page Down change month (week), T comes back to today, M and S switch views, Enter on a day opens its popover, N creates. Moves are announced through the CDK `LiveAnnouncer`. Style hook: `data-view` on the host.
 */
@Component({
  selector: 'cw-calendar-view',
  imports: [
    CalendarDayPart,
    CdkDrag,
    CdkDragPlaceholder,
    CdkDragPreview,
    CdkDropList,
    CdkDropListGroup,
    CwButton,
    CwSkeleton,
    CwToggleGroup,
    CwToggleGroupItem,
    NgIcon,
    NgTemplateOutlet,
  ],
  providers: [
    { provide: CALENDAR_VIEW, useExisting: CwCalendarView },
    provideIcons({
      phosphorCalendarBlankBold,
      phosphorCaretLeftBold,
      phosphorCaretRightBold,
    }),
  ],
  host: {
    role: 'group',
    class: 'flex min-w-0 flex-col gap-2',
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.data-view]': 'view()',
  },
  templateUrl: './calendar-view.component.html',
})
export class CwCalendarView<T> implements CalendarViewHost {
  // #region Properties
  /**
   * Property providedLabels
   *
   * @description
   * Texts inherited from the nearest labels provider.
   *
   * @type {CwCalendarViewProvidedLabels}
   * @readonly
   */
  private readonly providedLabels: CwCalendarViewProvidedLabels = inject(CALENDAR_VIEW_LABELS);

  /**
   * Property items
   *
   * @description
   * The items; those whose `itemSpan` is `null` are left out.
   *
   * @type {InputSignal<readonly T[]>}
   * @readonly
   */
  public readonly items: InputSignal<readonly T[]> = input.required<readonly T[]>();

  /**
   * Property trackBy
   *
   * @description
   * The id of an item, unique in the calendar.
   *
   * @type {InputSignal<CwCalendarKeyFn<T>>}
   * @readonly
   */
  public readonly trackBy: InputSignal<CwCalendarKeyFn<T>> = input.required<CwCalendarKeyFn<T>>();

  /**
   * Property itemLabel
   *
   * @description
   * The name of an item: frame `title`, announcements.
   *
   * @type {InputSignal<CwCalendarKeyFn<T>>}
   * @readonly
   */
  public readonly itemLabel: InputSignal<CwCalendarKeyFn<T>> = input.required<CwCalendarKeyFn<T>>();

  /**
   * Property itemSpan
   *
   * @description
   * When an item happens.
   *
   * @type {InputSignal<CwCalendarSpanFn<T>>}
   * @readonly
   */
  public readonly itemSpan: InputSignal<CwCalendarSpanFn<T>> =
    input.required<CwCalendarSpanFn<T>>();

  /**
   * Property view
   *
   * @description
   * Month or week, `[(view)]`.
   *
   * @type {ModelSignal<CwCalendarViewMode>}
   * @readonly
   */
  public readonly view: ModelSignal<CwCalendarViewMode> = model<CwCalendarViewMode>('month');

  /**
   * Property date
   *
   * @description
   * The day shown (its month or its week), `[(date)]`; today by default.
   *
   * @type {ModelSignal<Date | null>}
   * @readonly
   */
  public readonly date: ModelSignal<Date | null> = model<Date | null>(null);

  /**
   * Property weekStartsOn
   *
   * @description
   * First day of the week: Monday (1) in French.
   *
   * @type {InputSignal<CwCalendarWeekStart>}
   * @readonly
   */
  public readonly weekStartsOn: InputSignal<CwCalendarWeekStart> = input<CwCalendarWeekStart>(1);

  /**
   * Property showWeekends
   *
   * @description
   * Shows Saturday and Sunday.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly showWeekends: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  /**
   * Property variant
   *
   * @description
   * Look of the month grid: `default`, or `outlined` (days of at least 96 px, each week as tall
   * as the lines its fullest day uses; other months on `bg-muted`, today in a filled circle,
   * bordered item chips).
   *
   * @type {InputSignal<CwCalendarViewVariant>}
   * @readonly
   */
  public readonly variant: InputSignal<CwCalendarViewVariant> =
    input<CwCalendarViewVariant>('default');

  /**
   * Property toolbar
   *
   * @description
   * Layout of the header: `default`, or `title` (the title first as an `h2`, « Aujourd'hui » and
   * the arrows grouped at the end).
   *
   * @type {InputSignal<CwCalendarViewToolbar>}
   * @readonly
   */
  public readonly toolbar: InputSignal<CwCalendarViewToolbar> =
    input<CwCalendarViewToolbar>('default');

  /**
   * Property viewToggle
   *
   * @description
   * Whether the header shows the « Mois » / « Semaine » toggle; `true` by default. M and S still
   * switch views from the keyboard.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly viewToggle: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  /**
   * Property titled
   *
   * @description
   * Whether the header uses the `title` layout.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly titled: Signal<boolean> = computed(() => this.toolbar() === 'title');

  /**
   * Property maxPerDay
   *
   * @description
   * Lines a day in the month view before « +n autres ». Each week grows to the lines its fullest
   * day uses, up to `maxPerDay`: in the `outlined` variant 96 px hold two, +30 px a line; in the
   * default variant 76 px hold two, +22 px a line. No item is clipped and the bars across days
   * keep their lines; a week using fewer lines keeps the variant's minimum.
   *
   * @type {InputSignalWithTransform<number, unknown>}
   * @readonly
   */
  public readonly maxPerDay: InputSignalWithTransform<number, unknown> = input(2, {
    transform: (value: unknown) => Math.max(1, numberAttribute(value, 2)),
  });

  /**
   * Property hours
   *
   * @description
   * First and last hour of the week view's slots.
   *
   * @type {InputSignal<readonly [number, number]>}
   * @readonly
   */
  public readonly hours: InputSignal<readonly [number, number]> = input<readonly [number, number]>([
    8, 20,
  ]);

  /**
   * Property slotMinutes
   *
   * @description
   * Step of the week view's slots, for dropping and creating.
   *
   * @type {InputSignalWithTransform<CwCalendarSlotMinutes, unknown>}
   * @readonly
   */
  public readonly slotMinutes: InputSignalWithTransform<CwCalendarSlotMinutes, unknown> = input<
    CwCalendarSlotMinutes,
    unknown
  >(30, { transform: toSlot });

  /**
   * Property today
   *
   * @description
   * The current day and time (today marker, current time line); the clock by default.
   *
   * @type {InputSignal<Date | null>}
   * @readonly
   */
  public readonly today: InputSignal<Date | null> = input<Date | null>(null);

  /**
   * Property unscheduledCount
   *
   * @description
   * Count shown by « Sans date »; `null` hides the button.
   *
   * @type {InputSignal<number | null>}
   * @readonly
   */
  public readonly unscheduledCount: InputSignal<number | null> = input<number | null>(null);

  /**
   * Property readonly
   *
   * @description
   * No dragging, no creation.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly readonly: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property ariaLabel
   *
   * @description
   * Name of the calendar group.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly ariaLabel: InputSignal<string> = input<string>(this.providedLabels.ariaLabel);

  /**
   * Property locale
   *
   * @description
   * Locale of the day and month names (`Intl.DateTimeFormat`); by default the locale given by
   * `provideCwLocale` (`fr-FR`).
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly locale: InputSignal<string> = input<string>(inject(ɵLOCALE));

  /**
   * Property labels
   *
   * @description
   * Overrides of the provided texts.
   *
   * @type {InputSignal<Partial<CwCalendarViewLabels>>}
   * @readonly
   */
  public readonly labels: InputSignal<Partial<CwCalendarViewLabels>> = input<
    Partial<CwCalendarViewLabels>
  >({});

  /**
   * Property dayMenu
   *
   * @description
   * Menu opened by a right click on a day or a slot, or Shift + F10 and the Menu key on a focused
   * cell, with a `CwCalendarDayMenuData` as the menu's `data()`; `null` (the default) keeps the
   * browser's menu.
   *
   * @type {InputSignal<CwMenu | null>}
   * @readonly
   */
  public readonly dayMenu: InputSignal<CwMenu | null> = input<CwMenu | null>(null);

  /**
   * Property loading
   *
   * @description
   * Draws a skeleton of the grid instead of the days while the first read runs; the header stays.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly loading: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property itemMove
   *
   * @description
   * An item dropped on another day or slot, with its new span. A bar across days dragged with the
   * pointer moves by the days between the day it was grabbed by and the drop day; a drop that
   * leaves the span unchanged emits nothing.
   *
   * @type {OutputEmitterRef<CwCalendarItemMove<T>>}
   * @readonly
   */
  public readonly itemMove: OutputEmitterRef<CwCalendarItemMove<T>> =
    output<CwCalendarItemMove<T>>();

  /**
   * Property create
   *
   * @description
   * A request to create an item on a day or at a slot.
   *
   * @type {OutputEmitterRef<CwCalendarCreate>}
   * @readonly
   */
  public readonly create: OutputEmitterRef<CwCalendarCreate> = output<CwCalendarCreate>();

  /**
   * Property itemSchedule
   *
   * @description
   * An outside item dropped on a day or slot, with the pointer or through `scheduleWithKeyboard`.
   *
   * @type {OutputEmitterRef<CwCalendarItemSchedule>}
   * @readonly
   */
  public readonly itemSchedule: OutputEmitterRef<CwCalendarItemSchedule> =
    output<CwCalendarItemSchedule>();

  /**
   * Property open
   *
   * @description
   * An item opened by a click or Enter.
   *
   * @type {OutputEmitterRef<T>}
   * @readonly
   */
  public readonly open: OutputEmitterRef<T> = output<T>();

  /**
   * Property unscheduledOpen
   *
   * @description
   * « Sans date » pressed: the panel of items to schedule.
   *
   * @type {OutputEmitterRef<void>}
   * @readonly
   */
  public readonly unscheduledOpen: OutputEmitterRef<void> = output();

  /**
   * Property element
   *
   * @description
   * Native calendar element used for focus.
   *
   * @type {HTMLElement}
   * @readonly
   */
  private readonly element: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /**
   * Property injector
   *
   * @description
   * Injector used for work scheduled after rendering.
   *
   * @type {Injector}
   * @readonly
   */
  private readonly injector: Injector = inject(Injector);

  /**
   * Property announcer
   *
   * @description
   * Announces item movements to assistive technology.
   *
   * @type {LiveAnnouncer}
   * @readonly
   */
  private readonly announcer: LiveAnnouncer = inject(LiveAnnouncer);

  /**
   * Property itemDef
   *
   * @description
   * Projected item template definition.
   *
   * @type {Signal<CwCalendarItemDef | undefined>}
   * @readonly
   */
  private readonly itemDef: Signal<CwCalendarItemDef | undefined> = contentChild(CwCalendarItemDef);

  /**
   * Property itemTemplate
   *
   * @description
   * The item content template (`CwCalendarItemDef`), for the day part.
   *
   * @type {Signal<TemplateRef<CwCalendarItemContext<unknown>> | undefined>}
   * @readonly
   */
  public readonly itemTemplate: Signal<TemplateRef<CwCalendarItemContext<unknown>> | undefined> =
    computed(() => this.itemDef()?.template);

  /**
   * Property texts
   *
   * @description
   * The provided texts with the `labels` overrides, over the defaults for the optional texts.
   *
   * @type {Signal<Required<CwCalendarViewProvidedLabels>>}
   * @readonly
   */
  public readonly texts: Signal<Required<CwCalendarViewProvidedLabels>> = computed<
    Required<CwCalendarViewProvidedLabels>
  >(() => ({
    ...getProvidedLabels(),
    ...this.providedLabels,
    ...this.labels(),
  }));

  /**
   * Property dropListPrefix
   *
   * @description
   * Prefix of the ids of the day and slot drop lists, unique to this calendar.
   *
   * @type {string}
   * @readonly
   */
  protected readonly dropListPrefix: string = inject(_IdGenerator).getId('cw-calendar-drop-');

  /**
   * Property menuGesture
   *
   * @description
   * Recognizes the context-menu gestures of the days and slots.
   *
   * @type {ɵContextMenuGesture}
   * @readonly
   */
  private readonly menuGesture: ɵContextMenuGesture = new ɵContextMenuGesture();

  /**
   * Property externalOver
   *
   * @description
   * Key of the cell under an outside item dragged with the pointer.
   *
   * @type {WritableSignal<string | null>}
   * @readonly
   */
  private readonly externalOver: WritableSignal<string | null> = signal<string | null>(null);

  /**
   * Property skeletonRows
   *
   * @description
   * Rows and cells of the loading skeleton, one cell per shown weekday.
   *
   * @type {Signal<readonly (readonly number[])[]>}
   * @readonly
   */
  protected readonly skeletonRows: Signal<readonly (readonly number[])[]> = computed(() => {
    const days: number[] = this.weekdays();
    return Array.from({ length: SKELETON_WEEKS }, () => days);
  });

  /**
   * Property classes
   *
   * @description
   * The class strings the day part shares with the view.
   *
   * @type {{ more: string; add: string; row: string; addRow: string; preview: string; ghost: string; }}
   * @readonly
   */
  public readonly classes: {
    more: string;
    add: string;
    row: string;
    addRow: string;
    preview: string;
    ghost: string;
  } = {
    more: MORE,
    add: ADD,
    row: ROW,
    addRow: ADD_ROW,
    preview: PREVIEW,
    ghost: GHOST,
  };

  /**
   * Property hourClass
   *
   * @description
   * Classes for the hour gutter.
   *
   * @type {string}
   * @readonly
   */
  protected readonly hourClass: string = HOUR;

  /**
   * Property moved
   *
   * @description
   * Spans moved here, shown until new `items` arrive.
   *
   * @type {WritableSignal<ReadonlyMap<string, CwCalendarSpan>>}
   * @readonly
   */
  private readonly moved: WritableSignal<ReadonlyMap<string, CwCalendarSpan>> = linkedSignal<
    ReadonlyMap<string, CwCalendarSpan>
  >(() => {
    this.items();
    return new Map();
  });

  /**
   * Property cursor
   *
   * @description
   * Current keyboard position in the grid.
   *
   * @type {WritableSignal<Cursor | null>}
   * @readonly
   */
  private readonly cursor: WritableSignal<Cursor | null> = signal<Cursor | null>(null);

  /**
   * Property grabbed
   *
   * @description
   * Item and original cursor held during a keyboard move.
   *
   * @type {WritableSignal<Grab | null>}
   * @readonly
   */
  private readonly grabbed: WritableSignal<Grab | null> = signal<Grab | null>(null);

  /**
   * Property dragging
   *
   * @description
   * Identifier of the item currently dragged.
   *
   * @type {WritableSignal<string | null>}
   * @readonly
   */
  private readonly dragging: WritableSignal<string | null> = signal<string | null>(null);

  /**
   * Property barPress
   *
   * @description
   * The bar last pressed with the pointer, its element and the day under the pointer; turned into
   * `barGrab` or discarded by the next drag start.
   *
   * @type {{ id: string; element: HTMLElement; day: Date } | null}
   */
  private barPress: { id: string; element: HTMLElement; day: Date } | null = null;

  /**
   * Property barGrab
   *
   * @description
   * The day the bar being dragged was grabbed by, for the drag in progress only; read and cleared
   * by the drop (the CDK ends the drag before it drops, so the drag end cannot clear it).
   *
   * @type {{ id: string; day: Date } | null}
   */
  private barGrab: { id: string; day: Date } | null = null;

  /**
   * Property dragOver
   *
   * @description
   * Key of the active drag target.
   *
   * @type {WritableSignal<string | null>}
   * @readonly
   */
  private readonly dragOver: WritableSignal<string | null> = signal<string | null>(null);

  /**
   * Property now
   *
   * @description
   * Current date supplied by the consumer or the clock.
   *
   * @type {Signal<Date>}
   * @readonly
   */
  protected readonly now: Signal<Date> = computed(() => this.today() ?? new Date());

  /**
   * Property shown
   *
   * @description
   * Displayed date normalized to the start of its day.
   *
   * @type {Signal<Date>}
   * @readonly
   */
  protected readonly shown: Signal<Date> = computed(() => ɵstartOfDay(this.date() ?? this.now()));

  /**
   * Property formats
   *
   * @description
   * Localized date formatters for calendar labels.
   *
   * @type {Signal<{ month: Intl.DateTimeFormat; full: Intl.DateTimeFormat; dayMonth: Intl.DateTimeFormat; dayLong: Intl.DateTimeFormat; dayShort: Intl.DateTimeFormat; monthShort: Intl.DateTimeFormat; weekdayShort: Intl.DateTimeFormat; weekdayLong: Intl.DateTimeFormat; }>}
   * @readonly
   */
  private readonly formats: Signal<{
    month: Intl.DateTimeFormat;
    full: Intl.DateTimeFormat;
    dayMonth: Intl.DateTimeFormat;
    dayLong: Intl.DateTimeFormat;
    dayShort: Intl.DateTimeFormat;
    monthShort: Intl.DateTimeFormat;
    weekdayShort: Intl.DateTimeFormat;
    weekdayLong: Intl.DateTimeFormat;
  }> = computed(() => {
    const locale: string = this.locale();
    return {
      month: new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }),
      full: new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      dayMonth: new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' }),
      dayLong: new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' }),
      dayShort: new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }),
      monthShort: new Intl.DateTimeFormat(locale, { month: 'short' }),
      weekdayShort: new Intl.DateTimeFormat(locale, { weekday: 'short' }),
      weekdayLong: new Intl.DateTimeFormat(locale, { weekday: 'long' }),
    };
  });

  /**
   * Property entries
   *
   * @description
   * Scheduled items and their display metadata.
   *
   * @type {Signal<readonly Entry<T>[]>}
   * @readonly
   */
  private readonly entries: Signal<readonly Entry<T>[]> = computed<readonly Entry<T>[]>(() => {
    const track: CwCalendarKeyFn<T> = this.trackBy();
    const label: CwCalendarKeyFn<T> = this.itemLabel();
    const spanOf: CwCalendarSpanFn<T> = this.itemSpan();
    const moved: ReadonlyMap<string, CwCalendarSpan> = this.moved();
    const entries: Entry<T>[] = [];
    for (const item of this.items()) {
      const id: string = track(item);
      const span: CwCalendarSpan | null = moved.get(id) ?? spanOf(item);
      if (span) entries.push({ id, item, label: label(item), span });
    }
    return entries;
  });

  /**
   * Property weekdays
   *
   * @description
   * The shown weekdays (0 Sunday … 6 Saturday) in order.
   *
   * @type {Signal<number[]>}
   * @readonly
   */
  private readonly weekdays: Signal<number[]> = computed(() => {
    const days: number[] = Array.from(
      { length: 7 },
      (_, index) => (this.weekStartsOn() + index) % 7,
    );
    return this.showWeekends() ? days : days.filter((day) => day !== 0 && day !== 6);
  });

  /**
   * Property columnsClass
   *
   * @description
   * Grid classes for the visible weekday count.
   *
   * @type {Signal<"grid grid-cols-5" | "grid grid-cols-7">}
   * @readonly
   */
  protected readonly columnsClass: Signal<'grid grid-cols-5' | 'grid grid-cols-7'> = computed(
    () => COLUMNS[this.weekdays().length === 5 ? 5 : 7],
  );
  // #endregion

  // #region Methods
  /**
   * Method daysOfWeek
   *
   * @description
   * The days of the week of `date`, weekends dropped when hidden.
   *
   * @param {Date} date - Date used by the operation.
   * @returns {Date[]} Visible dates in the week.
   */
  private daysOfWeek(date: Date): Date[] {
    const first: Date = ɵstartOfWeek(date, this.weekStartsOn());
    const shown: number[] = this.weekdays();
    return Array.from({ length: 7 }, (_, index) => addDays(first, index)).filter((day) =>
      shown.includes(day.getDay()),
    );
  }
  // #endregion

  // #region Properties
  /**
   * Property gridKey
   *
   * @description
   * Changes with the month or week shown, so the grid is drawn anew and fades in.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly gridKey: Signal<string> = computed(() => {
    const shown: Date = this.shown();
    const start: Date =
      this.view() === 'month' ? ɵstartOfMonth(shown) : ɵstartOfWeek(shown, this.weekStartsOn());
    return `${this.view()}:${String(ɵdayKey(start))}`;
  });

  /**
   * Property title
   *
   * @description
   * Displayed month or week title.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly title: Signal<string> = computed(() => {
    const formats: {
      month: Intl.DateTimeFormat;
      full: Intl.DateTimeFormat;
      dayMonth: Intl.DateTimeFormat;
      dayLong: Intl.DateTimeFormat;
      dayShort: Intl.DateTimeFormat;
      monthShort: Intl.DateTimeFormat;
      weekdayShort: Intl.DateTimeFormat;
      weekdayLong: Intl.DateTimeFormat;
    } = this.formats();
    if (this.view() === 'month') return capitalize(formats.month.format(this.shown()));
    const days: Date[] = this.daysOfWeek(this.shown());
    const first: Date = days.at(0) ?? this.shown();
    const last: Date = days.at(-1) ?? first;
    const year: string = String(last.getFullYear());
    if (ɵsameMonth(first, last)) {
      return `${String(first.getDate())} – ${String(last.getDate())} ${formats.monthShort.format(last)} ${year}`;
    }
    return `${formats.dayShort.format(first)} – ${formats.dayShort.format(last)} ${year}`;
  });

  /**
   * Property gridLabel
   *
   * @description
   * Accessible label for the current grid.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly gridLabel: Signal<string> = computed(() => {
    if (this.view() === 'month') return this.title();
    const days: Date[] = this.daysOfWeek(this.shown());
    const first: Date = days.at(0) ?? this.shown();
    const last: Date = days.at(-1) ?? first;
    return this.format(this.texts().weekGrid, {
      from: String(first.getDate()),
      to: `${this.formats().dayLong.format(last)} ${String(last.getFullYear())}`,
    });
  });

  /**
   * Property activeCursor
   *
   * @description
   * The day and slot that hold the tab stop: the cursor while shown, else today, else the first day.
   *
   * @type {Signal<Cursor>}
   * @readonly
   */
  private readonly activeCursor: Signal<Cursor> = computed<Cursor>(() => {
    const days: Date[] =
      this.view() === 'month' ? this.monthDays().flat() : this.daysOfWeek(this.shown());
    const cursor: Cursor | null = this.cursor();
    const slots: number[] = this.slotMinutesList();
    if (cursor && days.some((day) => ɵsameDay(day, cursor.date))) {
      const slot: number | null =
        this.view() === 'week' && cursor.slot !== null && slots.includes(cursor.slot)
          ? cursor.slot
          : null;
      return { ...cursor, slot };
    }
    const today: Date | undefined = days.find((day) => ɵsameDay(day, this.now()));
    const shown: Date | undefined = days.find((day) => ɵsameDay(day, this.shown()));
    const date: Date = shown ?? today ?? days.at(0) ?? this.shown();
    return { day: ɵdayKey(date), date, slot: null };
  });

  /**
   * Property monthDays
   *
   * @description
   * Dates in the displayed month grid.
   *
   * @type {Signal<Date[][]>}
   * @readonly
   */
  private readonly monthDays: Signal<Date[][]> = computed(() => {
    const month: Date = ɵstartOfMonth(this.shown());
    const first: Date = ɵstartOfWeek(month, this.weekStartsOn());
    return Array.from({ length: WEEKS_SHOWN }, (_, week) =>
      this.daysOfWeek(addDays(first, week * 7)),
    );
  });

  /**
   * Property slotMinutesList
   *
   * @description
   * Minutes represented by week view slots.
   *
   * @type {Signal<number[]>}
   * @readonly
   */
  private readonly slotMinutesList: Signal<number[]> = computed(() => {
    const [from, to]: readonly [number, number] = this.hours();
    const step: CwCalendarSlotMinutes = this.slotMinutes();
    const list: number[] = [];
    for (let minutes: number = from * 60; minutes < to * 60; minutes += step) list.push(minutes);
    return list;
  });

  /**
   * Property weekHeaders
   *
   * @description
   * Labels and state for the visible week headers.
   *
   * @type {Signal<readonly WeekHeader[]>}
   * @readonly
   */
  protected readonly weekHeaders: Signal<readonly WeekHeader[]> = computed<readonly WeekHeader[]>(
    () => {
      const formats: {
        month: Intl.DateTimeFormat;
        full: Intl.DateTimeFormat;
        dayMonth: Intl.DateTimeFormat;
        dayLong: Intl.DateTimeFormat;
        dayShort: Intl.DateTimeFormat;
        monthShort: Intl.DateTimeFormat;
        weekdayShort: Intl.DateTimeFormat;
        weekdayLong: Intl.DateTimeFormat;
      } = this.formats();
      const days: Date[] =
        this.view() === 'month' ? (this.monthDays()[0] ?? []) : this.daysOfWeek(this.shown());
      return days.map((day) => ({
        key: String(ɵdayKey(day)),
        short: formats.weekdayShort.format(day),
        long: formats.weekdayLong.format(day),
        number: String(day.getDate()),
        today: this.view() === 'week' && ɵsameDay(day, this.now()),
      }));
    },
  );

  /**
   * Property monthWeeks
   *
   * @description
   * Rendered day cells for the month grid.
   *
   * @type {Signal<readonly (readonly DayView[])[]>}
   * @readonly
   */
  protected readonly monthWeeks: Signal<readonly (readonly DayView[])[]> = computed<
    readonly (readonly DayView[])[]
  >(() => {
    if (this.view() !== 'month') return [];
    const weeks: Date[][] = this.monthDays();
    const delay: { value: number } = { value: 0 };
    return weeks.map((days, week) =>
      this.layoutDays(
        days,
        this.maxPerDay(),
        this.variant() === 'outlined' ? OUTLINED_TOP : MONTH_TOP,
        false,
        week === weeks.length - 1,
        delay,
      ),
    );
  });

  /**
   * Property allDayRow
   *
   * @description
   * Rendered all-day cells for the current week.
   *
   * @type {Signal<readonly DayView[]>}
   * @readonly
   */
  protected readonly allDayRow: Signal<readonly DayView[]> = computed<readonly DayView[]>(() => {
    if (this.view() !== 'week') return [];
    return this.layoutDays(this.daysOfWeek(this.shown()), 2, WEEK_TOP, true, true, { value: 0 });
  });

  /**
   * Property slotRows
   *
   * @description
   * Rendered rows of week time slots.
   *
   * @type {Signal<readonly SlotRow[]>}
   * @readonly
   */
  protected readonly slotRows: Signal<readonly SlotRow[]> = computed<readonly SlotRow[]>(() => {
    if (this.view() !== 'week') return [];
    const days: Date[] = this.daysOfWeek(this.shown());
    const slots: number[] = this.slotMinutesList();
    const step: CwCalendarSlotMinutes = this.slotMinutes();
    const [from, to]: readonly [number, number] = this.hours();
    const cursor: Cursor = this.activeCursor();
    const formats: {
      month: Intl.DateTimeFormat;
      full: Intl.DateTimeFormat;
      dayMonth: Intl.DateTimeFormat;
      dayLong: Intl.DateTimeFormat;
      dayShort: Intl.DateTimeFormat;
      monthShort: Intl.DateTimeFormat;
      weekdayShort: Intl.DateTimeFormat;
      weekdayLong: Intl.DateTimeFormat;
    } = this.formats();
    const now: Date = this.now();
    const grabbed: Grab | null = this.grabbed();
    const target: string | null = this.dropTargetKey();
    const blocks: Map<string, BlockView[]> = new Map<string, BlockView[]>();
    let delay: number = 0;
    for (const entry of this.entries()) {
      if (entry.span.allDay) continue;
      const day: Date | undefined = days.find((candidate) => ɵsameDay(candidate, entry.span.start));
      if (!day) continue;
      const startMinutes: number = minutesOf(entry.span.start);
      const endMinutes: number = ɵsameDay(entry.span.start, entry.span.end)
        ? minutesOf(entry.span.end)
        : 24 * 60;
      const top: number = Math.min(Math.max(startMinutes, from * 60), to * 60 - step);
      const bottom: number = Math.max(Math.min(endMinutes, to * 60), top + step);
      const slot: number = slots[Math.floor((top - from * 60) / step)] ?? from * 60;
      const key: string = cellKey(day, slot);
      const list: BlockView[] = blocks.get(key) ?? [];
      list.push({
        ...this.itemView(entry, 'week', grabbed?.id === entry.id, delay++),
        classes: `${BLOCK} ${PILL_TONES[grabbed?.id === entry.id ? 'grabbed' : 'rest']}`,
        top: ((top - slot) / 60) * HOUR_HEIGHT + 1,
        height: ((bottom - top) / 60) * HOUR_HEIGHT - 2,
        time: `${formatTime(startMinutes)} – ${formatTime(endMinutes)}`,
      });
      blocks.set(key, list);
    }
    return slots.map((minutes, row) => ({
      minutes,
      label: minutes % 60 === 0,
      time: formatTime(minutes),
      cells: days.map((day, column): SlotCell => {
        const key: string = cellKey(day, minutes);
        const nowMinutes: number = minutesOf(now);
        const holdsNow: boolean =
          ɵsameDay(day, now) && nowMinutes >= minutes && nowMinutes < minutes + step;
        const top: ' border-t' | '' = minutes % 60 === 0 && row > 0 ? ' border-t' : '';
        const left: '' | ' border-l' = column > 0 ? ' border-l' : '';
        const tone: 'hover:bg-accent' | 'bg-selected' =
          target === key ? 'bg-selected' : 'hover:bg-accent';
        return {
          key,
          date: day,
          label: `${formats.full.format(day)}, ${formatTime(minutes)}`,
          tabStop: ɵdayKey(day) === cursor.day && cursor.slot === minutes,
          target: target === key,
          cellClass: `${SLOT} ${SLOT_HEIGHTS[step]} ${tone}${top}${left}`,
          drop: { date: day, slot: minutes, allDayRow: false },
          blocks: blocks.get(key) ?? [],
          now: holdsNow ? ((nowMinutes - minutes) / 60) * HOUR_HEIGHT : null,
        };
      }),
    }));
  });

  /**
   * Property dropTargetKey
   *
   * @description
   * The cell under a dragged item, or the keyboard target of a grabbed one.
   *
   * @type {Signal<string | null>}
   * @readonly
   */
  private readonly dropTargetKey: Signal<string | null> = computed(() => {
    if (this.grabbed()) {
      const cursor: Cursor = this.activeCursor();
      return cellKey(cursor.date, cursor.slot);
    }
    return this.dragging() ? this.dragOver() : this.externalOver();
  });

  /**
   * Property dropListIds
   *
   * @description
   * Ids of the day and slot drop lists drawn now. An outside `cdkDropList` connected to them
   * (`[cdkDropListConnectedTo]`, which takes a mutable array) drops its items on the calendar, which
   * emits `itemSchedule`.
   *
   * @type {Signal<string[]>}
   * @readonly
   */
  public readonly dropListIds: Signal<string[]> = computed(() => {
    // From the dates alone, not the laid-out items: an outside list declared before the calendar
    // reads them before the calendar's required inputs are set.
    if (this.view() === 'month') {
      return this.monthDays()
        .flat()
        .map((date) => this.dropListPrefix + cellKey(date, null));
    }
    const slots: (number | null)[] = [null, ...this.slotMinutesList()];
    return this.daysOfWeek(this.shown()).flatMap((date) =>
      slots.map((slot) => this.dropListPrefix + cellKey(date, slot)),
    );
  });
  // #endregion

  // #region Methods
  /**
   * Method format
   *
   * @description
   * Replaces the `{name}` placeholders of a text.
   *
   * @param {string} template - Label template containing placeholders.
   * @param {Record<string, string | number>} values - Values substituted into the template.
   * @returns {string} Label with placeholders replaced.
   */
  protected format(template: string, values: Record<string, string | number>): string {
    return template.replace(/\{(\w+)\}/g, (match, name: string) =>
      name in values ? String(values[name]) : match,
    );
  }

  /**
   * Method setView
   *
   * @description
   * Changes the selected calendar view.
   *
   * @param {CwToggleGroupValue} value - Value to normalize or select.
   */
  protected setView(value: CwToggleGroupValue): void {
    if (value === 'month' || value === 'week') this.view.set(value);
  }

  /**
   * Method goToday
   *
   * @description
   * Moves the calendar to today.
   */
  protected goToday(): void {
    const today: Date = ɵstartOfDay(this.now());
    this.date.set(today);
    this.cursor.set({ day: ɵdayKey(today), date: today, slot: null });
  }

  /**
   * Method step
   *
   * @description
   * Moves the displayed month or week.
   *
   * @param {number} direction - Direction to navigate.
   */
  protected step(direction: number): void {
    const shown: Date = this.shown();
    this.date.set(
      this.view() === 'month' ? ɵaddMonths(shown, direction) : addDays(shown, 7 * direction),
    );
  }

  /**
   * Method onCellFocus
   *
   * @description
   * Records the focused calendar cell.
   *
   * @param {Date} date - Date used by the operation.
   * @param {number | null} slot - Time slot, or null for an all-day position.
   */
  protected onCellFocus(date: Date, slot: number | null): void {
    this.cursor.set({ day: ɵdayKey(date), date, slot });
  }

  /**
   * Method openItem
   *
   * @description
   * Part handler (`CalendarViewHost`), not for consumers.
   *
   * @param {CwCalendarItemContext<unknown>} context - Context of the item to open.
   */
  public openItem(context: CwCalendarItemContext<unknown>): void {
    this.open.emit(context.$implicit as T);
  }

  /**
   * Method createOn
   *
   * @description
   * Part handler (`CalendarViewHost`), not for consumers.
   *
   * @param {Date} date - Date used by the operation.
   * @param {number | null} slot - Time slot, or null for an all-day position.
   * @param {boolean} allDay - Whether the item occupies the full day.
   */
  public createOn(date: Date, slot: number | null, allDay: boolean): void {
    if (this.readonly()) return;
    this.create.emit({ date: slot === null ? ɵstartOfDay(date) : atMinutes(date, slot), allDay });
  }

  /**
   * Method onDragStart
   *
   * @description
   * Marks an item as being dragged, without a grabbed day: the item moves by its start. Kept with
   * its published signature; the calendar's parts call `onItemDragStart`.
   *
   * @param {string} id - Identifier of the item.
   */
  public onDragStart(id: string): void {
    this.dragging.set(id);
    this.barPress = null;
    this.barGrab = null;
  }

  /**
   * Method onItemDragStart
   *
   * @description
   * Part handler (`CalendarViewHost`), not for consumers. The day a bar was pressed on is kept for
   * this drag only when it starts from that bar element; a press that never became a drag (a
   * click), or one on another element, is dropped here.
   *
   * @param {string} id - Identifier of the item.
   * @param {HTMLElement} element - Element the drag starts from.
   */
  public onItemDragStart(id: string, element: HTMLElement): void {
    this.dragging.set(id);
    const pressed: { id: string; element: HTMLElement; day: Date } | null = this.barPress;
    this.barPress = null;
    this.barGrab =
      pressed?.id === id && pressed.element === element ? { id, day: pressed.day } : null;
  }

  /**
   * Method onBarPointerdown
   *
   * @description
   * Part handler (`CalendarViewHost`), not for consumers. Measured on the press, before the CDK
   * replaces the bar with its placeholder: the day under the pointer, from its share of the bar.
   *
   * @param {MouseEvent} event - Press on the bar.
   * @param {BarView} bar - The pressed bar.
   */
  public onBarPointerdown(event: MouseEvent, bar: BarView): void {
    const target: EventTarget | null = event.currentTarget;
    if (!(target instanceof HTMLElement)) return;
    const rect: DOMRect = target.getBoundingClientRect();
    const index: number =
      rect.width > 0 ? Math.floor(((event.clientX - rect.left) / rect.width) * bar.days.length) : 0;
    const day: Date | undefined = bar.days.at(Math.min(Math.max(index, 0), bar.days.length - 1));
    this.barPress = day ? { id: bar.id, element: target, day } : null;
  }

  /**
   * Method onDragEnd
   *
   * @description
   * Part handler (`CalendarViewHost`), not for consumers.
   */
  public onDragEnd(): void {
    this.dragging.set(null);
    this.dragOver.set(null);
  }

  /**
   * Method onEnter
   *
   * @description
   * Updates the current drag target, and the outside item's target.
   *
   * @param {string} key - Grid or keyboard key.
   * @param {CdkDragEnter<DropData, unknown>} [event] - Entry event, to tell outside items apart.
   */
  protected onEnter(key: string, event?: CdkDragEnter<DropData, unknown>): void {
    this.dragOver.set(key);
    if (event && !this.ownsList(event.item.dropContainer)) this.externalOver.set(key);
  }

  /**
   * Method ownsList
   *
   * @description
   * Whether a drop list is one of this calendar's days or slots. A drag is the calendar's own when
   * it comes from one of them; its data cannot tell, since an outside item may carry the same
   * value as an item id.
   *
   * @param {{ readonly id: string } | null | undefined} list - Drop list a drag comes from.
   * @returns {boolean} Whether the list belongs to this calendar.
   */
  private ownsList(list: { readonly id: string } | null | undefined): boolean {
    return !!list && list.id.startsWith(this.dropListPrefix);
  }

  /**
   * Method onExit
   *
   * @description
   * Forgets the cell an outside item leaves.
   *
   * @param {string} key - Key of the cell left.
   */
  protected onExit(key: string): void {
    if (this.externalOver() === key) this.externalOver.set(null);
  }

  /**
   * Method onDrop
   *
   * @description
   * Moves a dragged item to its drop target, or emits `itemSchedule` for an outside item; does
   * nothing for an item released outside every day and slot.
   *
   * @param {CdkDragDrop<DropData, DropData, unknown>} event - Drag or keyboard event.
   */
  protected onDrop(event: CdkDragDrop<DropData, DropData, unknown>): void {
    this.externalOver.set(null);
    const grab: { id: string; day: Date } | null = this.barGrab;
    this.barGrab = null;
    // The CDK also drops an item released outside any list, into the last list it entered: the
    // drag is abandoned, for the calendar's items and outside items alike.
    if (!event.isPointerOverContainer) return;
    if (this.ownsList(event.previousContainer)) {
      const entry: Entry<T> | undefined = this.entries().find(
        (candidate) => candidate.id === event.item.data,
      );
      const grabbedBy: Date | undefined = entry && grab?.id === entry.id ? grab.day : undefined;
      // A bar moves by the days between the day it was grabbed by and the target, so it can land
      // back in the list it is drawn in (its first day); a pill or a block moves by its start, and
      // its own list keeps it where it is (a 9:10 block stays off the 9:00 slot's start).
      if (!entry || (!grabbedBy && event.previousContainer === event.container)) return;
      this.moveEntry(entry, event.container.data, grabbedBy);
      return;
    }
    // From a list outside the calendar, connected through `dropListIds`.
    const { date, slot }: DropData = event.container.data;
    this.itemSchedule.emit({
      data: event.item.data,
      date: slot === null ? ɵstartOfDay(date) : atMinutes(date, slot),
      allDay: slot === null,
    });
  }

  /**
   * Method scheduleWithKeyboard
   *
   * @description
   * Starts placing an outside item with the keyboard, the path that matches dragging it onto a
   * day: the focus moves to the active cell, the arrows choose the day (or slot), Space or Enter
   * emit `itemSchedule` and announce the `scheduled` text, Escape cancels and focuses the element
   * that was focused when the call was made. Does nothing on a read-only calendar.
   *
   * @param {unknown} data - The outside item, given back in `itemSchedule`.
   * @param {string} label - Name of the item, for the announcements.
   */
  public scheduleWithKeyboard(data: unknown, label: string): void {
    if (this.readonly() || this.loading()) return;
    const from: Cursor = this.activeCursor();
    const focused: Element | null = document.activeElement;
    this.grabbed.set({
      id: '',
      from,
      external: { data, label, origin: focused instanceof HTMLElement ? focused : null },
    });
    this.focusCell(from);
    this.announce(this.format(this.texts().grabbed, { item: label }));
  }

  /**
   * Method onGridContextMenu
   *
   * @description
   * Opens `dayMenu` on the day or slot under a right click.
   *
   * @param {MouseEvent} event - `contextmenu` event of the grid.
   */
  protected onGridContextMenu(event: MouseEvent): void {
    this.openDayMenu(event);
  }

  /**
   * Method openDayMenu
   *
   * @description
   * Opens `dayMenu` on the cell of a context-menu gesture.
   *
   * @param {MouseEvent | KeyboardEvent} event - `contextmenu` or `keydown` event inside a cell.
   * @returns {boolean} Whether the menu opened.
   */
  private openDayMenu(event: MouseEvent | KeyboardEvent): boolean {
    const menu: CwMenu | null = this.dayMenu();
    const cell: HTMLElement | null =
      event.target instanceof Element ? event.target.closest<HTMLElement>('[data-cell]') : null;
    const key: string | undefined = cell?.dataset['cell'];
    if (!menu || !cell || key === undefined) return false;
    const request: ɵContextMenuRequest | null = this.menuGesture.request(event, cell);
    if (!request) return false;
    const { date, slot }: { date: Date; slot: number | null } = parseCellKey(key);
    const data: CwCalendarDayMenuData = {
      date: slot === null ? date : atMinutes(date, slot),
      allDay: slot === null,
    };
    menu.open({ ...request, data });
    return true;
  }

  /**
   * Method onItemKeydown
   *
   * @description
   * Part handler (`CalendarViewHost`), not for consumers.
   *
   * @param {KeyboardEvent} event - Drag or keyboard event.
   * @param {string} id - Identifier of the item.
   */
  public onItemKeydown(event: KeyboardEvent, id: string): void {
    if (event.key !== ' ' || this.readonly() || this.grabbed()) return;
    event.preventDefault();
    event.stopPropagation();
    const entry: Entry<T> | undefined = this.entries().find((candidate) => candidate.id === id);
    if (!entry) return;
    const from: Cursor = this.cursorOf(entry);
    this.grabbed.set({ id, from });
    this.focusCell(from);
    this.announce(this.format(this.texts().grabbed, { item: entry.label }));
  }

  /**
   * Method onGridKeydown
   *
   * @description
   * Navigates the calendar grid with the keyboard.
   *
   * @param {KeyboardEvent} event - Drag or keyboard event.
   */
  protected onGridKeydown(event: KeyboardEvent): void {
    const cell: HTMLElement | null = (event.target as HTMLElement).closest<HTMLElement>(
      '[data-cell]',
    );
    if (!cell || event.altKey || event.ctrlKey || event.metaKey) return;
    const onCell: boolean = event.target === cell;
    const cursor: Cursor = this.activeCursor();
    const grabbed: Grab | null = this.grabbed();
    if (!grabbed && this.openDayMenu(event)) return;
    const week: boolean = this.view() === 'week';
    let next: Cursor | null = null;
    switch (event.key) {
      case 'ArrowLeft':
        next = this.shiftDay(cursor, -1);
        break;
      case 'ArrowRight':
        next = this.shiftDay(cursor, 1);
        break;
      case 'ArrowUp':
        next = week ? this.shiftSlot(cursor, -1) : this.at(addDays(cursor.date, -7), null);
        break;
      case 'ArrowDown':
        next = week ? this.shiftSlot(cursor, 1) : this.at(addDays(cursor.date, 7), null);
        break;
      case 'Home':
      case 'End': {
        const days: Date[] = this.daysOfWeek(cursor.date);
        const day: Date | undefined = event.key === 'Home' ? days[0] : days.at(-1);
        if (day) next = this.at(day, cursor.slot);
        break;
      }
      case 'PageUp':
      case 'PageDown': {
        const sign: 1 | -1 = event.key === 'PageUp' ? -1 : 1;
        next = this.at(
          week ? addDays(cursor.date, 7 * sign) : ɵaddMonths(cursor.date, sign),
          cursor.slot,
        );
        break;
      }
      case ' ':
      case 'Enter':
        if (grabbed) {
          this.dropGrabbed(cursor);
        } else if (onCell && event.key === 'Enter') {
          cell.querySelector<HTMLElement>('[data-more]')?.click();
        } else return;
        event.preventDefault();
        return;
      case 'Escape':
        if (!grabbed) return;
        this.grabbed.set(null);
        if (grabbed.external?.origin) grabbed.external.origin.focus();
        else this.focusCell(grabbed.from);
        this.announce(this.texts().cancelled);
        event.preventDefault();
        return;
      default:
        if (grabbed || !onCell || event.shiftKey) return;
        if (!this.letter(event.key, cursor)) return;
        event.preventDefault();
        return;
    }
    event.preventDefault();
    if (!next) return;
    this.focusCell(next);
    if (grabbed) this.announce(this.formats().full.format(next.date));
  }

  /**
   * Method letter
   *
   * @description
   * T, M, S and N on a cell (Calendar View sheet, "Clavier").
   *
   * @param {string} key - Grid or keyboard key.
   * @param {Cursor} cursor - Current keyboard position.
   * @returns {boolean} Whether the key was handled.
   */
  private letter(key: string, cursor: Cursor): boolean {
    switch (key.toLowerCase()) {
      case 't':
        this.goToday();
        this.focusCell(this.at(ɵstartOfDay(this.now()), null));
        return true;
      case 'm':
        this.view.set('month');
        this.focusCell({ ...cursor, slot: null });
        return true;
      case 's':
        this.view.set('week');
        this.focusCell(cursor);
        return true;
      case 'n':
        if (this.readonly()) return false;
        this.createOn(cursor.date, cursor.slot, cursor.slot === null);
        return true;
      default:
        return false;
    }
  }

  /**
   * Method dropGrabbed
   *
   * @description
   * Drops a keyboard-grabbed item at the cursor; an outside item emits `itemSchedule`.
   *
   * @param {Cursor} cursor - Current keyboard position.
   */
  private dropGrabbed(cursor: Cursor): void {
    const grabbed: Grab | null = this.grabbed();
    this.grabbed.set(null);
    if (!grabbed) return;
    if (grabbed.external) {
      const date: Date =
        cursor.slot === null ? ɵstartOfDay(cursor.date) : atMinutes(cursor.date, cursor.slot);
      this.itemSchedule.emit({ data: grabbed.external.data, date, allDay: cursor.slot === null });
      this.announce(
        this.format(this.texts().scheduled, {
          item: grabbed.external.label,
          date: this.formats().dayMonth.format(date),
        }),
      );
      this.focusCell(cursor);
      return;
    }
    const entry: Entry<T> | undefined = this.entries().find(
      (candidate) => candidate.id === grabbed.id,
    );
    if (!entry) return;
    const same: boolean = cursor.day === grabbed.from.day && cursor.slot === grabbed.from.slot;
    if (!same) {
      const week: boolean = this.view() === 'week';
      this.moveEntry(entry, {
        date: cursor.date,
        slot: cursor.slot,
        allDayRow: week && cursor.slot === null,
      });
    }
    this.focusCell(cursor);
  }

  /**
   * Method moveEntry
   *
   * @description
   * Gives an item its new span (duration kept) and emits `itemMove`, unless the span is unchanged.
   *
   * @param {Entry<T>} entry - Calendar entry to move or render.
   * @param {DropData} to - Target day or time slot.
   * @param {Date} [from] - Day the item was grabbed by, which lands on the target day; its start
   * by default.
   */
  private moveEntry(entry: Entry<T>, to: DropData, from?: Date): void {
    const { start, end, allDay }: CwCalendarSpan = entry.span;
    let span: CwCalendarSpan;
    if (to.slot !== null) {
      // Into a slot: a timed item keeps its duration; an all-day one becomes an hour long.
      const duration: number = allDay ? 60 * 60_000 : end.getTime() - start.getTime();
      const begin: Date = atMinutes(to.date, to.slot);
      span = { start: begin, end: new Date(begin.getTime() + duration), allDay: false };
    } else if (to.allDayRow && !allDay) {
      span = { start: ɵstartOfDay(to.date), end: ɵstartOfDay(to.date), allDay: true };
    } else {
      // Onto a day: the item keeps its times and its number of days.
      const shift: number = ɵdaysBetween(from ?? start, to.date);
      span = { start: addDays(start, shift), end: addDays(end, shift), allDay };
    }
    if (
      span.allDay === allDay &&
      span.start.getTime() === start.getTime() &&
      span.end.getTime() === end.getTime()
    ) {
      return;
    }
    this.moved.update((moved) => new Map(moved).set(entry.id, span));
    this.itemMove.emit({ item: entry.item, ...span });
    this.announce(
      this.format(this.texts().moved, {
        item: entry.label,
        date: this.formats().dayMonth.format(span.start),
      }),
    );
  }

  /**
   * Method shiftDay
   *
   * @description
   * Moves a cursor by calendar days.
   *
   * @param {Cursor} cursor - Current keyboard position.
   * @param {number} step - Number of days or slots to move.
   * @returns {Cursor} Cursor shifted by calendar days.
   */
  private shiftDay(cursor: Cursor, step: number): Cursor {
    const shown: number[] = this.weekdays();
    let date: Date = addDays(cursor.date, step);
    while (!shown.includes(date.getDay())) date = addDays(date, step);
    return this.at(date, cursor.slot);
  }

  /**
   * Method shiftSlot
   *
   * @description
   * Moves a cursor between time slots.
   *
   * @param {Cursor} cursor - Current keyboard position.
   * @param {number} step - Number of days or slots to move.
   * @returns {Cursor} Cursor shifted by time slots.
   */
  private shiftSlot(cursor: Cursor, step: number): Cursor {
    const slots: number[] = this.slotMinutesList();
    // The all-day row (`null`) sits above the first slot.
    const index: number = cursor.slot === null ? -1 : slots.indexOf(cursor.slot);
    const next: number = Math.min(Math.max(index + step, -1), slots.length - 1);
    return { ...cursor, slot: next < 0 ? null : (slots[next] ?? null) };
  }

  /**
   * Method cursorOf
   *
   * @description
   * The cell an item sits in: its day, and in the week view the slot of its start.
   *
   * @param {Entry<T>} entry - Calendar entry to move or render.
   * @returns {Cursor} Cursor corresponding to the entry.
   */
  private cursorOf(entry: Entry<T>): Cursor {
    const slots: number[] = this.slotMinutesList();
    if (this.view() !== 'week' || entry.span.allDay) return this.at(entry.span.start, null);
    const minutes: number = minutesOf(entry.span.start);
    const slot: number | null =
      [...slots].reverse().find((candidate) => candidate <= minutes) ?? slots.at(0) ?? null;
    return this.at(entry.span.start, slot);
  }

  /**
   * Method at
   *
   * @description
   * Builds a cursor for a date and optional slot.
   *
   * @param {Date} date - Date used by the operation.
   * @param {number | null} slot - Time slot, or null for an all-day position.
   * @returns {Cursor} Cursor at the requested date and slot.
   */
  private at(date: Date, slot: number | null): Cursor {
    const day: Date = ɵstartOfDay(date);
    return { day: ɵdayKey(day), date: day, slot };
  }

  /**
   * Method focusCell
   *
   * @description
   * Moves the keyboard to a cell, bringing its month (or week) in, and focuses it once drawn.
   *
   * @param {Cursor} cursor - Current keyboard position.
   */
  private focusCell(cursor: Cursor): void {
    this.cursor.set(cursor);
    const visible: boolean =
      this.view() === 'month'
        ? ɵsameMonth(cursor.date, this.shown())
        : this.daysOfWeek(this.shown()).some((day) => ɵsameDay(day, cursor.date));
    if (!visible) this.date.set(cursor.date);
    const key: string = cellKey(cursor.date, cursor.slot);
    afterNextRender(
      {
        write: () => {
          Array.from(this.element.querySelectorAll<HTMLElement>('[data-cell]'))
            .find((element) => element.dataset['cell'] === key)
            ?.focus();
        },
      },
      { injector: this.injector },
    );
  }

  /**
   * Method layoutDays
   *
   * @description
   * Lays out a row of days: bars across days on the first lines (one line is kept for the others), then the one-day items, then « +n autres » when they do not fit in `lines`.
   *
   * @param {readonly Date[]} days - Number of calendar days to move, or days to lay out.
   * @param {number} lines - Number of visible item lines.
   * @param {number} top - Top offset for item bars.
   * @param {boolean} allDayRow - Whether the days belong to the all-day row.
   * @param {boolean} lastRow - Whether this is the last displayed row.
   * @param {{ value: number }} delay - Mutable counter for item entry delays.
   * @returns {DayView[]} Rendered day cells.
   */
  private layoutDays(
    days: readonly Date[],
    lines: number,
    top: number,
    allDayRow: boolean,
    lastRow: boolean,
    delay: { value: number },
  ): DayView[] {
    const texts: CwCalendarViewLabels = this.texts();
    const formats: {
      month: Intl.DateTimeFormat;
      full: Intl.DateTimeFormat;
      dayMonth: Intl.DateTimeFormat;
      dayLong: Intl.DateTimeFormat;
      dayShort: Intl.DateTimeFormat;
      monthShort: Intl.DateTimeFormat;
      weekdayShort: Intl.DateTimeFormat;
      weekdayLong: Intl.DateTimeFormat;
    } = this.formats();
    const cursor: Cursor = this.activeCursor();
    const grabbed: string | null = this.grabbed()?.id ?? null;
    const target: string | null = this.dropTargetKey();
    const now: Date = this.now();
    const month: Date = this.shown();
    const first: Date | undefined = days.at(0);
    const last: Date | undefined = days.at(-1);
    if (!first || !last) return [];
    const keys: number[] = days.map(ɵdayKey);
    const bars: { entry: Entry<T>; from: number; to: number; row: number }[] = [];
    const singles: Map<number, Entry<T>[]> = new Map<number, Entry<T>[]>();
    const rowsEnd: number[] = [];
    const barRows: number = Math.max(0, lines - 1);
    const covering: (entry: Entry<T>) => number[] = (entry: Entry<T>): number[] => {
      const from: number = ɵdayKey(entry.span.start);
      const to: number = ɵdayKey(entry.span.end);
      return keys
        .map((key, index) => (key >= from && key <= to ? index : -1))
        .filter((index) => index >= 0);
    };
    const sorted: Entry<T>[] = [...this.entries()].sort(
      (a, b) =>
        Number(b.span.allDay) - Number(a.span.allDay) ||
        a.span.start.getTime() - b.span.start.getTime(),
    );
    const addSingle: (index: number, entry: Entry<T>) => void = (
      index: number,
      entry: Entry<T>,
    ): void => {
      const key: number = keys[index] ?? 0;
      singles.set(key, [...(singles.get(key) ?? []), entry]);
    };
    for (const entry of sorted) {
      if (allDayRow && !entry.span.allDay) continue;
      const multi: boolean = entry.span.allDay && !ɵsameDay(entry.span.start, entry.span.end);
      const columns: number[] = multi ? covering(entry) : [];
      if (!multi) {
        const index: number = keys.indexOf(ɵdayKey(entry.span.start));
        if (index >= 0) addSingle(index, entry);
        continue;
      }
      const from: number | undefined = columns.at(0);
      const to: number | undefined = columns.at(-1);
      if (from === undefined || to === undefined) continue;
      let row: number = rowsEnd.findIndex((end) => end < from);
      if (row < 0) row = rowsEnd.length;
      if (row < barRows) {
        rowsEnd[row] = to;
        bars.push({ entry, from, to, row });
      } else {
        // No line left for one more bar: it shows as a pill on each of its days.
        for (const index of columns) addSingle(index, entry);
      }
    }
    const count: number = days.length;
    // The `outlined` variant restyles the month grid only; the week's all-day row stays as it is.
    const outlined: boolean = !allDayRow && this.variant() === 'outlined';
    const variant: CwCalendarViewVariant = outlined ? 'outlined' : 'default';
    const line: number = outlined ? OUTLINED_LINE : LINE;
    const placed: {
      date: Date;
      covered: { entry: Entry<T>; from: number; to: number; row: number }[];
      reserved: number;
      own: Entry<T>[];
      shownSingles: Entry<T>[];
      hidden: number;
    }[] = days.map((date, index) => {
      const covered: { entry: Entry<T>; from: number; to: number; row: number }[] = bars.filter(
        (bar) => bar.from <= index && bar.to >= index,
      );
      const reserved: number = covered.reduce((max, bar) => Math.max(max, bar.row + 1), 0);
      const own: Entry<T>[] = singles.get(keys[index] ?? 0) ?? [];
      const available: number = lines - reserved;
      const fits: boolean = own.length <= available;
      const shownSingles: Entry<T>[] = fits ? own : own.slice(0, Math.max(0, available - 1));
      const hidden: number = own.length - shownSingles.length;
      return { date, covered, reserved, own, shownSingles, hidden };
    });
    // Mockup App.dc.html: month rows size to their content (`min-h-24`), so a week is as tall as
    // the lines its fullest day uses (bar lines, pills, « +n autres »), never more than `lines`;
    // the lines keep their fixed positions, so the bars across days stay aligned.
    const usedLines: number = Math.min(
      lines,
      placed.reduce(
        (max, day) =>
          Math.max(max, day.reserved + day.shownSingles.length + (day.hidden > 0 ? 1 : 0)),
        0,
      ),
    );
    const height: number | null = allDayRow
      ? null
      : outlined
        ? outlinedHeight(usedLines)
        : defaultHeight(usedLines);
    return placed.map((day, index): DayView => {
      const { date, covered, reserved, own, shownSingles, hidden }: (typeof placed)[number] = day;
      const key: string = cellKey(date, null);
      const today: boolean = ɵsameDay(date, now);
      const outside: boolean = !allDayRow && !ɵsameMonth(date, month);
      const all: Entry<T>[] = [...covered.map((bar) => bar.entry), ...own];
      const countText: string = this.format(all.length > 1 ? texts.countOther : texts.countOne, {
        count: all.length,
      });
      const right: boolean = index < count - 1;
      let edges: Edges = lastRow ? 'none' : 'bottom';
      if (allDayRow) edges = index > 0 ? 'left' : 'none';
      else if (right) edges = lastRow ? 'right' : 'both';
      const tone: 'target' | 'rest' = target === key ? 'target' : 'rest';
      const name: string = formats.full.format(date);
      return {
        date,
        key,
        label: all.length > 0 ? `${name}, ${countText}` : name,
        // The first of a month names its month: after the number in the default variant (« 1
        // nov. »); beside the 24 px circle of the outlined one, which holds the number alone.
        number:
          date.getDate() === 1 && !allDayRow && !outlined
            ? formats.dayShort.format(date)
            : String(date.getDate()),
        monthLabel: date.getDate() === 1 && outlined ? formats.monthShort.format(date) : null,
        numberClass: (outlined ? OUTLINED_NUMBERS : NUMBERS)[
          today ? 'today' : outside ? 'outside' : 'plain'
        ],
        height,
        headClass: HEADS[variant],
        addClass: outlined ? OUTLINED_ADD : ADD,
        spacerClass: SPACERS[variant],
        today,
        outside,
        tabStop: ɵdayKey(date) === cursor.day && cursor.slot === null,
        target: target === key,
        cellClass: `${allDayRow ? ALL_DAY_CELL : outlined ? OUTLINED_CELL : CELL} ${CELL_EDGES[edges]} ${CELL_TONES[tone]}${outlined && outside && tone === 'rest' ? ` ${OUTLINED_OUTSIDE}` : ''}`,
        drop: { date, slot: null, allDayRow },
        spacers: Array.from({ length: reserved }, (_, line) => line),
        pills: shownSingles.map((entry) =>
          this.itemView(
            entry,
            allDayRow ? 'week' : 'month',
            entry.id === grabbed,
            delay.value++,
            outlined,
          ),
        ),
        bars: bars
          .filter((bar) => bar.from === index)
          .map((bar): BarView => {
            const span: number = bar.to - bar.from + 1;
            const continues: boolean = ɵdayKey(bar.entry.span.end) > (keys[bar.to] ?? 0);
            const base: ItemView = this.itemView(
              bar.entry,
              'bar',
              bar.entry.id === grabbed,
              delay.value++,
              outlined,
            );
            const range: string = `${formats.dayShort.format(bar.entry.span.start)} – ${formats.dayShort.format(bar.entry.span.end)}`;
            return {
              ...base,
              title: this.format(texts.range, {
                item: bar.entry.label,
                from: String(bar.entry.span.start.getDate()),
                to: formats.dayShort.format(bar.entry.span.end),
              }),
              classes: `${base.classes}${continues ? ' rounded-r-none' : ''}`,
              top: `${String(top + bar.row * line)}px`,
              left: `calc(100% * ${String(bar.from)} / ${String(count)} + 4px)`,
              width: `calc(100% * ${String(span)} / ${String(count)} - 8px)`,
              continues,
              range,
              days: days.slice(bar.from, bar.to + 1),
            };
          }),
        all: all.map((entry) => this.itemView(entry, 'list', false, 0)),
        more:
          hidden > 0
            ? this.format(hidden > 1 ? texts.moreOther : texts.moreOne, { count: hidden })
            : null,
        popoverTitle: capitalize(formats.dayMonth.format(date)),
        popoverLabel: `${capitalize(formats.dayMonth.format(date))}, ${countText}`,
        // Mockup App.dc.html: the « + » of a day names its weekday (« … le jeudi 12 novembre »).
        createLabel: this.format(texts.createOn, {
          date: `${formats.weekdayLong.format(date)} ${formats.dayLong.format(date)}`,
        }),
        addLabel: this.format(texts.addOn, { date: formats.dayShort.format(date) }),
      };
    });
  }

  /**
   * Method itemView
   *
   * @description
   * Builds display data for a calendar item.
   *
   * @param {Entry<T>} entry - Calendar entry to move or render.
   * @param {CwCalendarItemPlace} view - Location where the item is rendered.
   * @param {boolean} grabbed - Whether the item is held for keyboard movement.
   * @param {number} index - Index used for display ordering.
   * @param {boolean} outlined - Whether the item is a chip of the `outlined` month.
   * @returns {ItemView} Display data for the item.
   */
  private itemView(
    entry: Entry<T>,
    view: CwCalendarItemPlace,
    grabbed: boolean,
    index: number,
    outlined: boolean = false,
  ): ItemView {
    // A bar across days is placed on its line from the row (`top`, `left`, `width`), out of the
    // flow of its first day, so the day neither pushes it down nor clips it.
    const position: string = view === 'bar' ? BAR_POSITION : 'relative';
    const frame: string = outlined
      ? `${position} ${OUTLINED_PILL} ${OUTLINED_PILL_TONES[grabbed ? 'grabbed' : 'rest']}`
      : `${position} ${PILL} ${PILL_TONES[grabbed ? 'grabbed' : 'rest']}`;
    return {
      id: entry.id,
      title: entry.label,
      classes: `${frame}${view === 'month' || view === 'week' ? ' w-full' : ''}`,
      // Mockup motion: items enter one by one, 60 ms then +30 ms, twelve at most.
      delay: 60 + 30 * Math.min(index, 11),
      context: { $implicit: entry.item, view, span: entry.span },
    };
  }

  /**
   * Method announce
   *
   * @description
   * Announces a message politely.
   *
   * @param {string} message - Message to announce.
   */
  private announce(message: string): void {
    void this.announcer.announce(message, 'polite');
  }
  // #endregion
}
