import { CdkTrapFocus, _IdGenerator } from '@angular/cdk/a11y';
import {
  afterNextRender,
  booleanAttribute,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  model,
  output,
  signal,
  type TemplateRef,
  untracked,
  viewChild,
  ViewContainerRef,
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
  phosphorCalendarBlankBold,
  phosphorCheckBold,
  phosphorClockBold,
} from '@ng-icons/phosphor-icons/bold';

import { CwButton } from '@cadenway/ui/components/button';
import {
  CwCalendar,
  type CwCalendarMode,
  type CwCalendarSelection,
  type CwDateDisabledFn,
} from '@cadenway/ui/components/calendar';
import {
  CwRipple,
  ɵConnectedPanel,
  ɵPanelStack,
  ɵsameDay,
  ɵstartOfDay,
  type ɵStackedPanel,
} from '@cadenway/ui/core';
import { CwInput } from '@cadenway/ui/components/input';
import {
  CwInputGroup,
  CwInputGroupAddon,
  CwInputGroupButton,
} from '@cadenway/ui/components/input-group';

import type {
  CwDatePickerRange,
  CwDatePickerSize,
  CwDatePickerValue,
  CwDatePickerVariant,
  CwDatePreset,
} from './date-picker.types';

/* Literal class strings (Date Picker sheet and preview of the Design System artifact): the trigger
   takes the classes of the Select trigger, aligned to the start. */
/**
 * Constant TRIGGER
 *
 * @description
 * Base classes for the date-picker button trigger.
 *
 * @type {string}
 */
const TRIGGER: string =
  'relative isolate overflow-hidden group/trigger flex w-full min-w-0 items-center justify-start gap-2 border border-input bg-transparent text-sm whitespace-nowrap transition-[color,background-color,box-shadow] motion-reduce:transition-none hover:bg-accent outline-hidden focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive/60 aria-invalid:ring-destructive/15 data-placeholder:text-muted-foreground [&_ng-icon]:shrink-0 [&_ng-icon]:[--ng-icon__size:1rem]';

/**
 * Constant TRIGGER_SIZES
 *
 * @description
 * Trigger height and spacing classes by size.
 *
 * @type {Record<CwDatePickerSize, string>}
 */
const TRIGGER_SIZES: Record<CwDatePickerSize, string> = {
  sm: 'h-7 rounded-md px-2',
  default: 'h-8 rounded-lg px-2.5',
  lg: 'h-9 rounded-lg px-3',
};

/* The field of the `input` variant: the Input Group field (`input[cwInputGroupInput]`), copied so
   that the picker owns its `aria-invalid` (an unparsable date). */
/**
 * Constant FIELD
 *
 * @description
 * Classes for the typed-date input field.
 *
 * @type {string}
 */
const FIELD: string =
  'h-full min-w-0 flex-1 bg-transparent px-2.5 text-sm tabular-nums outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed';

/**
 * Constant PANEL
 *
 * @description
 * Classes for the floating calendar panel.
 *
 * @type {string}
 */
const PANEL: string =
  'flex w-fit flex-col overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-md animate-menu-in motion-reduce:animate-none data-[state=closed]:animate-menu-out';

/* Presets enter one by one, 60 ms then 30 ms more each, twelve at most (cw-motion-tokens). */
/**
 * Constant PRESETS
 *
 * @description
 * Classes and staggered entrance animation for the preset column.
 *
 * @type {string}
 */
const PRESETS: string =
  'w-48 shrink-0 border-r p-1 *:animate-item-in *:motion-reduce:animate-none [&>*:nth-child(1)]:[animation-delay:60ms] [&>*:nth-child(2)]:[animation-delay:90ms] [&>*:nth-child(3)]:[animation-delay:120ms] [&>*:nth-child(4)]:[animation-delay:150ms] [&>*:nth-child(5)]:[animation-delay:180ms] [&>*:nth-child(6)]:[animation-delay:210ms] [&>*:nth-child(7)]:[animation-delay:240ms] [&>*:nth-child(8)]:[animation-delay:270ms] [&>*:nth-child(9)]:[animation-delay:300ms] [&>*:nth-child(10)]:[animation-delay:330ms] [&>*:nth-child(11)]:[animation-delay:360ms] [&>*:nth-child(12)]:[animation-delay:390ms]';

/**
 * Constant PRESET
 *
 * @description
 * Classes for an individual preset button.
 *
 * @type {string}
 */
