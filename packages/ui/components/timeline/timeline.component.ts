import { FocusKeyManager, type FocusableOption, LiveAnnouncer } from '@angular/cdk/a11y';
import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  Component,
  computed,
  contentChild,
  ElementRef,
  inject,
  Injector,
  input,
  model,
  numberAttribute,
  output,
  signal,
  type InputSignal,
  type InputSignalWithTransform,
  type ModelSignal,
  type OutputEmitterRef,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import { CwAvatar } from '@cadenway/ui/components/avatar';
import {
  ɵaddDays,
  ɵaddMonths,
  ɵdaysBetween,
  ɵdaysInMonth,
  ɵisoWeek,
  ɵnavigateList,
  ɵsameDay,
  ɵstartOfDay,
  ɵstartOfMonth,
  ɵstartOfWeek,
} from '@cadenway/ui/core';
import { CW_STATUS_LABELS, CwStatusIcon } from '@cadenway/ui/components/status-icon';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCalendarPlusBold, phosphorCaretDownBold } from '@ng-icons/phosphor-icons/bold';
import { phosphorDiamondFill, phosphorWarningCircleFill } from '@ng-icons/phosphor-icons/fill';

import { CwTimelineBarDef } from './timeline-bar/timeline-bar.directive';
import {
  dayMonth,
  isWeekend,
  monthShort,
  moveText,
  periodText,
  rangeText,
  weekdayShort,
  workingDaysBetween,
} from './timeline.dates';
import { TIMELINE_TEXTS as TEXTS } from './timeline.texts';
import type {
  CwDependency,
  CwMilestone,
  CwTimelineConflict,
  CwTimelineGroup,
  CwTimelineItem,
  CwTimelineItemChange,
  CwTimelineRange,
  CwTimelineScale,
  CwTimelineSchedule,
} from './timeline.types';

/**
 * Type Tone
 *
 * @description
 * Visual tone used for a timeline item bar.
 *
 * @type {'progress' | 'done' | 'blocked' | 'neutral'}
 */
type Tone = 'progress' | 'done' | 'blocked' | 'neutral';

// A bar is filled with its status color and its text stays readable on it (sheet, "Barre au
// repos"); the status icon takes the text color of a tinted bar, else it would vanish in it.
/**
 * Constant TONES
 *
 * @description
 * Status-based bar color and text classes.
 *
 * @type {Record<Tone, string>}
 */
const TONES: Record<Tone, string> = {
  progress: 'bg-balise text-foreground dark:text-background [&_cw-status-icon_svg]:text-current!',
  done: 'bg-jade text-foreground dark:text-background [&_cw-status-icon_svg]:text-current!',
  blocked:
    'bg-grenat text-destructive-foreground dark:text-background [&_cw-status-icon_svg]:text-current!',
  neutral: 'bg-secondary text-foreground',
};

/**
 * Constant BAR
 *
 * @description
 * Base classes for an item bar.
 *
 * @type {string}
 */
const BAR: string =
  'group/bar absolute top-1.5 isolate flex h-6 items-center overflow-hidden rounded-md border border-transparent text-xs font-medium outline-hidden hover:bg-linear-to-b hover:from-hover hover:to-hover focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring';
/**
 * Constant BAR_IDLE
 *
 * @description
 * Transition classes for an idle bar.
 *
 * @type {string}
 */
const BAR_IDLE: string =
  'transition-[left,width] duration-300 ease-snap motion-reduce:transition-none';
/**
 * Constant BAR_GRAB
 *
 * @description
 * Cursor class for a draggable bar.
 *
 * @type {string}
 */
const BAR_GRAB: string = 'cursor-grab';
/**
 * Constant BAR_DRAGGING
 *
 * @description
 * Cursor, stacking and shadow classes for a dragged bar.
 *
 * @type {string}
 */
const BAR_DRAGGING: string = 'z-20 cursor-grabbing shadow-lg';
/**
 * Constant BAR_SELECTED
 *
 * @description
 * Selection ring classes for a bar.
 *
 * @type {string}
 */
const BAR_SELECTED: string = 'ring-2 ring-inset ring-current/35';

/**
 * Constant GROUP_BAR_ROUNDING
 *
 * @description
 * Summary bar rounding by clipped edge.
 *
 * @type {{ readonly both: 'rounded-full'; readonly left: 'rounded-r-full'; readonly right: 'rounded-l-full'; readonly none: 'rounded-none'; }}
 */
const GROUP_BAR_ROUNDING: {
  readonly both: 'rounded-full';
  readonly left: 'rounded-r-full';
  readonly right: 'rounded-l-full';
  readonly none: 'rounded-none';
} = {
  both: 'rounded-full',
  left: 'rounded-r-full',
  right: 'rounded-l-full',
  none: 'rounded-none',
} as const;

// The two cells of a row share its hover veil, its selection and its focus ring (`FOCUS_INSET`):
// the name cell is sticky and opaque, so the row's own ring would hide behind it.
/**
 * Constant ROW_FOCUS
 *
 * @description
 * Shared focus ring classes for row cells.
 *
 * @type {string}
 */
const ROW_FOCUS: string =
  'group-focus-visible/row:ring-2 group-focus-visible/row:ring-inset group-focus-visible/row:ring-ring';
/**
 * Constant NAME_CELL_BASE
 *
 * @description
 * Shared layout and interaction classes for name cells.
 *
 * @type {string}
 */
const NAME_CELL_BASE: string =
  'sticky left-0 z-20 flex shrink-0 items-center gap-2 border-r bg-background pr-3 group-hover/row:bg-linear-to-b group-hover/row:from-hover group-hover/row:to-hover group-aria-selected/row:bg-linear-to-b group-aria-selected/row:from-selected group-aria-selected/row:to-selected';
/**
 * Constant NAME_CELLS
 *
 * @description
 * Name cell classes by tree level.
 *
 * @type {Record<1 | 2, string>}
 */
const NAME_CELLS: Record<1 | 2, string> = {
  1: `${NAME_CELL_BASE} pl-3 ${ROW_FOCUS}`,
  2: `${NAME_CELL_BASE} pl-8 ${ROW_FOCUS}`,
};
/**
 * Constant GROUP_NAME_CELL
 *
 * @description
 * Sticky group name cell classes.
 *
 * @type {string}
 */
const GROUP_NAME_CELL: string = `sticky left-0 z-20 flex shrink-0 items-center gap-1 border-r bg-background px-1.5 group-hover/row:bg-linear-to-b group-hover/row:from-hover group-hover/row:to-hover ${ROW_FOCUS}`;
/**
 * Constant TRACK_CELL
 *
 * @description
 * Timeline track cell classes.
 *
 * @type {string}
 */
const TRACK_CELL: string = `relative shrink-0 group-hover/row:bg-accent group-aria-selected/row:bg-selected ${ROW_FOCUS}`;

// Ruler cells: days on two lines (« lu » / « 9 »), weeks (« S46 9 nov. ») and months on one.
/**
 * Constant COLUMN_CELLS
 *
 * @description
 * Ruler column classes for each time scale.
 *
 * @type {Record<CwTimelineScale, string>}
 */
const COLUMN_CELLS: Record<CwTimelineScale, string> = {
  day: 'absolute inset-y-0 flex flex-col items-center justify-center gap-0.5 leading-none tabular-nums',
  week: 'absolute inset-y-0 flex items-center gap-1 px-2 text-xs whitespace-nowrap tabular-nums',
  month: 'absolute inset-y-0 flex items-center gap-1 px-2 text-xs whitespace-nowrap tabular-nums',
};

/**
 * Constant UNIT_WIDTHS
 *
 * @description
 * Default column widths for each time scale.
 *
 * @type {Record<CwTimelineScale, number>}
 */
const UNIT_WIDTHS: Record<CwTimelineScale, number> = { day: 36, week: 76, month: 114 };
/**
 * Constant ROW_HEIGHT
 *
 * @description
 * Height of a timeline row in pixels.
 *
 * @type {number}
 */
const ROW_HEIGHT: number = 36;
// Integration guide, Gantt: « zoom sur 8 crans (boutons, Ctrl + molette, Ctrl + et −) »; the steps
// of the mockup (`App.dc.html`, `G_LADDER`): month to day, each widening its columns.
/**
 * Constant ZOOM_LADDER
 *
 * @description
 * Ordered scale and zoom steps used by the timeline.
 *
 * @type {readonly (readonly [CwTimelineScale, number])[]}
 */
const ZOOM_LADDER: readonly (readonly [CwTimelineScale, number])[] = [
  ['month', 1],
  ['month', 1.6],
  ['week', 1],
  ['week', 1.5],
  ['day', 1],
  ['day', 1.5],
  ['day', 2],
  ['day', 3],
];
// Mockup `App.dc.html` (`gWheel`): one zoom step per 160 ms of wheel, so a trackpad does not jump
// through the whole ladder.
/**
 * Constant WHEEL_THROTTLE
 *
 * @description
 * Minimum interval between wheel zoom steps in milliseconds.
 *
 * @type {number}
 */
const WHEEL_THROTTLE: number = 160;
// Under these widths the name leaves the bar, then the percentage appears (sheet, "Barre").
/**
 * Constant NAME_INSIDE
 *
 * @description
 * Minimum bar width for an internal name.
 *
 * @type {number}
 */
const NAME_INSIDE: number = 100;
/**
 * Constant PERCENT_INSIDE
 *
 * @description
 * Minimum bar width for an internal percentage.
 *
 * @type {number}
 */
const PERCENT_INSIDE: number = 200;

/**
 * Interface Column
 *
 * @description
 * A dated ruler column and its layout.
 */
interface Column {
  // #region Properties
  /**
   * Property key
   * @readonly
   *
   * @description
   * Stable column key.
   *
   * @type {string}
   */
  readonly key: string;

  /**
   * Property date
   * @readonly
   *
   * @description
   * Date represented by the column.
   *
   * @type {Date}
   */
  readonly date: Date;

  /**
   * Property x
   * @readonly
   *
   * @description
   * Horizontal position in pixels.
   *
   * @type {number}
   */
  readonly x: number;

  /**
   * Property width
   * @readonly
   *
   * @description
   * Column width in pixels.
   *
   * @type {number}
   */
  readonly width: number;

  /**
   * Property label
   * @readonly
   *
   * @description
   * Main ruler label.
   *
   * @type {string}
   */
  readonly label: string;

  /**
   * Property sub
   * @readonly
   *
   * @description
   * Secondary ruler label.
   *
   * @type {string}
   */
  readonly sub: string;

  /**
   * Property today
   * @readonly
   *
   * @description
   * Whether the column represents today.
   *
   * @type {boolean}
   */
  readonly today: boolean;

  /**
   * Property weekend
   * @readonly
   *
   * @description
   * Whether the column represents a weekend.
   *
   * @type {boolean}
   */
  readonly weekend: boolean;

  /**
   * Property separator
   * @readonly
   *
   * @description
   * Whether the column starts a separated period.
   *
   * @type {boolean}
   */
  readonly separator: boolean;
  // #endregion
}

