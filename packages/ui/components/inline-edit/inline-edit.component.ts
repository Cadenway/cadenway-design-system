import {
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  untracked,
  viewChild,
  type InputSignal,
  type InputSignalWithTransform,
  type ModelSignal,
  type OutputEmitterRef,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import { LiveAnnouncer, _IdGenerator } from '@angular/cdk/a11y';
import { type ControlValueAccessor, NgControl } from '@angular/forms';
import type { FormValueControl } from '@angular/forms/signals';
import { CwKbd } from '@cadenway/ui/components/kbd';
import { CwSpinner } from '@cadenway/ui/components/spinner';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorLockSimpleBold, phosphorPencilSimpleBold } from '@ng-icons/phosphor-icons/bold';
import { phosphorWarningCircleFill } from '@ng-icons/phosphor-icons/fill';

import { CW_INLINE_EDIT_LABELS } from './inline-edit.constants';
import type { CwInlineEditLabels, CwInlineEditState } from './inline-edit.types';

/* Literal class strings (Inline Edit sheet and preview of the Design System artifact). The text does
   not move by a pixel between reading and editing: same `-mx-1.5 px-1.5`, a transparent border
   kept in reading mode, the same vertical padding, and the font inherited from the context. */
/**
 * Constant READ
 *
 * @description
 * Classes for an editable value in reading mode.
 *
 * @type {string}
 */
const READ: string =
  'group/edit -mx-1.5 flex w-fit max-w-[calc(100%+0.75rem)] gap-2 rounded-md border border-transparent px-1.5 text-left transition-colors hover:bg-accent outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none';

/**
 * Constant STATIC
 *
 * @description
 * Classes for a read-only value.
 *
 * @type {string}
 */
const STATIC: string =
  '-mx-1.5 flex w-fit max-w-[calc(100%+0.75rem)] gap-2 rounded-md border border-transparent px-1.5';

/**
 * Constant FIELD
 *
 * @description
 * Classes for the editing field.
 *
 * @type {string}
 */
const FIELD: string =
  '-mx-1.5 w-[calc(100%+0.75rem)] min-w-0 rounded-md border border-input bg-transparent px-1.5 outline-hidden focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 aria-invalid:border-destructive/60 aria-invalid:ring-3 aria-invalid:ring-destructive/15 placeholder:font-normal placeholder:text-muted-foreground';

/**
 * Constant LINES
 *
 * @description
 * Reading layout classes by line mode.
 *
 * @type {Readonly<Record<'single' | 'multiline', string>>}
 */
const LINES: Readonly<Record<'single' | 'multiline', string>> = {
  single: 'items-center py-[3px]',
  multiline: 'items-start py-1 leading-relaxed',
} as const;

/**
 * Constant FIELD_LINES
 *
 * @description
 * Editing layout classes by line mode.
 *
 * @type {Readonly<Record<'single' | 'multiline', string>>}
 */
const FIELD_LINES: Readonly<Record<'single' | 'multiline', string>> = {
  single: 'py-[3px]',
  multiline: 'field-sizing-content min-h-16 resize-none py-1 leading-relaxed',
} as const;

/**
 * Function optionalLength
 *
 * @description
 * Converts an optional maximum length to a number.
 *
 * @param {unknown} value - Maximum-length input, including empty values.
 *
 * @returns {number | undefined} Converted length, or undefined for an empty value.
 */
function optionalLength(value: unknown): number | undefined {
  return value === null || value === undefined || value === '' ? undefined : numberAttribute(value);
}

/**
 * Component CwInlineEdit
 *
 * @description
 * A text that turns into a field on click, at the same place and the same size: a task title, a
 * list name, a short description (Inline Edit sheet of the Design System artifact).
 *
 * Reading, it is a `button` named by its text and described by « Cliquer pour modifier », with a
 * pencil shown on hover and focus; an empty value shows `placeholder` in muted ink. A click, Enter
 * or F2 opens an `input` (a `textarea` with `multiline`) holding the text, selected. Enter
 * validates (Ctrl + Enter in `multiline`), Escape cancels, Tab and a click outside validate
 * (`submitOnBlur`, else they cancel). Validating an unchanged value cancels. `required` refuses an
 * empty value and keeps the field open with a message; `maxLength` caps the field.
 *
 * A valid change updates `[(value)]`, emits `save` and gives the focus back to the text; the parent
 * then sets `saving` (spinner, « Enregistrement… », `aria-busy`, not clickable) and, on a server
 * refusal, `error`: the field reopens with the typed text and the message under it
 * (`aria-invalid`). Escape emits `cancel`. `[(editing)]` drives the mode from outside. `readonly`
 * shows the bare text with a lock. The successful save and the errors are announced.
 *
 * Works with Signal Forms (`[formField]`, it is a `FormValueControl<string>`) and with Reactive or
 * template-driven forms (it is the control's value accessor); the font size and weight come from
 * the surrounding text (`<h2 class="text-lg font-semibold">`). Style hooks on the host:
 * `data-state="reading|editing|saving"`, `data-empty`, `data-readonly`.
 */
