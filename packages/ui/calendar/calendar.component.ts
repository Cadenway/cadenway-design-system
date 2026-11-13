import { Directionality } from '@angular/cdk/bidi';
import {
  afterNextRender,
  booleanAttribute,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { type ControlValueAccessor, NgControl } from '@angular/forms';
import type { FormValueControl } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorCaretDownBold,
  phosphorCaretLeftBold,
  phosphorCaretRightBold,
} from '@ng-icons/phosphor-icons/bold';

import { CwButton } from '@cadenway/ui/button';
import { CwRipple } from '@cadenway/ui/core';

import {
  addDays,
  addMonths,
  dayKey,
  isoWeek,
  sameDay,
  sameMonth,
  startOfDay,
  startOfMonth,
} from './calendar.dates';
import type {
  CwCalendarCaptionLayout,
  CwCalendarMode,
  CwCalendarSelection,
  CwDateDisabledFn,
  CwDateRange,
  CwWeekStart,
} from './calendar.types';

/* Literal class strings (Calendar sheet and preview of the Design System artifact), so Tailwind
   finds them in the compiled package. */
const DAY =
  'relative isolate overflow-hidden inline-flex size-8 items-center justify-center rounded-md text-sm tabular-nums transition-colors motion-reduce:transition-none hover:bg-accent outline-hidden focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:text-muted-foreground disabled:line-through disabled:opacity-50';

type DayTone = 'endpoint' | 'today' | 'outside' | 'plain';

const DAY_TONES: Record<DayTone, string> = {
  endpoint: 'bg-foreground font-medium text-background hover:bg-foreground/90',
  today: 'font-semibold text-primary',
  outside: 'text-muted-foreground',
  plain: '',
};

/* The range band sits on the cell, rounded at the ends of the range and of each week. */
type Band = 'none' | 'middle' | 'start' | 'end' | 'single';

const CELLS: Record<Band, string> = {
  none: 'p-0 text-center',
  middle: 'p-0 text-center bg-selected',
  start: 'p-0 text-center bg-selected rounded-l-md',
  end: 'p-0 text-center bg-selected rounded-r-md',
  single: 'p-0 text-center bg-selected rounded-md',
};

const SELECT =
  'h-7 appearance-none rounded-md border border-input bg-transparent ps-2 pe-6 text-sm scheme-light dark:scheme-dark hover:bg-accent outline-hidden transition-[color,background-color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 disabled:pointer-events-none disabled:opacity-50';

/** One day of the grid, as the template draws it. */
interface CalendarDay {
  readonly date: Date;
  readonly key: number;
  readonly label: string;
  readonly number: string;
  readonly outside: boolean;
  readonly hidden: boolean;
  readonly disabled: boolean;
  readonly today: boolean;
  readonly selected: boolean;
  readonly rangeStart: boolean;
  readonly rangeMiddle: boolean;
  readonly rangeEnd: boolean;
  readonly cellClass: string;
  readonly dayClass: string;
}

interface CalendarWeek {
  readonly number: number;
  readonly days: readonly CalendarDay[];
}

interface CaptionOption {
  readonly value: number;
  readonly label: string;
}

const WEEKS_SHOWN = 6;

function isRange(value: unknown): value is CwDateRange {
  return (
    typeof value === 'object' && value !== null && 'start' in value && value.start instanceof Date
  );
}

/* Signal Forms binds `min` and `max` typed as the value (a day or a range): read the bound day. */
function lowerBound(value: unknown): Date | undefined {
  if (value instanceof Date) return value;
  return isRange(value) ? value.start : undefined;
}

function upperBound(value: unknown): Date | undefined {
  if (value instanceof Date) return value;
  return isRange(value) ? (value.end ?? undefined) : undefined;
}

function sameSelection(a: CwCalendarSelection, b: CwCalendarSelection): boolean {
  if (a === b) return true;
  if (a instanceof Date && b instanceof Date) return sameDay(a, b);
  if (isRange(a) && isRange(b)) {
    const ends = a.end === null || b.end === null ? a.end === b.end : sameDay(a.end, b.end);
    return sameDay(a.start, b.start) && ends;
  }
  return false;
}