/**
 * Interface Band
 *
 * @description
 * A labeled band on the timeline ruler.
 */
interface Band {
  // #region Properties
  /**
   * Property key
   * @readonly
   *
   * @description
   * Stable band key.
   *
   * @type {string}
   */
  readonly key: string;

  /**
   * Property x
   * @readonly
   *
   * @description
   * Horizontal position in pixels.
   *
   * @type {number}
   */
  readonly x: number;

  /**
   * Property width
   * @readonly
   *
   * @description
   * Band width in pixels.
   *
   * @type {number}
   */
  readonly width: number;

  /**
   * Property label
   * @readonly
   *
   * @description
   * Main band label.
   *
   * @type {string}
   */
  readonly label: string;

  /**
   * Property sub
   * @readonly
   *
   * @description
   * Secondary band label.
   *
   * @type {string}
   */
  readonly sub: string;

  /**
   * Property separator
   * @readonly
   *
   * @description
   * Whether the band starts a separated period.
   *
   * @type {boolean}
   */
  readonly separator: boolean;
  // #endregion
}

/**
 * Interface Axis
 *
 * @description
 * Computed geometry and dates of the visible time axis.
 */
interface Axis {
  // #region Properties
  /**
   * Property scale
   * @readonly
   *
   * @description
   * Axis time scale.
   *
   * @type {CwTimelineScale}
   */
  readonly scale: CwTimelineScale;

  /**
   * Property start
   * @readonly
   *
   * @description
   * First visible day.
   *
   * @type {Date}
   */
  readonly start: Date;

  /**
   * Property end
   * @readonly
   *
   * @description
   * Last visible day.
   *
   * @type {Date}
   */
  readonly end: Date;

  /**
   * Property width
   * @readonly
   *
   * @description
   * Total axis width in pixels.
   *
   * @type {number}
   */
  readonly width: number;

  /**
   * Property dayWidth
   * @readonly
   *
   * @description
   * Width assigned to one day.
   *
   * @type {number}
   */
  readonly dayWidth: number;

  /**
   * Property columns
   * @readonly
   *
   * @description
   * Visible ruler columns.
   *
   * @type {readonly Column[]}
   */
  readonly columns: readonly Column[];

  /**
   * Property bands
   * @readonly
   *
   * @description
   * Visible ruler bands.
   *
   * @type {readonly Band[]}
   */
  readonly bands: readonly Band[];

  /**
   * Property xOf
   * @readonly
   *
   * @description
   * Maps a date to its horizontal position.
   *
   * @type {(date: Date) => number}
   */
  readonly xOf: (date: Date) => number;
  // #endregion
}

/**
 * Interface Dates
 *
 * @description
 * Inclusive start and end days of an item.
 */
interface Dates {
  // #region Properties
  /**
   * Property start
   * @readonly
   *
   * @description
   * First included day.
   *
   * @type {Date}
   */
  readonly start: Date;

  /**
   * Property end
   * @readonly
   *
   * @description
   * Last included day.
   *
   * @type {Date}
   */
  readonly end: Date;
  // #endregion
}

/**
 * Interface BarView
 *
 * @description
 * Calculated appearance and geometry of an item bar.
 */
interface BarView {
  // #region Properties
  /**
   * Property x
   * @readonly
   *
   * @description
   * Horizontal bar position.
   *
   * @type {number}
   */
  readonly x: number;

  /**
   * Property width
   * @readonly
   *
   * @description
   * Bar width in pixels.
   *
   * @type {number}
   */
  readonly width: number;

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Bar visual classes.
   *
   * @type {string}
   */
  readonly classes: string;

  /**
   * Property ariaLabel
   * @readonly
   *
   * @description
   * Accessible bar name.
   *
   * @type {string}
   */
  readonly ariaLabel: string;

  /**
   * Property tone
   * @readonly
   *
   * @description
   * Bar color tone.
   *
   * @type {Tone}
   */
  readonly tone: Tone;

  /**
   * Property progress
   * @readonly
   *
   * @description
   * Optional completion percentage.
   *
   * @type {number | null}
   */
  readonly progress: number | null;

  /**
   * Property percent
   * @readonly
   *
   * @description
   * Optional formatted percentage.
   *
   * @type {string | null}
   */
  readonly percent: string | null;

  /**
   * Property nameInside
   * @readonly
   *
   * @description
   * Whether the name fits inside the bar.
   *
   * @type {boolean}
   */
  readonly nameInside: boolean;

  /**
   * Property outside
   * @readonly
   *
   * @description
   * Optional position for a name outside the bar.
   *
   * @type {{ readonly x: number; readonly before: boolean } | null}
   */
  readonly outside: { readonly x: number; readonly before: boolean } | null;

  /**
   * Property late
   * @readonly
   *
   * @description
   * Optional lateness text.
   *
   * @type {string | null}
   */
  readonly late: string | null;

  /**
   * Property conflict
   * @readonly
   *
   * @description
   * Whether a dependency conflict is present.
   *
   * @type {boolean}
   */
  readonly conflict: boolean;

  /**
   * Property dragging
   * @readonly
   *
   * @description
   * Whether the bar is being dragged.
   *
   * @type {boolean}
   */
  readonly dragging: boolean;

  /**
   * Property resizing
   * @readonly
   *
   * @description
   * Whether the bar is being resized.
   *
   * @type {boolean}
   */
  readonly resizing: boolean;

  /**
   * Property resizable
   * @readonly
   *
   * @description
   * Whether resizing is allowed.
   *
   * @type {boolean}
   */
  readonly resizable: boolean;
  // #endregion
}

/**
 * Interface GroupRow
 *
 * @description
 * A group row and its optional summary bar.
 */
interface GroupRow {
  // #region Properties
  /**
   * Property kind
   * @readonly
   *
   * @description
   * Discriminator for a group row.
   *
   * @type {'group'}
   */
  readonly kind: 'group';

  /**
   * Property key
   * @readonly
   *
   * @description
   * Stable row key.
   *
   * @type {string}
   */
  readonly key: string;

  /**
   * Property level
   * @readonly
   *
   * @description
   * Tree level of the row.
   *
   * @type {1}
   */
  readonly level: 1;

  /**
   * Property top
   * @readonly
   *
   * @description
   * Optional vertical position.
   *
   * @type {number | null}
   */
  readonly top: number | null;

  /**
   * Property group
   * @readonly
   *
   * @description
   * Group represented by the row.
   *
   * @type {CwTimelineGroup}
   */
  readonly group: CwTimelineGroup;

  /**
   * Property expanded
   * @readonly
   *
   * @description
   * Whether child rows are visible.
   *
   * @type {boolean}
   */
  readonly expanded: boolean;

  /**
   * Property meta
   * @readonly
   *
   * @description
   * Summary text for the group.
   *
   * @type {string}
   */
  readonly meta: string;

  /**
   * Property bar
   * @readonly
   *
   * @description
   * Optional geometry of the summary bar.
   *
   * @type {{ readonly x: number; readonly width: number; readonly progress: number; readonly rounding: string; } | null}
   */
  readonly bar: {
    readonly x: number;
    readonly width: number;
    readonly progress: number;
    readonly rounding: string;
  } | null;
  // #endregion
}

/**
 * Interface ItemRow
 *
 * @description
 * An item row and its optional bar.
 */
interface ItemRow {
  // #region Properties
  /**
   * Property kind
   * @readonly
   *
   * @description
   * Discriminator for an item row.
   *
   * @type {'item'}
   */
  readonly kind: 'item';

  /**
   * Property key
   * @readonly
   *
   * @description
   * Stable row key.
   *
   * @type {string}
   */
  readonly key: string;

  /**
   * Property level
   * @readonly
   *
   * @description
   * Tree level of the row.
   *
   * @type {1 | 2}
   */
  readonly level: 1 | 2;

  /**
   * Property top
   * @readonly
   *
   * @description
   * Optional vertical position.
   *
   * @type {number | null}
   */
  readonly top: number | null;

  /**
   * Property item
   * @readonly
   *
   * @description
   * Item represented by the row.
   *
   * @type {CwTimelineItem}
   */
  readonly item: CwTimelineItem;

  /**
   * Property dates
   * @readonly
   *
   * @description
   * Optional inclusive item dates.
   *
   * @type {Dates | null}
   */
  readonly dates: Dates | null;

  /**
   * Property selected
   * @readonly
   *
   * @description
   * Whether the item is selected.
   *
   * @type {boolean}
   */
  readonly selected: boolean;

  /**
   * Property bar
   * @readonly
   *
   * @description
   * Optional rendered bar details.
   *
   * @type {BarView | null}
   */
  readonly bar: BarView | null;

  /**
   * Property ghost
   * @readonly
   *
   * @description
   * Optional position and width of the drag preview.
   *
   * @type {{ readonly x: number; readonly width: number } | null}
   */
  readonly ghost: { readonly x: number; readonly width: number } | null;
  // #endregion
}

/**
 * Interface MilestoneRow
 *
 * @description
 * A milestone row and its position on the axis.
 */
interface MilestoneRow {
  // #region Properties
  /**
   * Property kind
   * @readonly
   *
   * @description
   * Discriminator for a milestone row.
   *
   * @type {'milestone'}
   */
  readonly kind: 'milestone';

  /**
   * Property key
   * @readonly
   *
   * @description
   * Stable row key.
   *
   * @type {string}
   */
  readonly key: string;

  /**
   * Property level
   * @readonly
   *
   * @description
   * Tree level of the row.
   *
   * @type {1 | 2}
   */
  readonly level: 1 | 2;

  /**
   * Property top
   * @readonly
   *
   * @description
   * Optional vertical position.
   *
   * @type {number | null}
   */
  readonly top: number | null;

  /**
   * Property milestone
   * @readonly
   *
   * @description
   * Milestone represented by the row.
   *
   * @type {CwMilestone}
   */
  readonly milestone: CwMilestone;

  /**
   * Property x
   * @readonly
   *
   * @description
   * Optional horizontal milestone position.
   *
   * @type {number | null}
   */
  readonly x: number | null;

  /**
   * Property before
   * @readonly
   *
   * @description
   * Whether the milestone lies before the visible range.
   *
   * @type {boolean}
   */
  readonly before: boolean;

  /**
   * Property dateText
   * @readonly
   *
   * @description
   * Formatted milestone date.
   *
   * @type {string}
   */
  readonly dateText: string;

  /**
   * Property ariaLabel
   * @readonly
   *
   * @description
   * Accessible milestone name.
   *
   * @type {string}
   */
  readonly ariaLabel: string;
  // #endregion
}

/**
 * Type Row
 *
 * @description
 * A group, item or milestone row in the timeline.
 *
 * @type {GroupRow | ItemRow | MilestoneRow}
 */
type Row = GroupRow | ItemRow | MilestoneRow;

/**
 * Interface Section
 *
 * @description
 * A group and the rows rendered beneath it.
 */
interface Section {
  // #region Properties
  /**
   * Property key
   * @readonly
   *
   * @description
   * Stable section key.
   *
   * @type {string}
   */
  readonly key: string;