@Component({
  selector: 'cw-inline-edit',
  imports: [NgIcon, CwKbd, CwSpinner],
  providers: [
    provideIcons({ phosphorLockSimpleBold, phosphorPencilSimpleBold, phosphorWarningCircleFill }),
  ],
  host: {
    class: 'block min-w-0',
    '[attr.data-state]': 'state()',
    '[attr.data-empty]': 'value() === "" ? "" : null',
    '[attr.data-readonly]': 'readonly() ? "" : null',
  },
  templateUrl: './inline-edit.component.html',
})
export class CwInlineEdit implements FormValueControl<string>, ControlValueAccessor {
  // #region Properties
  /**
   * Property value
   * @readonly
   *
   * @description
   * Current value of the editor.
   *
   * @type {ModelSignal<string>}
   */
  public readonly value: ModelSignal<string> = model('');

  /**
   * Property editing
   * @readonly
   *
   * @description
   * Whether the field is open.
   *
   * @type {ModelSignal<boolean>}
   */
  public readonly editing: ModelSignal<boolean> = model(false);

  /**
   * Property multiline
   * @readonly
   *
   * @description
   * Whether the field accepts multiple lines.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly multiline: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property placeholder
   * @readonly
   *
   * @description
   * Text shown when the value is empty.
   *
   * @type {InputSignal<string>}
   */
  public readonly placeholder: InputSignal<string> = input('');

  /**
   * Property required
   * @readonly
   *
   * @description
   * Whether an empty value is rejected.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly required: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property maxLength
   * @readonly
   *
   * @description
   * Optional maximum length of the value.
   *
   * @type {InputSignalWithTransform<number | undefined, unknown>}
   */
  public readonly maxLength: InputSignalWithTransform<number | undefined, unknown> = input<
    number | undefined,
    unknown
  >(undefined, {
    transform: optionalLength,
  });

  /**
   * Property saving
   * @readonly
   *
   * @description
   * Whether the parent is saving.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly saving: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property error
   * @readonly
   *
   * @description
   * Validation or server error message.
   *
   * @type {InputSignal<string | null>}
   */
  public readonly error: InputSignal<string | null> = input<string | null>(null);

  /**
   * Property submitOnBlur
   * @readonly
   *
   * @description
   * Whether leaving the field validates changes.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly submitOnBlur: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  /**
   * Property readonly
   * @readonly
   *
   * @description
   * Whether the value is read-only.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly readonly: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property disabled
   * @readonly
   *
   * @description
   * Whether the editor is disabled.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly disabled: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property invalid
   * @readonly
   *
   * @description
   * Invalid state supplied by Signal Forms.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly invalid: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property touched
   * @readonly
   *
   * @description
   * Touched state supplied by Signal Forms.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly touched: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property ariaLabel
   * @readonly
   *
   * @description
   * Accessible name of the editing field.
   *
   * @type {InputSignal<string>}
   */
  public readonly ariaLabel: InputSignal<string> = input('');

  /**
   * Property labels
   * @readonly
   *
   * @description
   * Overrides for default labels.
   *
   * @type {InputSignal<Partial<CwInlineEditLabels>>}
   */
  public readonly labels: InputSignal<Partial<CwInlineEditLabels>> = input<
    Partial<CwInlineEditLabels>
  >({});

  /**
   * Property save
   * @readonly
   *
   * @description
   * Emits a changed and valid value.
   *
   * @type {OutputEmitterRef<string>}
   */
  public readonly save: OutputEmitterRef<string> = output<string>();

  /**
   * Property cancel
   * @readonly
   *
   * @description
   * Emits when editing is cancelled.
   *
   * @type {OutputEmitterRef<void>}
   */
  public readonly cancel: OutputEmitterRef<void> = output();

