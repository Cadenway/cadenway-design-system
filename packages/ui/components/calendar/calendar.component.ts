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
  type InputSignal,
  type InputSignalWithTransform,
  type ModelSignal,
  type OutputEmitterRef,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import { type ControlValueAccessor, NgControl } from '@angular/forms';
import type { FormValueControl } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorCaretDownBold,
  phosphorCaretLeftBold,
  phosphorCaretRightBold,
} from '@ng-icons/phosphor-icons/bold';

import { CwButton } from '@cadenway/ui/components/button';
import {
  CwRipple,
  ɵaddDays,
  ɵaddMonths,
  ɵdayKey,
  ɵisoWeek,
  ɵsameDay,
  ɵsameMonth,
  ɵstartOfDay,
  ɵstartOfMonth,
} from '@cadenway/ui/core';

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
/**
 * Constant DAY
 *
 * @description
 * Classes for an interactive day button, including focus and disabled states.
 *
 * @type {string}
 */
const DAY: string =
  'relative isolate overflow-hidden inline-flex size-8 items-center justify-center rounded-md text-sm tabular-nums transition-colors motion-reduce:transition-none hover:bg-accent outline-hidden focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:text-muted-foreground disabled:line-through disabled:opacity-50';

/**
 * Type DayTone
 *
 * @description
 * Visual tone assigned to a day button.
 *
 * @type {'endpoint' | 'today' | 'outside' | 'plain'}
 */
type DayTone = 'endpoint' | 'today' | 'outside' | 'plain';

/**
 * Constant DAY_TONES
 *
 * @description
 * Maps each day tone to its color classes.
 *
 * @type {Record<DayTone, string>}
 */
const DAY_TONES: Record<DayTone, string> = {
  endpoint: 'bg-foreground font-medium text-background hover:bg-foreground/90',
  today: 'font-semibold text-primary',
  outside: 'text-muted-foreground',
  plain: '',
};

/* The range band sits on the cell, rounded at the ends of the range and of each week. */
/**
 * Type Band
 *
 * @description
 * Position of a cell within a selected range band.
 *
 * @type {'none' | 'middle' | 'start' | 'end' | 'single'}
 */
type Band = 'none' | 'middle' | 'start' | 'end' | 'single';

/**
 * Constant CELLS
 *
 * @description
 * Maps range-band positions to cell classes.
 *
 * @type {Record<Band, string>}
 */
const CELLS: Record<Band, string> = {
  none: 'p-0 text-center',
  middle: 'p-0 text-center bg-selected',
  start: 'p-0 text-center bg-selected rounded-l-md',
  end: 'p-0 text-center bg-selected rounded-r-md',
  single: 'p-0 text-center bg-selected rounded-md',
};

/**
 * Constant SELECT
 *
 * @description
 * Classes used by the month and year dropdowns.
 *
 * @type {string}
 */
const SELECT: string =
  'h-7 appearance-none rounded-md border border-input bg-transparent ps-2 pe-6 text-sm scheme-light dark:scheme-dark hover:bg-accent outline-hidden transition-[color,background-color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 disabled:pointer-events-none disabled:opacity-50';

/**
 * Interface CalendarDay
 *
 * @description
 * One day of the grid, as the template draws it.
 */
interface CalendarDay {
  // #region Properties
  /**
   * Property date
   *
   * @description
   * Date represented by the day cell.
   *
   * @type {Date}
   * @readonly
   */
  readonly date: Date;

  /**
   * Property key
   *
   * @description
   * Numeric day key used for focus and comparisons.
   *
   * @type {number}
   * @readonly
   */
  readonly key: number;

  /**
   * Property label
   *
   * @description
   * Localized accessible day label.
   *
   * @type {string}
   * @readonly
   */
  readonly label: string;

  /**
   * Property number
   *
   * @description
   * Day-of-month text displayed in the cell.
   *
   * @type {string}
   * @readonly
   */
  readonly number: string;

  /**
   * Property outside
   *
   * @description
   * Whether the day belongs to a neighboring month.
   *
   * @type {boolean}
   * @readonly
   */
  readonly outside: boolean;

  /**
   * Property hidden
   *
   * @description
   * Whether an outside day is hidden.
   *
   * @type {boolean}
   * @readonly
   */
  readonly hidden: boolean;

  /**
   * Property disabled
   *
   * @description
   * Whether the day cannot be selected.
   *
   * @type {boolean}
   * @readonly
   */
  readonly disabled: boolean;

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

  /**
   * Property selected
   *
   * @description
   * Whether the day belongs to the selection.
   *
   * @type {boolean}
   * @readonly
   */
  readonly selected: boolean;