/**
 * The month calendar, week on Monday: pick a day or a range (Calendar sheet of the Design System
 * artifact). It sits in a Date Picker, a card or the sidebar, which frame it: it has no border.
 *
 * `[(selected)]` holds a `Date` (`mode="single"`) or a `{ start, end }` range (`mode="range"`, `end`
 * is `null` after the first pick); `[(month)]` is the month shown (by default the month of the
 * selection, else the current one). The calendar is a Signal Forms value control (`[formField]`
 * binds its `value`, which mirrors `selected`) and the value accessor of a Reactive or
 * template-driven form control. `min`, `max` and the `disabledDates` predicate disable days (struck
 * through, skipped by the arrows); `disabled` disables the whole calendar. Today is marked by
 * `aria-current="date"` and a bold amethyst figure.
 *
 * Keyboard (`role="grid"`, one focusable day): arrows move by a day or a week, Home and End go to
 * the start and end of the week, Page Up and Page Down change month (with Shift, year), Enter and
 * Space pick. Names come from `Intl.DateTimeFormat` in `locale` (« 18 novembre 2026 »).
 */
@Component({
  selector: 'cw-calendar',
  imports: [CwButton, CwRipple, NgIcon],
  providers: [
    provideIcons({ phosphorCaretDownBold, phosphorCaretLeftBold, phosphorCaretRightBold }),
  ],
  host: {
    class: 'block w-fit p-3',
    '[attr.data-mode]': 'mode()',
    '[attr.data-disabled]': 'isDisabled() ? "" : null',
    '(focusout)': 'onFocusout($event)',
    '(keydown)': 'onKeydown($event)',
  },
  templateUrl: './calendar.component.html',
})
export class CwCalendar implements FormValueControl<CwCalendarSelection>, ControlValueAccessor {
  /** One day or a range. */
  readonly mode = input<CwCalendarMode>('single');
  /** The selection, `[(selected)]`: a `Date` in `single` mode, a `{ start, end }` range otherwise. */
  readonly selected = model<CwCalendarSelection>(null);
  /** The same selection under the name Signal Forms binds (`[formField]`); prefer `selected`. */
  readonly value = model<CwCalendarSelection>(null);
  /** The month shown, `[(month)]`; follows the selection, else today, until navigated. */
  readonly month = model<Date | null>(null);
  /**
   * First day that can be picked. Typed like the value because Signal Forms binds it so; a range
   * bounds by its start.
   */
  readonly min = input<NonNullable<CwCalendarSelection> | undefined, unknown>(undefined, {
    transform: lowerBound,
  });
  /** Last day that can be picked; a range bounds by its end. */
  readonly max = input<NonNullable<CwCalendarSelection> | undefined, unknown>(undefined, {
    transform: upperBound,
  });
  /** Days that cannot be picked (public holidays, week-ends). */
  readonly disabledDates = input<CwDateDisabledFn | null>(null);
  /** First day of the week: Monday (1) in French. */
  readonly weekStartsOn = input<CwWeekStart>(1);
  /** Shows the days of the neighbouring months (muted, clickable). */
  readonly showOutsideDays = input(true, { transform: booleanAttribute });
  /** Adds a column of ISO week numbers (sprint planning). */
  readonly showWeekNumbers = input(false, { transform: booleanAttribute });
  /** Month title, or month and year lists for distant dates. */
  readonly captionLayout = input<CwCalendarCaptionLayout>('label');
  /** Locale of the day and month names (`Intl.DateTimeFormat`). */
  readonly locale = input('fr');
  /** Disables every day and the navigation (Signal Forms binds it from the field). */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Invalid state given by Signal Forms. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Touched state given by Signal Forms. */
  readonly touched = input(false, { transform: booleanAttribute });
  /** Required state given by Signal Forms. */
  readonly required = input(false, { transform: booleanAttribute });
  /** Name of the previous-month button. */
  readonly previousMonthLabel = input('Mois précédent');
  /** Name of the next-month button. */
  readonly nextMonthLabel = input('Mois suivant');
  /** Name of the month list (`captionLayout="dropdown"`). */
  readonly monthListLabel = input('Mois');
  /** Name of the year list (`captionLayout="dropdown"`). */
  readonly yearListLabel = input('Année');
  /** Full name of the week-number column. */
  readonly weekLabel = input('Semaine');
  /** Header of the week-number column. */
  readonly weekShortLabel = input('S.');
  /** Emitted when focus leaves the calendar: Signal Forms marks the field touched. */
  readonly touch = output();

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  private readonly direction = inject(Directionality, { optional: true });
  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly formDisabled = signal(false);
  private readonly current = signal<CwCalendarSelection>(null);
  /** The day that holds (or last held) the keyboard focus. */
  private readonly active = signal<Date | null>(null);
  private onChange: (value: CwCalendarSelection) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  private readonly minDay = computed(() => lowerBound(this.min()));
  private readonly maxDay = computed(() => upperBound(this.max()));

