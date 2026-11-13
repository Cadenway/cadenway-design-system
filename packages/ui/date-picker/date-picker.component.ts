import { CdkTrapFocus, _IdGenerator } from '@angular/cdk/a11y';
import {
  type OverlayRef,
  createFlexibleConnectedPositionStrategy,
  createOverlayRef,
  createRepositionScrollStrategy,
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  afterNextRender,
  booleanAttribute,
  Component,
  computed,
  DestroyRef,
  DOCUMENT,
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
} from '@angular/core';
import { type ControlValueAccessor, NgControl } from '@angular/forms';
import type { FormValueControl } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorCalendarBlankBold,
  phosphorCheckBold,
  phosphorClockBold,
} from '@ng-icons/phosphor-icons/bold';

import { CwButton } from '@cadenway/ui/button';
import {
  CwCalendar,
  type CwCalendarMode,
  type CwCalendarSelection,
  type CwDateDisabledFn,
} from '@cadenway/ui/calendar';
import { CwRipple, ɵmenuFrom, ɵpanelPositions, ɵprefersReducedMotion } from '@cadenway/ui/core';
import { CwInput } from '@cadenway/ui/input';
import { CwInputGroup, CwInputGroupAddon, CwInputGroupButton } from '@cadenway/ui/input-group';

import type {
  CwDatePickerRange,
  CwDatePickerSize,
  CwDatePickerValue,
  CwDatePickerVariant,
  CwDatePreset,
} from './date-picker.types';

/* Literal class strings (Date Picker sheet and preview of the Design System artifact): the trigger
   takes the classes of the Select trigger, aligned to the start. */
const TRIGGER =
  'relative isolate overflow-hidden group/trigger flex w-full min-w-0 items-center justify-start gap-2 border border-input bg-transparent text-sm whitespace-nowrap transition-[color,background-color,box-shadow] motion-reduce:transition-none hover:bg-accent outline-hidden focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive/60 aria-invalid:ring-destructive/15 data-placeholder:text-muted-foreground [&_ng-icon]:shrink-0 [&_ng-icon]:[--ng-icon__size:1rem]';

const TRIGGER_SIZES: Record<CwDatePickerSize, string> = {
  sm: 'h-7 rounded-md px-2',
  default: 'h-8 rounded-lg px-2.5',
  lg: 'h-9 rounded-lg px-3',
};

/* The field of the `input` variant: the Input Group field (`input[cwInputGroupInput]`), copied so
   that the picker owns its `aria-invalid` (an unparsable date). */
const FIELD =
  'h-full min-w-0 flex-1 bg-transparent px-2.5 text-sm tabular-nums outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed';

const PANEL =
  'flex w-fit flex-col overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-md animate-menu-in motion-reduce:animate-none data-[state=closed]:animate-menu-out';

/* Presets enter one by one, 60 ms then 30 ms more each, twelve at most (cw-motion-tokens). */
const PRESETS =
  'w-48 shrink-0 border-r p-1 *:animate-item-in *:motion-reduce:animate-none [&>*:nth-child(1)]:[animation-delay:60ms] [&>*:nth-child(2)]:[animation-delay:90ms] [&>*:nth-child(3)]:[animation-delay:120ms] [&>*:nth-child(4)]:[animation-delay:150ms] [&>*:nth-child(5)]:[animation-delay:180ms] [&>*:nth-child(6)]:[animation-delay:210ms] [&>*:nth-child(7)]:[animation-delay:240ms] [&>*:nth-child(8)]:[animation-delay:270ms] [&>*:nth-child(9)]:[animation-delay:300ms] [&>*:nth-child(10)]:[animation-delay:330ms] [&>*:nth-child(11)]:[animation-delay:360ms] [&>*:nth-child(12)]:[animation-delay:390ms]';

const PRESET =
  'relative isolate flex w-full cursor-default items-center gap-2 overflow-hidden rounded-md px-2 py-1.5 text-left text-sm whitespace-nowrap select-none transition-colors motion-reduce:transition-none hover:bg-accent aria-pressed:bg-selected outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring [&_ng-icon]:shrink-0 [&_ng-icon]:[--ng-icon__size:1rem]';

