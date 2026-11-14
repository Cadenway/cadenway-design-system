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
  type InputSignalWithTransform,
  type InputSignal,
  type ModelSignal,
  type OutputEmitterRef,
  type WritableSignal,
  type Signal,
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
  type QuestionnaireRef,
} from '../questionnaire.token';
import type {
  CwQuestionType,
  CwQuestionValue,
  CwQuestionnaireShortcuts,
} from '../questionnaire.types';

/**
 * Component CwQuestionnaireQuestion
 *
 * @description
 * One question of a questionnaire: a `legend`, an optional description, the choices and the error (Questionnaire sheet of the Design System artifact). Put it on a native `<fieldset>`, with a `legend[cwQuestionnaireTitle]`, an optional `cw-questionnaire-description` and `label[cwQuestionnaireChoice]`s. `type="single"` draws radios (value: the chosen value or `null`), `multiple` checkboxes (value: the ticked values); `[(value)]` is a model, the question is a Signal Forms value control (`[formField]`) and the value accessor of a Reactive or template-driven control. A `required` question without answer shows `errorText` once checked by « Suivant » (or touched and invalid in a form), with `aria-invalid` and `aria-describedby`, announces it and focuses its first choice. Inside a questionnaire only the current question shows; on its own (an assistant question) the letter keys work while the focus is inside it. Its key in the answers is `name`, else the form control name, else its index.
 */
