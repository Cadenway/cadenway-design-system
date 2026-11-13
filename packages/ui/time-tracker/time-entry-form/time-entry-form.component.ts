import {
  Component,
  booleanAttribute,
  computed,
  inject,
  input,
  linkedSignal,
  model,
  output,
  signal,
} from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';
import { type ControlValueAccessor, NgControl } from '@angular/forms';
import type { FormValueControl } from '@angular/forms/signals';
import { CwButton } from '@cadenway/ui/button';
import { CwCheckbox } from '@cadenway/ui/checkbox';
import { CwDatePicker, type CwDatePickerValue } from '@cadenway/ui/date-picker';
import { CwInput } from '@cadenway/ui/input';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorWarningCircleFill } from '@ng-icons/phosphor-icons/fill';

import { formatDuration, parseDuration } from '../duration';
import { CW_TIME_ENTRY_FORM_LABELS, CW_TIME_QUICK_DURATIONS } from '../time-tracker.constants';
import type { CwTimeEntryDraft, CwTimeEntryFormLabels } from '../time-tracker.types';

/* Literal class strings (Time Tracker sheet and preview of the Design System artifact; the quick
   durations of the mockup `App.dc.html`). */
const LABEL = 'flex items-center gap-2 text-sm leading-none font-medium select-none';
/* The duration field carries its own `aria-invalid` (the parsing is the form's), so it takes the
   classes of `input[cwInput]` rather than the directive, which owns that attribute. */
const DURATION =
  'h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm tabular-nums transition-[color,box-shadow] placeholder:text-muted-foreground outline-hidden focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive/60 aria-invalid:ring-3 aria-invalid:ring-destructive/15 motion-reduce:transition-none';
const QUICK =
  'inline-flex h-7 items-center justify-center rounded-md border border-input text-xs font-medium whitespace-nowrap tabular-nums transition-colors hover:bg-accent outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none';

function emptyDraft(): CwTimeEntryDraft {
  return { duration: null, date: new Date(), note: '', billable: true };
}

/**
 * The form that adds time by hand: shortcuts (« + 15 min » … « + 2 h »), a duration read as it is
 * typed (« = 90 min »), a date, a note and « Facturable » (Time Tracker sheet of the Design System
 * artifact). `cw-time-tracker` opens it in a popover under « Ajouter du temps »; it also works
 * alone.
 *
 * The duration accepts every format of `parseDuration`, a bare number in minutes; an unreadable
 * duration sets `aria-invalid` and writes « Format non reconnu : essayez « 1 h 30 » ou
 * « 90 min ». » on Ajouter. Ajouter or Enter emits `submit` with the draft and empties the form; a
 * shortcut emits `submit` at once with its duration; Annuler or Escape emits `cancel`.
 * `[(value)]` is the draft (today, billable, no duration by default); the form is a Signal Forms
 * value control and a `ControlValueAccessor`.
 */
