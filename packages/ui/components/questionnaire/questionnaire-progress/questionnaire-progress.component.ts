import { Component, computed, inject, input, type InputSignal, type Signal } from '@angular/core';

import { QUESTIONNAIRE, type QuestionnaireRef } from '../questionnaire.token';

/**
 * Component CwQuestionnaireProgress
 *
 * @description
 * Where the questionnaire stands: « Question 2 sur 4 », its name, and one segment per question, in ink once answered (Questionnaire sheet of the Design System artifact, « Progression »). Put it in a `form[cwQuestionnaire]`; it counts the questions itself. The bar is a `role="progressbar"` whose value text repeats « Question 2 sur 4 ». Hidden on the confirmation screen.
 */
@Component({
  selector: 'cw-questionnaire-progress',
  host: {
    class: 'grid gap-1.5',
    '[hidden]': 'questionnaire.done()',
  },
  templateUrl: './questionnaire-progress.component.html',
})
export class CwQuestionnaireProgress {
  // #region Properties
  /**
   * Property label
   *
   * @description
   * Word before the number (« Question »).
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly label: InputSignal<string> = input('Question');

  /**
   * Property ofLabel
   *
   * @description
   * Word between the numbers (« sur »).
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly ofLabel: InputSignal<string> = input('sur');

  /**
   * Property ariaLabel
   *
   * @description
   * Accessible name of the bar.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly ariaLabel: InputSignal<string> = input('Progression du formulaire');

  /**
   * Property questionnaire
   *
   * @description
   * Containing questionnaire that coordinates question state.
   *
   * @type {QuestionnaireRef}
   * @readonly
   */
  protected readonly questionnaire: QuestionnaireRef = inject(QUESTIONNAIRE);

  /**
   * Property text
   *
   * @description
   * Localized progress text for the current question.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly text: Signal<string> = computed(
    () =>
      `${this.label()} ${String(Math.min(this.questionnaire.step() + 1, this.questionnaire.count()))} ${this.ofLabel()} ${String(this.questionnaire.count())}`,
  );

  /**
   * Property segments
   *
   * @description
   * Progress segments indicating completed questions.
   *
   * @type {Signal<boolean[]>}
   * @readonly
   */
  protected readonly segments: Signal<boolean[]> = computed(() =>
    Array.from({ length: this.questionnaire.count() }, (_, index) =>
      this.questionnaire.isAnswered(index),
    ),
  );
  // #endregion
}