  /**
   * Property group
   * @readonly
   *
   * @description
   * Optional group row heading the section.
   *
   * @type {GroupRow | null}
   */
  readonly group: GroupRow | null;

  /**
   * Property expanded
   * @readonly
   *
   * @description
   * Whether the section is expanded.
   *
   * @type {boolean}
   */
  readonly expanded: boolean;

  /**
   * Property rows
   * @readonly
   *
   * @description
   * Rows belonging to the section.
   *
   * @type {readonly Row[]}
   */
  readonly rows: readonly Row[];
  // #endregion
}

/**
 * Interface Drag
 *
 * @description
 * State of an active pointer drag operation.
 */
interface Drag {
  // #region Properties
  /**
   * Property id
   * @readonly
   *
   * @description
   * Identifier of the primary item.
   *
   * @type {string}
   */
  readonly id: string;

  /**
   * Property ids
   * @readonly
   *
   * @description
   * Identifiers affected by the drag.
   *
   * @type {readonly string[]}
   */
  readonly ids: readonly string[];

  /**
   * Property mode
   * @readonly
   *
   * @description
   * Drag action being performed.
   *
   * @type {'move' | 'start' | 'end' | 'link'}
   */
  readonly mode: 'move' | 'start' | 'end' | 'link';

  /**
   * Property originX
   * @readonly
   *
   * @description
   * Pointer position at drag start.
   *
   * @type {number}
   */
  readonly originX: number;

  /**
   * Property delta
   * @readonly
   *
   * @description
   * Current horizontal drag displacement.
   *
   * @type {number}
   */
  readonly delta: number;

  /**
   * Property moved
   * @readonly
   *
   * @description
   * Whether the pointer moved.
   *
   * @type {boolean}
   */
  readonly moved: boolean;

  /**
   * Property additive
   * @readonly
   *
   * @description
   * Whether the selection modifier is active.
   *
   * @type {boolean}
   */
  readonly additive: boolean;
  // #endregion
}

/**
 * Interface RowOption
 *
 * @description
 * Focusable row exposed to the keyboard manager.
 */
interface RowOption extends FocusableOption {
  // #region Properties
  /**
   * Property key
   * @readonly
   *
   * @description
   * Stable key used to locate the row.
   *
   * @type {string}
   */
  readonly key: string;
  // #endregion
}

/**
 * Function clampProgress
 *
 * @description
 * Rounds progress and clamps it between zero and one hundred.
 *
 * @param {number | undefined} value - Optional progress percentage.
 *
 * @returns {number} Rounded percentage clamped between zero and one hundred.
 */
function clampProgress(value: number | undefined): number {
  return Math.min(100, Math.max(0, Math.round(value ?? 0)));
}

/**
 * Function datesOf
 *
 * @description
 * Returns the ordered inclusive item dates, using either date alone for a one-day bar.
 *
 * @param {CwTimelineItem} item - Item whose dates are inspected.
 *
 * @returns {Dates | null} Ordered inclusive dates, or null when the item is undated.
 */
function datesOf(item: CwTimelineItem): Dates | null {
  const start: Date | null | undefined = item.start ?? item.end;
  const end: Date | null | undefined = item.end ?? item.start;
  if (!start || !end) return null;
  const a: Date = ɵstartOfDay(start);
  const b: Date = ɵstartOfDay(end);
  return ɵdaysBetween(a, b) >= 0 ? { start: a, end: b } : { start: b, end: a };
}

/**
 * Function toneOf
 *
 * @description
 * Selects a bar tone from the item's status.
 *
 * @param {CwTimelineItem} item - Item whose status determines the tone.
 *
 * @returns {Tone} Bar tone for the item.
 */
function toneOf(item: CwTimelineItem): Tone {
  switch (item.status) {
    case 'progress':
      return 'progress';
    case 'done':
      return 'done';
    case 'blocked':
      return 'blocked';
    default:
      return 'neutral';
  }
}

/**
 * Function rangeFor
 *
 * @description
 * Computes the default range around a day for the chosen scale.
 *
 * @param {CwTimelineScale} scale - Timeline scale.
 * @param {Date} anchor - Day around which to build the range.
 *
 * @returns {CwTimelineRange} Default range for the selected scale.
 */
function rangeFor(scale: CwTimelineScale, anchor: Date): CwTimelineRange {
  switch (scale) {
    case 'day': {
      const start: Date = ɵstartOfWeek(anchor);
      return { start, end: ɵaddDays(start, 20) };
    }
    case 'week': {
      const start: Date = ɵaddDays(ɵstartOfWeek(anchor), -14);
      return { start, end: ɵaddDays(start, 12 * 7 - 1) };
    }
    case 'month': {
      const start: Date = ɵaddMonths(ɵstartOfMonth(anchor), -1);
      return { start, end: ɵaddDays(ɵaddMonths(start, 6), -1) };
    }
  }
}

/**
 * Function shiftByUnit
 *
 * @description
 * Shifts a date by the requested number of scale units.
 *
 * @param {Date} date - Date to shift.
 * @param {CwTimelineScale} scale - Scale defining the unit.
 * @param {number} steps - Signed number of units to shift.
 *
 * @returns {Date} Shifted date.
 */
function shiftByUnit(date: Date, scale: CwTimelineScale, steps: number): Date {
  if (scale === 'month') return ɵaddMonths(date, steps);
  return ɵaddDays(date, scale === 'week' ? steps * 7 : steps);
}

/**
 * Function shiftByPage
 *
 * @description
 * Shifts a range by pages appropriate to the selected scale.
 *
 * @param {CwTimelineRange} range - Range to shift.
 * @param {CwTimelineScale} scale - Scale defining the page size.
 * @param {number} steps - Signed number of pages to shift.
 *
 * @returns {CwTimelineRange} Shifted range.
 */
function shiftByPage(
  range: CwTimelineRange,
  scale: CwTimelineScale,
  steps: number,
): CwTimelineRange {
  if (scale === 'month') {
    return { start: ɵaddMonths(range.start, 3 * steps), end: ɵaddMonths(range.end, 3 * steps) };
  }
  const days: number = (scale === 'week' ? 28 : 7) * steps;
  return { start: ɵaddDays(range.start, days), end: ɵaddDays(range.end, days) };
}

/**
 * Function monthsBetween
 *
 * @description
 * Counts calendar month boundaries between two dates.
 *
 * @param {Date} from - Starting date.
 * @param {Date} to - Ending date.
 *
 * @returns {number} Number of calendar month boundaries between the dates.
 */
function monthsBetween(from: Date, to: Date): number {
  return (to.getFullYear() - from.getFullYear()) * 12 + to.getMonth() - from.getMonth();
}

/**
 * Function dependencyPath
 *
 * @description
 * The elbow of a finish-to-start dependency (sheet, "Dépendance"): out of the end of the
 * predecessor, down to the row of the successor, into its start. When the successor starts too
 * early, the line goes back through the gap between the rows.
 *
 * @param {number} x1 - Horizontal position at the predecessor endpoint.
 * @param {number} y1 - Vertical position at the predecessor endpoint.
 * @param {number} x2 - Horizontal position at the successor endpoint.
 * @param {number} y2 - Vertical position at the successor endpoint.
 *
 * @returns {string} SVG path for the dependency elbow.
 */
function dependencyPath(x1: number, y1: number, x2: number, y2: number): string {
  const r: number = 4;
  const out: number = x1 + 8;
  const s: number = y2 >= y1 ? 1 : -1;
  const n: (value: number) => string = (value: number): string =>
    String(Math.round(value * 100) / 100);
  if (x2 >= out + r) {
    if (y1 === y2) return `M${n(x1)} ${n(y1)} H${n(x2)}`;
    return (
      `M${n(x1)} ${n(y1)} H${n(out - r)} Q${n(out)} ${n(y1)} ${n(out)} ${n(y1 + s * r)} ` +
      `V${n(y2 - s * r)} Q${n(out)} ${n(y2)} ${n(out + r)} ${n(y2)} H${n(x2)}`
    );
  }
  const gap: number = y2 - s * (ROW_HEIGHT / 2);
  const back: number = x2 - 9;
  return (
    `M${n(x1)} ${n(y1)} H${n(out - r)} Q${n(out)} ${n(y1)} ${n(out)} ${n(y1 + s * r)} ` +
    `V${n(gap - s * r)} Q${n(out)} ${n(gap)} ${n(out - r)} ${n(gap)} H${n(back + r)} ` +
    `Q${n(back)} ${n(gap)} ${n(back)} ${n(gap + s * r)} V${n(y2 - s * r)} ` +
    `Q${n(back)} ${n(y2)} ${n(back + r)} ${n(y2)} H${n(x2)}`
  );
}

/**
 * Function arrowHead
 *
 * @description
 * Builds the SVG arrowhead path at a dependency endpoint.
 *
 * @param {number} x - Horizontal endpoint position.
 * @param {number} y - Vertical endpoint position.
 *
 * @returns {string} SVG path for the arrowhead.
 */
function arrowHead(x: number, y: number): string {
  return `M${String(x - 5)} ${String(y - 3.5)} L${String(x)} ${String(y)} L${String(x - 5)} ${String(y + 3.5)}`;
}

/**
 * Class CwTimeline
 * @class CwTimeline
 *
 * @description
 * The Gantt view: one bar per item between its start and its end, with its progress, the
 * finish-to-start dependencies, the milestones, today and the weekends, by day, week or month
 * (Timeline sheet of the Design System artifact). Generic: the consumer gives the items, their
 * dates, groups and labels, and applies every change it receives.
 *
 * Controlled: a move or a resize never changes `items`; it emits `itemChange` (pointer release, or
 * each arrow press) and the consumer writes the new dates back. `schedule` asks for dates for an
 * undated item (« Planifier », one day), `dependencyCreate` for a link drawn with Alt from the end
 * handle of a bar to another bar, `open` for a double click or Enter on a bar. `conflict` reports a
 * change that makes a successor start before its predecessor ends; the move is never blocked.
 *
 * Models: `scale`, `zoom` (column width factor of the scale), `range` (`null`: the weeks around
 * today), `collapsedGroups`, `selection` (bars moved together) and `showDependencies`. Ctrl + wheel
 * and Ctrl + / Ctrl − walk the eight zoom steps of the integration guide, from month to day, and
 * Ctrl + 0 resets the column width.
 *
 * Accessibility: a named `role="treegrid"` with one tab stop; ↑ ↓ move between rows, Home and End
 * jump; on a group ← → collapse and expand; on a bar ← → move it by one unit of the scale, Shift
 * changes its end, Alt its start; Space selects (Ctrl + Space adds), Enter opens, Escape cancels a
 * drag or clears the selection, T goes back to today, J, S and M pick the scale, Page Up and Page
 * Down change the period. Every bar is named (« CAD-482, 40 %, En cours, du 10 au 13 nov. »), late
 * and conflicts included; moves, conflicts and scale changes are announced politely. Arrows,
 * weekends and the today line are decorative. Bars glide when the scale or the period changes,
 * not under reduced motion. Style hooks: `data-scale` on the host; `data-status`, `data-late`,
 * `data-conflict`, `data-dragging`, `data-resizing`, `aria-pressed` on bars; `data-weekend` and
 * `aria-current="date"` on ruler days.
 */
