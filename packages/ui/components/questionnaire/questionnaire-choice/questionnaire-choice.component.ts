import {
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  viewChild,
  type InputSignalWithTransform,
  type InputSignal,
  type ModelSignal,
  type Signal,
} from '@angular/core';
import { CwInput } from '@cadenway/ui/components/input';
import { CwKbd } from '@cadenway/ui/components/kbd';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCheckBold } from '@ng-icons/phosphor-icons/bold';

import {
  type ChoiceRef,
  type QuestionRef,
  QUESTIONNAIRE_CHOICE,
  QUESTIONNAIRE_QUESTION,
} from '../questionnaire.token';

/**
 * Component CwQuestionnaireChoice
 *
 * @description
 * One answer card of a question: a hidden native radio or checkbox, its indicator, the title, an optional description and the letter key (Questionnaire sheet of the Design System artifact). Put it on a native `<label>` inside a `fieldset[cwQuestionnaireQuestion]`; its content is the title. The native input keeps the role, the state and the arrow keys of a radio group; the card reads `:checked` and `:disabled` (`has-checked:bg-selected`). The letter (« B ») is read before the title and drawn as a key on the right. `other` adds a text field shown while the choice is ticked; its text is `[(otherText)]` and replaces the value in the answers; Escape in it gives the focus back to the choice. `disabled` dims the card and ignores its letter.
 */
@Component({
  selector: 'label[cwQuestionnaireChoice]',
  imports: [CwInput, CwKbd, NgIcon],
  providers: [
    provideIcons({ phosphorCheckBold }),
    { provide: QUESTIONNAIRE_CHOICE, useExisting: CwQuestionnaireChoice },
  ],
  host: {
    class:
      'group/choice relative flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-colors motion-reduce:transition-none hover:bg-accent has-checked:border-foreground/40 has-checked:bg-selected has-[[data-choice]:focus-visible]:ring-2 has-[[data-choice]:focus-visible]:ring-ring has-[[data-choice]:focus-visible]:ring-offset-2 has-[[data-choice]:focus-visible]:ring-offset-background has-disabled:cursor-not-allowed has-disabled:opacity-50 has-disabled:hover:bg-transparent',
  },
  templateUrl: './questionnaire-choice.component.html',
})
export class CwQuestionnaireChoice implements ChoiceRef {
  // #region Properties
  /**
   * Property value
   *
   * @description
   * Value sent when the choice is ticked.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly value: InputSignal<string> = input.required<string>();

  /**
   * Property disabled
   *
   * @description
   * Makes the choice unavailable.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly disabled: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property other
   *
   * @description
   * Adds a free text field, shown while ticked.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly other: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property otherText
   *
   * @description
   * Text typed in the free field; `[(otherText)]`.
   *
   * @type {ModelSignal<string>}
   * @readonly
   */
  public readonly otherText: ModelSignal<string> = model('');

  /**
   * Property description
   *
   * @description
   * Second line under the title.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly description: InputSignal<string> = input('');

  /**
   * Property otherPlaceholder
   *
   * @description
   * Placeholder of the free field.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly otherPlaceholder: InputSignal<string> = input('Précisez…');

  /**
   * Property otherLabel
   *
   * @description
   * Accessible name of the free field.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly otherLabel: InputSignal<string> = input('Autre : précisez');

  /**
   * Property question
   *
   * @description
   * Containing question that owns the choice.
   *
   * @type {QuestionRef}
   * @readonly
   */
  protected readonly question: QuestionRef = inject(QUESTIONNAIRE_QUESTION);

  /**
   * Property control
   *
   * @description
   * Native choice input used for focus.
   *
   * @type {Signal<ElementRef<HTMLInputElement>>}
   * @readonly
   */
  private readonly control: Signal<ElementRef<HTMLInputElement>> =
    viewChild.required<ElementRef<HTMLInputElement>>('control');

  /**
   * Property isDisabled
   *
   * @description
   * Whether the choice cannot be picked.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  public readonly isDisabled: Signal<boolean> = computed(
    () => this.disabled() || this.question.isDisabled(),
  );

  /**
   * Property checked
   *
   * @description
   * Whether the choice is selected.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly checked: Signal<boolean> = computed(() => this.question.isChecked(this));

  /**
   * Property letter
   *
   * @description
   * Keyboard shortcut letter assigned to the choice.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly letter: Signal<string> = computed(() => this.question.letterOf(this));

  /**
   * Property multiple
   *
   * @description
   * Whether the question allows multiple selections.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly multiple: Signal<boolean> = computed(
    () => this.question.type() === 'multiple',
  );
  // #endregion

  // #region Methods
  /**
   * Method focus
   *
   * @description
   * Moves the focus to the native input.
   */
  public focus(): void {
    this.control().nativeElement.focus();
  }

  /**
   * Method changed
   *
   * @description
   * Reports a changed native choice state.
   */
  protected changed(): void {
    this.question.toggle(this, this.control().nativeElement.checked);
  }

  /**
   * Method typed
   *
   * @description
   * Updates the free-form answer text.
   *
   * @param {Event} event - Browser event associated with the interaction.
   */
  protected typed(event: Event): void {
    this.otherText.set((event.target as HTMLInputElement).value);
  }

  /**
   * Method escape
   *
   * @description
   * Handles Escape while editing a free-form answer.
   *
   * @param {Event} event - Browser event associated with the interaction.
   */
  protected escape(event: Event): void {
    event.preventDefault();
    this.focus();
  }
  // #endregion
}