const PRESET: string =
  'relative isolate flex w-full cursor-default items-center gap-2 overflow-hidden rounded-md px-2 py-1.5 text-left text-sm whitespace-nowrap select-none transition-colors motion-reduce:transition-none hover:bg-accent aria-pressed:bg-selected outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring [&_ng-icon]:shrink-0 [&_ng-icon]:[--ng-icon__size:1rem]';

/**
 * Constant SHORT_DATE
 *
 * @description
 * The default `format`: the short French date of the sheet, « mer. 18 nov. 2026 ».
 *
 * @type {Intl.DateTimeFormatOptions}
 */
const SHORT_DATE: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
};

/**
 * Constant TYPED
 *
 * @description
 * Pattern accepted for a typed day, month and four-digit year.
 *
 * @type {RegExp}
 */
const TYPED: RegExp = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

/**
 * Function isRange
 *
 * @description
 * Checks whether a value has a Date start for a selected range.
 *
 * @param {unknown} value - Value to inspect or apply.
 * @returns {value is CwDatePickerRange} Whether the value contains a Date start.
 */
function isRange(value: unknown): value is CwDatePickerRange {
  return (
    typeof value === 'object' && value !== null && 'start' in value && value.start instanceof Date
  );
}

/* Signal Forms binds `min` and `max` typed as the value (a day or a period): read the bound day. */
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
  return isRange(value) ? value.end : undefined;
}

/**
 * Function hasTime
 *
 * @description
 * Checks whether a date has a nonzero hour or minute.
 *
 * @param {Date} date - Date to inspect.
 * @returns {boolean} Whether the date has a nonzero hour or minute.
 */
function hasTime(date: Date): boolean {
  return date.getHours() !== 0 || date.getMinutes() !== 0;
}

/**
 * Function pad
 *
 * @description
 * Formats a number with at least two digits.
 *
 * @param {number} value - Value to inspect or apply.
 * @returns {string} Number formatted with at least two digits.
 */
function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/**
 * Component CwDatePicker
 *
 * @description
 * A field that opens a Calendar in a floating panel, with shortcuts: the due date, the start date, the period of a sprint (Date Picker sheet of the Design System artifact). `[(value)]` holds a `Date` (`mode="single"`) or a complete `{ start, end }` period (`mode="range"`; the panel stays open until the end is picked). The picker is a Signal Forms value control (`[formField]`) and the value accessor of a Reactive or template-driven form control; `aria-invalid` follows the control once touched, and an unparsable typed date. `[(open)]` drives the panel, a CDK overlay placed under the trigger (flipped when needed) that opens from the trigger corner (`animate-menu-in`), traps the focus (`role="dialog"`) and closes on Escape or an outside click; the focus returns to the trigger after Escape or a pick. The `button` variant shows the short date (`format`, `Intl.DateTimeFormat` options in `locale`) or the placeholder; Enter, Space and ↓ open it on the picked day (or today). The `input` variant lets the user type « jj/mm/aaaa » and opens the calendar from its button. `presets` (single mode) list shortcuts with their date and a check on the current one; `clearable` adds « Effacer », `withTime` (single mode) « Ajouter une heure ». Name the trigger with `<label for>` (its `id`) or `ariaLabel`; the name then goes on with the visible text (« Échéance, mer. 18 nov. 2026 »).
 */
@Component({
  selector: 'cw-date-picker',
  imports: [
    CdkTrapFocus,
    CwButton,
    CwCalendar,
    CwInput,
    CwInputGroup,
    CwInputGroupAddon,
    CwInputGroupButton,
    CwRipple,
    NgIcon,
  ],
  providers: [
    provideIcons({ phosphorCalendarBlankBold, phosphorCheckBold, phosphorClockBold }),
    ɵConnectedPanel,
  ],
  host: {
    class: 'inline-flex min-w-0',
    '[attr.id]': 'null',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
  },
  templateUrl: './date-picker.component.html',
})
export class CwDatePicker implements FormValueControl<CwDatePickerValue>, ControlValueAccessor {
  // #region Properties
  /**
   * Property value
   *
   * @description
   * The date or the period, `[(value)]`.
   *
   * @type {ModelSignal<CwDatePickerValue>}
   * @readonly
   */
  public readonly value: ModelSignal<CwDatePickerValue> = model<CwDatePickerValue>(null);

  /**
   * Property mode
   *
   * @description
   * One date or a period.
   *
   * @type {InputSignal<CwCalendarMode>}
   * @readonly
   */
  public readonly mode: InputSignal<CwCalendarMode> = input<CwCalendarMode>('single');