@Component({
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
  // #region Properties
  /**
   * Property type
   *
   * @description
   * One answer (radios) or several (checkboxes).
   *
   * @type {InputSignal<CwQuestionType>}
   * @readonly
   */
  public readonly type: InputSignal<CwQuestionType> = input<CwQuestionType>('single');

  /**
   * Property required
   *
   * @description
   * Blocks « Suivant » without an answer; otherwise « Passer » is offered.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly required: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property errorText
   *
   * @description
   * Error shown when a required answer is missing.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly errorText: InputSignal<string> = input('Choisissez une réponse pour continuer.');

  /**
   * Property name
   *
   * @description
   * Key of the question in the answers; Signal Forms binds the field name.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly name: InputSignal<string> = input('');

  /**
   * Property shortcuts
   *
   * @description
   * Letter shortcuts of a question used on its own; inside a questionnaire, the questionnaire's.
   *
   * @type {InputSignal<CwQuestionnaireShortcuts | null>}
   * @readonly
   */
  public readonly shortcuts: InputSignal<CwQuestionnaireShortcuts | null> =
    input<CwQuestionnaireShortcuts | null>(null);

  /**
   * Property disabled
   *
   * @description
   * Disables every choice (Signal Forms binds it from the field).
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
   * Property value
   *
   * @description
   * The answer; `[(value)]`.
   *
   * @type {ModelSignal<CwQuestionValue>}
   * @readonly
   */
  public readonly value: ModelSignal<CwQuestionValue> = model<CwQuestionValue>(null);

  /**
   * Property touch
   *
   * @description
   * Emitted when the focus leaves a choice: Signal Forms marks the field touched.
   *
   * @type {OutputEmitterRef<void>}
   * @readonly
   */
  public readonly touch: OutputEmitterRef<void> = output();

  /**
   * Property host
   *
   * @description
   * Question host used for focus and containment checks.
   *
   * @type {HTMLElement}
   * @readonly
   */
  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /**
   * Property questionnaire
   *
   * @description
   * Containing questionnaire that coordinates question state.
   *
   * @type {QuestionnaireRef | null}
   * @readonly
   */
  private readonly questionnaire: QuestionnaireRef | null = inject(QUESTIONNAIRE, {
    optional: true,
  });

  /**
   * Property ngControl
   *
   * @description
   * Optional forms control whose value accessor is this question.
   *
   * @type {NgControl | null}
   * @readonly
   */
  private readonly ngControl: NgControl | null = inject(NgControl, { optional: true, self: true });

  /**
   * Property announcer
   *
   * @description
   * Live announcer used for questionnaire feedback.
   *
   * @type {LiveAnnouncer}
   * @readonly
   */
  private readonly announcer: LiveAnnouncer = inject(LiveAnnouncer);

  /**
   * Property choices
   *
   * @description
   * Choice controls belonging to the question.
   *
   * @type {Signal<readonly ChoiceRef[]>}
   * @readonly
   */
  private readonly choices: Signal<readonly ChoiceRef[]> = contentChildren(QUESTIONNAIRE_CHOICE, {
    descendants: true,
  });

  /**
   * Property checkedOnce
   *
   * @description
   * Whether validation has been requested.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  private readonly checkedOnce: WritableSignal<boolean> = signal(false);

  /**
   * Property accessorTouched
   *
   * @description
   * Whether the forms accessor has reported a touch.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  private readonly accessorTouched: WritableSignal<boolean> = signal(false);

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
   * Property onChange
   *
   * @description
   * Callback notified when the question value changes.
   *
   * @type {(value: CwQuestionValue) => void}
   */
  private onChange: (value: CwQuestionValue) => void = () => undefined;

  /**
   * Property onTouched
   *
   * @description
   * Callback notified when the question is touched.
   *
   * @type {() => void}
   */
  private onTouched: () => void = () => undefined;

  /**
   * Property groupName
   *
   * @description
   * Shared `name` of the native radios or checkboxes of this question.
   *
   * @type {string}
   * @readonly
   */
  public readonly groupName: string = inject(_IdGenerator).getId('cw-questionnaire-question-');

  /**
   * Property errorId
   *
   * @description
   * Id of the error message.
   *
   * @type {string}
   * @readonly
   */
  public readonly errorId: string = `${this.groupName}-error`;

  /**
   * Property activeShortcuts
   *
   * @description
   * Shortcut mode inherited from the questionnaire or configured locally.
   *
   * @type {Signal<CwQuestionnaireShortcuts>}
   * @readonly
   */
  private readonly activeShortcuts: Signal<CwQuestionnaireShortcuts> = computed(
    () => this.shortcuts() ?? this.questionnaire?.shortcuts() ?? 'letters',
  );

  /**
   * Property hasAnswer
   *
   * @description
   * Whether the question has an answer.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  public readonly hasAnswer: Signal<boolean> = computed(() => {
    const value: CwQuestionValue = this.value();
    return Array.isArray(value) ? value.length > 0 : value !== null && value !== '';
  });

  /**
   * Property isDisabled
   *
   * @description
   * Whether the choices are disabled.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  public readonly isDisabled: Signal<boolean> = computed(
    () => this.disabled() || this.formDisabled(),
  );

  /**
   * Property errorVisible
   *
   * @description
   * Whether the error shows.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  public readonly errorVisible: Signal<boolean> = computed(() => {
    if (this.hasAnswer()) return false;
    if (this.required() && this.checkedOnce()) return true;
    if (this.invalid() && this.touched()) return true;
    const control: NgControl | null = this.ngControl;
    return (
      !!control && control.invalid === true && (control.touched === true || this.accessorTouched())
    );
  });

  /**
   * Property visible
   *
   * @description
   * Whether this question is the current questionnaire step.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly visible: Signal<boolean> = computed(() => {
    const questionnaire: QuestionnaireRef | null = this.questionnaire;
    if (!questionnaire) return true;
    return !questionnaire.done() && questionnaire.indexOf(this) === questionnaire.step();
  });
  // #endregion

  // #region Constructor
  /**
   * Constructor
   *
   * @description
   * Connects the optional forms control to this question.
   *
   * @constructor
   */
  public constructor() {
    // Reactive and template-driven forms: this question is the control's value accessor, set here
    // rather than through NG_VALUE_ACCESSOR so it can read the control's validity.
    if (this.ngControl) this.ngControl.valueAccessor = this;
  }
  // #endregion

  // #region Methods
  /**
   * Method writeValue
   *
   * @description
   * Applies a value supplied by the form control.
   *
   * @param {unknown} value - Value supplied by the form control.
   */
  public writeValue(value: unknown): void {
    if (Array.isArray(value)) this.value.set(value.filter((item) => typeof item === 'string'));
    else this.value.set(typeof value === 'string' ? value : null);
  }

  /**
   * Method registerOnChange
   *
   * @description
   * Registers the form value-change callback.
   *
   * @param {(value: CwQuestionValue) => void} fn - Callback registered by the form control.
   */
  public registerOnChange(fn: (value: CwQuestionValue) => void): void {
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
   * Method letterOf
   *
   * @description
   * Letter of a choice (« A »), or empty without shortcuts or past Z.
   *
   * @param {ChoiceRef} choice - Choice involved in the operation.
   * @returns {string} Shortcut letter, or an empty string when unavailable.
   */
  public letterOf(choice: ChoiceRef): string {
    const index: number = this.choices().indexOf(choice);
    if (this.activeShortcuts() !== 'letters' || index < 0 || index > 25) return '';
    return String.fromCharCode(65 + index);
  }

  /**
   * Method isChecked
   *
   * @description
   * Whether a choice is part of the answer.
   *
   * @param {ChoiceRef} choice - Choice involved in the operation.
   * @returns {boolean} Whether the choice is selected.
   */
  public isChecked(choice: ChoiceRef): boolean {
    const value: CwQuestionValue = this.value();
    return Array.isArray(value) ? value.includes(choice.value()) : value === choice.value();
  }

  /**
   * Method toggle
   *
   * @description
   * Applies a user change of a choice.
   *
   * @param {ChoiceRef} choice - Choice involved in the operation.
   * @param {boolean} checked - New checked state of the choice.
   */
  public toggle(choice: ChoiceRef, checked: boolean): void {
    if (this.isDisabled() || choice.isDisabled()) return;
    let next: CwQuestionValue;
    if (this.type() === 'multiple') {
      const current: readonly string[] = Array.isArray(this.value())
        ? (this.value() as readonly string[])
        : [];
      next = checked
        ? [...current.filter((item) => item !== choice.value()), choice.value()]
        : current.filter((item) => item !== choice.value());
    } else {
      next = checked ? choice.value() : this.value();
    }
    this.value.set(next);
    this.onChange(next);
  }

  /**
   * Method markTouched
   *
   * @description
   * Marks the question touched for the forms.
   */
  public markTouched(): void {
    this.accessorTouched.set(true);
    this.onTouched();
    this.touch.emit();
  }

  /**
   * Method key
   *
   * @description
   * Key of the question in the answers.
   *
   * @param {number} index - Question index in the questionnaire.
   * @returns {string} Question key used in the answers.
   */
  public key(index: number): string {
    const controlName: string | number | null | undefined = this.ngControl?.name;
    return this.name() || (controlName === null ? '' : String(controlName)) || String(index);
  }

  /**
   * Method answer
   *
   * @description
   * The answer, « Autre » replaced by its typed text.
   * @returns {string | string[] | null} Answer value, or null when unanswered.
   */
  public answer(): string | string[] | null {
    if (!this.hasAnswer()) return null;
    const replace: (value: string) => string = (value: string): string => {
      const choice: ChoiceRef | undefined = this.choices().find((item) => item.value() === value);
      return choice?.other() && choice.otherText().trim() !== ''
        ? choice.otherText().trim()
        : value;
    };
    const value: CwQuestionValue = this.value();
    if (Array.isArray(value)) {
      // Answers follow the order of the choices, not the order of the clicks.
      return this.choices()
        .map((choice) => choice.value())
        .filter((item) => value.includes(item))
        .map(replace);
    }
    return replace(value as string);
  }

  /**
   * Method validate
   *
   * @description
   * Checks a required answer: shows and announces the error, focuses the first choice.
   * @returns {boolean} Whether the question has a valid required answer.
   */
  public validate(): boolean {
    this.checkedOnce.set(true);
    if (!this.required() || this.hasAnswer()) return true;
    void this.announcer.announce(this.errorText(), 'assertive');
    this.choices()
      .find((choice) => !choice.isDisabled())
      ?.focus();
    return false;
  }

  /**
   * Method pressLetter
   *
   * @description
   * Picks (single) or toggles (multiple) the choice of a letter key.
   *
   * @param {string} key - Letter key used to select a choice.
   * @returns {boolean} Whether the letter selected or toggled a choice.
   */
  public pressLetter(key: string): boolean {
    if (key.length !== 1 || this.activeShortcuts() !== 'letters') return false;
    const index: number = key.toUpperCase().charCodeAt(0) - 65;
    const choice: ChoiceRef | undefined = this.choices().at(index);
    if (index < 0 || index > 25 || !choice || choice.isDisabled() || this.isDisabled()) {
      return false;
    }
    this.toggle(choice, this.type() === 'multiple' ? !this.isChecked(choice) : true);
    choice.focus();
    return true;
  }

  /**
   * Method focusTitle
   *
   * @description
   * Moves the focus to the legend, so the question is read first.
   */
  public focusTitle(): void {
    this.host.querySelector<HTMLElement>('legend')?.focus();
  }

  /**
   * Method keydown
   *
   * @description
   * Handles the keyboard shortcut for a choice.
   *
   * @param {KeyboardEvent} event - Browser event associated with the interaction.
   */
  protected keydown(event: KeyboardEvent): void {
    // Inside a questionnaire the form handles the keys of its current question.
    if (this.questionnaire || event.altKey || event.ctrlKey || event.metaKey) return;
    const target: HTMLElement = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' &&
      !['radio', 'checkbox'].includes((target as HTMLInputElement).type)
    ) {
      return;
    }
    if (this.pressLetter(event.key)) event.preventDefault();
  }
  // #endregion
}