@Component({
  selector: 'cw-timeline',
  imports: [NgIcon, NgTemplateOutlet, CwAvatar, CwStatusIcon],
  providers: [
    provideIcons({
      phosphorCalendarPlusBold,
      phosphorCaretDownBold,
      phosphorDiamondFill,
      phosphorWarningCircleFill,
    }),
  ],
  host: {
    class: 'flex min-h-0 min-w-0 flex-col gap-3',
    '[attr.data-scale]': 'scale()',
  },
  templateUrl: './timeline.component.html',
})
export class CwTimeline {
  // #region Properties
  /**
   * Property items
   * @readonly
   *
   * @description
   * The bars, in display order within their group.
   *
   * @type {InputSignal<readonly CwTimelineItem[]>}
   */
  public readonly items: InputSignal<readonly CwTimelineItem[]> =
    input.required<readonly CwTimelineItem[]>();

  /**
   * Property dependencies
   * @readonly
   *
   * @description
   * Finish-to-start links between items.
   *
   * @type {InputSignal<readonly CwDependency[]>}
   */
  public readonly dependencies: InputSignal<readonly CwDependency[]> = input<
    readonly CwDependency[]
  >([]);

  /**
   * Property milestones
   * @readonly
   *
   * @description
   * Milestones, each on its own row in its group.
   *
   * @type {InputSignal<readonly CwMilestone[]>}
   */
  public readonly milestones: InputSignal<readonly CwMilestone[]> = input<readonly CwMilestone[]>(
    [],
  );

  /**
   * Property groups
   * @readonly
   *
   * @description
   * Group rows, in order; empty draws a flat list. Items of an unknown group come last.
   *
   * @type {InputSignal<readonly CwTimelineGroup[]>}
   */
  public readonly groups: InputSignal<readonly CwTimelineGroup[]> = input<
    readonly CwTimelineGroup[]
  >([]);

  /**
   * Property scale
   * @readonly
   *
   * @description
   * Unit of the axis.
   *
   * @type {ModelSignal<CwTimelineScale>}
   */
  public readonly scale: ModelSignal<CwTimelineScale> = model<CwTimelineScale>('day');

  /**
   * Property zoom
   * @readonly
   *
   * @description
   * Column width factor within the scale (1, 1.5, 2, 3 on the day scale; see the zoom steps).
   *
   * @type {ModelSignal<number>}
   */
  public readonly zoom: ModelSignal<number> = model<number>(1);

  /**
   * Property range
   * @readonly
   *
   * @description
   * The period shown; `null` shows the weeks around today for the scale.
   *
   * @type {ModelSignal<CwTimelineRange | null>}
   */
  public readonly range: ModelSignal<CwTimelineRange | null> = model<CwTimelineRange | null>(null);

  /**
   * Property collapsedGroups
   * @readonly
   *
   * @description
   * Ids of the collapsed groups.
   *
   * @type {ModelSignal<readonly string[]>}
   */
  public readonly collapsedGroups: ModelSignal<readonly string[]> = model<readonly string[]>([]);

  /**
   * Property selection
   * @readonly
   *
   * @description
   * Ids of the selected items, moved together.
   *
   * @type {ModelSignal<readonly string[]>}
   */
  public readonly selection: ModelSignal<readonly string[]> = model<readonly string[]>([]);

  /**
   * Property showDependencies
   * @readonly
   *
   * @description
   * Draws the dependency arrows.
   *
   * @type {ModelSignal<boolean>}
   */
  public readonly showDependencies: ModelSignal<boolean> = model<boolean>(true);

  /**
   * Property showWeekends
   * @readonly
   *
   * @description
   * Marks the weekends on the day scale; `false` keeps working days only.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly showWeekends: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  /**
   * Property today
   * @readonly
   *
   * @description
   * The day of the « Aujourd'hui » line; `null` takes the current day.
   *
   * @type {InputSignal<Date | null>}
   */
  public readonly today: InputSignal<Date | null> = input<Date | null>(null);

  /**
   * Property nameColumnWidth
   * @readonly
   *
   * @description
   * Width of the name column, in pixels.
   *
   * @type {InputSignalWithTransform<number, unknown>}
   */
  public readonly nameColumnWidth: InputSignalWithTransform<number, unknown> = input(241, {
    transform: numberAttribute,
  });

  /**
   * Property readonly
   * @readonly
   *
   * @description
   * No move, no resize, no « Planifier ».
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly readonly: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property ariaLabel
   * @readonly
   *
   * @description
   * Accessible name of the grid (« Timeline de Produit »).
   *
   * @type {InputSignal<string>}
   */
  public readonly ariaLabel: InputSignal<string> = input.required<string>();

  /**
   * Property nameHeader
   * @readonly
   *
   * @description
   * Header of the name column.
   *
   * @type {InputSignal<string>}
   */
  public readonly nameHeader: InputSignal<string> = input<string>('Tâche');

  /**
   * Property undatedLabel
   * @readonly
   *
   * @description
   * Text of an undated item in the name column.
   *
   * @type {InputSignal<string>}
   */
  public readonly undatedLabel: InputSignal<string> = input<string>('Sans date');

  /**
   * Property scheduleLabel
   * @readonly
   *
   * @description
   * Label of the button that gives dates to an undated item.
   *
   * @type {InputSignal<string>}
   */
  public readonly scheduleLabel: InputSignal<string> = input<string>('Planifier');

  /**
   * Property itemChange
   * @readonly
   *
   * @description
   * A bar was moved or resized.
   *
   * @type {OutputEmitterRef<CwTimelineItemChange>}
   */
  public readonly itemChange: OutputEmitterRef<CwTimelineItemChange> =
    output<CwTimelineItemChange>();

  /**
   * Property schedule
   * @readonly
   *
   * @description
   * « Planifier » on an undated item.
   *
   * @type {OutputEmitterRef<CwTimelineSchedule>}
   */
  public readonly schedule: OutputEmitterRef<CwTimelineSchedule> = output<CwTimelineSchedule>();

  /**
   * Property dependencyCreate
   * @readonly
   *
   * @description
   * A link was drawn from one bar to another (Alt + drag from the end handle).
   *
   * @type {OutputEmitterRef<CwDependency>}
   */
  public readonly dependencyCreate: OutputEmitterRef<CwDependency> = output<CwDependency>();

  /**
   * Property conflict
   * @readonly
   *
   * @description
   * A change made a successor start before its predecessor ends.
   *
   * @type {OutputEmitterRef<CwTimelineConflict>}
   */
  public readonly conflict: OutputEmitterRef<CwTimelineConflict> = output<CwTimelineConflict>();

  /**
   * Property open
   * @readonly
   *
   * @description
   * Double click or Enter on a bar.
   *
   * @type {OutputEmitterRef<CwTimelineItem>}
   */
  public readonly open: OutputEmitterRef<CwTimelineItem> = output<CwTimelineItem>();

  /**
   * Property barDef
   * @readonly
   *
   * @description
   * Optional template overriding bar content.
   *
   * @type {Signal<CwTimelineBarDef | undefined>}
   */
  protected readonly barDef: Signal<CwTimelineBarDef | undefined> = contentChild(CwTimelineBarDef);

  /**
   * Property host
   * @readonly
   *
   * @description
   * Timeline host element used to locate focus targets.
   *
   * @type {HTMLElement}
   */
  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /**
   * Property announcer
   * @readonly
   *
   * @description
   * Live announcer for timeline changes.
   *
   * @type {LiveAnnouncer}
   */
  private readonly announcer: LiveAnnouncer = inject(LiveAnnouncer);

  /**
   * Property now
   * @readonly
   *
   * @description
   * Current local day captured when the timeline is created.
   *
   * @type {Date}
   */
  private readonly now: Date = ɵstartOfDay(new Date());

  /**
   * Property drag
   * @readonly
   *
   * @description
   * Current pointer drag state, or null when idle.
   *
   * @type {WritableSignal<Drag | null>}
   */
  private readonly drag: WritableSignal<Drag | null> = signal<Drag | null>(null);

  /**
   * Property activeKey
   * @readonly
   *
   * @description
   * Key of the active keyboard row.
   *
   * @type {WritableSignal<string | null>}
   */
  private readonly activeKey: WritableSignal<string | null> = signal<string | null>(null);

  /**
   * Property scheduleHover
   * @readonly
   *
   * @description
   * Pointer scheduling preview, when present.
   *
   * @type {WritableSignal<{ key: string; x: number; date: Date } | null>}
   */
  protected readonly scheduleHover: WritableSignal<{ key: string; x: number; date: Date } | null> =
    signal<{ key: string; x: number; date: Date } | null>(null);

  /**
   * Property lastWheel
   *
   * @description
   * Time of the last accepted wheel zoom.
   *
   * @type {number}
   */
  private lastWheel: number = Number.NEGATIVE_INFINITY;

  /**
   * Property todayDate
   * @readonly
   *
   * @description
   * Configured or captured current day normalized to midnight.
   *
   * @type {Signal<Date>}
   */
  protected readonly todayDate: Signal<Date> = computed(() => {
    const today: Date | null = this.today();
    return today ? ɵstartOfDay(today) : this.now;
  });

  /**
   * Property effectiveRange
   * @readonly
   *
   * @description
   * Ordered visible range derived from the input and scale.
   *
   * @type {Signal<CwTimelineRange>}
   */
  protected readonly effectiveRange: Signal<CwTimelineRange> = computed<CwTimelineRange>(() => {
    const range: CwTimelineRange | null = this.range();
    if (!range) return rangeFor(this.scale(), this.todayDate());
    const start: Date = ɵstartOfDay(range.start);
    const end: Date = ɵstartOfDay(range.end);
    return ɵdaysBetween(start, end) >= 0 ? { start, end } : { start: end, end: start };
  });

  /**
   * Property axis
   * @readonly
   *
   * @description
   * Computed axis geometry for the current range and scale.
   *
   * @type {Signal<Axis>}
   */
  protected readonly axis: Signal<Axis> = computed<Axis>(() => {
    const scale: CwTimelineScale = this.scale();
    const zoom: number = this.zoom() > 0 ? this.zoom() : 1;
    const unit: number = UNIT_WIDTHS[scale] * zoom;
    const range: CwTimelineRange = this.effectiveRange();
    const today: Date = this.todayDate();
    if (scale === 'day') return this.dayAxis(range, unit, today);
    if (scale === 'week') return this.weekAxis(range, unit, today);
    return this.monthAxis(range, unit, today);
  });

  /**
   * Property itemsById
   * @readonly
   *
   * @description
   * Items indexed by their identifiers.
   *
   * @type {Signal<Map<string, CwTimelineItem>>}
   */
  private readonly itemsById: Signal<Map<string, CwTimelineItem>> = computed(
    () => new Map(this.items().map((item) => [item.id, item] as const)),
  );