  /**
   * Property touch
   * @readonly
   *
   * @description
   * Emits when the field is touched.
   *
   * @type {OutputEmitterRef<void>}
   */
  public readonly touch: OutputEmitterRef<void> = output();

  /**
   * Property readButton
   * @readonly
   *
   * @description
   * Button used in reading mode.
   *
   * @type {Signal<ElementRef<HTMLButtonElement> | undefined>}
   */
  private readonly readButton: Signal<ElementRef<HTMLButtonElement> | undefined> =
    viewChild<ElementRef<HTMLButtonElement>>('readButton');

  /**
   * Property field
   * @readonly
   *
   * @description
   * Editing field when rendered.
   *
   * @type {Signal<ElementRef<HTMLInputElement | HTMLTextAreaElement> | undefined>}
   */
  private readonly field: Signal<ElementRef<HTMLInputElement | HTMLTextAreaElement> | undefined> =
    viewChild<ElementRef<HTMLInputElement | HTMLTextAreaElement>>('field');

  /**
   * Property injector
   * @readonly
   *
   * @description
   * Injector used to schedule focus after rendering.
   *
   * @type {Injector}
   */
  private readonly injector: Injector = inject(Injector);

  /**
   * Property announcer
   * @readonly
   *
   * @description
   * Announces save results and errors.
   *
   * @type {LiveAnnouncer}
   */
  private readonly announcer: LiveAnnouncer = inject(LiveAnnouncer);

  /**
   * Property ngControl
   * @readonly
   *
   * @description
   * Reactive or template-driven control if present.
   *
   * @type {NgControl | null}
   */
  private readonly ngControl: NgControl | null = inject(NgControl, { optional: true, self: true });

  /**
   * Property formDisabled
   * @readonly
   *
   * @description
   * Disabled state supplied by the value accessor.
   *
   * @type {WritableSignal<boolean>}
   */
  private readonly formDisabled: WritableSignal<boolean> = signal(false);

  /**
   * Property accessorTouched
   * @readonly
   *
   * @description
   * Touched state reported through the value accessor.
   *
   * @type {WritableSignal<boolean>}
   */
  private readonly accessorTouched: WritableSignal<boolean> = signal(false);

  /**
   * Property ids
   * @readonly
   *
   * @description
   * Generator for accessible element identifiers.
   *
   * @type {_IdGenerator}
   */
  private readonly ids: _IdGenerator = inject(_IdGenerator);

  /**
   * Property onChange
   *
   * @description
   * Callback registered by the form control.
   *
   * @type {(value: string) => void}
   */
  private onChange: (value: string) => void = () => undefined;

  /**
   * Property onTouched
   *
   * @description
   * Touch callback registered by the form control.
   *
   * @type {() => void}
   */
  private onTouched: () => void = () => undefined;
  // Escape and Enter close the field themselves: the blur that follows must not act a second time.
  /**
   * Property closing
   *
   * @description
   * Whether a keyboard action is already closing the field.
   *
   * @type {boolean}
   */
  private closing: boolean = false;

  /**
   * Property hintId
   * @readonly
   *
   * @description
   * Identifier of the reading-mode hint.
   *
   * @type {string}
   */
  protected readonly hintId: string = this.ids.getId('cw-inline-edit-hint-');

  /**
   * Property helpId
   * @readonly
   *
   * @description
   * Identifier of the editing help text.
   *
   * @type {string}
   */
  protected readonly helpId: string = this.ids.getId('cw-inline-edit-help-');

  /**
   * Property errorId
   * @readonly
   *
   * @description
   * Identifier of the error message.
   *
   * @type {string}
   */
  protected readonly errorId: string = this.ids.getId('cw-inline-edit-error-');

  /**
   * Property draft
   * @readonly
   *
   * @description
   * Value currently being edited.
   *
   * @type {WritableSignal<string>}
   */
  protected readonly draft: WritableSignal<string> = signal('');

  /**
   * Property localError
   * @readonly
   *
   * @description
   * Local validation error message.
   *
   * @type {WritableSignal<string | null>}
   */
  protected readonly localError: WritableSignal<string | null> = signal<string | null>(null);

  /**
   * Property text
   * @readonly
   *
   * @description
   * Default labels merged with overrides.
   *
   * @type {Signal<CwInlineEditLabels>}
   */
  protected readonly text: Signal<CwInlineEditLabels> = computed(() => ({
    ...CW_INLINE_EDIT_LABELS,
    ...this.labels(),
  }));