@Component({
  selector: 'cw-time-entry-form',
  imports: [NgIcon, CwButton, CwCheckbox, CwDatePicker, CwInput],
  providers: [provideIcons({ phosphorWarningCircleFill })],
  host: {
    class: 'block',
    '(keydown)': 'onKeydown($event)',
  },
  templateUrl: './time-entry-form.component.html',
})
export class CwTimeEntryForm implements FormValueControl<CwTimeEntryDraft>, ControlValueAccessor {
  /** The draft; `[(value)]`, or the value of a form control. */
  readonly value = model<CwTimeEntryDraft>(emptyDraft());
  /** The shortcut durations, in milliseconds; empty hides the row. */
  readonly quickDurations = input<readonly number[]>(CW_TIME_QUICK_DURATIONS);
  /** Disables the form (Signal Forms binds it from the field). */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** French texts, any of them overridden (`CW_TIME_ENTRY_FORM_LABELS`). */
  readonly labels = input<Partial<CwTimeEntryFormLabels>>({});
  /** Emits the complete draft to add. */
  // The sheet names this output `submit`; the host is `cw-time-entry-form`, not a `<form>`: no
  // native `submit` event ever reaches it.
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly submit = output<CwTimeEntryDraft & { readonly duration: number }>();
  /** Emits on Annuler or Escape. */
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly cancel = output();
  /** Emitted when the focus leaves the duration: Signal Forms marks the field touched. */
  readonly touch = output();

  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly ids = inject(_IdGenerator);
  private readonly formDisabled = signal(false);
  private onChange: (value: CwTimeEntryDraft) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  protected readonly titleId = this.ids.getId('cw-time-entry-form-title-');
  protected readonly durationId = this.ids.getId('cw-time-entry-form-duration-');
  protected readonly hintId = this.ids.getId('cw-time-entry-form-hint-');
  protected readonly dateId = this.ids.getId('cw-time-entry-form-date-');
  protected readonly noteId = this.ids.getId('cw-time-entry-form-note-');
  protected readonly billableId = this.ids.getId('cw-time-entry-form-billable-');
  protected readonly labelClasses = LABEL;
  protected readonly quickClasses = QUICK;
  protected readonly durationClasses = DURATION;
  protected readonly text = computed(() => ({ ...CW_TIME_ENTRY_FORM_LABELS, ...this.labels() }));
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  /** The typed duration, kept as typed while the draft holds the parsed milliseconds. */
  protected readonly durationText = linkedSignal<CwTimeEntryDraft, string>({
    source: this.value,
    // The text stays as typed while it still reads as the draft's duration.
    computation: (draft, previous) => {
      if (previous !== undefined && parseDuration(previous.value) === draft.duration) {
        return previous.value;
      }
      return draft.duration === null ? '' : formatDuration(draft.duration);
    },
  });
  protected readonly tried = signal(false);
  protected readonly parsed = computed(() => parseDuration(this.durationText()));
  protected readonly unreadable = computed(
    () => this.tried() && this.parsed() === null && this.durationText().trim() !== '',
  );
  protected readonly missing = computed(() => this.tried() && this.durationText().trim() === '');
  protected readonly hint = computed(() => {
    const parsed = this.parsed();
    if (this.unreadable() || this.missing()) return this.text().invalid;
    if (parsed !== null) return this.text().interpreted(formatDuration(parsed));
    return this.text().hint;
  });
  protected readonly formatQuick = (duration: number): string =>
    this.text().quick(formatDuration(duration));

  constructor() {
    // Reactive and template-driven forms: this form is the control's value accessor.
    if (this.ngControl) this.ngControl.valueAccessor = this;
  }

  writeValue(value: unknown): void {
    this.value.set(value && typeof value === 'object' ? (value as CwTimeEntryDraft) : emptyDraft());
  }

  registerOnChange(fn: (value: CwTimeEntryDraft) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  protected onDurationInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    this.durationText.set(text);
    this.tried.set(false);
    this.update({ duration: parseDuration(text) });
  }

  protected onDurationBlur(): void {
    this.onTouched();
    this.touch.emit();
  }

  protected onDate(date: CwDatePickerValue): void {
    if (date instanceof Date) this.update({ date });
  }

  protected onNote(event: Event): void {
    this.update({ note: (event.target as HTMLInputElement).value });
  }

  protected onBillable(billable: boolean): void {
    this.update({ billable });
  }

  protected addQuick(duration: number): void {
    this.submit.emit({ ...this.value(), duration });
    this.clear();
  }

  protected add(): void {
    const duration = this.parsed();
    if (duration === null || duration <= 0) {
      this.tried.set(true);
      return;
    }
    this.submit.emit({ ...this.value(), duration });
    this.clear();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.cancel.emit();
      return;
    }
    const target = event.target as HTMLElement;
    // Enter in a text field adds; on a button or in the date picker it keeps its own meaning.
    if (event.key === 'Enter' && target.tagName === 'INPUT' && !event.isComposing) {
      event.preventDefault();
      this.add();
    }
  }

  private update(change: Partial<CwTimeEntryDraft>): void {
    const next = { ...this.value(), ...change };
    this.value.set(next);
    this.onChange(next);
  }

  private clear(): void {
    const next = { ...emptyDraft(), billable: this.value().billable };
    this.tried.set(false);
    this.value.set(next);
    this.durationText.set('');
    this.onChange(next);
  }
}
