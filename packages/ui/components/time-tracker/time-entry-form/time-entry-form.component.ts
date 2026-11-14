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
  type InputSignalWithTransform,
  type InputSignal,
  type ModelSignal,
  type OutputEmitterRef,
  type WritableSignal,
  type Signal,
} from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';
import { type ControlValueAccessor, NgControl } from '@angular/forms';
import type { FormValueControl } from '@angular/forms/signals';
import { CwButton } from '@cadenway/ui/components/button';
import { CwCheckbox } from '@cadenway/ui/components/checkbox';
import { CwDatePicker, type CwDatePickerValue } from '@cadenway/ui/components/date-picker';
import { CwInput } from '@cadenway/ui/components/input';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorWarningCircleFill } from '@ng-icons/phosphor-icons/fill';

import { formatDuration, parseDuration } from '../duration';
import { CW_TIME_ENTRY_FORM_LABELS, CW_TIME_QUICK_DURATIONS } from '../time-tracker.constants';
import type { CwTimeEntryDraft, CwTimeEntryFormLabels } from '../time-tracker.types';

/* Literal class strings (Time Tracker sheet and preview of the Design System artifact; the quick
   durations of the mockup `App.dc.html`). */
/**
 * Constant LABEL
 *
 * @description
 * Classes for form labels.
 *
 * @type {string}
 */
const LABEL: string = 'flex items-center gap-2 text-sm leading-none font-medium select-none';
/* The duration field carries its own `aria-invalid` (the parsing is the form's), so it takes the
   classes of `input[cwInput]` rather than the directive, which owns that attribute. */
/**
 * Constant DURATION
 *
 * @description
 * Classes for the duration input.
 *
 * @type {string}
 */
const DURATION: string =
  'h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm tabular-nums transition-[color,box-shadow] placeholder:text-muted-foreground outline-hidden focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive/60 aria-invalid:ring-3 aria-invalid:ring-destructive/15 motion-reduce:transition-none';
/**
 * Constant QUICK
 *
 * @description
 * Classes for duration shortcuts.
 *
 * @type {string}
 */
const QUICK: string =
  'inline-flex h-7 items-center justify-center rounded-md border border-input text-xs font-medium whitespace-nowrap tabular-nums transition-colors hover:bg-accent outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none';

/**
 * Function emptyDraft
 *
 * @description
 * Creates the default time entry draft.
 * @returns {CwTimeEntryDraft} Default time entry draft.
 */
function emptyDraft(): CwTimeEntryDraft {
  return { duration: null, date: new Date(), note: '', billable: true };
}