  /**
   * Property message
   * @readonly
   *
   * @description
   * Local or server error message.
   *
   * @type {Signal<string | null>}
   */
  protected readonly message: Signal<string | null> = computed(
    () => this.localError() ?? this.error(),
  );

  /**
   * Property isDisabled
   * @readonly
   *
   * @description
   * Combined input and form disabled state.
   *
   * @type {Signal<boolean>}
   */
  protected readonly isDisabled: Signal<boolean> = computed(
    () => this.disabled() || this.formDisabled(),
  );

  /**
   * Property state
   * @readonly
   *
   * @description
   * Current reading, editing or saving state.
   *
   * @type {Signal<CwInlineEditState>}
   */
  protected readonly state: Signal<CwInlineEditState> = computed<CwInlineEditState>(() =>
    this.saving() && !this.editing() ? 'saving' : this.editing() ? 'editing' : 'reading',
  );

  /**
   * Property lines
   * @readonly
   *
   * @description
   * Current line layout mode.
   *
   * @type {Signal<'single' | 'multiline'>}
   */
  protected readonly lines: Signal<'single' | 'multiline'> = computed(() =>
    this.multiline() ? 'multiline' : 'single',
  );

  /**
   * Property readClasses
   * @readonly
   *
   * @description
   * Classes for the reading button.
   *
   * @type {Signal<string>}
   */
  protected readonly readClasses: Signal<string> = computed(() => `${READ} ${LINES[this.lines()]}`);

  /**
   * Property staticClasses
   * @readonly
   *
   * @description
   * Classes for read-only content.
   *
   * @type {Signal<string>}
   */
  protected readonly staticClasses: Signal<string> = computed(
    () => `${STATIC} ${LINES[this.lines()]}`,
  );

  /**
   * Property fieldClasses
   * @readonly
   *
   * @description
   * Classes for the editing field.
   *
   * @type {Signal<string>}
   */
  protected readonly fieldClasses: Signal<string> = computed(
    () => `${FIELD} ${FIELD_LINES[this.lines()]}`,
  );
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Connects form state and synchronizes editing and save feedback.
   */
  public constructor() {
    // Reactive and template-driven forms: this text is the control's value accessor. Set here
    // rather than through NG_VALUE_ACCESSOR, so it can read the control's validity.
    if (this.ngControl) this.ngControl.valueAccessor = this;

    // A server refusal arrives after `save`: the field reopens with the typed text (sheet, "Règles":
    // never lose the input on a server error) and the message is announced.
    effect(() => {
      const error: string | null = this.error();
      if (!error) return;
      untracked(() => {
        if (!this.editing() && !this.readonly()) this.open(false);
        void this.announcer.announce(error, 'assertive');
      });
    });

    // The end of `saving` without an error is the confirmation of the save (sheet, "Accessibilité").
    let wasSaving: boolean = false;
    effect(() => {
      const saving: boolean = this.saving();
      const error: string | null = this.error();
      if (wasSaving && !saving && !error) {
        untracked(() => void this.announcer.announce(this.text().saved, 'polite'));
      }
      wasSaving = saving;
    });

    // `[(editing)]` set from outside opens the field like a click does.
    effect(() => {
      if (!this.editing()) return;
      untracked(() => {
        if (this.field()) return;
        this.draft.set(this.value());
        this.focusField(true);
      });
    });
  }
  // #endregion

  // #region Methods
  /**
   * Method focus
   *
   * @description
   * Focuses the reading button or editing field.
   *
   * @param {FocusOptions} [options] - Optional browser focus behavior.
   */
  public focus(options?: FocusOptions): void {
    (this.field() ?? this.readButton())?.nativeElement.focus(options);
  }

  /**
   * Method writeValue
   *
   * @description
   * Writes a value supplied by the form control.
   *
   * @param {unknown} value - Form value to write; non-string values clear the editor.
   */
  public writeValue(value: unknown): void {
    this.value.set(typeof value === 'string' ? value : '');
  }

  /**
   * Method registerOnChange
   *
   * @description
   * Registers the form change callback.
   *
   * @param {(value: string) => void} fn - Callback notified when the value changes.
   */
  public registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  /**
   * Method registerOnTouched
   *
   * @description
   * Registers the form touch callback.
   *
   * @param {() => void} fn - Callback notified when the field is touched.
   */
  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Method setDisabledState
   *
   * @description
   * Sets the disabled state supplied by the form.
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
   * Reports whether validation feedback should be shown.
   *
   * @returns {boolean} Whether validation feedback should be displayed.
   */
  protected isInvalid(): boolean {
    if (this.message()) return true;
    if (this.invalid() && this.touched()) return true;
    const control: NgControl | null = this.ngControl;
    return (
      !!control && control.invalid === true && (control.touched === true || this.accessorTouched())
    );
  }

