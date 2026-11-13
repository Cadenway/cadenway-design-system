import {
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  contentChildren,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { LiveAnnouncer, _IdGenerator } from '@angular/cdk/a11y';
import { type ControlValueAccessor, NgControl } from '@angular/forms';
import type { FormValueControl } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorWarningCircleFill } from '@ng-icons/phosphor-icons/fill';

import {
  type ChoiceRef,
  QUESTIONNAIRE,
  QUESTIONNAIRE_CHOICE,
  QUESTIONNAIRE_QUESTION,
  type QuestionRef,
} from '../questionnaire.token';
import type {
  CwQuestionType,
  CwQuestionValue,
  CwQuestionnaireShortcuts,
} from '../questionnaire.types';

/**
 * One question of a questionnaire: a `legend`, an optional description, the choices and the error
 * (Questionnaire sheet of the Design System artifact).
 *
 * Put it on a native `<fieldset>`, with a `legend[cwQuestionnaireTitle]`, an optional
 * `cw-questionnaire-description` and `label[cwQuestionnaireChoice]`s. `type="single"` draws radios
 * (value: the chosen value or `null`), `multiple` checkboxes (value: the ticked values); `[(value)]`
 * is a model, the question is a Signal Forms value control (`[formField]`) and the value accessor of
 * a Reactive or template-driven control. A `required` question without answer shows `errorText`
 * once checked by « Suivant » (or touched and invalid in a form), with `aria-invalid` and
 * `aria-describedby`, announces it and focuses its first choice. Inside a questionnaire only the
 * current question shows; on its own (an assistant question) the letter keys work while the focus
 * is inside it. Its key in the answers is `name`, else the form control name, else its index.
 */