  /**
   * Property variant
   *
   * @description
   * A trigger button, or a field to type the date with a button that opens the calendar.
   *
   * @type {InputSignal<CwDatePickerVariant>}
   * @readonly
   */
  public readonly variant: InputSignal<CwDatePickerVariant> = input<CwDatePickerVariant>('button');

  /**
   * Property placeholder
   *
   * @description
   * Text of the empty trigger.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly placeholder: InputSignal<string> = input('Choisir une date');

  /**
   * Property format
   *
   * @description
   * `Intl.DateTimeFormat` options of the shown date; « mer. 18 nov. 2026 » by default.
   *
   * @type {InputSignal<Intl.DateTimeFormatOptions>}
   * @readonly
   */
  public readonly format: InputSignal<Intl.DateTimeFormatOptions> =
    input<Intl.DateTimeFormatOptions>(SHORT_DATE);

  /**
   * Property locale
   *
   * @description
   * Locale of the shown dates and of the calendar.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly locale: InputSignal<string> = input('fr');

  /**
   * Property presets
   *
   * @description
   * Shortcuts shown left of the calendar, in single mode.
   *
   * @type {InputSignal<readonly CwDatePreset[]>}
   * @readonly
   */
  public readonly presets: InputSignal<readonly CwDatePreset[]> = input<readonly CwDatePreset[]>(
    [],
  );

  /**
   * Property clearable
   *
   * @description
   * Shows « Effacer » under the calendar.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly clearable: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  /**
   * Property withTime
   *
   * @description
   * Shows « Ajouter une heure » under the calendar, in single mode.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly withTime: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property min
   *
   * @description
   * First day that can be picked; typed like the value because Signal Forms binds it so.
   *
   * @type {InputSignalWithTransform<NonNullable<CwDatePickerValue> | undefined, unknown>}
   * @readonly
   */
  public readonly min: InputSignalWithTransform<
    NonNullable<CwDatePickerValue> | undefined,
    unknown
  > = input<NonNullable<CwDatePickerValue> | undefined, unknown>(undefined, {
    transform: lowerBound,
  });

  /**
   * Property max
   *
   * @description
   * Last day that can be picked.
   *
   * @type {InputSignalWithTransform<NonNullable<CwDatePickerValue> | undefined, unknown>}
   * @readonly
   */
  public readonly max: InputSignalWithTransform<
    NonNullable<CwDatePickerValue> | undefined,
    unknown
  > = input<NonNullable<CwDatePickerValue> | undefined, unknown>(undefined, {
    transform: upperBound,
  });

  /**
   * Property disabledDates
   *
   * @description
   * Days that cannot be picked (public holidays).
   *
   * @type {InputSignal<CwDateDisabledFn | null>}
   * @readonly
   */
  public readonly disabledDates: InputSignal<CwDateDisabledFn | null> =
    input<CwDateDisabledFn | null>(null);

  /**
   * Property size
   *
   * @description
   * Height of the trigger.
   *
   * @type {InputSignal<CwDatePickerSize>}
   * @readonly
   */
  public readonly size: InputSignal<CwDatePickerSize> = input<CwDatePickerSize>('default');

  /**
   * Property disabled
   *
   * @description
   * Disables the trigger (Signal Forms binds it from the field).
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
   * Invalid state given by Signal Forms; shown once touched.
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
   * Required state given by Signal Forms; `aria-required` on the typed field (a button has none).
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly required: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property open
   *
   * @description
   * Whether the panel is open, `[(open)]`.
   *
   * @type {ModelSignal<boolean>}
   * @readonly
   */
  public readonly open: ModelSignal<boolean> = model(false);

  /**
   * Property id
   *
   * @description
   * Id of the trigger (or of the field), for `<label for>`; generated when not given.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly id: InputSignal<string> = input(inject(_IdGenerator).getId('cw-date-picker-'));

  /**
   * Property ariaLabel
   *
   * @description
   * Accessible name when no label points at the trigger (« Échéance »); the value is appended.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly ariaLabel: InputSignal<string> = input('');

  /**
   * Property dialogLabel
   *
   * @description
   * Name of the panel (`role="dialog"`).
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly dialogLabel: InputSignal<string> = input('Choisir une date');

  /**
   * Property clearLabel
   *
   * @description
   * Label of the clear button.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly clearLabel: InputSignal<string> = input('Effacer');

  /**
   * Property addTimeLabel
   *
   * @description
   * Label of the time button.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly addTimeLabel: InputSignal<string> = input('Ajouter une heure');

  /**
   * Property timeLabel
   *
   * @description
   * Name of the time field.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly timeLabel: InputSignal<string> = input('Heure');

  /**
   * Property openCalendarLabel
   *
   * @description
   * Name of the calendar button of the `input` variant.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly openCalendarLabel: InputSignal<string> = input('Ouvrir le calendrier');

  /**
   * Property inputPlaceholder
   *
   * @description
   * Expected format of the `input` variant, its placeholder.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly inputPlaceholder: InputSignal<string> = input('jj/mm/aaaa');

  /**
   * Property touch
   *
   * @description
   * Emitted when focus leaves the trigger: Signal Forms marks the field touched.
   *
   * @type {OutputEmitterRef<void>}
   * @readonly
   */
  public readonly touch: OutputEmitterRef<void> = output();