  /**
   * Property liveDates
   * @readonly
   *
   * @description
   * Dates of each dated item including drag previews.
   *
   * @type {Signal<Map<string, Dates>>}
   */
  private readonly liveDates: Signal<Map<string, Dates>> = computed(() => {
    const drag: Drag | null = this.drag();
    const dates: Map<string, Dates> = new Map<string, Dates>();
    for (const item of this.items()) {
      const own: Dates | null = datesOf(item);
      if (!own) continue;
      dates.set(item.id, drag?.ids.includes(item.id) ? this.dragged(own, drag) : own);
    }
    return dates;
  });

  /**
   * Property conflicts
   * @readonly
   *
   * @description
   * Predecessor names indexed by conflicting successor.
   *
   * @type {Signal<Map<string, string>>}
   */
  private readonly conflicts: Signal<Map<string, string>> = computed(() => {
    const dates: Map<string, Dates> = this.liveDates();
    const byId: Map<string, CwTimelineItem> = this.itemsById();
    const found: Map<string, string> = new Map<string, string>();
    for (const dependency of this.dependencies()) {
      const before: Dates | undefined = dates.get(dependency.from);
      const after: Dates | undefined = dates.get(dependency.to);
      if (!before || !after || found.has(dependency.to)) continue;
      if (ɵdaysBetween(after.start, before.end) >= 0) {
        found.set(dependency.to, byId.get(dependency.from)?.name ?? dependency.from);
      }
    }
    return found;
  });

  /**
   * Property sections
   * @readonly
   *
   * @description
   * Group sections and their rendered rows.
   *
   * @type {Signal<readonly Section[]>}
   */
  protected readonly sections: Signal<readonly Section[]> = computed<readonly Section[]>(() => {
    const groups: readonly CwTimelineGroup[] = this.groups();
    const items: readonly CwTimelineItem[] = this.items();
    const milestones: readonly CwMilestone[] = this.milestones();
    const collapsed: Set<string> = new Set<string>(this.collapsedGroups());
    const known: Set<string> = new Set<string>(groups.map((group) => group.id));
    let top: number = 0;
    const place: (visible: boolean) => number | null = (visible: boolean): number | null => {
      if (!visible) return null;
      const current: number = top;
      top += ROW_HEIGHT;
      return current;
    };
    const rowsOf: (
      members: readonly CwTimelineItem[],
      marks: readonly CwMilestone[],
      level: 1 | 2,
      visible: boolean,
    ) => Row[] = (
      members: readonly CwTimelineItem[],
      marks: readonly CwMilestone[],
      level: 1 | 2,
      visible: boolean,
    ): Row[] => {
      // Undated items come last in their group (sheet, "Dans Cadenway").
      const dated: CwTimelineItem[] = members.filter((item) => datesOf(item));
      const undated: CwTimelineItem[] = members.filter((item) => !datesOf(item));
      return [
        ...dated.map((item) => this.itemRow(item, level, place(visible))),
        ...marks.map((mark) => this.milestoneRow(mark, level, place(visible))),
        ...undated.map((item) => this.itemRow(item, level, place(visible))),
      ];
    };
    if (groups.length === 0) {
      return [
        { key: 'all', group: null, expanded: true, rows: rowsOf(items, milestones, 1, true) },
      ];
    }
    const sections: Section[] = groups.map((group) => {
      const expanded: boolean = !collapsed.has(group.id);
      const members: CwTimelineItem[] = items.filter((item) => item.group === group.id);
      const header: GroupRow = this.groupRow(group, members, expanded, place(true));
      const marks: CwMilestone[] = milestones.filter((mark) => mark.group === group.id);
      return {
        key: group.id,
        group: header,
        expanded,
        rows: rowsOf(members, marks, 2, expanded),
      };
    });
    const orphans: CwTimelineItem[] = items.filter((item) => !item.group || !known.has(item.group));
    const orphanMarks: CwMilestone[] = milestones.filter(
      (mark) => !mark.group || !known.has(mark.group),
    );
    if (orphans.length || orphanMarks.length) {
      sections.push({
        key: '',
        group: null,
        expanded: true,
        rows: rowsOf(orphans, orphanMarks, 1, true),
      });
    }
    return sections;
  });

  /**
   * Property visibleRows
   * @readonly
   *
   * @description
   * Keyboard-reachable rows, excluding collapsed children.
   *
   * @type {Signal<Row[]>}
   */
  private readonly visibleRows: Signal<Row[]> = computed(() =>
    this.sections().flatMap((section) => [
      ...(section.group ? [section.group] : []),
      ...(section.expanded ? section.rows : []),
    ]),
  );

  /**
   * Property bodyHeight
   * @readonly
   *
   * @description
   * Height occupied by visible rows.
   *
   * @type {Signal<number>}
   */
  protected readonly bodyHeight: Signal<number> = computed(
    () => this.visibleRows().length * ROW_HEIGHT,
  );

  /**
   * Property tabStop
   * @readonly
   *
   * @description
   * Key of the active or first keyboard-reachable row.
   *
   * @type {Signal<string | null>}
   */
  protected readonly tabStop: Signal<string | null> = computed(() => {
    const rows: Row[] = this.visibleRows();
    const active: string | null = this.activeKey();
    return rows.find((row) => row.key === active)?.key ?? rows.at(0)?.key ?? null;
  });

  /**
   * Property options
   * @readonly
   *
   * @description
   * Focusable options for visible rows.
   *
   * @type {Signal<readonly RowOption[]>}
   */
  private readonly options: Signal<readonly RowOption[]> = computed<readonly RowOption[]>(() =>
    this.visibleRows().map((row) => ({
      key: row.key,
      focus: () => {
        this.focusTarget(row.key)?.focus();
      },
    })),
  );

  /**
   * Property keyManager
   * @readonly
   *
   * @description
   * Keyboard manager for visible timeline rows.
   *
   * @type {FocusKeyManager<RowOption>}
   */
  private readonly keyManager: FocusKeyManager<RowOption> = new FocusKeyManager<RowOption>(
    this.options,
    inject(Injector),
  )
    .withVerticalOrientation()
    .withHomeAndEnd();

  /**
   * Property todayX
   * @readonly
   *
   * @description
   * Position of the today marker within the visible axis.
   *
   * @type {Signal<number | null>}
   */
  protected readonly todayX: Signal<number | null> = computed(() => {
    const axis: Axis = this.axis();
    const x: number = axis.xOf(this.todayDate()) + axis.dayWidth / 2;
    return x >= 0 && x <= axis.width ? Math.round(x * 100) / 100 : null;
  });

  /**
   * Property dependencyLines
   * @readonly
   *
   * @description
   * SVG paths and colors for visible dependency arrows.
   *
   * @type {Signal< { key: string; line: string; head: string; stroke: string }[] >}
   */
  protected readonly dependencyLines: Signal<
    { key: string; line: string; head: string; stroke: string }[]
  > = computed(() => {
    if (!this.showDependencies()) return [];
    const rows: Map<string, ItemRow> = new Map<string, ItemRow>();
    for (const row of this.visibleRows()) if (row.kind === 'item') rows.set(row.item.id, row);
    return this.dependencies().flatMap((dependency) => {
      const from: ItemRow | undefined = rows.get(dependency.from);
      const to: ItemRow | undefined = rows.get(dependency.to);
      if (!from?.bar || !to?.bar || from.top === null || to.top === null) return [];
      const x1: number = from.bar.x + from.bar.width;
      const y1: number = from.top + ROW_HEIGHT / 2;
      const x2: number = to.bar.x;
      const y2: number = to.top + ROW_HEIGHT / 2;
      const conflict: boolean =
        !!from.dates && !!to.dates && ɵdaysBetween(to.dates.start, from.dates.end) >= 0;
      return [
        {
          key: `${dependency.from}>${dependency.to}`,
          line: dependencyPath(x1, y1, x2, y2),
          head: arrowHead(x2, y2),
          stroke: conflict ? 'stroke-destructive' : 'stroke-muted-foreground',
        },
      ];
    });
  });

  /**
   * Property dragTip
   * @readonly
   *
   * @description
   * Position and text of the active move tooltip.
   *
   * @type {Signal<{ text: string; x: number; y: number } | null>}
   */
  protected readonly dragTip: Signal<{ text: string; x: number; y: number } | null> = computed(
    () => {
      const drag: Drag | null = this.drag();
      if (!drag || drag.mode === 'link' || !drag.moved) return null;
      const row: ItemRow | undefined = this.visibleRows().find(
        (candidate): candidate is ItemRow =>
          candidate.kind === 'item' && candidate.item.id === drag.id,
      );
      if (!row?.bar || !row.dates || row.top === null) return null;
      return {
        text: moveText(row.dates.start, row.dates.end),
        x: this.nameColumnWidth() + row.bar.x + row.bar.width / 2,
        y: row.top >= 30 ? row.top - 28 : row.top + ROW_HEIGHT + 2,
      };
    },
  );

  /**
   * Property scheduleDefaultX
   * @readonly
   *
   * @description
   * Fallback horizontal scheduling position for an undated row.
   *
   * @type {Signal<number>}
   */
  protected readonly scheduleDefaultX: Signal<number> = computed(() => {
    const axis: Axis = this.axis();
    const x: number = axis.xOf(this.todayDate());
    return x >= 0 && x < axis.width ? x : 8;
  });

  /**
   * Property nameCells
   * @readonly
   *
   * @description
   * Name cell classes by tree level.
   *
   * @type {typeof NAME_CELLS}
   */
  protected readonly nameCells: typeof NAME_CELLS = NAME_CELLS;

  /**
   * Property groupNameCell
   * @readonly
   *
   * @description
   * Group name cell classes.
   *
   * @type {string}
   */
  protected readonly groupNameCell: string = GROUP_NAME_CELL;

  /**
   * Property trackCell
   * @readonly
   *
   * @description
   * Track cell classes.
   *
   * @type {string}
   */
  protected readonly trackCell: string = TRACK_CELL;

  /**
   * Property columnCell
   * @readonly
   *
   * @description
   * Ruler column classes for the current scale.
   *
   * @type {Signal<string>}
   */
  protected readonly columnCell: Signal<string> = computed(() => COLUMN_CELLS[this.scale()]);
  // #endregion

  // #region Methods
  /**
   * Method scheduleX
   * @method scheduleX
   *
   * @description
   * Returns the horizontal scheduling position for an undated row.
   *
   * @param {ItemRow} row - Undated item row to position.
   *
   * @returns {number} Horizontal scheduling position in pixels.
   */
  protected scheduleX(row: ItemRow): number {
    const hover: { key: string; x: number; date: Date } | null = this.scheduleHover();
    return hover?.key === row.key ? hover.x : this.scheduleDefaultX();
  }

  /**
   * Method onFocusin
   * @method onFocusin
   *
   * @description
   * Tracks the row that received keyboard focus.
   *
   * @param {FocusEvent} event - Focus event from a timeline row.
   */
  protected onFocusin(event: FocusEvent): void {
    const key: string | null = this.keyOf(event.target);
    if (key === null) return;
    this.activeKey.set(key);
    const option: RowOption | undefined = this.options().find((candidate) => candidate.key === key);
    if (option) this.keyManager.updateActiveItem(option);
  }

