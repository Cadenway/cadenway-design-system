import { LiveAnnouncer } from '@angular/cdk/a11y';
import {
  CdkDrag,
  CdkDragPlaceholder,
  CdkDragPreview,
  CdkDropList,
  CdkDropListGroup,
  type CdkDragDrop,
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
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorCalendarBlankBold,
  phosphorCaretLeftBold,
  phosphorCaretRightBold,
} from '@ng-icons/phosphor-icons/bold';

import { CwButton } from '@cadenway/ui/button';
import { ɵFOCUS_INSET } from '@cadenway/ui/core';
import {
  CwToggleGroup,
  CwToggleGroupItem,
  type CwToggleGroupValue,
} from '@cadenway/ui/toggle-group';

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
import { CW_CALENDAR_VIEW_LABELS } from './calendar-view.constants';
import {
  addDays,
  addMonths,
  atMinutes,
  dayKey,
  daysBetween,
  formatTime,
  minutesOf,
  sameDay,
  sameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from './calendar-view.dates';
import type {
  CwCalendarCreate,
  CwCalendarItemContext,
  CwCalendarItemMove,
  CwCalendarItemPlace,
  CwCalendarKeyFn,
  CwCalendarSlotMinutes,
  CwCalendarSpan,
  CwCalendarSpanFn,
  CwCalendarViewLabels,
  CwCalendarViewMode,
  CwCalendarWeekStart,
} from './calendar-view.types';

/* Literal class strings (Calendar View sheet and preview of the Design System artifact), so
   Tailwind finds them in the compiled package. */
const CELL =
  'group/day flex h-[76px] min-w-0 flex-col gap-0.5 overflow-hidden p-1 transition-colors motion-reduce:transition-none ' +
  ɵFOCUS_INSET;

const ALL_DAY_CELL =
  'group/day flex h-11 min-w-0 flex-col gap-0.5 overflow-hidden p-0.5 transition-colors motion-reduce:transition-none ' +
  ɵFOCUS_INSET;

const CELL_TONES = { rest: 'hover:bg-accent', target: 'bg-selected' } as const;

type Edges = 'both' | 'right' | 'bottom' | 'left' | 'none';
const CELL_EDGES: Record<Edges, string> = {
  both: 'border-r border-b',
  right: 'border-r',
  bottom: 'border-b',
  left: 'border-l',
  none: '',
};

const NUMBERS = {
  today: 'text-xs font-semibold tabular-nums text-primary',
  outside: 'text-xs tabular-nums text-muted-foreground',
  plain: 'text-xs font-medium tabular-nums',
} as const;

const COLUMNS = { 5: 'grid grid-cols-5', 7: 'grid grid-cols-7' } as const;

const PILL =
  'relative isolate flex h-5 min-w-0 shrink-0 items-center gap-1 overflow-hidden rounded-sm px-1 text-left text-xs transition-colors ' +
  'hover:bg-linear-to-b hover:from-hover hover:to-hover animate-item-in motion-reduce:animate-none [&_ng-icon]:[--ng-icon__size:0.75rem] ' +
  ɵFOCUS_INSET;

const PILL_TONES = {
  rest: 'bg-muted dark:bg-secondary',
  grabbed: 'cursor-grabbing bg-popover shadow-lg rotate-1 motion-reduce:rotate-0',
} as const;

const PREVIEW =
  'flex h-5 min-w-0 items-center gap-1 overflow-hidden rounded-sm bg-popover px-1 text-xs shadow-lg rotate-1 cursor-grabbing motion-reduce:rotate-0 [&_ng-icon]:[--ng-icon__size:0.75rem]';

const GHOST = 'h-5 shrink-0 rounded-sm border-2 border-dashed border-line-control';

const MORE =
  'relative isolate flex h-5 w-fit shrink-0 items-center overflow-hidden rounded-sm px-1 text-xs font-medium tabular-nums text-muted-foreground transition-colors hover:bg-accent hover:text-foreground ' +
  'outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

const ADD =
  'relative isolate flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-sm text-muted-foreground opacity-0 transition-colors hover:bg-accent hover:text-foreground ' +
  'group-hover/day:opacity-100 group-focus-within/day:opacity-100 focus-visible:opacity-100 [&_ng-icon]:[--ng-icon__size:0.875rem] ' +
  'outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

const ROW =
  'relative isolate flex w-full min-w-0 items-center gap-2 overflow-hidden rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent [&_ng-icon]:[--ng-icon__size:1rem] ' +
  ɵFOCUS_INSET;

const BLOCK =
  'absolute inset-x-[3px] z-10 isolate flex flex-col items-start overflow-hidden rounded-md px-1.5 py-1 text-left text-xs leading-4 transition-colors ' +
  'hover:bg-linear-to-b hover:from-hover hover:to-hover animate-item-in motion-reduce:animate-none [&_ng-icon]:[--ng-icon__size:0.75rem] ' +
  ɵFOCUS_INSET;

const SLOT = 'relative min-w-0 transition-colors motion-reduce:transition-none ' + ɵFOCUS_INSET;

const HOUR =
  'absolute top-0.5 right-2 text-[11px] leading-none whitespace-nowrap text-muted-foreground tabular-nums';

const ADD_ROW = `${ROW} text-muted-foreground hover:text-foreground`;

const SLOT_HEIGHTS: Record<CwCalendarSlotMinutes, string> = {
  15: 'h-2.5',
  30: 'h-5',
  60: 'h-10',
};

/** One hour is 40 px in the week view (sheet, "Tailles"). */
const HOUR_HEIGHT = 40;
const WEEKS_SHOWN = 6;
/** First line of a month cell under its number (`p-1` + `h-5` + `gap-0.5`), then 22 px a line. */
const MONTH_TOP = 26;
const WEEK_TOP = 2;
const LINE = 22;

/** An item with its resolved span. */
interface Entry<T> {
  readonly id: string;
  readonly item: T;
  readonly label: string;
  readonly span: CwCalendarSpan;
}

interface SlotCell {
  readonly key: string;
  readonly date: Date;
  readonly label: string;
  readonly tabStop: boolean;
  readonly target: boolean;
  readonly cellClass: string;
  readonly drop: DropData;
  readonly blocks: readonly BlockView[];
  readonly now: number | null;
}

interface SlotRow {
  readonly minutes: number;
  /** Shown on the hours only; every row still reads its time. */
  readonly label: boolean;
  readonly time: string;
  readonly cells: readonly SlotCell[];
}

interface WeekHeader {
  readonly key: string;
  readonly short: string;
  readonly long: string;
  readonly number: string;
  readonly today: boolean;
}

function cellKey(date: Date, slot: number | null): string {
  return `${String(dayKey(date))}:${slot === null ? 'day' : String(slot)}`;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function toSlot(value: unknown): CwCalendarSlotMinutes {
  const minutes = numberAttribute(value, 30);
  return minutes === 15 || minutes === 60 ? minutes : 30;
}

/**
 * The calendar of a list, a sprint or « Mes tâches »: each item on its day, in a month grid or a
 * week of hourly slots, moved from day to day or slot to slot (Calendar View sheet of the Design
 * System artifact).
 *
 * Generic: `items` are any `T`; `trackBy` gives an item's id, `itemLabel` its name, `itemSpan` when
 * it happens (`null`: not drawn, count it in `unscheduledCount`). The calendar draws the frames
 * (pill, bar across days, hourly block, popover row) and their states; the content comes from
 * `ng-template[cwCalendarItem]` (`CwCalendarItemDef`). A `[cwCalendarActions]` element is projected
 * at the end of the header (« Créer une tâche »).
 *
 * Month view: six weeks from `weekStartsOn` (Monday), `maxPerDay` lines a day then « +n autres »,
 * which opens the day in a popover; items over several days are one bar across the week, reserving
 * the first line of the days they cover. Week view: an all-day row, then the `hours` range in slots
 * of `slotMinutes`, blocks as tall as their duration, and the current time on today's column.
 * `showWeekends=false` drops Saturday and Sunday. `view` and `date` (the day shown) are models;
 * `today` marks the current day (`aria-current="date"`).
 *
 * A drop (CDK drag-drop, or Space, arrows and Space) moves the item at once and emits `itemMove`
 * with its new span, duration kept; any new `items` resets the calendar. « + » on a day, a double
 * click on a slot, N and « Ajouter une tâche » of the popover emit `create`; a click or Enter on an
 * item emits `open`; « Sans date » emits `unscheduledOpen`. `readonly` turns off dragging and
 * creation.
 *
 * Keyboard (`role="grid"`, one focusable cell): arrows move by a day or a week (in the week view,
 * up and down by a slot), Home and End go to the ends of the week, Page Up and Page Down change
 * month (week), T comes back to today, M and S switch views, Enter on a day opens its popover, N
 * creates. Moves are announced through the CDK `LiveAnnouncer`. Style hook: `data-view` on the host.
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
  /** The items; those whose `itemSpan` is `null` are left out. */
  readonly items = input.required<readonly T[]>();
  /** The id of an item, unique in the calendar. */
  readonly trackBy = input.required<CwCalendarKeyFn<T>>();
  /** The name of an item: frame `title`, announcements. */
  readonly itemLabel = input.required<CwCalendarKeyFn<T>>();
  /** When an item happens. */
  readonly itemSpan = input.required<CwCalendarSpanFn<T>>();
  /** Month or week, `[(view)]`. */
  readonly view = model<CwCalendarViewMode>('month');
  /** The day shown (its month or its week), `[(date)]`; today by default. */
  readonly date = model<Date | null>(null);
  /** First day of the week: Monday (1) in French. */
  readonly weekStartsOn = input<CwCalendarWeekStart>(1);
  /** Shows Saturday and Sunday. */
  readonly showWeekends = input(true, { transform: booleanAttribute });
  /** Lines a day in the month view before « +n autres ». */
  readonly maxPerDay = input(2, {
    transform: (value: unknown) => Math.max(1, numberAttribute(value, 2)),
  });
  /** First and last hour of the week view's slots. */
  readonly hours = input<readonly [number, number]>([8, 20]);
  /** Step of the week view's slots, for dropping and creating. */
  readonly slotMinutes = input<CwCalendarSlotMinutes, unknown>(30, { transform: toSlot });
  /** The current day and time (today marker, current time line); the clock by default. */
  readonly today = input<Date | null>(null);
  /** Count shown by « Sans date »; `null` hides the button. */
  readonly unscheduledCount = input<number | null>(null);
  /** No dragging, no creation. */
  readonly readonly = input(false, { transform: booleanAttribute });
  /** Name of the calendar group. */
  readonly ariaLabel = input('Calendrier');
  /** Locale of the day and month names (`Intl.DateTimeFormat`). */
  readonly locale = input('fr');
  /** Overrides of the French texts. */
  readonly labels = input<Partial<CwCalendarViewLabels>>({});

  /** An item dropped on another day or slot. */
  readonly itemMove = output<CwCalendarItemMove<T>>();
  /** A request to create an item on a day or at a slot. */
  readonly create = output<CwCalendarCreate>();
  /** An item opened by a click or Enter. */
  readonly open = output<T>();
  /** « Sans date » pressed: the panel of items to schedule. */
  readonly unscheduledOpen = output();

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  private readonly announcer = inject(LiveAnnouncer);
  private readonly itemDef = contentChild(CwCalendarItemDef);

  /** The item content template (`CwCalendarItemDef`), for the day part. */
  readonly itemTemplate = computed(
    () => this.itemDef()?.template as TemplateRef<CwCalendarItemContext<unknown>> | undefined,
  );
  /** The French texts with the `labels` overrides. */
  readonly texts = computed<CwCalendarViewLabels>(() => ({
    ...CW_CALENDAR_VIEW_LABELS,
    ...this.labels(),
  }));
  /** The class strings the day part shares with the view. */
  readonly classes = {
    more: MORE,
    add: ADD,
    row: ROW,
    addRow: ADD_ROW,
    preview: PREVIEW,
    ghost: GHOST,
  };
  protected readonly hourClass = HOUR;

  /** Spans moved here, shown until new `items` arrive. */
  private readonly moved = linkedSignal<ReadonlyMap<string, CwCalendarSpan>>(() => {
    this.items();
    return new Map();
  });
  private readonly cursor = signal<Cursor | null>(null);
  private readonly grabbed = signal<{ readonly id: string; readonly from: Cursor } | null>(null);
  private readonly dragging = signal<string | null>(null);
  private readonly dragOver = signal<string | null>(null);

  protected readonly now = computed(() => this.today() ?? new Date());
  protected readonly shown = computed(() => startOfDay(this.date() ?? this.now()));

  private readonly formats = computed(() => {
    const locale = this.locale();
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

  private readonly entries = computed<readonly Entry<T>[]>(() => {
    const track = this.trackBy();
    const label = this.itemLabel();
    const spanOf = this.itemSpan();
    const moved = this.moved();
    const entries: Entry<T>[] = [];
    for (const item of this.items()) {
      const id = track(item);
      const span = moved.get(id) ?? spanOf(item);
      if (span) entries.push({ id, item, label: label(item), span });
    }
    return entries;
  });

  /** The shown weekdays (0 Sunday … 6 Saturday) in order. */
  private readonly weekdays = computed(() => {
    const days = Array.from({ length: 7 }, (_, index) => (this.weekStartsOn() + index) % 7);
    return this.showWeekends() ? days : days.filter((day) => day !== 0 && day !== 6);
  });

  protected readonly columnsClass = computed(() => COLUMNS[this.weekdays().length === 5 ? 5 : 7]);

  /** The days of the week of `date`, weekends dropped when hidden. */
  private daysOfWeek(date: Date): Date[] {
    const first = startOfWeek(date, this.weekStartsOn());
    const shown = this.weekdays();
    return Array.from({ length: 7 }, (_, index) => addDays(first, index)).filter((day) =>
      shown.includes(day.getDay()),
    );
  }

  /** Changes with the month or week shown, so the grid is drawn anew and fades in. */
  protected readonly gridKey = computed(() => {
    const shown = this.shown();
    const start =
      this.view() === 'month' ? startOfMonth(shown) : startOfWeek(shown, this.weekStartsOn());
    return `${this.view()}:${String(dayKey(start))}`;
  });

  protected readonly title = computed(() => {
    const formats = this.formats();
    if (this.view() === 'month') return capitalize(formats.month.format(this.shown()));
    const days = this.daysOfWeek(this.shown());
    const first = days.at(0) ?? this.shown();
    const last = days.at(-1) ?? first;
    const year = String(last.getFullYear());
    if (sameMonth(first, last)) {
      return `${String(first.getDate())} – ${String(last.getDate())} ${formats.monthShort.format(last)} ${year}`;
    }
    return `${formats.dayShort.format(first)} – ${formats.dayShort.format(last)} ${year}`;
  });

  protected readonly gridLabel = computed(() => {
    if (this.view() === 'month') return this.title();
    const days = this.daysOfWeek(this.shown());
    const first = days.at(0) ?? this.shown();
    const last = days.at(-1) ?? first;
    return this.format(this.texts().weekGrid, {
      from: String(first.getDate()),
      to: `${this.formats().dayLong.format(last)} ${String(last.getFullYear())}`,
    });
  });

  /** The day and slot that hold the tab stop: the cursor while shown, else today, else the first day. */
  private readonly activeCursor = computed<Cursor>(() => {
    const days = this.view() === 'month' ? this.monthDays().flat() : this.daysOfWeek(this.shown());
    const cursor = this.cursor();
    const slots = this.slotMinutesList();
    if (cursor && days.some((day) => sameDay(day, cursor.date))) {
      const slot =
        this.view() === 'week' && cursor.slot !== null && slots.includes(cursor.slot)
          ? cursor.slot
          : null;
      return { ...cursor, slot };
    }
    const today = days.find((day) => sameDay(day, this.now()));
    const shown = days.find((day) => sameDay(day, this.shown()));
    const date = shown ?? today ?? days.at(0) ?? this.shown();
    return { day: dayKey(date), date, slot: null };
  });

  private readonly monthDays = computed(() => {
    const month = startOfMonth(this.shown());
    const first = startOfWeek(month, this.weekStartsOn());
    return Array.from({ length: WEEKS_SHOWN }, (_, week) =>
      this.daysOfWeek(addDays(first, week * 7)),
    );
  });

  private readonly slotMinutesList = computed(() => {
    const [from, to] = this.hours();
    const step = this.slotMinutes();
    const list: number[] = [];
    for (let minutes = from * 60; minutes < to * 60; minutes += step) list.push(minutes);
    return list;
  });

  protected readonly weekHeaders = computed<readonly WeekHeader[]>(() => {
    const formats = this.formats();
    const days =
      this.view() === 'month' ? (this.monthDays()[0] ?? []) : this.daysOfWeek(this.shown());
    return days.map((day) => ({
      key: String(dayKey(day)),
      short: formats.weekdayShort.format(day),
      long: formats.weekdayLong.format(day),
      number: String(day.getDate()),
      today: this.view() === 'week' && sameDay(day, this.now()),
    }));
  });

  protected readonly monthWeeks = computed<readonly (readonly DayView[])[]>(() => {
    if (this.view() !== 'month') return [];
    const weeks = this.monthDays();
    const delay = { value: 0 };
    return weeks.map((days, week) =>
      this.layoutDays(days, this.maxPerDay(), MONTH_TOP, false, week === weeks.length - 1, delay),
    );
  });

  protected readonly allDayRow = computed<readonly DayView[]>(() => {
    if (this.view() !== 'week') return [];
    return this.layoutDays(this.daysOfWeek(this.shown()), 2, WEEK_TOP, true, true, { value: 0 });
  });

  protected readonly slotRows = computed<readonly SlotRow[]>(() => {
    if (this.view() !== 'week') return [];
    const days = this.daysOfWeek(this.shown());
    const slots = this.slotMinutesList();
    const step = this.slotMinutes();
    const [from, to] = this.hours();
    const cursor = this.activeCursor();
    const formats = this.formats();
    const now = this.now();
    const grabbed = this.grabbed();
    const target = this.dropTargetKey();
    const blocks = new Map<string, BlockView[]>();
    let delay = 0;
    for (const entry of this.entries()) {
      if (entry.span.allDay) continue;
      const day = days.find((candidate) => sameDay(candidate, entry.span.start));
      if (!day) continue;
      const startMinutes = minutesOf(entry.span.start);
      const endMinutes = sameDay(entry.span.start, entry.span.end)
        ? minutesOf(entry.span.end)
        : 24 * 60;
      const top = Math.min(Math.max(startMinutes, from * 60), to * 60 - step);
      const bottom = Math.max(Math.min(endMinutes, to * 60), top + step);
      const slot = slots[Math.floor((top - from * 60) / step)] ?? from * 60;
      const key = cellKey(day, slot);
      const list = blocks.get(key) ?? [];
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
        const key = cellKey(day, minutes);
        const nowMinutes = minutesOf(now);
        const holdsNow = sameDay(day, now) && nowMinutes >= minutes && nowMinutes < minutes + step;
        const top = minutes % 60 === 0 && row > 0 ? ' border-t' : '';
        const left = column > 0 ? ' border-l' : '';
        const tone = target === key ? 'bg-selected' : 'hover:bg-accent';
        return {
          key,
          date: day,
          label: `${formats.full.format(day)}, ${formatTime(minutes)}`,
          tabStop: dayKey(day) === cursor.day && cursor.slot === minutes,
          target: target === key,
          cellClass: `${SLOT} ${SLOT_HEIGHTS[step]} ${tone}${top}${left}`,
          drop: { date: day, slot: minutes, allDayRow: false },
          blocks: blocks.get(key) ?? [],
          now: holdsNow ? ((nowMinutes - minutes) / 60) * HOUR_HEIGHT : null,
        };
      }),
    }));
  });

  /** The cell under a dragged item, or the keyboard target of a grabbed one. */
  private readonly dropTargetKey = computed(() => {
    if (this.grabbed()) {
      const cursor = this.activeCursor();
      return cellKey(cursor.date, cursor.slot);
    }
    return this.dragging() ? this.dragOver() : null;
  });

  /** Replaces the `{name}` placeholders of a text. */
  protected format(template: string, values: Record<string, string | number>): string {
    return template.replace(/\{(\w+)\}/g, (match, name: string) =>
      name in values ? String(values[name]) : match,
    );
  }

  protected setView(value: CwToggleGroupValue): void {
    if (value === 'month' || value === 'week') this.view.set(value);
  }

  protected goToday(): void {
    const today = startOfDay(this.now());
    this.date.set(today);
    this.cursor.set({ day: dayKey(today), date: today, slot: null });
  }

  protected step(direction: number): void {
    const shown = this.shown();
    this.date.set(
      this.view() === 'month' ? addMonths(shown, direction) : addDays(shown, 7 * direction),
    );
  }

  protected onCellFocus(date: Date, slot: number | null): void {
    this.cursor.set({ day: dayKey(date), date, slot });
  }

  /** Part handler (`CalendarViewHost`), not for consumers. */
  openItem(context: CwCalendarItemContext<unknown>): void {
    this.open.emit(context.$implicit as T);
  }

  /** Part handler (`CalendarViewHost`), not for consumers. */
  createOn(date: Date, slot: number | null, allDay: boolean): void {
    if (this.readonly()) return;
    this.create.emit({ date: slot === null ? startOfDay(date) : atMinutes(date, slot), allDay });
  }

  /** Part handler (`CalendarViewHost`), not for consumers. */
  onDragStart(id: string): void {
    this.dragging.set(id);
  }

  /** Part handler (`CalendarViewHost`), not for consumers. */
  onDragEnd(): void {
    this.dragging.set(null);
    this.dragOver.set(null);
  }

  protected onEnter(key: string): void {
    this.dragOver.set(key);
  }

  protected onDrop(event: CdkDragDrop<DropData, DropData, string>): void {
    if (event.previousContainer === event.container) return;
    const entry = this.entries().find((candidate) => candidate.id === event.item.data);
    if (entry) this.moveEntry(entry, event.container.data);
  }

  /** Part handler (`CalendarViewHost`), not for consumers. */
  onItemKeydown(event: KeyboardEvent, id: string): void {
    if (event.key !== ' ' || this.readonly() || this.grabbed()) return;
    event.preventDefault();
    event.stopPropagation();
    const entry = this.entries().find((candidate) => candidate.id === id);
    if (!entry) return;
    const from = this.cursorOf(entry);
    this.grabbed.set({ id, from });
    this.focusCell(from);
    this.announce(this.format(this.texts().grabbed, { item: entry.label }));
  }

  protected onGridKeydown(event: KeyboardEvent): void {
    const cell = (event.target as HTMLElement).closest<HTMLElement>('[data-cell]');
    if (!cell || event.altKey || event.ctrlKey || event.metaKey) return;
    const onCell = event.target === cell;
    const cursor = this.activeCursor();
    const grabbed = this.grabbed();
    const week = this.view() === 'week';
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
        const days = this.daysOfWeek(cursor.date);
        const day = event.key === 'Home' ? days[0] : days.at(-1);
        if (day) next = this.at(day, cursor.slot);
        break;
      }
      case 'PageUp':
      case 'PageDown': {
        const sign = event.key === 'PageUp' ? -1 : 1;
        next = this.at(
          week ? addDays(cursor.date, 7 * sign) : addMonths(cursor.date, sign),
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
        this.focusCell(grabbed.from);
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

  /** T, M, S and N on a cell (Calendar View sheet, "Clavier"). */
  private letter(key: string, cursor: Cursor): boolean {
    switch (key.toLowerCase()) {
      case 't':
        this.goToday();
        this.focusCell(this.at(startOfDay(this.now()), null));
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

  private dropGrabbed(cursor: Cursor): void {
    const grabbed = this.grabbed();
    this.grabbed.set(null);
    if (!grabbed) return;
    const entry = this.entries().find((candidate) => candidate.id === grabbed.id);
    if (!entry) return;
    const same = cursor.day === grabbed.from.day && cursor.slot === grabbed.from.slot;
    if (!same) {
      const week = this.view() === 'week';
      this.moveEntry(entry, {
        date: cursor.date,
        slot: cursor.slot,
        allDayRow: week && cursor.slot === null,
      });
    }
    this.focusCell(cursor);
  }

  /** Gives an item its new span (duration kept) and emits `itemMove`. */
  private moveEntry(entry: Entry<T>, to: DropData): void {
    const { start, end, allDay } = entry.span;
    let span: CwCalendarSpan;
    if (to.slot !== null) {
      // Into a slot: a timed item keeps its duration; an all-day one becomes an hour long.
      const duration = allDay ? 60 * 60_000 : end.getTime() - start.getTime();
      const begin = atMinutes(to.date, to.slot);
      span = { start: begin, end: new Date(begin.getTime() + duration), allDay: false };
    } else if (to.allDayRow && !allDay) {
      span = { start: startOfDay(to.date), end: startOfDay(to.date), allDay: true };
    } else {
      // Onto a day: the item keeps its times and its number of days.
      const shift = daysBetween(start, to.date);
      span = { start: addDays(start, shift), end: addDays(end, shift), allDay };
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

  private shiftDay(cursor: Cursor, step: number): Cursor {
    const shown = this.weekdays();
    let date = addDays(cursor.date, step);
    while (!shown.includes(date.getDay())) date = addDays(date, step);
    return this.at(date, cursor.slot);
  }

  private shiftSlot(cursor: Cursor, step: number): Cursor {
    const slots = this.slotMinutesList();
    // The all-day row (`null`) sits above the first slot.
    const index = cursor.slot === null ? -1 : slots.indexOf(cursor.slot);
    const next = Math.min(Math.max(index + step, -1), slots.length - 1);
    return { ...cursor, slot: next < 0 ? null : (slots[next] ?? null) };
  }

  /** The cell an item sits in: its day, and in the week view the slot of its start. */
  private cursorOf(entry: Entry<T>): Cursor {
    const slots = this.slotMinutesList();
    if (this.view() !== 'week' || entry.span.allDay) return this.at(entry.span.start, null);
    const minutes = minutesOf(entry.span.start);
    const slot =
      [...slots].reverse().find((candidate) => candidate <= minutes) ?? slots.at(0) ?? null;
    return this.at(entry.span.start, slot);
  }

  private at(date: Date, slot: number | null): Cursor {
    const day = startOfDay(date);
    return { day: dayKey(day), date: day, slot };
  }

  /** Moves the keyboard to a cell, bringing its month (or week) in, and focuses it once drawn. */
  private focusCell(cursor: Cursor): void {
    this.cursor.set(cursor);
    const visible =
      this.view() === 'month'
        ? sameMonth(cursor.date, this.shown())
        : this.daysOfWeek(this.shown()).some((day) => sameDay(day, cursor.date));
    if (!visible) this.date.set(cursor.date);
    const key = cellKey(cursor.date, cursor.slot);
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
   * Lays out a row of days: bars across days on the first lines (one line is kept for the others),
   * then the one-day items, then « +n autres » when they do not fit in `lines`.
   */
  private layoutDays(
    days: readonly Date[],
    lines: number,
    top: number,
    allDayRow: boolean,
    lastRow: boolean,
    delay: { value: number },
  ): DayView[] {
    const texts = this.texts();
    const formats = this.formats();
    const cursor = this.activeCursor();
    const grabbed = this.grabbed()?.id ?? null;
    const target = this.dropTargetKey();
    const now = this.now();
    const month = this.shown();
    const first = days.at(0);
    const last = days.at(-1);
    if (!first || !last) return [];
    const keys = days.map(dayKey);
    const bars: { entry: Entry<T>; from: number; to: number; row: number }[] = [];
    const singles = new Map<number, Entry<T>[]>();
    const rowsEnd: number[] = [];
    const barRows = Math.max(0, lines - 1);
    const covering = (entry: Entry<T>): number[] => {
      const from = dayKey(entry.span.start);
      const to = dayKey(entry.span.end);
      return keys
        .map((key, index) => (key >= from && key <= to ? index : -1))
        .filter((index) => index >= 0);
    };
    const sorted = [...this.entries()].sort(
      (a, b) =>
        Number(b.span.allDay) - Number(a.span.allDay) ||
        a.span.start.getTime() - b.span.start.getTime(),
    );
    const addSingle = (index: number, entry: Entry<T>): void => {
      const key = keys[index] ?? 0;
      singles.set(key, [...(singles.get(key) ?? []), entry]);
    };
    for (const entry of sorted) {
      if (allDayRow && !entry.span.allDay) continue;
      const multi = entry.span.allDay && !sameDay(entry.span.start, entry.span.end);
      const columns = multi ? covering(entry) : [];
      if (!multi) {
        const index = keys.indexOf(dayKey(entry.span.start));
        if (index >= 0) addSingle(index, entry);
        continue;
      }
      const from = columns.at(0);
      const to = columns.at(-1);
      if (from === undefined || to === undefined) continue;
      let row = rowsEnd.findIndex((end) => end < from);
      if (row < 0) row = rowsEnd.length;
      if (row < barRows) {
        rowsEnd[row] = to;
        bars.push({ entry, from, to, row });
      } else {
        // No line left for one more bar: it shows as a pill on each of its days.
        for (const index of columns) addSingle(index, entry);
      }
    }
    const count = days.length;
    return days.map((date, index): DayView => {
      const key = cellKey(date, null);
      const covered = bars.filter((bar) => bar.from <= index && bar.to >= index);
      const reserved = covered.reduce((max, bar) => Math.max(max, bar.row + 1), 0);
      const own = singles.get(keys[index] ?? 0) ?? [];
      const available = lines - reserved;
      const fits = own.length <= available;
      const shownSingles = fits ? own : own.slice(0, Math.max(0, available - 1));
      const hidden = own.length - shownSingles.length;
      const today = sameDay(date, now);
      const outside = !allDayRow && !sameMonth(date, month);
      const all = [...covered.map((bar) => bar.entry), ...own];
      const countText = this.format(all.length > 1 ? texts.countOther : texts.countOne, {
        count: all.length,
      });
      const right = index < count - 1;
      let edges: Edges = lastRow ? 'none' : 'bottom';
      if (allDayRow) edges = index > 0 ? 'left' : 'none';
      else if (right) edges = lastRow ? 'right' : 'both';
      const tone = target === key ? 'target' : 'rest';
      const name = formats.full.format(date);
      return {
        date,
        key,
        label: all.length > 0 ? `${name}, ${countText}` : name,
        number:
          date.getDate() === 1 && !allDayRow
            ? formats.dayShort.format(date)
            : String(date.getDate()),
        numberClass: NUMBERS[today ? 'today' : outside ? 'outside' : 'plain'],
        today,
        outside,
        tabStop: dayKey(date) === cursor.day && cursor.slot === null,
        target: target === key,
        cellClass: `${allDayRow ? ALL_DAY_CELL : CELL} ${CELL_EDGES[edges]} ${CELL_TONES[tone]}`,
        drop: { date, slot: null, allDayRow },
        spacers: Array.from({ length: reserved }, (_, line) => line),
        pills: shownSingles.map((entry) =>
          this.itemView(entry, allDayRow ? 'week' : 'month', entry.id === grabbed, delay.value++),
        ),
        bars: bars
          .filter((bar) => bar.from === index)
          .map((bar): BarView => {
            const span = bar.to - bar.from + 1;
            const continues = dayKey(bar.entry.span.end) > (keys[bar.to] ?? 0);
            const base = this.itemView(bar.entry, 'bar', bar.entry.id === grabbed, delay.value++);
            const range = `${formats.dayShort.format(bar.entry.span.start)} – ${formats.dayShort.format(bar.entry.span.end)}`;
            return {
              ...base,
              title: this.format(texts.range, {
                item: bar.entry.label,
                from: String(bar.entry.span.start.getDate()),
                to: formats.dayShort.format(bar.entry.span.end),
              }),
              classes: `${base.classes} absolute${continues ? ' rounded-r-none' : ''}`,
              top: `${String(top + bar.row * LINE)}px`,
              left: `calc(100% * ${String(bar.from)} / ${String(count)} + 4px)`,
              width: `calc(100% * ${String(span)} / ${String(count)} - 8px)`,
              continues,
              range,
            };
          }),
        all: all.map((entry) => this.itemView(entry, 'list', false, 0)),
        more:
          hidden > 0
            ? this.format(hidden > 1 ? texts.moreOther : texts.moreOne, { count: hidden })
            : null,
        popoverTitle: capitalize(formats.dayMonth.format(date)),
        popoverLabel: `${capitalize(formats.dayMonth.format(date))}, ${countText}`,
        createLabel: this.format(texts.createOn, { date: formats.dayLong.format(date) }),
        addLabel: this.format(texts.addOn, { date: formats.dayShort.format(date) }),
      };
    });
  }

  private itemView(
    entry: Entry<T>,
    view: CwCalendarItemPlace,
    grabbed: boolean,
    index: number,
  ): ItemView {
    return {
      id: entry.id,
      title: entry.label,
      classes: `${PILL} ${PILL_TONES[grabbed ? 'grabbed' : 'rest']}${view === 'month' || view === 'week' ? ' w-full' : ''}`,
      // Mockup motion: items enter one by one, 60 ms then +30 ms, twelve at most.
      delay: 60 + 30 * Math.min(index, 11),
      context: { $implicit: entry.item, view, span: entry.span },
    };
  }

  private announce(message: string): void {
    void this.announcer.announce(message, 'polite');
  }
}
