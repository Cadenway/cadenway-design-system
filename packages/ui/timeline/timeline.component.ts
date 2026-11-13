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
} from '@angular/core';
import { CwAvatar } from '@cadenway/ui/avatar';
import { ɵnavigateList } from '@cadenway/ui/core';
import { CW_STATUS_LABELS, CwStatusIcon } from '@cadenway/ui/status-icon';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCalendarPlusBold, phosphorCaretDownBold } from '@ng-icons/phosphor-icons/bold';
import { phosphorDiamondFill, phosphorWarningCircleFill } from '@ng-icons/phosphor-icons/fill';

import { CwTimelineBarDef } from './timeline-bar/timeline-bar.directive';
import {
  addDays,
  addMonths,
  dayMonth,
  daysInMonth,
  diffDays,
  firstOfMonth,
  isoWeek,
  isWeekend,
  mondayOf,
  monthShort,
  moveText,
  periodText,
  rangeText,
  sameDay,
  startOfDay,
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

/* Literal class strings (Timeline sheet and preview of the Design System artifact), so Tailwind
   finds them in the compiled package. */
type Tone = 'progress' | 'done' | 'blocked' | 'neutral';

// A bar is filled with its status color and its text stays readable on it (sheet, "Barre au
// repos"); the status icon takes the text color of a tinted bar, else it would vanish in it.
const TONES: Record<Tone, string> = {
  progress: 'bg-balise text-foreground dark:text-background [&_cw-status-icon_svg]:text-current!',
  done: 'bg-jade text-foreground dark:text-background [&_cw-status-icon_svg]:text-current!',
  blocked:
    'bg-grenat text-destructive-foreground dark:text-background [&_cw-status-icon_svg]:text-current!',
  neutral: 'bg-secondary text-foreground',
};

const BAR =
  'group/bar absolute top-1.5 isolate flex h-6 items-center overflow-hidden rounded-md border border-transparent text-xs font-medium outline-hidden hover:bg-linear-to-b hover:from-hover hover:to-hover focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring';
const BAR_IDLE = 'transition-[left,width] duration-300 ease-snap motion-reduce:transition-none';
const BAR_GRAB = 'cursor-grab';
const BAR_DRAGGING = 'z-20 cursor-grabbing shadow-lg';
const BAR_SELECTED = 'ring-2 ring-inset ring-current/35';

const GROUP_BAR_ROUNDING = {
  both: 'rounded-full',
  left: 'rounded-r-full',
  right: 'rounded-l-full',
  none: 'rounded-none',
} as const;

// The two cells of a row share its hover veil, its selection and its focus ring (`FOCUS_INSET`):
// the name cell is sticky and opaque, so the row's own ring would hide behind it.
const ROW_FOCUS =
  'group-focus-visible/row:ring-2 group-focus-visible/row:ring-inset group-focus-visible/row:ring-ring';
const NAME_CELL_BASE =
  'sticky left-0 z-20 flex shrink-0 items-center gap-2 border-r bg-background pr-3 group-hover/row:bg-linear-to-b group-hover/row:from-hover group-hover/row:to-hover group-aria-selected/row:bg-linear-to-b group-aria-selected/row:from-selected group-aria-selected/row:to-selected';
const NAME_CELLS: Record<1 | 2, string> = {
  1: `${NAME_CELL_BASE} pl-3 ${ROW_FOCUS}`,
  2: `${NAME_CELL_BASE} pl-8 ${ROW_FOCUS}`,
};
const GROUP_NAME_CELL = `sticky left-0 z-20 flex shrink-0 items-center gap-1 border-r bg-background px-1.5 group-hover/row:bg-linear-to-b group-hover/row:from-hover group-hover/row:to-hover ${ROW_FOCUS}`;
const TRACK_CELL = `relative shrink-0 group-hover/row:bg-accent group-aria-selected/row:bg-selected ${ROW_FOCUS}`;

// Ruler cells: days on two lines (« lu » / « 9 »), weeks (« S46 9 nov. ») and months on one.
const COLUMN_CELLS: Record<CwTimelineScale, string> = {
  day: 'absolute inset-y-0 flex flex-col items-center justify-center gap-0.5 leading-none tabular-nums',
  week: 'absolute inset-y-0 flex items-center gap-1 px-2 text-xs whitespace-nowrap tabular-nums',
  month: 'absolute inset-y-0 flex items-center gap-1 px-2 text-xs whitespace-nowrap tabular-nums',
};

const UNIT_WIDTHS: Record<CwTimelineScale, number> = { day: 36, week: 76, month: 114 };
const ROW_HEIGHT = 36;
// Integration guide, Gantt: « zoom sur 8 crans (boutons, Ctrl + molette, Ctrl + et −) »; the steps
// of the mockup (`App.dc.html`, `G_LADDER`): month to day, each widening its columns.
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
const WHEEL_THROTTLE = 160;
// Under these widths the name leaves the bar, then the percentage appears (sheet, "Barre").
const NAME_INSIDE = 100;
const PERCENT_INSIDE = 200;

interface Column {
  readonly key: string;
  readonly date: Date;
  readonly x: number;
  readonly width: number;
  readonly label: string;
  readonly sub: string;
  readonly today: boolean;
  readonly weekend: boolean;
  readonly separator: boolean;
}

interface Band {
  readonly key: string;
  readonly x: number;
  readonly width: number;
  readonly label: string;
  readonly sub: string;
  readonly separator: boolean;
}

interface Axis {
  readonly scale: CwTimelineScale;
  readonly start: Date;
  readonly end: Date;
  readonly width: number;
  readonly dayWidth: number;
  readonly columns: readonly Column[];
  readonly bands: readonly Band[];
  readonly xOf: (date: Date) => number;
}

interface Dates {
  readonly start: Date;
  readonly end: Date;
}

interface BarView {
  readonly x: number;
  readonly width: number;
  readonly classes: string;
  readonly ariaLabel: string;
  readonly tone: Tone;
  readonly progress: number | null;
  readonly percent: string | null;
  readonly nameInside: boolean;
  readonly outside: { readonly x: number; readonly before: boolean } | null;
  readonly late: string | null;
  readonly conflict: boolean;
  readonly dragging: boolean;
  readonly resizing: boolean;
  readonly resizable: boolean;
}

interface GroupRow {
  readonly kind: 'group';
  readonly key: string;
  readonly level: 1;
  readonly top: number | null;
  readonly group: CwTimelineGroup;
  readonly expanded: boolean;
  readonly meta: string;
  readonly bar: {
    readonly x: number;
    readonly width: number;
    readonly progress: number;
    readonly rounding: string;
  } | null;
}

interface ItemRow {
  readonly kind: 'item';
  readonly key: string;
  readonly level: 1 | 2;
  readonly top: number | null;
  readonly item: CwTimelineItem;
  readonly dates: Dates | null;
  readonly selected: boolean;
  readonly bar: BarView | null;
  readonly ghost: { readonly x: number; readonly width: number } | null;
}

interface MilestoneRow {
  readonly kind: 'milestone';
  readonly key: string;
  readonly level: 1 | 2;
  readonly top: number | null;
  readonly milestone: CwMilestone;
  readonly x: number | null;
  readonly before: boolean;
  readonly dateText: string;
  readonly ariaLabel: string;
}

type Row = GroupRow | ItemRow | MilestoneRow;

interface Section {
  readonly key: string;
  readonly group: GroupRow | null;
  readonly expanded: boolean;
  readonly rows: readonly Row[];
}

interface Drag {
  readonly id: string;
  readonly ids: readonly string[];
  readonly mode: 'move' | 'start' | 'end' | 'link';
  readonly originX: number;
  readonly delta: number;
  readonly moved: boolean;
  readonly additive: boolean;
}

interface RowOption extends FocusableOption {
  readonly key: string;
}

function clampProgress(value: number | undefined): number {
  return Math.min(100, Math.max(0, Math.round(value ?? 0)));
}

/** The dated span of an item: one of its two dates alone makes a one-day bar. */
function datesOf(item: CwTimelineItem): Dates | null {
  const start = item.start ?? item.end;
  const end = item.end ?? item.start;
  if (!start || !end) return null;
  const a = startOfDay(start);
  const b = startOfDay(end);
  return diffDays(a, b) >= 0 ? { start: a, end: b } : { start: b, end: a };
}

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

/** The period of a scale around a day: the default range, and the range after a scale change. */
function rangeFor(scale: CwTimelineScale, anchor: Date): CwTimelineRange {
  switch (scale) {
    case 'day': {
      const start = mondayOf(anchor);
      return { start, end: addDays(start, 20) };
    }
    case 'week': {
      const start = addDays(mondayOf(anchor), -14);
      return { start, end: addDays(start, 12 * 7 - 1) };
    }
    case 'month': {
      const start = addMonths(firstOfMonth(anchor), -1);
      return { start, end: addDays(addMonths(start, 6), -1) };
    }
  }
}

/** Shifts a day by one unit of the scale: a day, a week or a month. */
function shiftByUnit(date: Date, scale: CwTimelineScale, steps: number): Date {
  if (scale === 'month') return addMonths(date, steps);
  return addDays(date, scale === 'week' ? steps * 7 : steps);
}

/** Shifts a range by one page: a week (day scale), four weeks, or a quarter. */
function shiftByPage(
  range: CwTimelineRange,
  scale: CwTimelineScale,
  steps: number,
): CwTimelineRange {
  if (scale === 'month') {
    return { start: addMonths(range.start, 3 * steps), end: addMonths(range.end, 3 * steps) };
  }
  const days = (scale === 'week' ? 28 : 7) * steps;
  return { start: addDays(range.start, days), end: addDays(range.end, days) };
}

function monthsBetween(from: Date, to: Date): number {
  return (to.getFullYear() - from.getFullYear()) * 12 + to.getMonth() - from.getMonth();
}

/**
 * The elbow of a finish-to-start dependency (sheet, "Dépendance"): out of the end of the
 * predecessor, down to the row of the successor, into its start. When the successor starts too
 * early, the line goes back through the gap between the rows.
 */
function dependencyPath(x1: number, y1: number, x2: number, y2: number): string {
  const r = 4;
  const out = x1 + 8;
  const s = y2 >= y1 ? 1 : -1;
  const n = (value: number): string => String(Math.round(value * 100) / 100);
  if (x2 >= out + r) {
    if (y1 === y2) return `M${n(x1)} ${n(y1)} H${n(x2)}`;
    return (
      `M${n(x1)} ${n(y1)} H${n(out - r)} Q${n(out)} ${n(y1)} ${n(out)} ${n(y1 + s * r)} ` +
      `V${n(y2 - s * r)} Q${n(out)} ${n(y2)} ${n(out + r)} ${n(y2)} H${n(x2)}`
    );
  }
  const gap = y2 - s * (ROW_HEIGHT / 2);
  const back = x2 - 9;
  return (
    `M${n(x1)} ${n(y1)} H${n(out - r)} Q${n(out)} ${n(y1)} ${n(out)} ${n(y1 + s * r)} ` +
    `V${n(gap - s * r)} Q${n(out)} ${n(gap)} ${n(out - r)} ${n(gap)} H${n(back + r)} ` +
    `Q${n(back)} ${n(gap)} ${n(back)} ${n(gap + s * r)} V${n(y2 - s * r)} ` +
    `Q${n(back)} ${n(y2)} ${n(back + r)} ${n(y2)} H${n(x2)}`
  );
}

function arrowHead(x: number, y: number): string {
  return `M${String(x - 5)} ${String(y - 3.5)} L${String(x)} ${String(y)} L${String(x - 5)} ${String(y + 3.5)}`;
}

/**
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
  /** The bars, in display order within their group. */
  readonly items = input.required<readonly CwTimelineItem[]>();
  /** Finish-to-start links between items. */
  readonly dependencies = input<readonly CwDependency[]>([]);
  /** Milestones, each on its own row in its group. */
  readonly milestones = input<readonly CwMilestone[]>([]);
  /** Group rows, in order; empty draws a flat list. Items of an unknown group come last. */
  readonly groups = input<readonly CwTimelineGroup[]>([]);
  /** Unit of the axis. */
  readonly scale = model<CwTimelineScale>('day');
  /** Column width factor within the scale (1, 1.5, 2, 3 on the day scale; see the zoom steps). */
  readonly zoom = model<number>(1);
  /** The period shown; `null` shows the weeks around today for the scale. */
  readonly range = model<CwTimelineRange | null>(null);
  /** Ids of the collapsed groups. */
  readonly collapsedGroups = model<readonly string[]>([]);
  /** Ids of the selected items, moved together. */
  readonly selection = model<readonly string[]>([]);
  /** Draws the dependency arrows. */
  readonly showDependencies = model<boolean>(true);
  /** Marks the weekends on the day scale; `false` keeps working days only. */
  readonly showWeekends = input(true, { transform: booleanAttribute });
  /** The day of the « Aujourd'hui » line; `null` takes the current day. */
  readonly today = input<Date | null>(null);
  /** Width of the name column, in pixels. */
  readonly nameColumnWidth = input(241, { transform: numberAttribute });
  /** No move, no resize, no « Planifier ». */
  readonly readonly = input(false, { transform: booleanAttribute });
  /** Accessible name of the grid (« Timeline de Produit »). */
  readonly ariaLabel = input.required<string>();
  /** Header of the name column. */
  readonly nameHeader = input<string>('Tâche');
  /** Text of an undated item in the name column. */
  readonly undatedLabel = input<string>('Sans date');
  /** Label of the button that gives dates to an undated item. */
  readonly scheduleLabel = input<string>('Planifier');

  /** A bar was moved or resized. */
  readonly itemChange = output<CwTimelineItemChange>();
  /** « Planifier » on an undated item. */
  readonly schedule = output<CwTimelineSchedule>();
  /** A link was drawn from one bar to another (Alt + drag from the end handle). */
  readonly dependencyCreate = output<CwDependency>();
  /** A change made a successor start before its predecessor ends. */
  readonly conflict = output<CwTimelineConflict>();
  /** Double click or Enter on a bar. */
  readonly open = output<CwTimelineItem>();

  protected readonly barDef = contentChild(CwTimelineBarDef);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly announcer = inject(LiveAnnouncer);
  private readonly now = startOfDay(new Date());

  private readonly drag = signal<Drag | null>(null);
  private readonly activeKey = signal<string | null>(null);
  protected readonly scheduleHover = signal<{ key: string; x: number; date: Date } | null>(null);
  private lastWheel = Number.NEGATIVE_INFINITY;

  protected readonly todayDate = computed(() => {
    const today = this.today();
    return today ? startOfDay(today) : this.now;
  });

  protected readonly effectiveRange = computed<CwTimelineRange>(() => {
    const range = this.range();
    if (!range) return rangeFor(this.scale(), this.todayDate());
    const start = startOfDay(range.start);
    const end = startOfDay(range.end);
    return diffDays(start, end) >= 0 ? { start, end } : { start: end, end: start };
  });

  protected readonly axis = computed<Axis>(() => {
    const scale = this.scale();
    const zoom = this.zoom() > 0 ? this.zoom() : 1;
    const unit = UNIT_WIDTHS[scale] * zoom;
    const range = this.effectiveRange();
    const today = this.todayDate();
    if (scale === 'day') return this.dayAxis(range, unit, today);
    if (scale === 'week') return this.weekAxis(range, unit, today);
    return this.monthAxis(range, unit, today);
  });

  private readonly itemsById = computed(
    () => new Map(this.items().map((item) => [item.id, item] as const)),
  );

  /** The dates of every dated item, including the live preview of a drag. */
  private readonly liveDates = computed(() => {
    const drag = this.drag();
    const dates = new Map<string, Dates>();
    for (const item of this.items()) {
      const own = datesOf(item);
      if (!own) continue;
      dates.set(item.id, drag?.ids.includes(item.id) ? this.dragged(own, drag) : own);
    }
    return dates;
  });

  /** Successor id → name of the predecessor it starts before. */
  private readonly conflicts = computed(() => {
    const dates = this.liveDates();
    const byId = this.itemsById();
    const found = new Map<string, string>();
    for (const dependency of this.dependencies()) {
      const before = dates.get(dependency.from);
      const after = dates.get(dependency.to);
      if (!before || !after || found.has(dependency.to)) continue;
      if (diffDays(after.start, before.end) >= 0) {
        found.set(dependency.to, byId.get(dependency.from)?.name ?? dependency.from);
      }
    }
    return found;
  });

  protected readonly sections = computed<readonly Section[]>(() => {
    const groups = this.groups();
    const items = this.items();
    const milestones = this.milestones();
    const collapsed = new Set(this.collapsedGroups());
    const known = new Set(groups.map((group) => group.id));
    let top = 0;
    const place = (visible: boolean): number | null => {
      if (!visible) return null;
      const current = top;
      top += ROW_HEIGHT;
      return current;
    };
    const rowsOf = (
      members: readonly CwTimelineItem[],
      marks: readonly CwMilestone[],
      level: 1 | 2,
      visible: boolean,
    ): Row[] => {
      // Undated items come last in their group (sheet, "Dans Cadenway").
      const dated = members.filter((item) => datesOf(item));
      const undated = members.filter((item) => !datesOf(item));
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
      const expanded = !collapsed.has(group.id);
      const members = items.filter((item) => item.group === group.id);
      const header = this.groupRow(group, members, expanded, place(true));
      const marks = milestones.filter((mark) => mark.group === group.id);
      return {
        key: group.id,
        group: header,
        expanded,
        rows: rowsOf(members, marks, 2, expanded),
      };
    });
    const orphans = items.filter((item) => !item.group || !known.has(item.group));
    const orphanMarks = milestones.filter((mark) => !mark.group || !known.has(mark.group));
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

  /** The rows reachable with the arrows, in order: collapsed groups hide theirs. */
  private readonly visibleRows = computed(() =>
    this.sections().flatMap((section) => [
      ...(section.group ? [section.group] : []),
      ...(section.expanded ? section.rows : []),
    ]),
  );

  protected readonly bodyHeight = computed(() => this.visibleRows().length * ROW_HEIGHT);

  protected readonly tabStop = computed(() => {
    const rows = this.visibleRows();
    const active = this.activeKey();
    return rows.find((row) => row.key === active)?.key ?? rows.at(0)?.key ?? null;
  });

  private readonly options = computed<readonly RowOption[]>(() =>
    this.visibleRows().map((row) => ({
      key: row.key,
      focus: () => {
        this.focusTarget(row.key)?.focus();
      },
    })),
  );

  private readonly keyManager = new FocusKeyManager<RowOption>(this.options, inject(Injector))
    .withVerticalOrientation()
    .withHomeAndEnd();

  protected readonly todayX = computed(() => {
    const axis = this.axis();
    const x = axis.xOf(this.todayDate()) + axis.dayWidth / 2;
    return x >= 0 && x <= axis.width ? Math.round(x * 100) / 100 : null;
  });

  protected readonly dependencyLines = computed(() => {
    if (!this.showDependencies()) return [];
    const rows = new Map<string, ItemRow>();
    for (const row of this.visibleRows()) if (row.kind === 'item') rows.set(row.item.id, row);
    return this.dependencies().flatMap((dependency) => {
      const from = rows.get(dependency.from);
      const to = rows.get(dependency.to);
      if (!from?.bar || !to?.bar || from.top === null || to.top === null) return [];
      const x1 = from.bar.x + from.bar.width;
      const y1 = from.top + ROW_HEIGHT / 2;
      const x2 = to.bar.x;
      const y2 = to.top + ROW_HEIGHT / 2;
      const conflict = !!from.dates && !!to.dates && diffDays(to.dates.start, from.dates.end) >= 0;
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

  /** The tooltip of the bar being moved: « 24 → 26 nov. · 3 j », above its row. */
  protected readonly dragTip = computed(() => {
    const drag = this.drag();
    if (!drag || drag.mode === 'link' || !drag.moved) return null;
    const row = this.visibleRows().find(
      (candidate): candidate is ItemRow =>
        candidate.kind === 'item' && candidate.item.id === drag.id,
    );
    if (!row?.bar || !row.dates || row.top === null) return null;
    return {
      text: moveText(row.dates.start, row.dates.end),
      x: this.nameColumnWidth() + row.bar.x + row.bar.width / 2,
      y: row.top >= 30 ? row.top - 28 : row.top + ROW_HEIGHT + 2,
    };
  });

  protected readonly scheduleDefaultX = computed(() => {
    const axis = this.axis();
    const x = axis.xOf(this.todayDate());
    return x >= 0 && x < axis.width ? x : 8;
  });

  protected readonly nameCells = NAME_CELLS;
  protected readonly groupNameCell = GROUP_NAME_CELL;
  protected readonly trackCell = TRACK_CELL;
  protected readonly columnCell = computed(() => COLUMN_CELLS[this.scale()]);

  protected scheduleX(row: ItemRow): number {
    const hover = this.scheduleHover();
    return hover?.key === row.key ? hover.x : this.scheduleDefaultX();
  }

  // Keyboard, pointer and wheel ------------------------------------------------------------------

  protected onFocusin(event: FocusEvent): void {
    const key = this.keyOf(event.target);
    if (key === null) return;
    this.activeKey.set(key);
    const option = this.options().find((candidate) => candidate.key === key);
    if (option) this.keyManager.updateActiveItem(option);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.globalShortcut(event)) {
      event.preventDefault();
      return;
    }
    const key = this.keyOf(event.target);
    if (key === null) return;
    const row = this.visibleRows().find((candidate) => candidate.key === key);
    if (!row) return;
    if (['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
      const option = this.options().find((candidate) => candidate.key === key);
      if (option) this.keyManager.updateActiveItem(option);
      if (ɵnavigateList(this.keyManager, event, 'vertical')) {
        event.preventDefault();
        const active = this.keyManager.activeItem;
        if (active) this.activeKey.set(active.key);
      }
      return;
    }
    if (row.kind === 'group') this.groupKey(event, row);
    else if (row.kind === 'item') this.itemKey(event, row);
  }

  protected onWheel(event: WheelEvent): void {
    if (!(event.ctrlKey || event.metaKey)) return;
    event.preventDefault();
    if (event.timeStamp - this.lastWheel < WHEEL_THROTTLE) return;
    this.lastWheel = event.timeStamp;
    this.zoomBy(event.deltaY < 0 ? 1 : -1);
  }

  protected toggleGroup(id: string): void {
    this.collapsedGroups.update((groups) =>
      groups.includes(id) ? groups.filter((group) => group !== id) : [...groups, id],
    );
  }

  protected onBarPointerDown(event: PointerEvent, row: ItemRow): void {
    if (event.button !== 0 || !row.dates) return;
    const bar = event.currentTarget as HTMLElement;
    bar.focus();
    if (this.readonly()) return;
    const edge = (event.target as Element).closest('[data-edge]')?.getAttribute('data-edge');
    const mode =
      edge === 'end' && event.altKey
        ? 'link'
        : edge === 'start'
          ? 'start'
          : edge === 'end'
            ? 'end'
            : 'move';
    const selection = this.selection();
    const ids = mode === 'move' && selection.includes(row.item.id) ? selection : [row.item.id];
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

  protected onBarPointerMove(event: PointerEvent): void {
    const drag = this.drag();
    if (!drag || drag.mode === 'link') return;
    // Steps of one day whatever the scale (sheet, "Barre en déplacement").
    const delta = Math.round((event.clientX - drag.originX) / this.axis().dayWidth);
    if (delta !== drag.delta) this.drag.set({ ...drag, delta, moved: true });
  }

  protected onBarPointerUp(event: PointerEvent, row: ItemRow): void {
    const drag = this.drag();
    this.drag.set(null);
    if (!drag) return;
    if (drag.mode === 'link') {
      const target = this.host.ownerDocument
        .elementFromPoint(event.clientX, event.clientY)
        ?.closest<HTMLElement>('[data-bar-id]');
      const to = target?.dataset['barId'];
      if (to && to !== drag.id) this.dependencyCreate.emit({ from: drag.id, to });
      return;
    }
    if (!drag.moved || drag.delta === 0) {
      this.select(row.item.id, drag.additive);
      return;
    }
    const changes = drag.ids.flatMap((id) => {
      const item = this.itemsById().get(id);
      const own = item ? datesOf(item) : null;
      return item && own ? [{ item, own, next: this.dragged(own, drag) }] : [];
    });
    this.commit(changes);
  }

  protected onBarPointerCancel(): void {
    this.drag.set(null);
  }

  protected onTrackPointerMove(event: PointerEvent, row: ItemRow): void {
    if (row.dates || this.readonly()) return;
    const track = event.currentTarget as HTMLElement;
    const x = event.clientX - track.getBoundingClientRect().left;
    const date = this.dateAt(x);
    this.scheduleHover.set({ key: row.key, x: this.axis().xOf(date), date });
  }

  protected planify(row: ItemRow): void {
    const hover = this.scheduleHover();
    const date = hover?.key === row.key ? hover.date : this.todayDate();
    this.schedule.emit({ item: row.item, start: date, end: date });
  }

  // Rendering helpers ----------------------------------------------------------------------------

  protected statusLabel(item: CwTimelineItem): string {
    return item.status ? CW_STATUS_LABELS[item.status] : '';
  }

  protected percentOf(item: CwTimelineItem): string {
    return TEXTS.percent(clampProgress(item.progress));
  }

  // Internals ------------------------------------------------------------------------------------

  private dayAxis(range: CwTimelineRange, unit: number, today: Date): Axis {
    const weekends = this.showWeekends();
    const columns: Column[] = [];
    for (let day = range.start; diffDays(day, range.end) >= 0; day = addDays(day, 1)) {
      if (!weekends && isWeekend(day)) continue;
      columns.push({
        key: day.toDateString(),
        date: day,
        x: columns.length * unit,
        width: unit,
        label: weekdayShort(day),
        sub: String(day.getDate()),
        today: sameDay(day, today),
        weekend: weekends && isWeekend(day),
        separator: columns.length > 0 && day.getDay() === 1,
      });
    }
    const bands: Band[] = [];
    for (const column of columns) {
      const monday = mondayOf(column.date).toDateString();
      const last = bands.at(-1);
      if (last?.key === monday) {
        bands[bands.length - 1] = {
          ...last,
          width: last.width + column.width,
          sub: periodText(
            mondayOf(column.date) < range.start ? range.start : mondayOf(column.date),
            column.date,
          ),
        };
      } else {
        bands.push({
          key: monday,
          x: column.x,
          width: column.width,
          label: TEXTS.week(isoWeek(column.date)),
          sub: periodText(column.date, column.date),
          separator: bands.length > 0,
        });
      }
    }
    const start = range.start;
    const xOf = (date: Date): number => {
      const days = diffDays(start, date);
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

  private weekAxis(range: CwTimelineRange, unit: number, today: Date): Axis {
    const start = mondayOf(range.start);
    const end = addDays(mondayOf(range.end), 6);
    const columns: Column[] = [];
    for (let monday = start; diffDays(monday, end) >= 0; monday = addDays(monday, 7)) {
      const offset = diffDays(monday, today);
      columns.push({
        key: monday.toDateString(),
        date: monday,
        x: columns.length * unit,
        width: unit,
        label: TEXTS.weekShort(isoWeek(monday)),
        sub: dayMonth(monday),
        today: offset >= 0 && offset < 7,
        weekend: false,
        separator: columns.length > 0,
      });
    }
    const width = columns.length * unit;
    const xOf = (date: Date): number => (diffDays(start, date) / 7) * unit;
    const bands: Band[] = [];
    for (let month = firstOfMonth(start); diffDays(month, end) >= 0; month = addMonths(month, 1)) {
      const x = Math.max(0, xOf(month));
      const right = Math.min(width, xOf(addMonths(month, 1)));
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

  private monthAxis(range: CwTimelineRange, unit: number, today: Date): Axis {
    const start = firstOfMonth(range.start);
    const end = addDays(addMonths(firstOfMonth(range.end), 1), -1);
    const columns: Column[] = [];
    for (let month = start; diffDays(month, end) >= 0; month = addMonths(month, 1)) {
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
    const width = columns.length * unit;
    const xOf = (date: Date): number =>
      (monthsBetween(start, date) + (date.getDate() - 1) / daysInMonth(date)) * unit;
    const bands: Band[] = [];
    for (const column of columns) {
      const year = String(column.date.getFullYear());
      const last = bands.at(-1);
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

  private groupRow(
    group: CwTimelineGroup,
    members: readonly CwTimelineItem[],
    expanded: boolean,
    top: number | null,
  ): GroupRow {
    const dated = members.map((item) => this.liveDates().get(item.id)).filter((dates) => !!dates);
    const first = group.start
      ? startOfDay(group.start)
      : dated
          .map((d) => d.start)
          .sort((a, b) => +a - +b)
          .at(0);
    const last = group.end
      ? startOfDay(group.end)
      : dated
          .map((d) => d.end)
          .sort((a, b) => +b - +a)
          .at(0);
    const progress =
      group.progress ??
      (members.length
        ? members.reduce((sum, item) => sum + clampProgress(item.progress), 0) / members.length
        : 0);
    const count = String(members.length);
    let bar: GroupRow['bar'] = null;
    if (first && last) {
      const axis = this.axis();
      const left = axis.xOf(first);
      const right = axis.xOf(addDays(last, 1));
      const x = Math.max(0, left);
      const end = Math.min(axis.width, right);
      if (end > x) {
        const clippedLeft = left < 0;
        const clippedRight = right > axis.width;
        const rounding = clippedLeft
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

  private itemRow(item: CwTimelineItem, level: 1 | 2, top: number | null): ItemRow {
    const dates = this.liveDates().get(item.id) ?? null;
    const selected = this.selection().includes(item.id);
    const drag = this.drag();
    const dragging = !!drag && drag.mode !== 'link' && drag.moved && drag.ids.includes(item.id);
    const own = datesOf(item);
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

  private milestoneRow(mark: CwMilestone, level: 1 | 2, top: number | null): MilestoneRow {
    const axis = this.axis();
    const date = startOfDay(mark.date);
    const x = axis.xOf(date) + axis.dayWidth / 2;
    const inside = x >= 0 && x <= axis.width;
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

  private span(dates: Dates): { x: number; width: number } | null {
    const axis = this.axis();
    const left = axis.xOf(dates.start);
    const right = axis.xOf(addDays(dates.end, 1));
    const x = Math.max(0, left);
    const end = Math.min(axis.width, right);
    if (end <= 0 || x >= axis.width) return null;
    return { x, width: Math.max(end - x, 6) };
  }

  private barView(
    item: CwTimelineItem,
    dates: Dates,
    selected: boolean,
    dragging: boolean,
    drag: Drag | null,
  ): BarView | null {
    const span = this.span(dates);
    if (!span) return null;
    const axis = this.axis();
    const today = this.todayDate();
    const progress = clampProgress(item.progress);
    const lateDays =
      (item.late ?? (diffDays(dates.end, today) > 0 && progress < 100))
        ? Math.max(1, diffDays(dates.end, today))
        : 0;
    const predecessor = this.conflicts().get(item.id) ?? null;
    const tone = toneOf(item);
    const nameInside = span.width >= NAME_INSIDE;
    const outsideNeeded = !nameInside || lateDays > 0;
    const before = span.x + span.width + 160 > axis.width && span.x > 160;
    // The percentage follows the name, as on the bar, so the accessible name starts with the
    // visible text (WCAG 2.5.3, Label in Name); the sheet puts the status before it.
    const parts = [
      item.name,
      item.progress === undefined ? null : TEXTS.percent(progress),
      item.status ? CW_STATUS_LABELS[item.status] : null,
      rangeText(dates.start, dates.end),
      lateDays ? TEXTS.lateLong(lateDays) : null,
      predecessor ? TEXTS.conflict(predecessor) : null,
    ].filter((part) => part !== null);
    const readonly = this.readonly();
    const classes = [
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

  private dragged(dates: Dates, drag: Drag): Dates {
    const { delta } = drag;
    switch (drag.mode) {
      case 'start': {
        const start = addDays(dates.start, delta);
        return { start: diffDays(start, dates.end) >= 0 ? start : dates.end, end: dates.end };
      }
      case 'end': {
        const end = addDays(dates.end, delta);
        return { start: dates.start, end: diffDays(dates.start, end) >= 0 ? end : dates.start };
      }
      case 'move':
        return { start: addDays(dates.start, delta), end: addDays(dates.end, delta) };
      case 'link':
        return dates;
    }
  }

  private dateAt(x: number): Date {
    const axis = this.axis();
    if (axis.scale === 'day') {
      const column =
        axis.columns[Math.max(0, Math.min(axis.columns.length - 1, Math.floor(x / axis.dayWidth)))];
      return column.date;
    }
    return addDays(axis.start, Math.max(0, Math.floor(x / axis.dayWidth)));
  }

  private keyOf(target: EventTarget | null): string | null {
    if (!(target instanceof Element)) return null;
    return target.closest<HTMLElement>('[data-focus-key]')?.dataset['focusKey'] ?? null;
  }

  private focusTarget(key: string): HTMLElement | null {
    return (
      Array.from(this.host.querySelectorAll<HTMLElement>('[data-focus-key]')).find(
        (element) => element.dataset['focusKey'] === key,
      ) ?? null
    );
  }

  private globalShortcut(event: KeyboardEvent): boolean {
    const ctrl = event.ctrlKey || event.metaKey;
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

  private groupKey(event: KeyboardEvent, row: GroupRow): void {
    const expand = event.key === 'ArrowRight';
    const collapse = event.key === 'ArrowLeft';
    if ((expand && !row.expanded) || (collapse && row.expanded) || event.key === 'Enter') {
      event.preventDefault();
      this.toggleGroup(row.group.id);
    } else if (expand || collapse) {
      event.preventDefault();
    }
  }

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
        const today = this.todayDate();
        this.schedule.emit({ item: row.item, start: today, end: today });
      }
      return;
    }
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const own = datesOf(row.item);
    if (!own || this.readonly()) return;
    const step = event.key === 'ArrowRight' ? 1 : -1;
    const scale = this.scale();
    let next: Dates;
    if (event.shiftKey) {
      const end = shiftByUnit(own.end, scale, step);
      next = { start: own.start, end: diffDays(own.start, end) >= 0 ? end : own.start };
    } else if (event.altKey) {
      const start = shiftByUnit(own.start, scale, step);
      next = { start: diffDays(start, own.end) >= 0 ? start : own.end, end: own.end };
    } else {
      next = { start: shiftByUnit(own.start, scale, step), end: shiftByUnit(own.end, scale, step) };
    }
    this.commit([{ item: row.item, own, next }]);
  }

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

  private commit(changes: readonly { item: CwTimelineItem; own: Dates; next: Dates }[]): void {
    const moved = changes.filter(
      (change) =>
        !sameDay(change.own.start, change.next.start) || !sameDay(change.own.end, change.next.end),
    );
    if (moved.length === 0) return;
    const before = new Map<string, Dates>();
    const after = new Map<string, Dates>();
    for (const item of this.items()) {
      const own = datesOf(item);
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
    const ids = new Set(moved.map((change) => change.item.id));
    const byId = this.itemsById();
    for (const dependency of this.dependencies()) {
      if (!ids.has(dependency.from) && !ids.has(dependency.to)) continue;
      const overlap = (dates: Map<string, Dates>): number => {
        const from = dates.get(dependency.from);
        const to = dates.get(dependency.to);
        return from && to ? diffDays(to.start, from.end) + 1 : 0;
      };
      const overlapDays = overlap(after);
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

  private zoomBy(step: number): void {
    const scale = this.scale();
    const zoom = this.zoom();
    let index = ZOOM_LADDER.findIndex(([s, m]) => s === scale && m === zoom);
    if (index < 0) index = ZOOM_LADDER.findIndex(([s]) => s === scale);
    const next = Math.max(0, Math.min(ZOOM_LADDER.length - 1, index + step));
    if (next === index) return;
    const [nextScale, nextZoom] = ZOOM_LADDER[next];
    this.applyScale(nextScale, nextZoom);
  }

  private applyScale(scale: CwTimelineScale, zoom: number): void {
    const current = this.scale();
    if (scale !== current) {
      const range = this.effectiveRange();
      const middle = addDays(range.start, Math.floor(diffDays(range.start, range.end) / 2));
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
}