@Component({
  // A component on a native element (attribute selector), as its sheet requires: the element keeps
  // its native role, focus and form behavior. The lint rule only knows element selectors.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'fieldset[cwQuestionnaireQuestion]',
  imports: [NgIcon],
  providers: [
    provideIcons({ phosphorWarningCircleFill }),
    { provide: QUESTIONNAIRE_QUESTION, useExisting: CwQuestionnaireQuestion },
  ],
  host: {
    class: 'm-0 min-w-0 border-0 p-0',
    '[hidden]': '!visible()',
    '[attr.data-type]': 'type()',
    '[attr.aria-invalid]': 'errorVisible() ? "true" : null',
    '[attr.aria-describedby]': 'errorVisible() ? errorId : null',
    '(keydown)': 'keydown($event)',
  },
  templateUrl: './questionnaire-question.component.html',
})
export class CwQuestionnaireQuestion
  implements QuestionRef, FormValueControl<CwQuestionValue>, ControlValueAccessor
{
  /** One answer (radios) or several (checkboxes). */
  readonly type = input<CwQuestionType>('single');
  /** Blocks « Suivant » without an answer; otherwise « Passer » is offered. */
  readonly required = input(false, { transform: booleanAttribute });
  /** Error shown when a required answer is missing. */
  readonly errorText = input('Choisissez une réponse pour continuer.');
  /** Key of the question in the answers; Signal Forms binds the field name. */
  readonly name = input('');
  /** Letter shortcuts of a question used on its own; inside a questionnaire, the questionnaire's. */
  readonly shortcuts = input<CwQuestionnaireShortcuts | null>(null);
  /** Disables every choice (Signal Forms binds it from the field). */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Invalid state given by Signal Forms; shown once touched. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Touched state given by Signal Forms. */
  readonly touched = input(false, { transform: booleanAttribute });
  /** The answer; `[(value)]`. */
  readonly value = model<CwQuestionValue>(null);
  /** Emitted when the focus leaves a choice: Signal Forms marks the field touched. */
  readonly touch = output();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly questionnaire = inject(QUESTIONNAIRE, { optional: true });
  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly announcer = inject(LiveAnnouncer);
  private readonly choices = contentChildren(QUESTIONNAIRE_CHOICE, { descendants: true });
  private readonly checkedOnce = signal(false);
  private readonly accessorTouched = signal(false);
  private readonly formDisabled = signal(false);
  private onChange: (value: CwQuestionValue) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  /** Shared `name` of the native radios or checkboxes of this question. */
  readonly groupName = inject(_IdGenerator).getId('cw-questionnaire-question-');
  /** Id of the error message. */
  readonly errorId = `${this.groupName}-error`;

  private readonly activeShortcuts = computed(
    () => this.shortcuts() ?? this.questionnaire?.shortcuts() ?? 'letters',
  );
  /** Whether the question has an answer. */
  readonly hasAnswer = computed(() => {
    const value = this.value();
    return Array.isArray(value) ? value.length > 0 : value !== null && value !== '';
  });
  /** Whether the choices are disabled. */
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  /** Whether the error shows. */
  readonly errorVisible = computed(() => {
    if (this.hasAnswer()) return false;
    if (this.required() && this.checkedOnce()) return true;
    if (this.invalid() && this.touched()) return true;
    const control = this.ngControl;
    return (
      !!control && control.invalid === true && (control.touched === true || this.accessorTouched())
    );
  });
  protected readonly visible = computed(() => {
    const questionnaire = this.questionnaire;
    if (!questionnaire) return true;
    return !questionnaire.done() && questionnaire.indexOf(this) === questionnaire.step();
  });

  constructor() {
    // Reactive and template-driven forms: this question is the control's value accessor, set here
    // rather than through NG_VALUE_ACCESSOR so it can read the control's validity.
    if (this.ngControl) this.ngControl.valueAccessor = this;
  }

  writeValue(value: unknown): void {
    if (Array.isArray(value)) this.value.set(value.filter((item) => typeof item === 'string'));
    else this.value.set(typeof value === 'string' ? value : null);
  }

  registerOnChange(fn: (value: CwQuestionValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  /** Letter of a choice (« A »), or empty without shortcuts or past Z. */
  letterOf(choice: ChoiceRef): string {
    const index = this.choices().indexOf(choice);
    if (this.activeShortcuts() !== 'letters' || index < 0 || index > 25) return '';
    return String.fromCharCode(65 + index);
  }

  /** Whether a choice is part of the answer. */
  isChecked(choice: ChoiceRef): boolean {
    const value = this.value();
    return Array.isArray(value) ? value.includes(choice.value()) : value === choice.value();
  }

  /** Applies a user change of a choice. */
  toggle(choice: ChoiceRef, checked: boolean): void {
    if (this.isDisabled() || choice.isDisabled()) return;
    let next: CwQuestionValue;
    if (this.type() === 'multiple') {
      const current = Array.isArray(this.value()) ? (this.value() as readonly string[]) : [];
      next = checked
        ? [...current.filter((item) => item !== choice.value()), choice.value()]
        : current.filter((item) => item !== choice.value());
    } else {
      next = checked ? choice.value() : this.value();
    }
    this.value.set(next);
    this.onChange(next);
  }

  /** Marks the question touched for the forms. */
  markTouched(): void {
    this.accessorTouched.set(true);
    this.onTouched();
    this.touch.emit();
  }

  /** Key of the question in the answers. */
  key(index: number): string {
    const controlName = this.ngControl?.name;
    return this.name() || (controlName === null ? '' : String(controlName)) || String(index);
  }

  /** The answer, « Autre » replaced by its typed text. */
  answer(): string | string[] | null {
    if (!this.hasAnswer()) return null;
    const replace = (value: string): string => {
      const choice = this.choices().find((item) => item.value() === value);
      return choice?.other() && choice.otherText().trim() !== ''
        ? choice.otherText().trim()
        : value;
    };
    const value = this.value();
    if (Array.isArray(value)) {
      // Answers follow the order of the choices, not the order of the clicks.
      return this.choices()
        .map((choice) => choice.value())
        .filter((item) => value.includes(item))
        .map(replace);
    }
    return replace(value as string);
  }

  /** Checks a required answer: shows and announces the error, focuses the first choice. */
  validate(): boolean {
    this.checkedOnce.set(true);
    if (!this.required() || this.hasAnswer()) return true;
    void this.announcer.announce(this.errorText(), 'assertive');
    this.choices()
      .find((choice) => !choice.isDisabled())
      ?.focus();
    return false;
  }

  /** Picks (single) or toggles (multiple) the choice of a letter key. */
  pressLetter(key: string): boolean {
    if (key.length !== 1 || this.activeShortcuts() !== 'letters') return false;
    const index = key.toUpperCase().charCodeAt(0) - 65;
    const choice = this.choices().at(index);
    if (index < 0 || index > 25 || !choice || choice.isDisabled() || this.isDisabled()) {
      return false;
    }
    this.toggle(choice, this.type() === 'multiple' ? !this.isChecked(choice) : true);
    choice.focus();
    return true;
  }

  /** Moves the focus to the legend, so the question is read first. */
  focusTitle(): void {
    this.host.querySelector<HTMLElement>('legend')?.focus();
  }

  protected keydown(event: KeyboardEvent): void {
    // Inside a questionnaire the form handles the keys of its current question.
    if (this.questionnaire || event.altKey || event.ctrlKey || event.metaKey) return;
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' &&
      !['radio', 'checkbox'].includes((target as HTMLInputElement).type)
    ) {
      return;
    }
    if (this.pressLetter(event.key)) event.preventDefault();
  }
}