  /**
   * Property injector
   *
   * @description
   * Injector used to schedule work after rendering.
   *
   * @type {Injector}
   * @readonly
   */
  private readonly injector: Injector = inject(Injector);

  /**
   * Property viewContainer
   *
   * @description
   * Container used to attach the floating panel.
   *
   * @type {ViewContainerRef}
   * @readonly
   */
  private readonly viewContainer: ViewContainerRef = inject(ViewContainerRef);

  /**
   * Property ngControl
   *
   * @description
   * Optional forms control whose value accessor is this picker.
   *
   * @type {NgControl | null}
   * @readonly
   */
  private readonly ngControl: NgControl | null = inject(NgControl, { optional: true, self: true });

  /**
   * Property panelTemplate
   *
   * @description
   * Template rendered inside the floating panel.
   *
   * @type {Signal<TemplateRef<unknown>>}
   * @readonly
   */
  private readonly panelTemplate: Signal<TemplateRef<unknown>> =
    viewChild.required<TemplateRef<unknown>>('panel');

  /**
   * Property element
   *
   * @description
   * Picker host used as the panel origin.
   *
   * @type {HTMLElement}
   * @readonly
   */
  private readonly element: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /**
   * Property trigger
   *
   * @description
   * Reference to the button trigger or typed field.
   *
   * @type {Signal<ElementRef<HTMLElement> | undefined>}
   * @readonly
   */
  private readonly trigger: Signal<ElementRef<HTMLElement> | undefined> = viewChild<
    string,
    ElementRef<HTMLElement>
  >('trigger', {
    read: ElementRef,
  });

  /**
   * Property calendarButton
   *
   * @description
   * Reference to the calendar button of the input variant.
   *
   * @type {Signal<ElementRef<HTMLElement> | undefined>}
   * @readonly
   */
  private readonly calendarButton: Signal<ElementRef<HTMLElement> | undefined> = viewChild<
    string,
    ElementRef<HTMLElement>
  >('calendarButton', {
    read: ElementRef,
  });

  /**
   * Property calendar
   *
   * @description
   * Calendar displayed inside the open panel.
   *
   * @type {Signal<CwCalendar | undefined>}
   * @readonly
   */
  private readonly calendar: Signal<CwCalendar | undefined> = viewChild(CwCalendar);

  /**
   * Property formDisabled
   *
   * @description
   * Disabled state supplied by the form control.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  private readonly formDisabled: WritableSignal<boolean> = signal(false);

  /**
   * Property accessorTouched
   *
   * @description
   * Whether the value accessor has reported a touch.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  private readonly accessorTouched: WritableSignal<boolean> = signal(false);

  /**
   * Property focusTriggerOnClose
   *
   * @description
   * Whether focus should return to the trigger after the panel closes.
   *
   * @type {boolean}
   */
  private focusTriggerOnClose: boolean = false;

  /**
   * Property onChange
   *
   * @description
   * Callback notified when the user changes the value.
   *
   * @type {(value: CwDatePickerValue) => void}
   */
  private onChange: (value: CwDatePickerValue) => void = () => undefined;

  /**
   * Property onTouched
   *
   * @description
   * Callback notified when the control is touched.
   *
   * @type {() => void}
   */
  private onTouched: () => void = () => undefined;

  /**
   * Property overlay
   *
   * @description
   * Connected panel that renders and positions the calendar.
   *
   * @type {ɵConnectedPanel}
   * @readonly
   */
  protected readonly overlay: ɵConnectedPanel = inject(ɵConnectedPanel);

  /**
   * Property stack
   *
   * @description
   * Shared stack coordinating floating panels.
   *
   * @type {ɵPanelStack}
   * @readonly
   */
  private readonly stack: ɵPanelStack = inject(ɵPanelStack);

