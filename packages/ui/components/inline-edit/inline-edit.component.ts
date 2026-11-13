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
const READ =
  'group/edit -mx-1.5 flex w-fit max-w-[calc(100%+0.75rem)] gap-2 rounded-md border border-transparent px-1.5 text-left transition-colors hover:bg-accent outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none';

const STATIC =
  '-mx-1.5 flex w-fit max-w-[calc(100%+0.75rem)] gap-2 rounded-md border border-transparent px-1.5';

const FIELD =
  '-mx-1.5 w-[calc(100%+0.75rem)] min-w-0 rounded-md border border-input bg-transparent px-1.5 outline-hidden focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 aria-invalid:border-destructive/60 aria-invalid:ring-3 aria-invalid:ring-destructive/15 placeholder:font-normal placeholder:text-muted-foreground';

const LINES = {
  single: 'items-center py-[3px]',
  multiline: 'items-start py-1 leading-relaxed',
} as const;

const FIELD_LINES = {
  single: 'py-[3px]',
  multiline: 'field-sizing-content min-h-16 resize-none py-1 leading-relaxed',
} as const;

function optionalLength(value: unknown): number | undefined {
  return value === null || value === undefined || value === '' ? undefined : numberAttribute(value);
}

/**
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
  /** The text; `[(value)]`, or the value of a form control. */
  readonly value = model('');
  /** Whether the field is open; `[(editing)]`. */
  readonly editing = model(false);
  /** A `textarea` that grows with its lines; Ctrl + Enter validates, Enter adds a line. */
  readonly multiline = input(false, { transform: booleanAttribute });
  /** Text shown when the value is empty (« Ajouter une description… »), and in the empty field. */
  readonly placeholder = input('');
  /** Refuses an empty value: the field stays open with `labels.required`. */
  readonly required = input(false, { transform: booleanAttribute });
  /** Maximum length of the text, as the native `maxlength`; `null` for none. */
  readonly maxLength = input<number | undefined, unknown>(undefined, { transform: optionalLength });
  /** The parent is saving: the text shows with a spinner and cannot be clicked. */
  readonly saving = input(false, { transform: booleanAttribute });
  /** A refusal (validation or server): the field reopens with the typed text and this message. */
  readonly error = input<string | null>(null);
  /** A click outside, or Tab, validates; `false` makes them cancel. */
  readonly submitOnBlur = input(true, { transform: booleanAttribute });
  /** Bare text, no hover nor pencil; a lock explains it (`labels.readonly`). */
  readonly readonly = input(false, { transform: booleanAttribute });
  /** Disables the text (Signal Forms binds it from the field). */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Invalid state given by Signal Forms; shown once touched. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Touched state given by Signal Forms. */
  readonly touched = input(false, { transform: booleanAttribute });
  /** Name of the field (« Titre de la tâche »); the text names the button in reading mode. */
  readonly ariaLabel = input('');
  /** French texts, any of them overridden (`CW_INLINE_EDIT_LABELS`). */
  readonly labels = input<Partial<CwInlineEditLabels>>({});
  /** Emits the new text when a changed and valid value is validated. */
  readonly save = output<string>();
  /** Emits when the edition is cancelled: Escape, or an unchanged value validated. */
  // The sheet names this output `cancel`; no native `cancel` event bubbles from this host's content.
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly cancel = output();
  /** Emitted when the focus leaves the field: Signal Forms marks the field touched. */
  readonly touch = output();

  private readonly readButton = viewChild<ElementRef<HTMLButtonElement>>('readButton');
  private readonly field = viewChild<ElementRef<HTMLInputElement | HTMLTextAreaElement>>('field');
  private readonly injector = inject(Injector);
  private readonly announcer = inject(LiveAnnouncer);
  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly formDisabled = signal(false);
  private readonly accessorTouched = signal(false);
  private readonly ids = inject(_IdGenerator);
  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  // Escape and Enter close the field themselves: the blur that follows must not act a second time.
  private closing = false;

  protected readonly hintId = this.ids.getId('cw-inline-edit-hint-');
  protected readonly helpId = this.ids.getId('cw-inline-edit-help-');
  protected readonly errorId = this.ids.getId('cw-inline-edit-error-');
  protected readonly draft = signal('');
  protected readonly localError = signal<string | null>(null);
  protected readonly text = computed(() => ({ ...CW_INLINE_EDIT_LABELS, ...this.labels() }));
  protected readonly message = computed(() => this.localError() ?? this.error());
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  protected readonly state = computed<CwInlineEditState>(() =>
    this.saving() && !this.editing() ? 'saving' : this.editing() ? 'editing' : 'reading',
  );
  protected readonly lines = computed(() => (this.multiline() ? 'multiline' : 'single'));
  protected readonly readClasses = computed(() => `${READ} ${LINES[this.lines()]}`);
  protected readonly staticClasses = computed(() => `${STATIC} ${LINES[this.lines()]}`);
  protected readonly fieldClasses = computed(() => `${FIELD} ${FIELD_LINES[this.lines()]}`);

  constructor() {
    // Reactive and template-driven forms: this text is the control's value accessor. Set here
    // rather than through NG_VALUE_ACCESSOR, so it can read the control's validity.
    if (this.ngControl) this.ngControl.valueAccessor = this;

    // A server refusal arrives after `save`: the field reopens with the typed text (sheet, "Règles":
    // never lose the input on a server error) and the message is announced.
    effect(() => {
      const error = this.error();
      if (!error) return;
      untracked(() => {
        if (!this.editing() && !this.readonly()) this.open(false);
        void this.announcer.announce(error, 'assertive');
      });
    });

    // The end of `saving` without an error is the confirmation of the save (sheet, "Accessibilité").
    let wasSaving = false;
    effect(() => {
      const saving = this.saving();
      const error = this.error();
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

  /** Moves the focus to the text, or into the field while editing (Signal Forms calls it). */
  focus(options?: FocusOptions): void {
    (this.field() ?? this.readButton())?.nativeElement.focus(options);
  }

  writeValue(value: unknown): void {
    this.value.set(typeof value === 'string' ? value : '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  protected isInvalid(): boolean {
    if (this.message()) return true;
    if (this.invalid() && this.touched()) return true;
    const control = this.ngControl;
    return (
      !!control && control.invalid === true && (control.touched === true || this.accessorTouched())
    );
  }

  protected onReadKeydown(event: KeyboardEvent): void {
    if (event.key !== 'F2') return;
    event.preventDefault();
    this.open(true);
  }

  protected onFieldInput(event: Event): void {
    this.draft.set((event.target as HTMLInputElement).value);
    if (this.localError()) this.localError.set(null);
  }

  protected onFieldKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.closing = true;
      this.close(true);
      return;
    }
    if (event.key !== 'Enter' || event.isComposing) return;
    const modified = event.ctrlKey || event.metaKey;
    if (this.multiline() && !modified) return;
    event.preventDefault();
    this.closing = true;
    this.commit(true);
  }

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

  /** Opens the field with the current text, selected. */
  protected open(select: boolean): void {
    if (this.readonly() || this.isDisabled() || this.saving()) return;
    if (!this.editing() || !this.field()) this.draft.set(this.value());
    this.editing.set(true);
    this.focusField(select);
  }

  private focusField(select: boolean): void {
    afterNextRender(
      () => {
        const field = this.field()?.nativeElement;
        if (!field) return;
        field.focus();
        if (select) field.select();
      },
      { injector: this.injector },
    );
  }

  private commit(restoreFocus: boolean): void {
    const next = this.multiline() ? this.draft() : this.draft().trim();
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

  private close(restoreFocus: boolean): void {
    this.localError.set(null);
    this.editing.set(false);
    this.markTouched();
    this.cancel.emit();
    if (restoreFocus) this.focusRead();
  }

  private focusRead(): void {
    afterNextRender(() => this.readButton()?.nativeElement.focus(), { injector: this.injector });
  }

  private markTouched(): void {
    this.accessorTouched.set(true);
    this.onTouched();
    this.touch.emit();
  }
}