/**
 * Component CwTimeEntryForm
 *
 * @description
 * The form that adds time by hand: shortcuts (« + 15 min » … « + 2 h »), a duration read as it is typed (« = 90 min »), a date, a note and « Facturable » (Time Tracker sheet of the Design System artifact). `cw-time-tracker` opens it in a popover under « Ajouter du temps »; it also works alone. The duration accepts every format of `parseDuration`, a bare number in minutes; an unreadable duration sets `aria-invalid` and writes « Format non reconnu : essayez « 1 h 30 » ou « 90 min ». » on Ajouter. Ajouter or Enter emits `submit` with the draft and empties the form; a shortcut emits `submit` at once with its duration; Annuler or Escape emits `cancel`. `[(value)]` is the draft (today, billable, no duration by default); the form is a Signal Forms value control and a `ControlValueAccessor`.
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
  // #region Properties
  /**
   * Property value
   *
   * @description
   * The draft; `[(value)]`, or the value of a form control.
   *
   * @type {ModelSignal<CwTimeEntryDraft>}
   * @readonly
   */
  public readonly value: ModelSignal<CwTimeEntryDraft> = model<CwTimeEntryDraft>(emptyDraft());

  /**
   * Property quickDurations
   *
   * @description
   * The shortcut durations, in milliseconds; empty hides the row.
   *
   * @type {InputSignal<readonly number[]>}
   * @readonly
   */
  public readonly quickDurations: InputSignal<readonly number[]> =
    input<readonly number[]>(CW_TIME_QUICK_DURATIONS);

  /**
   * Property disabled
   *
   * @description
   * Disables the form (Signal Forms binds it from the field).
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly disabled: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property labels
   *
   * @description
   * French texts, any of them overridden (`CW_TIME_ENTRY_FORM_LABELS`).
   *
   * @type {InputSignal<Partial<CwTimeEntryFormLabels>>}
   * @readonly
   */
  public readonly labels: InputSignal<Partial<CwTimeEntryFormLabels>> = input<
    Partial<CwTimeEntryFormLabels>
  >({});

  /**
   * Property submit
   *
   * @description
   * Emits the complete draft to add.
   * The custom host is not a form and does not receive a native submit event.
   *
   * @type {OutputEmitterRef<CwTimeEntryDraft & { readonly duration: number; }>}
   * @readonly
   */
  public readonly submit: OutputEmitterRef<CwTimeEntryDraft & { readonly duration: number }> =
    output<CwTimeEntryDraft & { readonly duration: number }>();

  /**
   * Property cancel
   *
   * @description
   * Emits on Annuler or Escape.
   *
   * @type {OutputEmitterRef<void>}
   * @readonly
   */
  public readonly cancel: OutputEmitterRef<void> = output();

  /**
   * Property touch
   *
   * @description
   * Emitted when the focus leaves the duration: Signal Forms marks the field touched.
   *
   * @type {OutputEmitterRef<void>}
   * @readonly
   */
  public readonly touch: OutputEmitterRef<void> = output();

  /**
   * Property ngControl
   *
   * @description
   * Optional Angular forms control bound to the component.
   *
   * @type {NgControl | null}
   * @readonly
   */
  private readonly ngControl: NgControl | null = inject(NgControl, { optional: true, self: true });

  /**
   * Property ids
   *
   * @description
   * Generator for accessible form element IDs.
   *
   * @type {_IdGenerator}
   * @readonly
   */
  private readonly ids: _IdGenerator = inject(_IdGenerator);

  /**
   * Property formDisabled
   *
   * @description
   * Disabled state supplied by Angular forms.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  private readonly formDisabled: WritableSignal<boolean> = signal(false);

  /**
   * Property onChange
   *
   * @description
   * Callback registered by Angular forms for value changes.
   *
   * @type {(value: CwTimeEntryDraft) => void}
   */
  private onChange: (value: CwTimeEntryDraft) => void = () => undefined;

  /**
   * Property onTouched
   *
   * @description
   * Callback registered by Angular forms for touch events.
   *
   * @type {() => void}
   */
  private onTouched: () => void = () => undefined;

  /**
   * Property titleId
   *
   * @description
   * Identifier for the form heading.
   *
   * @type {string}
   * @readonly
   */
  protected readonly titleId: string = this.ids.getId('cw-time-entry-form-title-');

  /**
   * Property durationId
   *
   * @description
   * Identifier for the duration input.
   *
   * @type {string}
   * @readonly
   */
  protected readonly durationId: string = this.ids.getId('cw-time-entry-form-duration-');

  /**
   * Property hintId
   *
   * @description
   * Identifier for the duration hint.
   *
   * @type {string}
   * @readonly
   */
  protected readonly hintId: string = this.ids.getId('cw-time-entry-form-hint-');

  /**
   * Property dateId
   *
   * @description
   * Identifier for the date input.
   *
   * @type {string}
   * @readonly
   */
  protected readonly dateId: string = this.ids.getId('cw-time-entry-form-date-');

  /**
   * Property noteId
   *
   * @description
   * Identifier for the note input.
   *
   * @type {string}
   * @readonly
   */
  protected readonly noteId: string = this.ids.getId('cw-time-entry-form-note-');

  /**
   * Property billableId
   *
   * @description
   * Identifier for the billable control.
   *
   * @type {string}
   * @readonly
   */
  protected readonly billableId: string = this.ids.getId('cw-time-entry-form-billable-');

  /**
   * Property labelClasses
   *
   * @description
   * Classes for form labels.
   *
   * @type {string}
   * @readonly
   */
  protected readonly labelClasses: string = LABEL;

  /**
   * Property quickClasses
   *
   * @description
   * Classes for duration shortcut controls.
   *
   * @type {string}
   * @readonly
   */
  protected readonly quickClasses: string = QUICK;

  /**
   * Property durationClasses
   *
   * @description
   * Classes for the duration input.
   *
   * @type {string}
   * @readonly
   */
  protected readonly durationClasses: string = DURATION;

  /**
   * Property text
   *
   * @description
   * Default labels merged with consumer overrides.
   *
   * @type {Signal<{ title: string; duration: string; durationPlaceholder: string; interpreted: (duration: string) => string; hint: string; invalid: string; quick: (duration: string) => string; date: string; note: string; notePlaceholder: string; billable: string; cancel: string; submit: string; }>}
   * @readonly
   */
  protected readonly text: Signal<{
    title: string;
    duration: string;
    durationPlaceholder: string;
    interpreted: (duration: string) => string;
    hint: string;
    invalid: string;
    quick: (duration: string) => string;
    date: string;
    note: string;
    notePlaceholder: string;
    billable: string;
    cancel: string;
    submit: string;
  }> = computed(() => ({ ...CW_TIME_ENTRY_FORM_LABELS, ...this.labels() }));

  /**
   * Property isDisabled
   *
   * @description
   * Whether either form binding disables the control.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly isDisabled: Signal<boolean> = computed(
    () => this.disabled() || this.formDisabled(),
  );

  /**
   * Property durationText
   *
   * @description
   * The typed duration, kept as typed while the draft holds the parsed milliseconds.
   *
   * @type {WritableSignal<string>}
   * @readonly
   */
  protected readonly durationText: WritableSignal<string> = linkedSignal<CwTimeEntryDraft, string>({
    source: this.value,
    // The text stays as typed while it still reads as the draft's duration.
    computation: (draft, previous) => {
      if (previous !== undefined && parseDuration(previous.value) === draft.duration) {
        return previous.value;
      }
      return draft.duration === null ? '' : formatDuration(draft.duration);
    },
  });

  /**
   * Property tried
   *
   * @description
   * Whether submission has been attempted.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  protected readonly tried: WritableSignal<boolean> = signal(false);

  /**
   * Property parsed
   *
   * @description
   * Duration parsed from the current text.
   *
   * @type {Signal<number | null>}
   * @readonly
   */
  protected readonly parsed: Signal<number | null> = computed(() =>
    parseDuration(this.durationText()),
  );

  /**
   * Property unreadable
   *
   * @description
   * Whether the entered duration cannot be parsed.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly unreadable: Signal<boolean> = computed(
    () => this.tried() && this.parsed() === null && this.durationText().trim() !== '',
  );

  /**
   * Property missing
   *
   * @description
   * Whether a required duration is missing.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly missing: Signal<boolean> = computed(
    () => this.tried() && this.durationText().trim() === '',
  );

  /**
   * Property hint
   *
   * @description
   * Hint or validation message for the duration.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly hint: Signal<string> = computed(() => {
    const parsed: number | null = this.parsed();
    if (this.unreadable() || this.missing()) return this.text().invalid;
    if (parsed !== null) return this.text().interpreted(formatDuration(parsed));
    return this.text().hint;
  });

  /**
   * Property formatQuick
   *
   * @description
   * Formats the label of a duration shortcut.
   *
   * @type {(duration: number) => string}
   * @readonly
   */
  protected readonly formatQuick: (duration: number) => string = (duration: number): string =>
    this.text().quick(formatDuration(duration));
  // #endregion

  // #region Constructor
  /**
   * Constructor
   *
   * @description
   * Connects the component to its Angular forms control.
   *
   * @constructor
   */
  public constructor() {
    // Reactive and template-driven forms: this form is the control's value accessor.
    if (this.ngControl) this.ngControl.valueAccessor = this;
  }
  // #endregion

  // #region Methods
  /**
   * Method writeValue
   *
   * @description
   * Updates the draft from Angular forms.
   *
   * @param {unknown} value - Value to format or write.
   */
  public writeValue(value: unknown): void {
    this.value.set(value && typeof value === 'object' ? (value as CwTimeEntryDraft) : emptyDraft());
  }

  /**
   * Method registerOnChange
   *
   * @description
   * Registers the Angular forms value-change callback.
   *
   * @param {(value: CwTimeEntryDraft) => void} fn - Callback registered by Angular forms.
   */
  public registerOnChange(fn: (value: CwTimeEntryDraft) => void): void {
    this.onChange = fn;
  }

  /**
   * Method registerOnTouched
   *
   * @description
   * Registers the Angular forms touch callback.
   *
   * @param {() => void} fn - Callback registered by Angular forms.
   */
  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Method setDisabledState
   *
   * @description
   * Updates the disabled state from Angular forms.
   *
   * @param {boolean} isDisabled - Disabled state supplied by Angular forms.
   */
  public setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  /**
   * Method onDurationInput
   *
   * @description
   * Parses duration input and updates the draft.
   *
   * @param {Event} event - Browser event from the interaction.
   */
  protected onDurationInput(event: Event): void {
    const text: string = (event.target as HTMLInputElement).value;
    this.durationText.set(text);
    this.tried.set(false);
    this.update({ duration: parseDuration(text) });
  }

  /**
   * Method onFieldBlur
   *
   * @description
   * Reports interaction with one of the draft fields to the bound form.
   */
  protected onFieldBlur(): void {
    this.onTouched();
    this.touch.emit();
  }

  /**
   * Method onDate
   *
   * @description
   * Updates the date when a day is selected.
   *
   * @param {CwDatePickerValue} date - Selected date.
   */
  protected onDate(date: CwDatePickerValue): void {
    if (date instanceof Date) this.update({ date });
  }

  /**
   * Method onNote
   *
   * @description
   * Updates the entry note.
   *
   * @param {Event} event - Browser event from the interaction.
   */
  protected onNote(event: Event): void {
    this.update({ note: (event.target as HTMLInputElement).value });
  }

  /**
   * Method onBillable
   *
   * @description
   * Updates whether the entry is billable.
   *
   * @param {boolean} billable - Whether the entry is billable.
   */
  protected onBillable(billable: boolean): void {
    this.update({ billable });
  }

  /**
   * Method addQuick
   *
   * @description
   * Submits a draft using a shortcut duration.
   *
   * @param {number} duration - Duration in milliseconds.
   */
  protected addQuick(duration: number): void {
    this.submit.emit({ ...this.value(), duration });
    this.clear();
  }

  /**
   * Method add
   *
   * @description
   * Validates and submits the current draft.
   */
  protected add(): void {
    const duration: number | null = this.parsed();
    if (duration === null || duration <= 0) {
      this.tried.set(true);
      return;
    }
    this.submit.emit({ ...this.value(), duration });
    this.clear();
  }

  /**
   * Method onKeydown
   *
   * @description
   * Handles cancellation and submission from the keyboard.
   *
   * @param {KeyboardEvent} event - Browser event from the interaction.
   */
  protected onKeydown(event: KeyboardEvent): void {
    if (this.isDisabled()) return;
    if (event.key === 'Escape') {
      this.cancel.emit();
      return;
    }
    const target: HTMLElement = event.target as HTMLElement;
    // Enter in a text field adds; on a button or in the date picker it keeps its own meaning.
    if (event.key === 'Enter' && target.tagName === 'INPUT' && !event.isComposing) {
      event.preventDefault();
      this.add();
    }
  }

  /**
   * Method update
   *
   * @description
   * Applies draft changes and notifies Angular forms.
   *
   * @param {Partial<CwTimeEntryDraft>} change - Draft fields to update.
   */
  private update(change: Partial<CwTimeEntryDraft>): void {
    const next: { duration: number | null; date: Date; note: string; billable: boolean } = {
      ...this.value(),
      ...change,
    };
    this.value.set(next);
    this.onChange(next);
  }

  /**
   * Method clear
   *
   * @description
   * Resets the draft after submission while preserving billable status.
   */
  private clear(): void {
    const next: { billable: boolean; duration: number | null; date: Date; note: string } = {
      ...emptyDraft(),
      billable: this.value().billable,
    };
    this.tried.set(false);
    this.value.set(next);
    this.durationText.set('');
    this.onChange(next);
  }
  // #endregion
}