  protected readonly selectClass = SELECT;
  protected readonly today = signal(startOfDay(new Date()));
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  protected readonly shownMonth = computed(() => {
    const month = this.month();
    if (month) return startOfMonth(month);
    const selection = this.current();
    const anchor = isRange(selection) ? selection.start : selection;
    return startOfMonth(anchor ?? this.today());
  });

  private readonly formats = computed(() => {
    const locale = this.locale();
    return {
      title: new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }),
      day: new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }),
      weekdayShort: new Intl.DateTimeFormat(locale, { weekday: 'short' }),
      weekdayLong: new Intl.DateTimeFormat(locale, { weekday: 'long' }),
      monthShort: new Intl.DateTimeFormat(locale, { month: 'short' }),
    };
  });

  protected readonly title = computed(() => this.formats().title.format(this.shownMonth()));

  protected readonly weekdays = computed(() => {
    const formats = this.formats();
    // 2026-11-16 is a Monday: the seven days from the first day of the week.
    const monday = new Date(2026, 10, 16);
    const first = addDays(monday, this.weekStartsOn() - 1);
    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(first, index);
      // The sheet's two-letter headers (« lu ma me je ve sa di ») from the short names (« lun. »).
      const short = formats.weekdayShort.format(date).replace('.', '').slice(0, 2);
      return { short, long: formats.weekdayLong.format(date) };
    });
  });

  protected readonly weeks = computed<readonly CalendarWeek[]>(() => {
    const month = this.shownMonth();
    const offset = (month.getDay() - this.weekStartsOn() + 7) % 7;
    const first = addDays(month, -offset);
    const selection = this.current();
    const formats = this.formats();
    const today = this.today();
    const range = this.mode() === 'range' && isRange(selection) ? selection : null;
    const rangeEnd = range?.end && !sameDay(range.start, range.end) ? range.end : null;
    const single = this.mode() === 'single' ? (selection instanceof Date ? selection : null) : null;

    return Array.from({ length: WEEKS_SHOWN }, (_, week) => {
      const days = Array.from({ length: 7 }, (_, column): CalendarDay => {
        const date = addDays(first, week * 7 + column);
        const key = dayKey(date);
        const outside = !sameMonth(date, month);
        const hidden = outside && !this.showOutsideDays();
        const isStart = range !== null && sameDay(date, range.start);
        const isEnd = rangeEnd !== null && sameDay(date, rangeEnd);
        const inside =
          range !== null &&
          rangeEnd !== null &&
          key > dayKey(range.start) &&
          key < dayKey(rangeEnd);
        const endpoint = (single !== null && sameDay(date, single)) || isStart || isEnd;
        const isToday = sameDay(date, today);
        let band: Band = 'none';
        if (!hidden && rangeEnd !== null && (isStart || isEnd || inside)) {
          const left = isStart || column === 0;
          const right = isEnd || column === 6;
          band = left && right ? 'single' : left ? 'start' : right ? 'end' : 'middle';
        }
        const tone: DayTone = endpoint
          ? 'endpoint'
          : isToday
            ? 'today'
            : outside
              ? 'outside'
              : 'plain';
        return {
          date,
          key,
          label: formats.day.format(date),
          number: String(date.getDate()),
          outside,
          hidden,
          disabled: this.isDisabled() || this.dateDisabled(date),
          today: isToday,
          selected: endpoint || inside,
          rangeStart: isStart && rangeEnd !== null,
          rangeMiddle: inside,
          rangeEnd: isEnd,
          cellClass: CELLS[band],
          dayClass: `${DAY} ${DAY_TONES[tone]}`,
        };
      });
      // ISO weeks start on Monday; with a Sunday start the row's Thursday still names the week.
      return { number: isoWeek(days[4]?.date ?? first), days };
    });
  });

  /** The key of the one focusable day: the focused one, the selection, today, the first day. */
  protected readonly tabStop = computed(() => {
    const days = this.weeks()
      .flatMap((week) => week.days)
      .filter((day) => !day.outside && !day.disabled);
    const find = (date: Date | null): CalendarDay | undefined =>
      date ? days.find((day) => sameDay(day.date, date)) : undefined;
    const selection = this.current();
    const anchor = isRange(selection) ? selection.start : selection;
    return (find(this.active()) ?? find(anchor) ?? find(this.today()) ?? days.at(0))?.key ?? null;
  });

  protected readonly previousDisabled = computed(() => {
    const min = this.minDay();
    return this.isDisabled() || (!!min && this.shownMonth() <= startOfMonth(min));
  });

  protected readonly nextDisabled = computed(() => {
    const max = this.maxDay();
    return this.isDisabled() || (!!max && this.shownMonth() >= startOfMonth(max));
  });

  protected readonly monthOptions = computed<readonly CaptionOption[]>(() => {
    const year = this.shownMonth().getFullYear();
    return Array.from({ length: 12 }, (_, index) => ({
      value: index,
      label: this.formats().monthShort.format(new Date(year, index, 1)),
    }));
  });

  protected readonly yearOptions = computed<readonly CaptionOption[]>(() => {
    const shown = this.shownMonth().getFullYear();
    const from = Math.min(this.minDay()?.getFullYear() ?? shown - 10, shown);
    const to = Math.max(this.maxDay()?.getFullYear() ?? shown + 10, shown);
    return Array.from({ length: to - from + 1 }, (_, index) => ({
      value: from + index,
      label: String(from + index),
    }));
  });

  constructor() {
    // Reactive and template-driven forms: this calendar is the control's value accessor. Set here
    // rather than through NG_VALUE_ACCESSOR, as on cw-checkbox.
    if (this.ngControl) this.ngControl.valueAccessor = this;

    // `selected` (the sheet's name) and `value` (the Signal Forms name) are one selection: the one
    // written last wins. Each effect skips its model's untouched default, so an unbound model never
    // erases the bound one.
    this.follow(() => this.selected());
    this.follow(() => this.value());
  }

  /** Moves the focus to the focusable day (Signal Forms calls it to focus an invalid field). */
  focus(options?: FocusOptions): void {
    this.dayButton(this.tabStop())?.focus(options);
  }

  writeValue(value: unknown): void {
    this.commit(value instanceof Date || isRange(value) ? value : null, false);
  }

  registerOnChange(fn: (value: CwCalendarSelection) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  protected showMonth(offset: number): void {
    this.month.set(addMonths(this.shownMonth(), offset));
  }

  protected pickMonth(event: Event): void {
    const index = Number((event.target as HTMLSelectElement).value);
    this.month.set(new Date(this.shownMonth().getFullYear(), index, 1));
  }

  protected pickYear(event: Event): void {
    const year = Number((event.target as HTMLSelectElement).value);
    this.month.set(new Date(year, this.shownMonth().getMonth(), 1));
  }

  protected pick(day: CalendarDay): void {
    if (day.disabled) return;
    let next: CwCalendarSelection = day.date;
    if (this.mode() === 'range') {
      const selection = this.current();
      const open = isRange(selection) && selection.end === null ? selection : null;
      if (!open) next = { start: day.date, end: null };
      else if (dayKey(day.date) < dayKey(open.start)) next = { start: day.date, end: open.start };
      else next = { start: open.start, end: day.date };
    }
    this.commit(next, true);
    // A day of a neighbouring month brings its month in (Calendar sheet, "Hors mois").
    this.moveFocus(day.date, false);
  }

  protected onDayFocus(day: CalendarDay): void {
    this.active.set(day.date);
  }

  protected onKeydown(event: KeyboardEvent): void {
    // Only the days navigate: the month and year lists keep their own arrows.
    const onDay = (event.target as HTMLElement).dataset['day'] !== undefined;
    const from = this.active();
    if (!onDay || !from || event.altKey || event.ctrlKey || event.metaKey) return;
    const rtl = this.direction?.value === 'rtl';
    const startOfWeek = (from.getDay() - this.weekStartsOn() + 7) % 7;
    let target: Date;
    let step: number;
    switch (event.key) {
      case 'ArrowLeft':
        step = rtl ? 1 : -1;
        target = addDays(from, step);
        break;
      case 'ArrowRight':
        step = rtl ? -1 : 1;
        target = addDays(from, step);
        break;
      case 'ArrowUp':
        step = -7;
        target = addDays(from, step);
        break;
      case 'ArrowDown':
        step = 7;
        target = addDays(from, step);
        break;
      case 'Home':
        step = 1;
        target = addDays(from, -startOfWeek);
        break;
      case 'End':
        step = -1;
        target = addDays(from, 6 - startOfWeek);
        break;
      case 'PageUp':
        step = 1;
        target = addMonths(from, event.shiftKey ? -12 : -1);
        break;
      case 'PageDown':
        step = -1;
        target = addMonths(from, event.shiftKey ? 12 : 1);
        break;
      default:
        return;
    }
    event.preventDefault();
    const reachable = this.reachable(target, step);
    if (reachable) this.moveFocus(reachable, true);
  }

  protected onFocusout(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (next && this.element.contains(next)) return;
    this.onTouched();
    this.touch.emit();
  }

  /**
   * The nearest pickable day from `target`, walking by `step` days (arrows keep their direction;
   * Home, End and the page keys walk back towards the day they left). Null when none is in reach.
   */
  private reachable(target: Date, step: number): Date | null {
    const min = this.minDay();
    const max = this.maxDay();
    let candidate = target;
    for (let index = 0; index < 366; index += 1) {
      if (!this.dateDisabled(candidate)) return candidate;
      const key = dayKey(candidate);
      if ((min && step < 0 && key < dayKey(min)) || (max && step > 0 && key > dayKey(max))) {
        return null;
      }
      candidate = addDays(candidate, step);
    }
    return null;
  }

  private outOfBounds(date: Date): boolean {
    const min = this.minDay();
    const max = this.maxDay();
    return (!!min && dayKey(date) < dayKey(min)) || (!!max && dayKey(date) > dayKey(max));
  }

  private dateDisabled(date: Date): boolean {
    return this.outOfBounds(date) || (this.disabledDates()?.(date) ?? false);
  }

  private moveFocus(date: Date, focus: boolean): void {
    this.active.set(date);
    if (!sameMonth(date, this.shownMonth())) this.month.set(startOfMonth(date));
    afterNextRender(
      {
        write: () => {
          const button = this.dayButton(dayKey(date));
          if (
            focus ||
            (button && this.element.contains(this.element.ownerDocument.activeElement))
          ) {
            button?.focus();
          }
        },
      },
      { injector: this.injector },
    );
  }

  private dayButton(key: number | null): HTMLButtonElement | null {
    if (key === null) return null;
    return this.element.querySelector<HTMLButtonElement>(`button[data-day="${String(key)}"]`);
  }

  private commit(next: CwCalendarSelection, fromUser: boolean): void {
    const value = next instanceof Date ? startOfDay(next) : next;
    this.current.set(value);
    this.selected.set(value);
    this.value.set(value);
    if (fromUser) this.onChange(value);
  }

  private follow(read: () => CwCalendarSelection): void {
    let seen: CwCalendarSelection = null;
    effect(() => {
      const value = read();
      if (sameSelection(value, seen)) return;
      seen = value;
      untracked(() => {
        if (!sameSelection(value, this.current())) this.current.set(value);
      });
    });
  }
}