  /**
   * Property rangeStart
   *
   * @description
   * Whether the day starts a completed range.
   *
   * @type {boolean}
   * @readonly
   */
  readonly rangeStart: boolean;

  /**
   * Property rangeMiddle
   *
   * @description
   * Whether the day lies inside a completed range.
   *
   * @type {boolean}
   * @readonly
   */
  readonly rangeMiddle: boolean;

  /**
   * Property rangeEnd
   *
   * @description
   * Whether the day ends a completed range.
   *
   * @type {boolean}
   * @readonly
   */
  readonly rangeEnd: boolean;

  /**
   * Property cellClass
   *
   * @description
   * Classes used to draw the selection band.
   *
   * @type {string}
   * @readonly
   */
  readonly cellClass: string;

  /**
   * Property dayClass
   *
   * @description
   * Classes used to draw the day button.
   *
   * @type {string}
   * @readonly
   */
  readonly dayClass: string;
  // #endregion
}

/**
 * Interface CalendarWeek
 *
 * @description
 * Week number and day cells for one grid row.
 */
interface CalendarWeek {
  // #region Properties
  /**
   * Property number
   *
   * @description
   * ISO week number displayed beside the row.
   *
   * @type {number}
   * @readonly
   */
  readonly number: number;

  /**
   * Property days
   *
   * @description
   * Day cells displayed in the week.
   *
   * @type {readonly CalendarDay[]}
   * @readonly
   */
  readonly days: readonly CalendarDay[];
  // #endregion
}

/**
 * Interface CaptionOption
 *
 * @description
 * Value and label for a month or year dropdown option.
 */
interface CaptionOption {
  // #region Properties
  /**
   * Property value
   *
   * @description
   * Value represented by the dropdown option.
   *
   * @type {number}
   * @readonly
   */
  readonly value: number;

  /**
   * Property label
   *
   * @description
   * Localized label displayed for the dropdown option.
   *
   * @type {string}
   * @readonly
   */
  readonly label: string;
  // #endregion
}

/**
 * Constant WEEKS_SHOWN
 *
 * @description
 * Number of week rows rendered in the calendar grid.
 *
 * @type {number}
 */
const WEEKS_SHOWN: number = 6;

/**
 * Function isRange
 *
 * @description
 * Checks whether a value is a date range with a Date start.
 *
 * @param {unknown} value - Value to inspect or apply.
 * @returns {value is CwDateRange} Whether the value contains a Date start.
 */
function isRange(value: unknown): value is CwDateRange {
  return (
    typeof value === 'object' && value !== null && 'start' in value && value.start instanceof Date
  );
}

/* Signal Forms binds `min` and `max` typed as the value (a day or a range): read the bound day. */
/**
 * Function lowerBound
 *
 * @description
 * Extracts the first day from a date or range bound.
 *
 * @param {unknown} value - Value to inspect or apply.
 * @returns {Date | undefined} First bound day, or undefined when absent.
 */
function lowerBound(value: unknown): Date | undefined {
  if (value instanceof Date) return value;
  return isRange(value) ? value.start : undefined;
}

/**
 * Function upperBound
 *
 * @description
 * Extracts the last day from a date or range bound.
 *
 * @param {unknown} value - Value to inspect or apply.
 * @returns {Date | undefined} Last bound day, or undefined when absent.
 */
function upperBound(value: unknown): Date | undefined {
  if (value instanceof Date) return value;
  return isRange(value) ? (value.end ?? undefined) : undefined;
}

/**
 * Function sameSelection
 *
 * @description
 * Compares two selections by their calendar days.
 *
 * @param {CwCalendarSelection} a - First selection to compare.
 * @param {CwCalendarSelection} b - Second selection to compare.
 * @returns {boolean} Whether both selections represent the same days.
 */
function sameSelection(a: CwCalendarSelection, b: CwCalendarSelection): boolean {
  if (a === b) return true;
  if (a instanceof Date && b instanceof Date) return ɵsameDay(a, b);
  if (isRange(a) && isRange(b)) {
    const ends: boolean =
      a.end === null || b.end === null ? a.end === b.end : ɵsameDay(a.end, b.end);
    return ɵsameDay(a.start, b.start) && ends;
  }
  return false;
}