/** The default `format`: the short French date of the sheet, « mer. 18 nov. 2026 ». */
const SHORT_DATE: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
};

const TYPED = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function sameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

function isRange(value: unknown): value is CwDatePickerRange {
  return (
    typeof value === 'object' && value !== null && 'start' in value && value.start instanceof Date
  );
}

/* Signal Forms binds `min` and `max` typed as the value (a day or a period): read the bound day. */
function lowerBound(value: unknown): Date | undefined {
  if (value instanceof Date) return value;
  return isRange(value) ? value.start : undefined;
}

function upperBound(value: unknown): Date | undefined {
  if (value instanceof Date) return value;
  return isRange(value) ? value.end : undefined;
}

function hasTime(date: Date): boolean {
  return date.getHours() !== 0 || date.getMinutes() !== 0;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/**
 * A field that opens a Calendar in a floating panel, with shortcuts: the due date, the start date,
 * the period of a sprint (Date Picker sheet of the Design System artifact).
 *
 * `[(value)]` holds a `Date` (`mode="single"`) or a complete `{ start, end }` period
 * (`mode="range"`; the panel stays open until the end is picked). The picker is a Signal Forms value
 * control (`[formField]`) and the value accessor of a Reactive or template-driven form control;
 * `aria-invalid` follows the control once touched, and an unparsable typed date. `[(open)]` drives
 * the panel, a CDK overlay placed under the trigger (flipped when needed) that opens from the
 * trigger corner (`animate-menu-in`), traps the focus (`role="dialog"`) and closes on Escape or an
 * outside click; the focus returns to the trigger after Escape or a pick.
 *
 * The `button` variant shows the short date (`format`, `Intl.DateTimeFormat` options in `locale`)
 * or the placeholder; Enter, Space and ↓ open it on the picked day (or today). The `input` variant
 * lets the user type « jj/mm/aaaa » and opens the calendar from its button. `presets` (single mode)
 * list shortcuts with their date and a check on the current one; `clearable` adds « Effacer »,
 * `withTime` (single mode) « Ajouter une heure ». Name the trigger with `<label for>` (its `id`) or
 * `ariaLabel`; the name then goes on with the visible text (« Échéance, mer. 18 nov. 2026 »).
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
  providers: [provideIcons({ phosphorCalendarBlankBold, phosphorCheckBold, phosphorClockBold })],
  host: {
    class: 'inline-flex min-w-0',
    '[attr.id]': 'null',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
  },
  templateUrl: './date-picker.component.html',
})
export class CwDatePicker implements FormValueControl<CwDatePickerValue>, ControlValueAccessor {
  /** The date or the period, `[(value)]`. */
  readonly value = model<CwDatePickerValue>(null);
  /** One date or a period. */
  readonly mode = input<CwCalendarMode>('single');
  /** A trigger button, or a field to type the date with a button that opens the calendar. */
  readonly variant = input<CwDatePickerVariant>('button');
  /** Text of the empty trigger. */
  readonly placeholder = input('Choisir une date');
  /** `Intl.DateTimeFormat` options of the shown date; « mer. 18 nov. 2026 » by default. */
  readonly format = input<Intl.DateTimeFormatOptions>(SHORT_DATE);
  /** Locale of the shown dates and of the calendar. */
  readonly locale = input('fr');
  /** Shortcuts shown left of the calendar, in single mode. */
  readonly presets = input<readonly CwDatePreset[]>([]);
  /** Shows « Effacer » under the calendar. */
  readonly clearable = input(true, { transform: booleanAttribute });
  /** Shows « Ajouter une heure » under the calendar, in single mode. */
  readonly withTime = input(false, { transform: booleanAttribute });
  /** First day that can be picked; typed like the value because Signal Forms binds it so. */
  readonly min = input<NonNullable<CwDatePickerValue> | undefined, unknown>(undefined, {
    transform: lowerBound,
  });
  /** Last day that can be picked. */
  readonly max = input<NonNullable<CwDatePickerValue> | undefined, unknown>(undefined, {
    transform: upperBound,
  });
  /** Days that cannot be picked (public holidays). */
  readonly disabledDates = input<CwDateDisabledFn | null>(null);
  /** Height of the trigger. */
  readonly size = input<CwDatePickerSize>('default');
  /** Disables the trigger (Signal Forms binds it from the field). */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Invalid state given by Signal Forms; shown once touched. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Touched state given by Signal Forms. */
  readonly touched = input(false, { transform: booleanAttribute });
  /** Required state given by Signal Forms; `aria-required` on the typed field (a button has none). */
  readonly required = input(false, { transform: booleanAttribute });
  /** Whether the panel is open, `[(open)]`. */
  readonly open = model(false);
  /** Id of the trigger (or of the field), for `<label for>`; generated when not given. */
  readonly id = input(inject(_IdGenerator).getId('cw-date-picker-'));
  /** Accessible name when no label points at the trigger (« Échéance »); the value is appended. */
  readonly ariaLabel = input('');
  /** Name of the panel (`role="dialog"`). */
  readonly dialogLabel = input('Choisir une date');
  /** Label of the clear button. */
  readonly clearLabel = input('Effacer');
  /** Label of the time button. */
  readonly addTimeLabel = input('Ajouter une heure');
  /** Name of the time field. */
  readonly timeLabel = input('Heure');
  /** Name of the calendar button of the `input` variant. */
  readonly openCalendarLabel = input('Ouvrir le calendrier');
  /** Expected format of the `input` variant, its placeholder. */
  readonly inputPlaceholder = input('jj/mm/aaaa');
  /** Emitted when focus leaves the trigger: Signal Forms marks the field touched. */
  readonly touch = output();

  private readonly injector = inject(Injector);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly document = inject(DOCUMENT);
  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly panelTemplate = viewChild.required<TemplateRef<unknown>>('panel');
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly trigger = viewChild<string, ElementRef<HTMLElement>>('trigger', {
    read: ElementRef,
  });
  private readonly calendarButton = viewChild<string, ElementRef<HTMLElement>>('calendarButton', {
    read: ElementRef,
  });
  private readonly calendar = viewChild(CwCalendar);
  private readonly formDisabled = signal(false);
  private readonly accessorTouched = signal(false);
  private overlayRef: OverlayRef | null = null;
  private focusTriggerOnClose = false;
  private closeTimer: ReturnType<typeof setTimeout> | null = null;
  private onChange: (value: CwDatePickerValue) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  protected readonly panelId = inject(_IdGenerator).getId('cw-date-picker-panel-');
  protected readonly triggerClass = computed(() => `${TRIGGER} ${TRIGGER_SIZES[this.size()]}`);
  protected readonly fieldClass = FIELD;
  protected readonly panelClass = PANEL;
  protected readonly presetsClass = PRESETS;
  protected readonly presetClass = PRESET;
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  protected readonly minDay = computed(() => lowerBound(this.min()));
  protected readonly maxDay = computed(() => upperBound(this.max()));
  /** The calendar selection while the panel is open: a range waits for its end here. */
  protected readonly draft = signal<CwCalendarSelection>(null);
  protected readonly closing = signal(false);
  protected readonly menuFrom = signal<string | null>(null);
  protected readonly timeShown = signal(false);
  protected readonly typed = signal<string | null>(null);
  protected readonly typedInvalid = signal(false);

  private readonly formats = computed(() => {
    const locale = this.locale();
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

  /** The text of the trigger: the short date, the period, or nothing (placeholder). */
  protected readonly display = computed(() => {
    const value = this.value();
    const formats = this.formats();
    if (value instanceof Date) {
      return (this.withTime() && hasTime(value) ? formats.shortTime : formats.short).format(value);
    }
    if (isRange(value)) {
      // Date Picker sheet, "Variantes": « 16 nov. → 27 nov. 2026 », the year once when shared.
      const sameYear = value.start.getFullYear() === value.end.getFullYear();
      const start = (sameYear ? formats.dayMonth : formats.dayMonthYear).format(value.start);
      return `${start} → ${formats.dayMonthYear.format(value.end)}`;
    }
    return '';
  });

  // The name holds the visible text word for word (WCAG 2.5.3, axe `label-content-name-mismatch`):
  // « Échéance, mer. 18 nov. 2026 », « Échéance, Choisir une date ».
  protected readonly triggerLabel = computed(() => {
    const label = this.ariaLabel();
    return label ? `${label}, ${this.display() || this.placeholder()}` : null;
  });

  protected readonly fieldText = computed(() => {
    const typed = this.typed();
    if (typed !== null) return typed;
    const value = this.value();
    return value instanceof Date ? this.formats().typed.format(value) : '';
  });

  protected readonly time = computed(() => {
    const value = this.value();
    return value instanceof Date && hasTime(value)
      ? `${pad(value.getHours())}:${pad(value.getMinutes())}`
      : '';
  });

  protected readonly presetRows = computed(() => {
    const value = this.value();
    const formats = this.formats();
    return this.presets().map((preset) => ({
      preset,
      hint: preset.date ? formats.hint.format(preset.date) : '',
      selected:
        preset.date === null
          ? value === null
          : value instanceof Date && sameDay(value, preset.date),
    }));
  });

  protected readonly showPresets = computed(
    () => this.mode() === 'single' && this.presets().length > 0,
  );

  constructor() {
    // Reactive and template-driven forms: this picker is the control's value accessor. Set here
    // rather than through NG_VALUE_ACCESSOR, as on cw-checkbox.
    if (this.ngControl) this.ngControl.valueAccessor = this;

    effect(() => {
      const open = this.open();
      untracked(() => {
        if (open) this.attach();
        else this.beginClose();
      });
    });

    inject(DestroyRef).onDestroy(() => {
      if (this.closeTimer) clearTimeout(this.closeTimer);
      this.overlayRef?.dispose();
    });
  }

  /** Moves the focus to the trigger or the field (Signal Forms focuses an invalid field so). */
  focus(options?: FocusOptions): void {
    this.trigger()?.nativeElement.focus(options);
  }

  writeValue(value: unknown): void {
    this.typed.set(null);
    this.typedInvalid.set(false);
    this.value.set(value instanceof Date || isRange(value) ? value : null);
  }

  registerOnChange(fn: (value: CwDatePickerValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  protected isInvalid(): boolean {
    if (this.typedInvalid()) return true;
    if (this.invalid() && this.touched()) return true;
    const control = this.ngControl;
    return (
      !!control && control.invalid === true && (control.touched === true || this.accessorTouched())
    );
  }

  protected toggle(): void {
    if (this.open()) this.close(true);
    else if (!this.isDisabled()) this.open.set(true);
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' && !event.altKey && !this.open() && !this.isDisabled()) {
      event.preventDefault();
      this.open.set(true);
    }
  }

  protected onFieldKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.commitTyped((event.target as HTMLInputElement).value);
    else if (event.key === 'ArrowDown' && event.altKey && !this.isDisabled()) {
      event.preventDefault();
      this.open.set(true);
    }
  }

  protected onFieldChange(event: Event): void {
    this.commitTyped((event.target as HTMLInputElement).value);
  }

  protected onFieldInput(event: Event): void {
    this.typed.set((event.target as HTMLInputElement).value);
  }

  protected markTouched(): void {
    this.accessorTouched.set(true);
    this.onTouched();
    this.touch.emit();
  }

  protected onCalendarChange(selection: CwCalendarSelection): void {
    if (selection instanceof Date) {
      const previous = this.value();
      const date = startOfDay(selection);
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

  protected pickPreset(preset: CwDatePreset): void {
    this.setValue(preset.date ? startOfDay(preset.date) : null);
    this.close(true);
  }

  protected clear(): void {
    this.timeShown.set(false);
    this.setValue(null);
    this.close(true);
  }

  protected showTime(): void {
    this.timeShown.set(true);
    afterNextRender(
      {
        write: () => {
          this.overlayRef?.overlayElement
            .querySelector<HTMLInputElement>('input[type=time]')
            ?.focus();
        },
      },
      { injector: this.injector },
    );
  }

  protected onTimeChange(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    if (!text) return;
    const [hours = 0, minutes = 0] = text.split(':').map(Number);
    const value = this.value();
    const base = value instanceof Date ? new Date(value) : startOfDay(new Date());
    base.setHours(hours, minutes, 0, 0);
    this.setValue(base);
  }

  protected onPanelAnimationEnd(event: AnimationEvent): void {
    if (this.closing() && event.target === event.currentTarget) this.finishClose();
  }

  private setValue(value: CwDatePickerValue): void {
    this.typed.set(null);
    this.typedInvalid.set(false);
    this.value.set(value);
    this.onChange(value);
  }

  private commitTyped(text: string): void {
    const trimmed = text.trim();
    if (!trimmed) {
      this.setValue(null);
      return;
    }
    const match = TYPED.exec(trimmed);
    const date = match ? new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1])) : null;
    const valid =
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

  private unpickable(date: Date): boolean {
    const min = this.minDay();
    const max = this.maxDay();
    return (
      (!!min && date < startOfDay(min)) ||
      (!!max && startOfDay(date) > startOfDay(max)) ||
      (this.disabledDates()?.(date) ?? false)
    );
  }

  private close(focusTrigger: boolean): void {
    this.focusTriggerOnClose = focusTrigger;
    this.open.set(false);
  }

  private attach(): void {
    if (this.closeTimer) clearTimeout(this.closeTimer);
    this.closing.set(false);
    if (this.overlayRef?.hasAttached()) return;
    const value = this.value();
    this.draft.set(isRange(value) ? { start: value.start, end: value.end } : value);
    this.timeShown.set(value instanceof Date && hasTime(value));

    const origin = this.element;
    const strategy = createFlexibleConnectedPositionStrategy(this.injector, origin)
      .withPositions(ɵpanelPositions('bottom', 'start'))
      .withViewportMargin(8)
      .withPush(false);
    const overlayRef = createOverlayRef(this.injector, {
      positionStrategy: strategy,
      scrollStrategy: createRepositionScrollStrategy(this.injector),
    });
    this.overlayRef = overlayRef;
    strategy.positionChanges.subscribe((change) => {
      this.menuFrom.set(ɵmenuFrom(change.connectionPair));
    });
    overlayRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape' && !event.altKey && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        this.close(true);
      }
    });
    overlayRef.outsidePointerEvents().subscribe((event) => {
      // The trigger toggles on its own click.
      if (!origin.contains(event.target as Node | null)) this.close(false);
    });
    overlayRef.attach(new TemplatePortal(this.panelTemplate(), this.viewContainer));

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

  private beginClose(): void {
    const overlayRef = this.overlayRef;
    if (!overlayRef?.hasAttached() || this.closing()) return;
    const panel = overlayRef.overlayElement.firstElementChild as HTMLElement | null;
    const animation = panel ? getComputedStyle(panel).animationName : '';
    // Without a running animation (reduced motion, no stylesheet) the panel goes at once.
    if (!panel || !animation || animation === 'none' || ɵprefersReducedMotion(this.document)) {
      this.finishClose();
      return;
    }
    this.closing.set(true);
    // Safety net if `animationend` never comes (the panel hidden by an ancestor).
    this.closeTimer = setTimeout(() => {
      this.finishClose();
    }, 400);
  }

  private finishClose(): void {
    if (this.closeTimer) clearTimeout(this.closeTimer);
    this.closeTimer = null;
    this.closing.set(false);
    this.overlayRef?.dispose();
    this.overlayRef = null;
    if (this.focusTriggerOnClose) {
      this.focusTriggerOnClose = false;
      const target = this.variant() === 'input' ? this.calendarButton() : this.trigger();
      target?.nativeElement.focus();
    }
  }
}