  /**
   * Method onKeydown
   * @method onKeydown
   *
   * @description
   * Handles timeline keyboard navigation and shortcuts.
   *
   * @param {KeyboardEvent} event - Keyboard event from the timeline.
   */
  protected onKeydown(event: KeyboardEvent): void {
    if (this.globalShortcut(event)) {
      event.preventDefault();
      return;
    }
    const key: string | null = this.keyOf(event.target);
    if (key === null) return;
    const row: Row | undefined = this.visibleRows().find((candidate) => candidate.key === key);
    if (!row) return;
    if (['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
      const option: RowOption | undefined = this.options().find(
        (candidate) => candidate.key === key,
      );
      if (option) this.keyManager.updateActiveItem(option);
      if (ɵnavigateList(this.keyManager, event, 'vertical')) {
        event.preventDefault();
        const active: (FocusableOption & RowOption) | null = this.keyManager.activeItem;
        if (active) this.activeKey.set(active.key);
      }
      return;
    }
    if (row.kind === 'group') this.groupKey(event, row);
    else if (row.kind === 'item') this.itemKey(event, row);
  }

  /**
   * Method onWheel
   * @method onWheel
   *
   * @description
   * Applies throttled zoom for modified wheel input.
   *
   * @param {WheelEvent} event - Wheel event used for modified zoom.
   */
  protected onWheel(event: WheelEvent): void {
    if (!(event.ctrlKey || event.metaKey)) return;
    event.preventDefault();
    if (event.timeStamp - this.lastWheel < WHEEL_THROTTLE) return;
    this.lastWheel = event.timeStamp;
    this.zoomBy(event.deltaY < 0 ? 1 : -1);
  }

  /**
   * Method toggleGroup
   * @method toggleGroup
   *
   * @description
   * Toggles a group between collapsed and expanded states.
   *
   * @param {string} id - Identifier of the group to toggle.
   */
  protected toggleGroup(id: string): void {
    this.collapsedGroups.update((groups) =>
      groups.includes(id) ? groups.filter((group) => group !== id) : [...groups, id],
    );
  }

  /**
   * Method onBarPointerDown
   * @method onBarPointerDown
   *
   * @description
   * Starts a bar move, resize or dependency drag.
   *
   * @param {PointerEvent} event - Pointer event starting the interaction.
   * @param {ItemRow} row - Item row containing the bar.
   */
  protected onBarPointerDown(event: PointerEvent, row: ItemRow): void {
    if (event.button !== 0 || !row.dates) return;
    const bar: HTMLElement = event.currentTarget as HTMLElement;
    bar.focus();
    if (this.readonly()) return;
    const edge: string | null | undefined = (event.target as Element)
      .closest('[data-edge]')
      ?.getAttribute('data-edge');
    const mode: 'end' | 'link' | 'start' | 'move' =
      edge === 'end' && event.altKey
        ? 'link'
        : edge === 'start'
          ? 'start'
          : edge === 'end'
            ? 'end'
            : 'move';
    const selection: readonly string[] = this.selection();
    const ids: readonly string[] =
      mode === 'move' && selection.includes(row.item.id) ? selection : [row.item.id];
    this.drag.set({
      id: row.item.id,
      ids,
      mode,
      originX: event.clientX,
      delta: 0,
      moved: false,
      additive: event.ctrlKey || event.metaKey,
    });
    try {
      bar.setPointerCapture(event.pointerId);
    } catch {
      // Test DOMs have no pointer capture; the events still reach the bar.
    }
    // No text selection and no native drag while the bar follows the pointer.
    event.preventDefault();
  }

  /**
   * Method onBarPointerMove
   * @method onBarPointerMove
   *
   * @description
   * Updates the active bar drag in day increments.
   *
   * @param {PointerEvent} event - Pointer event updating the drag.
   */
  protected onBarPointerMove(event: PointerEvent): void {
    const drag: Drag | null = this.drag();
    if (!drag || drag.mode === 'link') return;
    // Steps of one day whatever the scale (sheet, "Barre en déplacement").
    const delta: number = Math.round((event.clientX - drag.originX) / this.axis().dayWidth);
    if (delta !== drag.delta) this.drag.set({ ...drag, delta, moved: true });
  }

  /**
   * Method onBarPointerUp
   * @method onBarPointerUp
   *
   * @description
   * Completes a drag, selection or dependency request.
   *
   * @param {PointerEvent} event - Pointer event ending the interaction.
   * @param {ItemRow} row - Item row containing the bar.
   */
  protected onBarPointerUp(event: PointerEvent, row: ItemRow): void {
    const drag: Drag | null = this.drag();
    this.drag.set(null);
    if (!drag) return;
    if (drag.mode === 'link') {
      const target: HTMLElement | null | undefined = this.host.ownerDocument
        .elementFromPoint(event.clientX, event.clientY)
        ?.closest<HTMLElement>('[data-bar-id]');
      const to: string | undefined = target?.dataset['barId'];
      if (to && to !== drag.id) this.dependencyCreate.emit({ from: drag.id, to });
      return;
    }
    if (!drag.moved || drag.delta === 0) {
      this.select(row.item.id, drag.additive);
      return;
    }
    const changes: { item: CwTimelineItem; own: Dates; next: Dates }[] = drag.ids.flatMap((id) => {
      const item: CwTimelineItem | undefined = this.itemsById().get(id);
      const own: Dates | null = item ? datesOf(item) : null;
      return item && own ? [{ item, own, next: this.dragged(own, drag) }] : [];
    });
    this.commit(changes);
  }

  /**
   * Method onBarPointerCancel
   * @method onBarPointerCancel
   *
   * @description
   * Cancels the active pointer drag.
   */
  protected onBarPointerCancel(): void {
    this.drag.set(null);
  }

  /**
   * Method onTrackPointerMove
   * @method onTrackPointerMove
   *
   * @description
   * Updates the scheduling preview for an undated row.
   *
   * @param {PointerEvent} event - Pointer event updating the preview.
   * @param {ItemRow} row - Undated item row being scheduled.
   */
  protected onTrackPointerMove(event: PointerEvent, row: ItemRow): void {
    if (row.dates || this.readonly()) return;
    const track: HTMLElement = event.currentTarget as HTMLElement;
    const x: number = event.clientX - track.getBoundingClientRect().left;
    const date: Date = this.dateAt(x);
    this.scheduleHover.set({ key: row.key, x: this.axis().xOf(date), date });
  }

  /**
   * Method planify
   * @method planify
   *
   * @description
   * Requests scheduling of an undated item.
   *
   * @param {ItemRow} row - Undated item row to schedule.
   */
  protected planify(row: ItemRow): void {
    const hover: { key: string; x: number; date: Date } | null = this.scheduleHover();
    const date: Date = hover?.key === row.key ? hover.date : this.todayDate();
    this.schedule.emit({ item: row.item, start: date, end: date });
  }

  /**
   * Method statusLabel
   * @method statusLabel
   *
   * @description
   * Returns the French label for an item status.
   *
   * @param {CwTimelineItem} item - Item whose status is labeled.
   *
   * @returns {string} French status label.
   */
  protected statusLabel(item: CwTimelineItem): string {
    return item.status ? CW_STATUS_LABELS[item.status] : '';
  }

  /**
   * Method percentOf
   * @method percentOf
   *
   * @description
   * Formats an item completion percentage.
   *
   * @param {CwTimelineItem} item - Item whose progress is formatted.
   *
   * @returns {string} Formatted completion percentage.
   */
  protected percentOf(item: CwTimelineItem): string {
    return TEXTS.percent(clampProgress(item.progress));
  }

  /**
   * Method dayAxis
   * @method dayAxis
   *
   * @description
   * Builds ruler geometry for a day scale.
   *
   * @param {CwTimelineRange} range - Displayed date range.
   * @param {number} unit - Width of a day unit in pixels.
   * @param {Date} today - Date used to mark today.
   *
   * @returns {Axis} Day-scale ruler geometry.
   */
  private dayAxis(range: CwTimelineRange, unit: number, today: Date): Axis {
    const weekends: boolean = this.showWeekends();
    const columns: Column[] = [];
    for (let day: Date = range.start; ɵdaysBetween(day, range.end) >= 0; day = ɵaddDays(day, 1)) {
      if (!weekends && isWeekend(day)) continue;
      columns.push({
        key: day.toDateString(),
        date: day,
        x: columns.length * unit,
        width: unit,
        label: weekdayShort(day),
        sub: String(day.getDate()),
        today: ɵsameDay(day, today),
        weekend: weekends && isWeekend(day),
        separator: columns.length > 0 && day.getDay() === 1,
      });
    }
    const bands: Band[] = [];
    for (const column of columns) {
      const monday: string = ɵstartOfWeek(column.date).toDateString();
      const last: Band | undefined = bands.at(-1);
      if (last?.key === monday) {
        bands[bands.length - 1] = {
          ...last,
          width: last.width + column.width,
          sub: periodText(
            ɵstartOfWeek(column.date) < range.start ? range.start : ɵstartOfWeek(column.date),
            column.date,
          ),
        };
      } else {
        bands.push({
          key: monday,
          x: column.x,
          width: column.width,
          label: TEXTS.week(ɵisoWeek(column.date)),
          sub: periodText(column.date, column.date),
          separator: bands.length > 0,
        });
      }
    }
    const start: Date = range.start;
    const xOf: (date: Date) => number = (date: Date): number => {
      const days: number = ɵdaysBetween(start, date);
      if (weekends) return days * unit;
      return (
        (days >= 0 ? workingDaysBetween(start, date) : -workingDaysBetween(date, start)) * unit
      );
    };
    return {
      scale: 'day',
      start,
      end: range.end,
      width: columns.length * unit,
      dayWidth: unit,
      columns,
      bands,
      xOf,
    };
  }

  /**
   * Method weekAxis
   * @method weekAxis
   *
   * @description
   * Builds ruler geometry for a week scale.
   *
   * @param {CwTimelineRange} range - Displayed date range.
   * @param {number} unit - Width of a day unit in pixels.
   * @param {Date} today - Date used to mark today.
   *
   * @returns {Axis} Week-scale ruler geometry.
   */
  private weekAxis(range: CwTimelineRange, unit: number, today: Date): Axis {
    const start: Date = ɵstartOfWeek(range.start);
    const end: Date = ɵaddDays(ɵstartOfWeek(range.end), 6);
    const columns: Column[] = [];
    for (let monday: Date = start; ɵdaysBetween(monday, end) >= 0; monday = ɵaddDays(monday, 7)) {
      const offset: number = ɵdaysBetween(monday, today);
      columns.push({
        key: monday.toDateString(),
        date: monday,
        x: columns.length * unit,
        width: unit,
        label: TEXTS.weekShort(ɵisoWeek(monday)),
        sub: dayMonth(monday),
        today: offset >= 0 && offset < 7,
        weekend: false,
        separator: columns.length > 0,
      });
    }
    const width: number = columns.length * unit;
    const xOf: (date: Date) => number = (date: Date): number =>
      (ɵdaysBetween(start, date) / 7) * unit;
    const bands: Band[] = [];
    for (
      let month: Date = ɵstartOfMonth(start);
      ɵdaysBetween(month, end) >= 0;
      month = ɵaddMonths(month, 1)
    ) {
      const x: number = Math.max(0, xOf(month));
      const right: number = Math.min(width, xOf(ɵaddMonths(month, 1)));
      bands.push({
        key: month.toDateString(),
        x,
        width: right - x,
        label: monthShort(month),
        sub: String(month.getFullYear()),
        separator: bands.length > 0,
      });
    }
    return { scale: 'week', start, end, width, dayWidth: unit / 7, columns, bands, xOf };
  }

  /**
   * Method monthAxis
   * @method monthAxis
   *
   * @description
   * Builds ruler geometry for a month scale.
   *
   * @param {CwTimelineRange} range - Displayed date range.
   * @param {number} unit - Width of a day unit in pixels.
   * @param {Date} today - Date used to mark today.
   *
   * @returns {Axis} Month-scale ruler geometry.
   */
  private monthAxis(range: CwTimelineRange, unit: number, today: Date): Axis {
    const start: Date = ɵstartOfMonth(range.start);
    const end: Date = ɵaddDays(ɵaddMonths(ɵstartOfMonth(range.end), 1), -1);
    const columns: Column[] = [];
    for (let month: Date = start; ɵdaysBetween(month, end) >= 0; month = ɵaddMonths(month, 1)) {
      columns.push({
        key: month.toDateString(),
        date: month,
        x: columns.length * unit,
        width: unit,
        label: monthShort(month),
        sub: '',
        today: monthsBetween(month, today) === 0,
        weekend: false,
        separator: columns.length > 0,
      });
    }
    const width: number = columns.length * unit;
    const xOf: (date: Date) => number = (date: Date): number =>
      (monthsBetween(start, date) + (date.getDate() - 1) / ɵdaysInMonth(date)) * unit;
    const bands: Band[] = [];
    for (const column of columns) {
      const year: string = String(column.date.getFullYear());
      const last: Band | undefined = bands.at(-1);
      if (last?.key === year) {
        bands[bands.length - 1] = { ...last, width: last.width + column.width };
      } else {
        bands.push({
          key: year,
          x: column.x,
          width: column.width,
          label: year,
          sub: '',
          separator: bands.length > 0,
        });
      }
    }
    // A month is 30.44 days on average: the pointer still moves bars by whole days.
    return { scale: 'month', start, end, width, dayWidth: unit / 30.44, columns, bands, xOf };
  }

  /**
   * Method groupRow
   * @method groupRow
   *
   * @description
   * Builds the display row and summary bar for a group.
   *
   * @param {CwTimelineGroup} group - Group represented by the row.
   * @param {readonly CwTimelineItem[]} members - Items belonging to the group.
   * @param {boolean} expanded - Whether group members are expanded.
   * @param {number | null} top - Vertical row position, or null when unmeasured.
   *
   * @returns {GroupRow} Display row for the group.
   */
  private groupRow(
    group: CwTimelineGroup,
    members: readonly CwTimelineItem[],
    expanded: boolean,
    top: number | null,
  ): GroupRow {
    const dated: Dates[] = members
      .map((item) => this.liveDates().get(item.id))
      .filter((dates) => !!dates);
    const first: Date | undefined = group.start
      ? ɵstartOfDay(group.start)
      : dated
          .map((d) => d.start)
          .sort((a, b) => +a - +b)
          .at(0);
    const last: Date | undefined = group.end
      ? ɵstartOfDay(group.end)
      : dated
          .map((d) => d.end)
          .sort((a, b) => +b - +a)
          .at(0);
    const progress: number =
      group.progress ??
      (members.length
        ? members.reduce((sum, item) => sum + clampProgress(item.progress), 0) / members.length
        : 0);
    const count: string = String(members.length);
    let bar: GroupRow['bar'] = null;
    if (first && last) {
      const axis: Axis = this.axis();
      const left: number = axis.xOf(first);
      const right: number = axis.xOf(ɵaddDays(last, 1));
      const x: number = Math.max(0, left);
      const end: number = Math.min(axis.width, right);
      if (end > x) {
        const clippedLeft: boolean = left < 0;
        const clippedRight: boolean = right > axis.width;
        const rounding: 'rounded-none' | 'rounded-r-full' | 'rounded-l-full' | 'rounded-full' =
          clippedLeft
            ? clippedRight
              ? GROUP_BAR_ROUNDING.none
              : GROUP_BAR_ROUNDING.left
            : clippedRight
              ? GROUP_BAR_ROUNDING.right
              : GROUP_BAR_ROUNDING.both;
        bar = { x, width: end - x, progress: clampProgress(progress), rounding };
      }
    }
    return {
      kind: 'group',
      key: `g:${group.id}`,
      level: 1,
      top,
      group,
      expanded,
      meta: first && last ? `${periodText(first, last)} · ${count}` : count,
      bar,
    };
  }

  /**
   * Method itemRow
   * @method itemRow
   *
   * @description
   * Builds the display row for an item.
   *
   * @param {CwTimelineItem} item - Item represented by the row.
   * @param {1 | 2} level - Nesting level of the row.
   * @param {number | null} top - Vertical row position, or null when unmeasured.
   *
   * @returns {ItemRow} Display row for the item.
   */
  private itemRow(item: CwTimelineItem, level: 1 | 2, top: number | null): ItemRow {
    const dates: Dates | null = this.liveDates().get(item.id) ?? null;
    const selected: boolean = this.selection().includes(item.id);
    const drag: Drag | null = this.drag();
    const dragging: boolean =
      !!drag && drag.mode !== 'link' && drag.moved && drag.ids.includes(item.id);
    const own: Dates | null = datesOf(item);
    return {
      kind: 'item',
      key: `i:${item.id}`,
      level,
      top,
      item,
      dates,
      selected,
      bar: dates ? this.barView(item, dates, selected, dragging, drag) : null,
      ghost: dragging && own ? this.span(own) : null,
    };
  }

  /**
   * Method milestoneRow
   * @method milestoneRow
   *
   * @description
   * Builds the display row for a milestone.
   *
   * @param {CwMilestone} mark - Milestone represented by the row.
   * @param {1 | 2} level - Nesting level of the row.
   * @param {number | null} top - Vertical row position, or null when unmeasured.
   *
   * @returns {MilestoneRow} Display row for the milestone.
   */
  private milestoneRow(mark: CwMilestone, level: 1 | 2, top: number | null): MilestoneRow {
    const axis: Axis = this.axis();
    const date: Date = ɵstartOfDay(mark.date);
    const x: number = axis.xOf(date) + axis.dayWidth / 2;
    const inside: boolean = x >= 0 && x <= axis.width;
    return {
      kind: 'milestone',
      key: `m:${mark.id}`,
      level,
      top,
      milestone: mark,
      x: inside ? x : null,
      // Near the right edge the label goes left of the diamond (sheet, "Jalon").
      before: x > axis.width - 160,
      dateText: dayMonth(date),
      ariaLabel: TEXTS.milestone(mark.label, dayMonth(date)),
    };
  }

  /**
   * Method span
   * @method span
   *
   * @description
   * Calculates the visible horizontal span of an item date range.
   *
   * @param {Dates} dates - Inclusive date range to position.
   *
   * @returns {{ x: number; width: number } | null} Visible horizontal geometry, or null when outside the range.
   */
  private span(dates: Dates): { x: number; width: number } | null {
    const axis: Axis = this.axis();
    const left: number = axis.xOf(dates.start);
    const right: number = axis.xOf(ɵaddDays(dates.end, 1));
    const x: number = Math.max(0, left);
    const end: number = Math.min(axis.width, right);
    if (end <= 0 || x >= axis.width) return null;
    return { x, width: Math.max(end - x, 6) };
  }

  /**
   * Method barView
   * @method barView
   *
   * @description
   * Builds the visual state and geometry of an item bar.
   *
   * @param {CwTimelineItem} item - Item represented by the bar.
   * @param {Dates} dates - Item date range.
   * @param {boolean} selected - Whether the item is selected.
   * @param {boolean} dragging - Whether the bar is being dragged.
   * @param {Drag | null} drag - Current drag state, or null when absent.
   *
   * @returns {BarView | null} Bar display state and geometry, or null when outside the range.
   */
  private barView(
    item: CwTimelineItem,
    dates: Dates,
    selected: boolean,
    dragging: boolean,
    drag: Drag | null,
  ): BarView | null {
    const span: { x: number; width: number } | null = this.span(dates);
    if (!span) return null;
    const axis: Axis = this.axis();
    const today: Date = this.todayDate();
    const progress: number = clampProgress(item.progress);
    const lateDays: number =
      (item.late ?? (ɵdaysBetween(dates.end, today) > 0 && progress < 100))
        ? Math.max(1, ɵdaysBetween(dates.end, today))
        : 0;
    const predecessor: string | null = this.conflicts().get(item.id) ?? null;
    const tone: Tone = toneOf(item);
    const nameInside: boolean = span.width >= NAME_INSIDE;
    const outsideNeeded: boolean = !nameInside || lateDays > 0;
    const before: boolean = span.x + span.width + 160 > axis.width && span.x > 160;
    // The percentage follows the name, as on the bar, so the accessible name starts with the
    // visible text (WCAG 2.5.3, Label in Name); the sheet puts the status before it.
    const parts: string[] = [
      item.name,
      item.progress === undefined ? null : TEXTS.percent(progress),
      item.status ? CW_STATUS_LABELS[item.status] : null,
      rangeText(dates.start, dates.end),
      lateDays ? TEXTS.lateLong(lateDays) : null,
      predecessor ? TEXTS.conflict(predecessor) : null,
    ].filter((part) => part !== null);
    const readonly: boolean = this.readonly();
    const classes: string = [
      BAR,
      TONES[tone],
      readonly ? '' : dragging ? BAR_DRAGGING : BAR_GRAB,
      selected ? BAR_SELECTED : '',
      dragging ? '' : BAR_IDLE,
    ]
      .filter((part) => part !== '')
      .join(' ');
    return {
      x: span.x,
      width: span.width,
      classes,
      ariaLabel: parts.join(', '),
      tone,
      progress: progress > 0 && progress < 100 ? progress : null,
      percent:
        span.width >= PERCENT_INSIDE && item.progress !== undefined
          ? TEXTS.percent(progress)
          : null,
      nameInside,
      outside: outsideNeeded ? { x: before ? span.x - 4 : span.x + span.width + 4, before } : null,
      late: lateDays ? TEXTS.late(lateDays) : null,
      conflict: predecessor !== null,
      dragging,
      resizing: dragging && (drag?.mode === 'start' || drag?.mode === 'end'),
      resizable: !readonly && span.width >= 18,
    };
  }

  /**
   * Method dragged
   * @method dragged
   *
   * @description
   * Computes item dates after the current drag.
   *
   * @param {Dates} dates - Original item dates.
   * @param {Drag} drag - Current drag state.
   *
   * @returns {Dates} Dates resulting from the drag.
   */
  private dragged(dates: Dates, drag: Drag): Dates {
    const { delta }: Drag = drag;
    switch (drag.mode) {
      case 'start': {
        const start: Date = ɵaddDays(dates.start, delta);
        return { start: ɵdaysBetween(start, dates.end) >= 0 ? start : dates.end, end: dates.end };
      }
      case 'end': {
        const end: Date = ɵaddDays(dates.end, delta);
        return { start: dates.start, end: ɵdaysBetween(dates.start, end) >= 0 ? end : dates.start };
      }
      case 'move':
        return { start: ɵaddDays(dates.start, delta), end: ɵaddDays(dates.end, delta) };
      case 'link':
        return dates;
    }
  }

  /**
   * Method dateAt
   * @method dateAt
   *
   * @description
   * Finds the date at a horizontal position on the axis.
   *
   * @param {number} x - Horizontal axis position in pixels.
   *
   * @returns {Date} Date at the requested position.
   */
  private dateAt(x: number): Date {
    const axis: Axis = this.axis();
    if (axis.scale === 'day') {
      const column: Column =
        axis.columns[Math.max(0, Math.min(axis.columns.length - 1, Math.floor(x / axis.dayWidth)))];
      return column.date;
    }
    return ɵaddDays(axis.start, Math.max(0, Math.floor(x / axis.dayWidth)));
  }

  /**
   * Method keyOf
   * @method keyOf
   *
   * @description
   * Finds a focus key from an event target.
   *
   * @param {EventTarget | null} target - Event target to inspect.
   *
   * @returns {string | null} Focus key, or null when no key is associated.
   */
  private keyOf(target: EventTarget | null): string | null {
    if (!(target instanceof Element)) return null;
    return target.closest<HTMLElement>('[data-focus-key]')?.dataset['focusKey'] ?? null;
  }

  /**
   * Method focusTarget
   * @method focusTarget
   *
   * @description
   * Finds the element associated with a focus key.
   *
   * @param {string} key - Focus key identifying the target.
   *
   * @returns {HTMLElement | null} Matching element, or null when absent.
   */
  private focusTarget(key: string): HTMLElement | null {
    return (
      Array.from(this.host.querySelectorAll<HTMLElement>('[data-focus-key]')).find(
        (element) => element.dataset['focusKey'] === key,
      ) ?? null
    );
  }

  /**
   * Method globalShortcut
   * @method globalShortcut
   *
   * @description
   * Handles timeline-wide keyboard shortcuts.
   *
   * @param {KeyboardEvent} event - Keyboard event to handle.
   *
   * @returns {boolean} Whether a timeline-wide shortcut was handled.
   */
  private globalShortcut(event: KeyboardEvent): boolean {
    const ctrl: boolean = event.ctrlKey || event.metaKey;
    if (ctrl && (event.key === '+' || event.key === '=')) {
      this.zoomBy(1);
      return true;
    }
    if (ctrl && event.key === '-') {
      this.zoomBy(-1);
      return true;
    }
    if (ctrl && event.key === '0') {
      this.zoom.set(1);
      void this.announcer.announce(TEXTS.zoom(100), 'polite');
      return true;
    }
    if (event.key === 'Escape') {
      if (this.drag()) {
        this.drag.set(null);
        return true;
      }
      if (this.selection().length) {
        this.selection.set([]);
        return true;
      }
      return false;
    }
    if (event.key === 'PageUp' || event.key === 'PageDown') {
      this.range.set(
        shiftByPage(this.effectiveRange(), this.scale(), event.key === 'PageUp' ? -1 : 1),
      );
      return true;
    }
    if (ctrl || event.altKey || event.shiftKey) return false;
    switch (event.key.toLowerCase()) {
      case 't':
        this.range.set(rangeFor(this.scale(), this.todayDate()));
        return true;
      case 'j':
        this.applyScale('day', 1);
        return true;
      case 's':
        this.applyScale('week', 1);
        return true;
      case 'm':
        this.applyScale('month', 1);
        return true;
      default:
        return false;
    }
  }

  /**
   * Method groupKey
   * @method groupKey
   *
   * @description
   * Handles expansion keys for a group row.
   *
   * @param {KeyboardEvent} event - Keyboard event from the row.
   * @param {GroupRow} row - Group row receiving the event.
   */
  private groupKey(event: KeyboardEvent, row: GroupRow): void {
    const expand: boolean = event.key === 'ArrowRight';
    const collapse: boolean = event.key === 'ArrowLeft';
    if ((expand && !row.expanded) || (collapse && row.expanded) || event.key === 'Enter') {
      event.preventDefault();
      this.toggleGroup(row.group.id);
    } else if (expand || collapse) {
      event.preventDefault();
    }
  }

  /**
   * Method itemKey
   * @method itemKey
   *
   * @description
   * Handles selection, opening and date changes for an item row.
   *
   * @param {KeyboardEvent} event - Keyboard event from the row.
   * @param {ItemRow} row - Item row receiving the event.
   */
  private itemKey(event: KeyboardEvent, row: ItemRow): void {
    if (event.key === ' ') {
      event.preventDefault();
      this.select(row.item.id, event.ctrlKey || event.metaKey);
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      if (row.dates) this.open.emit(row.item);
      else if (!this.readonly()) {
        const today: Date = this.todayDate();
        this.schedule.emit({ item: row.item, start: today, end: today });
      }
      return;
    }
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const own: Dates | null = datesOf(row.item);
    if (!own || this.readonly()) return;
    const step: 1 | -1 = event.key === 'ArrowRight' ? 1 : -1;
    const scale: CwTimelineScale = this.scale();
    let next: Dates;
    if (event.shiftKey) {
      const end: Date = shiftByUnit(own.end, scale, step);
      next = { start: own.start, end: ɵdaysBetween(own.start, end) >= 0 ? end : own.start };
    } else if (event.altKey) {
      const start: Date = shiftByUnit(own.start, scale, step);
      next = { start: ɵdaysBetween(start, own.end) >= 0 ? start : own.end, end: own.end };
    } else {
      next = { start: shiftByUnit(own.start, scale, step), end: shiftByUnit(own.end, scale, step) };
    }
    this.commit([{ item: row.item, own, next }]);
  }

  /**
   * Method select
   * @method select
   *
   * @description
   * Updates item selection with or without the additive modifier.
   *
   * @param {string} id - Identifier of the item to select.
   * @param {boolean} additive - Whether to preserve other selected items.
   */
  private select(id: string, additive: boolean): void {
    this.selection.update((selection) => {
      if (additive) {
        return selection.includes(id)
          ? selection.filter((candidate) => candidate !== id)
          : [...selection, id];
      }
      return selection.length === 1 && selection[0] === id ? [] : [id];
    });
  }

  /**
   * Method commit
   * @method commit
   *
   * @description
   * Emits changed dates and newly introduced dependency conflicts.
   *
   * @param {readonly { item: CwTimelineItem; own: Dates; next: Dates }[]} changes - Item date changes and their original ranges.
   */
  private commit(changes: readonly { item: CwTimelineItem; own: Dates; next: Dates }[]): void {
    const moved: { item: CwTimelineItem; own: Dates; next: Dates }[] = changes.filter(
      (change) =>
        !ɵsameDay(change.own.start, change.next.start) ||
        !ɵsameDay(change.own.end, change.next.end),
    );
    if (moved.length === 0) return;
    const before: Map<string, Dates> = new Map<string, Dates>();
    const after: Map<string, Dates> = new Map<string, Dates>();
    for (const item of this.items()) {
      const own: Dates | null = datesOf(item);
      if (own) {
        before.set(item.id, own);
        after.set(item.id, own);
      }
    }
    for (const change of moved) after.set(change.item.id, change.next);
    const messages: string[] = [];
    for (const change of moved) {
      this.itemChange.emit({
        item: change.item,
        start: change.next.start,
        end: change.next.end,
        previous: change.own,
      });
      messages.push(TEXTS.moved(change.item.name, rangeText(change.next.start, change.next.end)));
    }
    const ids: Set<string> = new Set<string>(moved.map((change) => change.item.id));
    const byId: Map<string, CwTimelineItem> = this.itemsById();
    for (const dependency of this.dependencies()) {
      if (!ids.has(dependency.from) && !ids.has(dependency.to)) continue;
      const overlap: (dates: Map<string, Dates>) => number = (
        dates: Map<string, Dates>,
      ): number => {
        const from: Dates | undefined = dates.get(dependency.from);
        const to: Dates | undefined = dates.get(dependency.to);
        return from && to ? ɵdaysBetween(to.start, from.end) + 1 : 0;
      };
      const overlapDays: number = overlap(after);
      if (overlapDays > 0 && overlap(before) <= 0) {
        this.conflict.emit({ dependency, overlapDays });
        messages.push(
          TEXTS.conflictAnnounce(
            byId.get(dependency.to)?.name ?? dependency.to,
            byId.get(dependency.from)?.name ?? dependency.from,
          ),
        );
      }
    }
    void this.announcer.announce(messages.join('. '), 'polite');
  }

  /**
   * Method zoomBy
   * @method zoomBy
   *
   * @description
   * Moves to the next or previous zoom step.
   *
   * @param {number} step - Signed direction of the zoom step.
   */
  private zoomBy(step: number): void {
    const scale: CwTimelineScale = this.scale();
    const zoom: number = this.zoom();
    let index: number = ZOOM_LADDER.findIndex(
      ([s, m]: readonly [CwTimelineScale, number]) => s === scale && m === zoom,
    );
    if (index < 0)
      index = ZOOM_LADDER.findIndex(([s]: readonly [CwTimelineScale, number]) => s === scale);
    const next: number = Math.max(0, Math.min(ZOOM_LADDER.length - 1, index + step));
    if (next === index) return;
    const [nextScale, nextZoom]: readonly [CwTimelineScale, number] = ZOOM_LADDER[next];
    this.applyScale(nextScale, nextZoom);
  }

  /**
   * Method applyScale
   * @method applyScale
   *
   * @description
   * Applies a scale and zoom while preserving the visible midpoint.
   *
   * @param {CwTimelineScale} scale - Scale to apply.
   * @param {number} zoom - Zoom level to apply.
   */
  private applyScale(scale: CwTimelineScale, zoom: number): void {
    const current: CwTimelineScale = this.scale();
    if (scale !== current) {
      const range: CwTimelineRange = this.effectiveRange();
      const middle: Date = ɵaddDays(
        range.start,
        Math.floor(ɵdaysBetween(range.start, range.end) / 2),
      );
      this.scale.set(scale);
      this.zoom.set(zoom);
      // Keep the middle of the period in view when the scale changes (mockup `App.dc.html`, `go`).
      this.range.set(rangeFor(scale, middle));
      void this.announcer.announce(TEXTS.scale(scale), 'polite');
      return;
    }
    if (zoom === this.zoom()) return;
    this.zoom.set(zoom);
    void this.announcer.announce(TEXTS.zoom(Math.round(zoom * 100)), 'polite');
  }
  // #endregion
}