/**
 * Component CwCalendar
 *
 * @description
 * The month calendar, week on Monday: pick a day or a range (Calendar sheet of the Design System artifact). It sits in a Date Picker, a card or the sidebar, which frame it: it has no border. `[(selected)]` holds a `Date` (`mode="single"`) or a `{ start, end }` range (`mode="range"`, `end` is `null` after the first pick); `[(month)]` is the month shown (by default the month of the selection, else the current one). The calendar is a Signal Forms value control (`[formField]` binds its `value`, which mirrors `selected`) and the value accessor of a Reactive or template-driven form control. `min`, `max` and the `disabledDates` predicate disable days (struck through, skipped by the arrows); `disabled` disables the whole calendar. Today is marked by `aria-current="date"` and a bold amethyst figure. Keyboard (`role="grid"`, one focusable day): arrows move by a day or a week, Home and End go to the start and end of the week, Page Up and Page Down change month (with Shift, year), Enter and Space pick. Names come from `Intl.DateTimeFormat` in `locale` (« 18 novembre 2026 »).
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
  // #region Properties
  /**
   * Property mode
   *
   * @description
   * One day or a range.
   *
   * @type {InputSignal<CwCalendarMode>}
   * @readonly
   */
  public readonly mode: InputSignal<CwCalendarMode> = input<CwCalendarMode>('single');

  /**
   * Property selected
   *
   * @description
   * The selection, `[(selected)]`: a `Date` in `single` mode, a `{ start, end }` range otherwise.
   *
   * @type {ModelSignal<CwCalendarSelection>}
   * @readonly
   */
  public readonly selected: ModelSignal<CwCalendarSelection> = model<CwCalendarSelection>(null);

  /**
   * Property value
   *
   * @description
   * The same selection under the name Signal Forms binds (`[formField]`); prefer `selected`.
   *
   * @type {ModelSignal<CwCalendarSelection>}
   * @readonly
   */
  public readonly value: ModelSignal<CwCalendarSelection> = model<CwCalendarSelection>(null);

  /**
   * Property month
   *
   * @description
   * The month shown, `[(month)]`; follows the selection, else today, until navigated.
   *
   * @type {ModelSignal<Date | null>}
   * @readonly
   */
  public readonly month: ModelSignal<Date | null> = model<Date | null>(null);

  /**
   * Property min
   *
   * @description
   * First day that can be picked. Typed like the value because Signal Forms binds it so; a range bounds by its start.
   *
   * @type {InputSignalWithTransform<NonNullable<CwCalendarSelection> | undefined, unknown>}
   * @readonly
   */
  public readonly min: InputSignalWithTransform<
    NonNullable<CwCalendarSelection> | undefined,
    unknown
  > = input<NonNullable<CwCalendarSelection> | undefined, unknown>(undefined, {
    transform: lowerBound,
  });

  /**
   * Property max
   *
   * @description
   * Last day that can be picked; a range bounds by its end.
   *
   * @type {InputSignalWithTransform<NonNullable<CwCalendarSelection> | undefined, unknown>}
   * @readonly
   */
  public readonly max: InputSignalWithTransform<
    NonNullable<CwCalendarSelection> | undefined,
    unknown
  > = input<NonNullable<CwCalendarSelection> | undefined, unknown>(undefined, {
    transform: upperBound,
  });

  /**
   * Property disabledDates
   *
   * @description
   * Days that cannot be picked (public holidays, week-ends).
   *
   * @type {InputSignal<CwDateDisabledFn | null>}
   * @readonly
   */
  public readonly disabledDates: InputSignal<CwDateDisabledFn | null> =
    input<CwDateDisabledFn | null>(null);

  /**
   * Property weekStartsOn
   *
   * @description
   * First day of the week: Monday (1) in French.
   *
   * @type {InputSignal<CwWeekStart>}
   * @readonly
   */
  public readonly weekStartsOn: InputSignal<CwWeekStart> = input<CwWeekStart>(1);

  /**
   * Property showOutsideDays
   *
   * @description
   * Shows the days of the neighbouring months (muted, clickable).
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly showOutsideDays: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  /**
   * Property showWeekNumbers
   *
   * @description
   * Adds a column of ISO week numbers (sprint planning).
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly showWeekNumbers: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property captionLayout
   *
   * @description
   * Month title, or month and year lists for distant dates.
   *
   * @type {InputSignal<CwCalendarCaptionLayout>}
   * @readonly
   */
  public readonly captionLayout: InputSignal<CwCalendarCaptionLayout> =
    input<CwCalendarCaptionLayout>('label');

  /**
   * Property locale
   *
   * @description
   * Locale of the day and month names (`Intl.DateTimeFormat`).
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly locale: InputSignal<string> = input('fr');

  /**
   * Property disabled
   *
   * @description
   * Disables every day and the navigation (Signal Forms binds it from the field).
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly disabled: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property invalid
   *
   * @description
   * Invalid state given by Signal Forms.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly invalid: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property touched
   *
   * @description
   * Touched state given by Signal Forms.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly touched: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property required
   *
   * @description
   * Required state given by Signal Forms.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly required: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property previousMonthLabel
   *
   * @description
   * Name of the previous-month button.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly previousMonthLabel: InputSignal<string> = input('Mois précédent');

  /**
   * Property nextMonthLabel
   *
   * @description
   * Name of the next-month button.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly nextMonthLabel: InputSignal<string> = input('Mois suivant');

  /**
   * Property monthListLabel
   *
   * @description
   * Name of the month list (`captionLayout="dropdown"`).
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly monthListLabel: InputSignal<string> = input('Mois');

  /**
   * Property yearListLabel
   *
   * @description
   * Name of the year list (`captionLayout="dropdown"`).
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly yearListLabel: InputSignal<string> = input('Année');

  /**
   * Property weekLabel
   *
   * @description
   * Full name of the week-number column.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly weekLabel: InputSignal<string> = input('Semaine');

  /**
   * Property weekShortLabel
   *
   * @description
   * Header of the week-number column.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly weekShortLabel: InputSignal<string> = input('S.');

  /**
   * Property touch
   *
   * @description
   * Emitted when focus leaves the calendar: Signal Forms marks the field touched.
   *
   * @type {OutputEmitterRef<void>}
   * @readonly
   */
  public readonly touch: OutputEmitterRef<void> = output();

  /**
   * Property element
   *
   * @description
   * Calendar host used to locate day buttons and inspect focus.
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
   * Property direction
   *
   * @description
   * Optional text direction used for horizontal keyboard navigation.
   *
   * @type {Directionality | null}
   * @readonly
   */
  private readonly direction: Directionality | null = inject(Directionality, { optional: true });

  /**
   * Property ngControl
   *
   * @description
   * Optional forms control whose value accessor is this calendar.
   *
   * @type {NgControl | null}
   * @readonly
   */
  private readonly ngControl: NgControl | null = inject(NgControl, { optional: true, self: true });

  /**
   * Property formDisabled
   *
   * @description
   * Disabled state supplied by a forms control.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  private readonly formDisabled: WritableSignal<boolean> = signal(false);

  /**
   * Property current
   *
   * @description
   * Current selection shared by the two model inputs.
   *
   * @type {WritableSignal<CwCalendarSelection>}
   * @readonly
   */
  private readonly current: WritableSignal<CwCalendarSelection> = signal<CwCalendarSelection>(null);

  /**
   * Property active
   *
   * @description
   * The day that holds (or last held) the keyboard focus.
   *
   * @type {WritableSignal<Date | null>}
   * @readonly
   */
  private readonly active: WritableSignal<Date | null> = signal<Date | null>(null);

  /**
   * Property onChange
   *
   * @description
   * Callback notified of user-driven selection changes.
   *
   * @type {(value: CwCalendarSelection) => void}
   */
  private onChange: (value: CwCalendarSelection) => void = () => undefined;

  /**
   * Property onTouched
   *
   * @description
   * Callback notified when focus leaves the calendar.
   *
   * @type {() => void}
   */
  private onTouched: () => void = () => undefined;

  /**
   * Property minDay
   *
   * @description
   * Lower date bound extracted from the configured input.
   *
   * @type {Signal<Date | undefined>}
   * @readonly
   */
  private readonly minDay: Signal<Date | undefined> = computed(() => lowerBound(this.min()));

  /**
   * Property maxDay
   *
   * @description
   * Upper date bound extracted from the configured input.
   *
   * @type {Signal<Date | undefined>}
   * @readonly
   */
  private readonly maxDay: Signal<Date | undefined> = computed(() => upperBound(this.max()));

  /**
   * Property selectClass
   *
   * @description
   * Classes applied to the month and year dropdowns.
   *
   * @type {string}
   * @readonly
   */
  protected readonly selectClass: string = SELECT;

  /**
   * Property today
   *
   * @description
   * Whether the day is today.
   *
   * @type {WritableSignal<Date>}
   * @readonly
   */
  protected readonly today: WritableSignal<Date> = signal(ɵstartOfDay(new Date()));

  /**
   * Property isDisabled
   *
   * @description
   * Whether the input or forms control disables the calendar.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly isDisabled: Signal<boolean> = computed(
    () => this.disabled() || this.formDisabled(),
  );

  /**
   * Property shownMonth
   *
   * @description
   * Month currently displayed, falling back to the selection or today.
   *
   * @type {Signal<Date>}
   * @readonly
   */
  protected readonly shownMonth: Signal<Date> = computed(() => {
    const month: Date | null = this.month();
    if (month) return ɵstartOfMonth(month);
    const selection: CwCalendarSelection = this.current();
    const anchor: Date | null = isRange(selection) ? selection.start : selection;
    return ɵstartOfMonth(anchor ?? this.today());
  });

  /**
   * Property formats
   *
   * @description
   * Localized formatters for the calendar title, days, weekdays and months.
   *
   * @type {Signal<{ title: Intl.DateTimeFormat; day: Intl.DateTimeFormat; weekdayShort: Intl.DateTimeFormat; weekdayLong: Intl.DateTimeFormat; monthShort: Intl.DateTimeFormat; }>}
   * @readonly
   */
  private readonly formats: Signal<{
    title: Intl.DateTimeFormat;
    day: Intl.DateTimeFormat;
    weekdayShort: Intl.DateTimeFormat;
    weekdayLong: Intl.DateTimeFormat;
    monthShort: Intl.DateTimeFormat;
  }> = computed(() => {
    const locale: string = this.locale();
    return {
      title: new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }),
      day: new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }),
      weekdayShort: new Intl.DateTimeFormat(locale, { weekday: 'short' }),
      weekdayLong: new Intl.DateTimeFormat(locale, { weekday: 'long' }),
      monthShort: new Intl.DateTimeFormat(locale, { month: 'short' }),
    };
  });

  /**
   * Property title
   *
   * @description
   * Localized title for the displayed month.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly title: Signal<string> = computed(() =>
    this.formats().title.format(this.shownMonth()),
  );

  /**
   * Property weekdays
   *
   * @description
   * Short and accessible weekday labels in configured week order.
   *
   * @type {Signal<{ short: string; long: string; }[]>}
   * @readonly
   */
  protected readonly weekdays: Signal<{ short: string; long: string }[]> = computed(() => {
    const formats: {
      title: Intl.DateTimeFormat;
      day: Intl.DateTimeFormat;
      weekdayShort: Intl.DateTimeFormat;
      weekdayLong: Intl.DateTimeFormat;
      monthShort: Intl.DateTimeFormat;
    } = this.formats();
    // 2026-11-16 is a Monday: the seven days from the first day of the week.
    const monday: Date = new Date(2026, 10, 16);
    const first: Date = ɵaddDays(monday, this.weekStartsOn() - 1);
    return Array.from({ length: 7 }, (_, index) => {
      const date: Date = ɵaddDays(first, index);
      // The sheet's two-letter headers (« lu ma me je ve sa di ») from the short names (« lun. »).
      const short: string = formats.weekdayShort.format(date).replace('.', '').slice(0, 2);
      return { short, long: formats.weekdayLong.format(date) };
    });
  });

  /**
   * Property weeks
   *
   * @description
   * Six rows of day cells for the displayed month and its neighbors.
   *
   * @type {Signal<readonly CalendarWeek[]>}
   * @readonly
   */
  protected readonly weeks: Signal<readonly CalendarWeek[]> = computed<readonly CalendarWeek[]>(
    () => {
      const month: Date = this.shownMonth();
      const offset: number = (month.getDay() - this.weekStartsOn() + 7) % 7;
      const first: Date = ɵaddDays(month, -offset);
      const selection: CwCalendarSelection = this.current();
      const formats: {
        title: Intl.DateTimeFormat;
        day: Intl.DateTimeFormat;
        weekdayShort: Intl.DateTimeFormat;
        weekdayLong: Intl.DateTimeFormat;
        monthShort: Intl.DateTimeFormat;
      } = this.formats();
      const today: Date = this.today();
      const range: CwDateRange | null =
        this.mode() === 'range' && isRange(selection) ? selection : null;
      const rangeEnd: Date | null =
        range?.end && !ɵsameDay(range.start, range.end) ? range.end : null;
      const single: Date | null =
        this.mode() === 'single' ? (selection instanceof Date ? selection : null) : null;

      return Array.from({ length: WEEKS_SHOWN }, (_, week) => {
        const days: CalendarDay[] = Array.from({ length: 7 }, (_, column): CalendarDay => {
          const date: Date = ɵaddDays(first, week * 7 + column);
          const key: number = ɵdayKey(date);
          const outside: boolean = !ɵsameMonth(date, month);
          const hidden: boolean = outside && !this.showOutsideDays();
          const isStart: boolean = range !== null && ɵsameDay(date, range.start);
          const isEnd: boolean = rangeEnd !== null && ɵsameDay(date, rangeEnd);
          const inside: boolean =
            range !== null &&
            rangeEnd !== null &&
            key > ɵdayKey(range.start) &&
            key < ɵdayKey(rangeEnd);
          const endpoint: boolean = (single !== null && ɵsameDay(date, single)) || isStart || isEnd;
          const isToday: boolean = ɵsameDay(date, today);
          let band: Band = 'none';
          if (!hidden && rangeEnd !== null && (isStart || isEnd || inside)) {
            const left: boolean = isStart || column === 0;
            const right: boolean = isEnd || column === 6;
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
        return { number: ɵisoWeek(days[4]?.date ?? first), days };
      });
    },
  );

  /**
   * Property tabStop
   *
   * @description
   * The key of the one focusable day: the focused one, the selection, today, the first day.
   *
   * @type {Signal<number | null>}
   * @readonly
   */
  protected readonly tabStop: Signal<number | null> = computed(() => {
    const days: CalendarDay[] = this.weeks()
      .flatMap((week) => week.days)
      .filter((day) => !day.outside && !day.disabled);
    const find: (date: Date | null) => CalendarDay | undefined = (
      date: Date | null,
    ): CalendarDay | undefined => (date ? days.find((day) => ɵsameDay(day.date, date)) : undefined);
    const selection: CwCalendarSelection = this.current();
    const anchor: Date | null = isRange(selection) ? selection.start : selection;
    return (find(this.active()) ?? find(anchor) ?? find(this.today()) ?? days.at(0))?.key ?? null;
  });

  /**
   * Property previousDisabled
   *
   * @description
   * Whether previous-month navigation is unavailable.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly previousDisabled: Signal<boolean> = computed(() => {
    const min: Date | undefined = this.minDay();
    return this.isDisabled() || (!!min && this.shownMonth() <= ɵstartOfMonth(min));
  });

  /**
   * Property nextDisabled
   *
   * @description
   * Whether next-month navigation is unavailable.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly nextDisabled: Signal<boolean> = computed(() => {
    const max: Date | undefined = this.maxDay();
    return this.isDisabled() || (!!max && this.shownMonth() >= ɵstartOfMonth(max));
  });

  /**
   * Property monthOptions
   *
   * @description
   * Localized month choices for the displayed year.
   *
   * @type {Signal<readonly CaptionOption[]>}
   * @readonly
   */
  protected readonly monthOptions: Signal<readonly CaptionOption[]> = computed<
    readonly CaptionOption[]
  >(() => {
    const year: number = this.shownMonth().getFullYear();
    return Array.from({ length: 12 }, (_, index) => ({
      value: index,
      label: this.formats().monthShort.format(new Date(year, index, 1)),
    }));
  });

  /**
   * Property yearOptions
   *
   * @description
   * Year choices bounded by configured dates and the displayed year.
   *
   * @type {Signal<readonly CaptionOption[]>}
   * @readonly
   */
  protected readonly yearOptions: Signal<readonly CaptionOption[]> = computed<
    readonly CaptionOption[]
  >(() => {
    const shown: number = this.shownMonth().getFullYear();
    const from: number = Math.min(this.minDay()?.getFullYear() ?? shown - 10, shown);
    const to: number = Math.max(this.maxDay()?.getFullYear() ?? shown + 10, shown);
    return Array.from({ length: to - from + 1 }, (_, index) => ({
      value: from + index,
      label: String(from + index),
    }));
  });
  // #endregion

  // #region Constructor
  /**
   * Constructor
   *
   * @description
   * Connects the value accessor and keeps the selection models synchronized.
   *
   * @constructor
   */
  public constructor() {
    // Reactive and template-driven forms: this calendar is the control's value accessor. Set here
    // rather than through NG_VALUE_ACCESSOR, as on cw-checkbox.
    if (this.ngControl) this.ngControl.valueAccessor = this;

    // `selected` (the sheet's name) and `value` (the Signal Forms name) are one selection: the one
    // written last wins. Each effect skips its model's untouched default, so an unbound model never
    // erases the bound one.
    this.follow(() => this.selected());
    this.follow(() => this.value());
  }
  // #endregion

  // #region Methods
  /**
   * Method focus
   *
   * @description
   * Moves the focus to the focusable day (Signal Forms calls it to focus an invalid field).
   *
   * @param {FocusOptions} options - Optional browser focus behavior.
   */
  public focus(options?: FocusOptions): void {
    this.dayButton(this.tabStop())?.focus(options);
  }

  /**
   * Method writeValue
   *
   * @description
   * Applies a date or range received from the form control.
   *
   * @param {unknown} value - Value to inspect or apply.
   */
  public writeValue(value: unknown): void {
    this.commit(value instanceof Date || isRange(value) ? value : null, false);
  }

  /**
   * Method registerOnChange
   *
   * @description
   * Registers the form value-change callback.
   *
   * @param {(value: CwCalendarSelection) => void} fn - Callback registered by the form control.
   */
  public registerOnChange(fn: (value: CwCalendarSelection) => void): void {
    this.onChange = fn;
  }

  /**
   * Method registerOnTouched
   *
   * @description
   * Registers the form touched callback.
   *
   * @param {() => void} fn - Callback registered by the form control.
   */
  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Method setDisabledState
   *
   * @description
   * Updates the disabled state supplied by the form.
   *
   * @param {boolean} isDisabled - Disabled state supplied by the form.
   */
  public setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  /**
   * Method showMonth
   *
   * @description
   * Moves the displayed month by a signed offset.
   *
   * @param {number} offset - Signed number of months to move.
   */
  protected showMonth(offset: number): void {
    this.month.set(ɵaddMonths(this.shownMonth(), offset));
  }

  /**
   * Method pickMonth
   *
   * @description
   * Changes the displayed month from the dropdown selection.
   *
   * @param {Event} event - Browser event associated with the interaction.
   */
  protected pickMonth(event: Event): void {
    const index: number = Number((event.target as HTMLSelectElement).value);
    this.month.set(new Date(this.shownMonth().getFullYear(), index, 1));
  }

  /**
   * Method pickYear
   *
   * @description
   * Changes the displayed year from the dropdown selection.
   *
   * @param {Event} event - Browser event associated with the interaction.
   */
  protected pickYear(event: Event): void {
    const year: number = Number((event.target as HTMLSelectElement).value);
    this.month.set(new Date(year, this.shownMonth().getMonth(), 1));
  }

  /**
   * Method pick
   *
   * @description
   * Selects an enabled day or completes the current range.
   *
   * @param {CalendarDay} day - Calendar day involved in the interaction.
   */
  protected pick(day: CalendarDay): void {
    if (day.disabled) return;
    let next: CwCalendarSelection = day.date;
    if (this.mode() === 'range') {
      const selection: CwCalendarSelection = this.current();
      const open: CwDateRange | null =
        isRange(selection) && selection.end === null ? selection : null;
      if (!open) next = { start: day.date, end: null };
      else if (ɵdayKey(day.date) < ɵdayKey(open.start)) next = { start: day.date, end: open.start };
      else next = { start: open.start, end: day.date };
    }
    this.commit(next, true);
    // A day of a neighbouring month brings its month in (Calendar sheet, "Hors mois").
    this.moveFocus(day.date, false);
  }

  /**
   * Method onDayFocus
   *
   * @description
   * Records the day that received focus.
   *
   * @param {CalendarDay} day - Calendar day involved in the interaction.
   */
  protected onDayFocus(day: CalendarDay): void {
    this.active.set(day.date);
  }

  /**
   * Method onKeydown
   *
   * @description
   * Navigates enabled days using calendar keyboard controls.
   *
   * @param {KeyboardEvent} event - Browser event associated with the interaction.
   */
  protected onKeydown(event: KeyboardEvent): void {
    // Only the days navigate: the month and year lists keep their own arrows.
    const onDay: boolean = (event.target as HTMLElement).dataset['day'] !== undefined;
    const from: Date | null = this.active();
    if (!onDay || !from || event.altKey || event.ctrlKey || event.metaKey) return;
    const rtl: boolean = this.direction?.value === 'rtl';
    const startOfWeek: number = (from.getDay() - this.weekStartsOn() + 7) % 7;
    let target: Date;
    let step: number;
    switch (event.key) {
      case 'ArrowLeft':
        step = rtl ? 1 : -1;
        target = ɵaddDays(from, step);
        break;
      case 'ArrowRight':
        step = rtl ? -1 : 1;
        target = ɵaddDays(from, step);
        break;
      case 'ArrowUp':
        step = -7;
        target = ɵaddDays(from, step);
        break;
      case 'ArrowDown':
        step = 7;
        target = ɵaddDays(from, step);
        break;
      case 'Home':
        step = 1;
        target = ɵaddDays(from, -startOfWeek);
        break;
      case 'End':
        step = -1;
        target = ɵaddDays(from, 6 - startOfWeek);
        break;
      case 'PageUp':
        step = 1;
        target = ɵaddMonths(from, event.shiftKey ? -12 : -1);
        break;
      case 'PageDown':
        step = -1;
        target = ɵaddMonths(from, event.shiftKey ? 12 : 1);
        break;
      default:
        return;
    }
    event.preventDefault();
    const reachable: Date | null = this.reachable(target, step);
    if (reachable) this.moveFocus(reachable, true);
  }

  /**
   * Method onFocusout
   *
   * @description
   * Reports touched state when focus leaves the calendar.
   *
   * @param {FocusEvent} event - Browser event associated with the interaction.
   */
  protected onFocusout(event: FocusEvent): void {
    const next: Node | null = event.relatedTarget as Node | null;
    if (next && this.element.contains(next)) return;
    this.onTouched();
    this.touch.emit();
  }

  /**
   * Method reachable
   *
   * @description
   * The nearest pickable day from `target`, walking by `step` days (arrows keep their direction; Home, End and the page keys walk back towards the day they left). Null when none is in reach.
   *
   * @param {Date} target - Day from which to search for an enabled date.
   * @param {number} step - Signed number of days to advance when searching.
   * @returns {Date | null} Nearest selectable day, or null when none is reached.
   */
  private reachable(target: Date, step: number): Date | null {
    const min: Date | undefined = this.minDay();
    const max: Date | undefined = this.maxDay();
    let candidate: Date = target;
    for (let index: number = 0; index < 366; index += 1) {
      if (!this.dateDisabled(candidate)) return candidate;
      const key: number = ɵdayKey(candidate);
      if ((min && step < 0 && key < ɵdayKey(min)) || (max && step > 0 && key > ɵdayKey(max))) {
        return null;
      }
      candidate = ɵaddDays(candidate, step);
    }
    return null;
  }

  /**
   * Method outOfBounds
   *
   * @description
   * Checks whether a date lies outside the configured bounds.
   *
   * @param {Date} date - Date to inspect or focus.
   * @returns {boolean} Whether the date is outside the configured range.
   */
  private outOfBounds(date: Date): boolean {
    const min: Date | undefined = this.minDay();
    const max: Date | undefined = this.maxDay();
    return (!!min && ɵdayKey(date) < ɵdayKey(min)) || (!!max && ɵdayKey(date) > ɵdayKey(max));
  }

  /**
   * Method dateDisabled
   *
   * @description
   * Checks configured bounds and the disabled-date predicate.
   *
   * @param {Date} date - Date to inspect or focus.
   * @returns {boolean} Whether the date cannot be selected.
   */
  private dateDisabled(date: Date): boolean {
    return this.outOfBounds(date) || (this.disabledDates()?.(date) ?? false);
  }

  /**
   * Method moveFocus
   *
   * @description
   * Records a day, shows its month and optionally focuses its button.
   *
   * @param {Date} date - Date to inspect or focus.
   * @param {boolean} focus - Whether to focus the day button after rendering.
   */
  private moveFocus(date: Date, focus: boolean): void {
    this.active.set(date);
    if (!ɵsameMonth(date, this.shownMonth())) this.month.set(ɵstartOfMonth(date));
    afterNextRender(
      {
        write: () => {
          const button: HTMLButtonElement | null = this.dayButton(ɵdayKey(date));
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

  /**
   * Method dayButton
   *
   * @description
   * Finds the button for a day key in the rendered grid.
   *
   * @param {number | null} key - Numeric key of the day button, or null.
   * @returns {HTMLButtonElement | null} Day button, or null when it is not rendered.
   */
  private dayButton(key: number | null): HTMLButtonElement | null {
    if (key === null) return null;
    return this.element.querySelector<HTMLButtonElement>(`button[data-day="${String(key)}"]`);
  }

  /**
   * Method commit
   *
   * @description
   * Synchronizes the selection models and reports user changes.
   *
   * @param {CwCalendarSelection} next - Selection to apply.
   * @param {boolean} fromUser - Whether to report the change to the form control.
   */
  private commit(next: CwCalendarSelection, fromUser: boolean): void {
    const value: Date | CwDateRange | null = next instanceof Date ? ɵstartOfDay(next) : next;
    this.current.set(value);
    this.selected.set(value);
    this.value.set(value);
    if (fromUser) this.onChange(value);
  }

  /**
   * Method follow
   *
   * @description
   * Keeps the internal selection synchronized with one model input.
   *
   * @param {() => CwCalendarSelection} read - Function reading the model to follow.
   */
  private follow(read: () => CwCalendarSelection): void {
    let seen: CwCalendarSelection = null;
    effect(() => {
      const value: CwCalendarSelection = read();
      if (sameSelection(value, seen)) return;
      seen = value;
      untracked(() => {
        if (!sameSelection(value, this.current())) this.current.set(value);
      });
    });
  }
  // #endregion
}