  /**
   * Property stacked
   *
   * @description
   * Panel-stack entry used to close this picker when another panel opens.
   *
   * @type {ɵStackedPanel}
   * @readonly
   */
  private readonly stacked: ɵStackedPanel = {
    close: () => {
      this.close(false);
    },
    contains: (node) => this.overlay.contains(node),
  };

  /**
   * Property panelId
   *
   * @description
   * Unique identifier of the picker panel.
   *
   * @type {string}
   * @readonly
   */
  protected readonly panelId: string = inject(_IdGenerator).getId('cw-date-picker-panel-');

  /**
   * Property triggerClass
   *
   * @description
   * Trigger classes for the selected size.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly triggerClass: Signal<string> = computed(
    () => `${TRIGGER} ${TRIGGER_SIZES[this.size()]}`,
  );

  /**
   * Property fieldClass
   *
   * @description
   * Classes applied to the typed-date input.
   *
   * @type {string}
   * @readonly
   */
  protected readonly fieldClass: string = FIELD;

  /**
   * Property panelClass
   *
   * @description
   * Classes applied to the floating panel.
   *
   * @type {string}
   * @readonly
   */
  protected readonly panelClass: string = PANEL;

  /**
   * Property presetsClass
   *
   * @description
   * Classes applied to the preset list.
   *
   * @type {string}
   * @readonly
   */
  protected readonly presetsClass: string = PRESETS;

  /**
   * Property presetClass
   *
   * @description
   * Classes applied to a preset button.
   *
   * @type {string}
   * @readonly
   */
  protected readonly presetClass: string = PRESET;

  /**
   * Property isDisabled
   *
   * @description
   * Whether input or form state disables the picker.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly isDisabled: Signal<boolean> = computed(
    () => this.disabled() || this.formDisabled(),
  );

  /**
   * Property minDay
   *
   * @description
   * Earliest selectable date extracted from the configured bound.
   *
   * @type {Signal<Date | undefined>}
   * @readonly
   */
  protected readonly minDay: Signal<Date | undefined> = computed(() => lowerBound(this.min()));

  /**
   * Property maxDay
   *
   * @description
   * Latest selectable date extracted from the configured bound.
   *
   * @type {Signal<Date | undefined>}
   * @readonly
   */
  protected readonly maxDay: Signal<Date | undefined> = computed(() => upperBound(this.max()));

  /**
   * Property draft
   *
   * @description
   * The calendar selection while the panel is open: a range waits for its end here.
   *
   * @type {WritableSignal<CwCalendarSelection>}
   * @readonly
   */
  protected readonly draft: WritableSignal<CwCalendarSelection> = signal<CwCalendarSelection>(null);

  /**
   * Property timeShown
   *
   * @description
   * Whether the time input is visible.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  protected readonly timeShown: WritableSignal<boolean> = signal(false);

  /**
   * Property typed
   *
   * @description
   * Current typed text, or null when showing the formatted value.
   *
   * @type {WritableSignal<string | null>}
   * @readonly
   */
  protected readonly typed: WritableSignal<string | null> = signal<string | null>(null);