  /**
   * Method onReadKeydown
   *
   * @description
   * Opens editing when the F2 key is pressed.
   *
   * @param {KeyboardEvent} event - Keyboard event received by the reading button.
   */
  protected onReadKeydown(event: KeyboardEvent): void {
    if (event.key !== 'F2') return;
    event.preventDefault();
    this.open(true);
  }

  /**
   * Method onFieldInput
   *
   * @description
   * Updates the draft from the field.
   *
   * @param {Event} event - Input event containing the current draft.
   */
  protected onFieldInput(event: Event): void {
    this.draft.set((event.target as HTMLInputElement).value);
    if (this.localError()) this.localError.set(null);
  }

  /**
   * Method onFieldKeydown
   *
   * @description
   * Handles keyboard submission and cancellation.
   *
   * @param {KeyboardEvent} event - Keyboard event received by the editing field.
   */
  protected onFieldKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.closing = true;
      this.close(true);
      return;
    }
    if (event.key !== 'Enter' || event.isComposing) return;
    const modified: boolean = event.ctrlKey || event.metaKey;
    if (this.multiline() && !modified) return;
    event.preventDefault();
    this.closing = true;
    this.commit(true);
  }

  /**
   * Method onFieldBlur
   *
   * @description
   * Marks the field touched and commits or cancels.
   */
  protected onFieldBlur(): void {
    this.markTouched();
    if (this.closing) {
      this.closing = false;
      return;
    }
    if (!this.editing()) return;
    if (this.submitOnBlur()) this.commit(false);
    else this.close(false);
  }

  /**
   * Method open
   *
   * @description
   * Opens the field with the current value.
   *
   * @param {boolean} select - Whether to select the field contents after opening.
   */
  protected open(select: boolean): void {
    if (this.readonly() || this.isDisabled() || this.saving()) return;
    if (!this.editing() || !this.field()) this.draft.set(this.value());
    this.editing.set(true);
    this.focusField(select);
  }

  /**
   * Method focusField
   *
   * @description
   * Focuses the rendered field and optionally selects its value.
   *
   * @param {boolean} select - Whether to select the field contents after focusing.
   */
  private focusField(select: boolean): void {
    afterNextRender(
      () => {
        const field: HTMLInputElement | HTMLTextAreaElement | undefined =
          this.field()?.nativeElement;
        if (!field) return;
        field.focus();
        if (select) field.select();
      },
      { injector: this.injector },
    );
  }

  /**
   * Method commit
   *
   * @description
   * Validates and emits a changed draft.
   *
   * @param {boolean} restoreFocus - Whether to return focus to the reading button after committing.
   */
  private commit(restoreFocus: boolean): void {
    const next: string = this.multiline() ? this.draft() : this.draft().trim();
    if (this.required() && next.trim() === '') {
      this.localError.set(this.text().required);
      this.closing = false;
      void this.announcer.announce(this.text().required, 'assertive');
      return;
    }
    if (next === this.value() && !this.error()) {
      this.close(restoreFocus);
      return;
    }
    this.localError.set(null);
    this.value.set(next);
    this.onChange(next);
    this.editing.set(false);
    this.markTouched();
    this.save.emit(next);
    if (restoreFocus) this.focusRead();
  }

  /**
   * Method close
   *
   * @description
   * Cancels editing and restores focus when requested.
   *
   * @param {boolean} restoreFocus - Whether to return focus to the reading button after cancellation.
   */
  private close(restoreFocus: boolean): void {
    this.localError.set(null);
    this.editing.set(false);
    this.markTouched();
    this.cancel.emit();
    if (restoreFocus) this.focusRead();
  }

  /**
   * Method focusRead
   *
   * @description
   * Focuses the reading button after rendering.
   */
  private focusRead(): void {
    afterNextRender(() => this.readButton()?.nativeElement.focus(), { injector: this.injector });
  }

  /**
   * Method markTouched
   *
   * @description
   * Reports the touched state to forms.
   */
  private markTouched(): void {
    this.accessorTouched.set(true);
    this.onTouched();
    this.touch.emit();
  }
  // #endregion
}