  /**
   * Property typedInvalid
   *
   * @description
   * Whether the last committed typed date is invalid.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  protected readonly typedInvalid: WritableSignal<boolean> = signal(false);

  /**
   * Property formats
   *
   * @description
   * Localized formatters for the trigger, typed input and preset hints.
   *
   * @type {Signal<{ short: Intl.DateTimeFormat; shortTime: Intl.DateTimeFormat; dayMonth: Intl.DateTimeFormat; dayMonthYear: Intl.DateTimeFormat; hint: Intl.DateTimeFormat; typed: Intl.DateTimeFormat; }>}
   * @readonly
   */
  private readonly formats: Signal<{
    short: Intl.DateTimeFormat;
    shortTime: Intl.DateTimeFormat;
    dayMonth: Intl.DateTimeFormat;
    dayMonthYear: Intl.DateTimeFormat;
    hint: Intl.DateTimeFormat;
    typed: Intl.DateTimeFormat;
  }> = computed(() => {
    const locale: string = this.locale();
    return {
      short: new Intl.DateTimeFormat(locale, this.format()),
      shortTime: new Intl.DateTimeFormat(locale, {
        ...this.format(),
        hour: '2-digit',
        minute: '2-digit',
      }),
      dayMonth: new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }),
      dayMonthYear: new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      hint: new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short' }),
      typed: new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }),
    };
  });

  /**
   * Property display
   *
   * @description
   * The text of the trigger: the short date, the period, or nothing (placeholder).
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly display: Signal<string> = computed(() => {
    const value: CwDatePickerValue = this.value();
    const formats: {
      short: Intl.DateTimeFormat;
      shortTime: Intl.DateTimeFormat;
      dayMonth: Intl.DateTimeFormat;
      dayMonthYear: Intl.DateTimeFormat;
      hint: Intl.DateTimeFormat;
      typed: Intl.DateTimeFormat;
    } = this.formats();
    if (value instanceof Date) {
      return (this.withTime() && hasTime(value) ? formats.shortTime : formats.short).format(value);
    }
    if (isRange(value)) {
      // Date Picker sheet, "Variantes": « 16 nov. → 27 nov. 2026 », the year once when shared.
      const sameYear: boolean = value.start.getFullYear() === value.end.getFullYear();
      const start: string = (sameYear ? formats.dayMonth : formats.dayMonthYear).format(
        value.start,
      );
      return `${start} → ${formats.dayMonthYear.format(value.end)}`;
    }
    return '';
  });

  /**
   * Property triggerLabel
   *
   * @description
   * Accessible trigger name including the visible value or placeholder, preserving the visible
   * label word for word for label-in-name accessibility.
   *
   * @type {Signal<string | null>}
   * @readonly
   */
  protected readonly triggerLabel: Signal<string | null> = computed(() => {
    const label: string = this.ariaLabel();
    return label ? `${label}, ${this.display() || this.placeholder()}` : null;
  });

  /**
   * Property fieldText
   *
   * @description
   * Typed text when editing, otherwise the formatted selected date.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly fieldText: Signal<string> = computed(() => {
    const typed: string | null = this.typed();
    if (typed !== null) return typed;
    const value: CwDatePickerValue = this.value();
    return value instanceof Date ? this.formats().typed.format(value) : '';
  });

  /**
   * Property time
   *
   * @description
   * Selected time formatted for the time input.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly time: Signal<string> = computed(() => {
    const value: CwDatePickerValue = this.value();
    return value instanceof Date && hasTime(value)
      ? `${pad(value.getHours())}:${pad(value.getMinutes())}`
      : '';
  });

  /**
   * Property presetRows
   *
   * @description
   * Preset records with their formatted hints and selected states.
   *
   * @type {Signal<{ preset: CwDatePreset; hint: string; selected: boolean; }[]>}
   * @readonly
   */
  protected readonly presetRows: Signal<
    { preset: CwDatePreset; hint: string; selected: boolean }[]
  > = computed(() => {
    const value: CwDatePickerValue = this.value();
    const formats: {
      short: Intl.DateTimeFormat;
      shortTime: Intl.DateTimeFormat;
      dayMonth: Intl.DateTimeFormat;
      dayMonthYear: Intl.DateTimeFormat;
      hint: Intl.DateTimeFormat;
      typed: Intl.DateTimeFormat;
    } = this.formats();
    return this.presets().map((preset) => ({
      preset,
      hint: preset.date ? formats.hint.format(preset.date) : '',
      selected:
        preset.date === null
          ? value === null
          : value instanceof Date && ɵsameDay(value, preset.date),
    }));
  });

  /**
   * Property showPresets
   *
   * @description
   * Whether presets are available in the current mode.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly showPresets: Signal<boolean> = computed(
    () => this.mode() === 'single' && this.presets().length > 0,
  );
  // #endregion

  // #region Constructor
  /**
   * Constructor
   *
   * @description
   * Connects the value accessor, panel lifecycle and destruction cleanup.
   *
   * @constructor
   */
  public constructor() {
    // Reactive and template-driven forms: this picker is the control's value accessor. Set here
    // rather than through NG_VALUE_ACCESSOR, as on cw-checkbox.
    if (this.ngControl) this.ngControl.valueAccessor = this;

    effect(() => {
      const open: boolean = this.open();
      untracked(() => {
        if (open) this.attach();
        else this.beginClose();
      });
    });

    inject(DestroyRef).onDestroy(() => {
      this.stack.release(this.stacked);
      this.overlay.dispose();
    });
  }
  // #endregion

  // #region Methods
  /**
   * Method focus
   *
   * @description
   * Moves the focus to the trigger or the field (Signal Forms focuses an invalid field so).
   *
   * @param {FocusOptions} options - Optional browser focus behavior.
   */
  public focus(options?: FocusOptions): void {
    this.trigger()?.nativeElement.focus(options);
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
    this.typed.set(null);
    this.typedInvalid.set(false);
    this.value.set(value instanceof Date || isRange(value) ? value : null);
  }

  /**
   * Method registerOnChange
   *
   * @description
   * Registers the form value-change callback.
   *
   * @param {(value: CwDatePickerValue) => void} fn - Callback registered by the form control.
   */
  public registerOnChange(fn: (value: CwDatePickerValue) => void): void {
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
   * Method isInvalid
   *
   * @description
   * Checks typed validation and touched form invalid state.
   * @returns {boolean} Whether an invalid state should be displayed.
   */
  protected isInvalid(): boolean {
    if (this.typedInvalid()) return true;
    if (this.invalid() && this.touched()) return true;
    const control: NgControl | null = this.ngControl;
    return (
      !!control && control.invalid === true && (control.touched === true || this.accessorTouched())
    );
  }

  /**
   * Method toggle
   *
   * @description
   * Closes the open panel or opens an enabled picker.
   */
  protected toggle(): void {
    if (this.open()) this.close(true);
    else if (!this.isDisabled()) this.openPanel();
  }

  /**
   * Method onTriggerKeydown
   *
   * @description
   * Opens the panel for an unmodified Down arrow on the trigger.
   *
   * @param {KeyboardEvent} event - Browser event associated with the interaction.
   */
  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' && !event.altKey && !this.open() && !this.isDisabled()) {
      event.preventDefault();
      this.openPanel();
    }
  }

  /**
   * Method onFieldKeydown
   *
   * @description
   * Commits typed text on Enter or opens the panel on Alt plus Down.
   *
   * @param {KeyboardEvent} event - Browser event associated with the interaction.
   */
  protected onFieldKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.commitTyped((event.target as HTMLInputElement).value);
    else if (event.key === 'ArrowDown' && event.altKey && !this.isDisabled()) {
      event.preventDefault();
      this.openPanel();
    }
  }

  /**
   * Method onFieldChange
   *
   * @description
   * Commits a typed date when the input changes.
   *
   * @param {Event} event - Browser event associated with the interaction.
   */
  protected onFieldChange(event: Event): void {
    this.commitTyped((event.target as HTMLInputElement).value);
  }

  /**
   * Method onFieldInput
   *
   * @description
   * Keeps the typed date text while the user edits.
   *
   * @param {Event} event - Browser event associated with the interaction.
   */
  protected onFieldInput(event: Event): void {
    this.typed.set((event.target as HTMLInputElement).value);
  }

  /**
   * Method markTouched
   *
   * @description
   * Reports that the picker has been touched.
   */
  protected markTouched(): void {
    this.accessorTouched.set(true);
    this.onTouched();
    this.touch.emit();
  }

  /**
   * Method onCalendarChange
   *
   * @description
   * Applies a selected day or completes a range from the calendar.
   *
   * @param {CwCalendarSelection} selection - Selection received from the calendar.
   */
  protected onCalendarChange(selection: CwCalendarSelection): void {
    if (selection instanceof Date) {
      const previous: CwDatePickerValue = this.value();
      const date: Date = ɵstartOfDay(selection);
      // A time already chosen stays on the new day.
      if (this.withTime() && previous instanceof Date) {
        date.setHours(previous.getHours(), previous.getMinutes());
      }
      this.setValue(date);
      this.close(true);
      return;
    }
    this.draft.set(selection);
    // Date Picker sheet, "Règles": never close before the end of a range.
    if (selection?.end) {
      this.setValue({ start: selection.start, end: selection.end });
      this.close(true);
    }
  }

  /**
   * Method pickPreset
   *
   * @description
   * Applies a preset date or clears the value and closes the panel.
   *
   * @param {CwDatePreset} preset - Preset chosen by the user.
   */
  protected pickPreset(preset: CwDatePreset): void {
    this.setValue(preset.date ? ɵstartOfDay(preset.date) : null);
    this.close(true);
  }

  /**
   * Method clear
   *
   * @description
   * Clears the selected value and closes the panel.
   */
  protected clear(): void {
    this.timeShown.set(false);
    this.setValue(null);
    this.close(true);
  }

  /**
   * Method showTime
   *
   * @description
   * Shows the time field and focuses it after rendering.
   */
  protected showTime(): void {
    this.timeShown.set(true);
    afterNextRender(
      {
        write: () => {
          this.overlay.pane?.querySelector<HTMLInputElement>('input[type=time]')?.focus();
        },
      },
      { injector: this.injector },
    );
  }

  /**
   * Method onTimeChange
   *
   * @description
   * Applies the selected hours and minutes to the current day.
   *
   * @param {Event} event - Browser event associated with the interaction.
   */
  protected onTimeChange(event: Event): void {
    const text: string = (event.target as HTMLInputElement).value;
    if (!text) return;
    const [hours = 0, minutes = 0]: number[] = text.split(':').map(Number);
    const value: CwDatePickerValue = this.value();
    const base: Date = value instanceof Date ? new Date(value) : ɵstartOfDay(new Date());
    base.setHours(hours, minutes, 0, 0);
    this.setValue(base);
  }

  /**
   * Method setValue
   *
   * @description
   * Updates the value and reports the user change.
   *
   * @param {CwDatePickerValue} value - Value to inspect or apply.
   */
  private setValue(value: CwDatePickerValue): void {
    this.typed.set(null);
    this.typedInvalid.set(false);
    this.value.set(value);
    this.onChange(value);
  }

  /**
   * Method commitTyped
   *
   * @description
   * Parses and validates typed date text before applying it.
   *
   * @param {string} text - Typed date text to parse.
   */
  private commitTyped(text: string): void {
    const trimmed: string = text.trim();
    if (!trimmed) {
      this.setValue(null);
      return;
    }
    const match: RegExpExecArray | null = TYPED.exec(trimmed);
    const date: Date | null = match
      ? new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]))
      : null;
    const valid: boolean =
      date !== null &&
      date.getDate() === Number(match?.[1]) &&
      date.getMonth() === Number(match?.[2]) - 1 &&
      !this.unpickable(date);
    if (!valid) {
      // Date Picker sheet, "Accessibilité": an invalid typed date sets the error state.
      this.typed.set(text);
      this.typedInvalid.set(true);
      return;
    }
    this.setValue(date);
  }

  /**
   * Method unpickable
   *
   * @description
   * Checks whether a date is outside bounds or disabled.
   *
   * @param {Date} date - Date to inspect.
   * @returns {boolean} Whether the date cannot be selected.
   */
  private unpickable(date: Date): boolean {
    const min: Date | undefined = this.minDay();
    const max: Date | undefined = this.maxDay();
    return (
      (!!min && date < ɵstartOfDay(min)) ||
      (!!max && ɵstartOfDay(date) > ɵstartOfDay(max)) ||
      (this.disabledDates()?.(date) ?? false)
    );
  }

  /**
   * Method openPanel
   *
   * @description
   * Opens the panel from the trigger: the other floating panels the user opened close.
   */
  private openPanel(): void {
    this.stack.open(this.stacked, this.element);
    this.open.set(true);
  }

  /**
   * Method close
   *
   * @description
   * Requests panel closure and records whether to restore focus.
   *
   * @param {boolean} focusTrigger - Whether to restore focus to the trigger after closing.
   */
  private close(focusTrigger: boolean): void {
    this.focusTriggerOnClose = focusTrigger;
    this.open.set(false);
  }

  /**
   * Method attach
   *
   * @description
   * Opens the connected panel and focuses the calendar.
   */
  private attach(): void {
    // Reopened during its closing animation: the panel stays as it was, focus included.
    const reopened: boolean = this.overlay.attached();
    if (!reopened) {
      const value: CwDatePickerValue = this.value();
      this.draft.set(isRange(value) ? { start: value.start, end: value.end } : value);
      this.timeShown.set(value instanceof Date && hasTime(value));
    }
    const origin: HTMLElement = this.element;
    this.overlay.open({
      origin,
      template: this.panelTemplate(),
      viewContainerRef: this.viewContainer,
      // The panel joins the CDK overlay container and may shrink to the viewport.
      inline: false,
      flexibleDimensions: true,
      outsideClick: (event) => {
        // The trigger toggles on its own click.
        if (!origin.contains(event.target as Node | null)) this.close(false);
      },
      keydown: (event) => {
        if (event.key === 'Escape' && !event.altKey && !event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          this.close(true);
        }
      },
    });
    if (reopened) return;

    // Date Picker sheet, "Clavier": the focus goes to the picked day, else today.
    afterNextRender(
      {
        write: () => {
          this.calendar()?.focus();
        },
      },
      { injector: this.injector },
    );
  }

  /**
   * Method beginClose
   *
   * @description
   * Releases the panel stack and restores focus after the exit animation.
   */
  private beginClose(): void {
    this.stack.release(this.stacked);
    if (!this.overlay.attached()) return;
    const panel: HTMLElement | null | undefined = this.overlay.pane?.firstElementChild as
      HTMLElement | null | undefined;
    this.overlay.close(panel, () => {
      if (!this.focusTriggerOnClose) return;
      this.focusTriggerOnClose = false;
      const target: ElementRef<HTMLElement> | undefined =
        this.variant() === 'input' ? this.calendarButton() : this.trigger();
      target?.nativeElement.focus();
    });
  }
  // #endregion
}
