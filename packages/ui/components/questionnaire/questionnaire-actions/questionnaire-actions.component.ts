import {
  Component,
  computed,
  contentChildren,
  inject,
  input,
  type InputSignal,
  type Signal,
} from '@angular/core';
import { CwButton } from '@cadenway/ui/components/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCaretLeftBold } from '@ng-icons/phosphor-icons/bold';

import { QUESTIONNAIRE, type QuestionnaireRef } from '../questionnaire.token';

/**
 * Component CwQuestionnaireActions
 *
 * @description
 * The buttons under the current question: Précédent on the left, Passer (optional questions) and Suivant or Envoyer on the right (Questionnaire sheet of the Design System artifact, « Actions »). Put it in a `form[cwQuestionnaire]`. Précédent shows from the second question; Envoyer replaces Suivant on the last one; Suivant and Envoyer check the required answer. Project your own `button[cwButton]`s to replace the defaults. Hidden on the confirmation screen.
 */
@Component({
  selector: 'cw-questionnaire-actions',
  imports: [CwButton, NgIcon],
  providers: [provideIcons({ phosphorCaretLeftBold })],
  host: {
    class: 'flex items-center gap-2',
    '[hidden]': 'questionnaire.done()',
  },
  templateUrl: './questionnaire-actions.component.html',
})
export class CwQuestionnaireActions {
  // #region Properties
  /**
   * Property previousLabel
   *
   * @description
   * Text of the back button.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly previousLabel: InputSignal<string> = input('Précédent');

  /**
   * Property skipLabel
   *
   * @description
   * Text of the skip button.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly skipLabel: InputSignal<string> = input('Passer');

  /**
   * Property nextLabel
   *
   * @description
   * Text of the next button.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly nextLabel: InputSignal<string> = input('Suivant');

  /**
   * Property submitLabel
   *
   * @description
   * Text of the send button, on the last question.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly submitLabel: InputSignal<string> = input('Envoyer');

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
   * Property projected
   *
   * @description
   * Consumer-projected action buttons.
   *
   * @type {Signal<readonly CwButton[]>}
   * @readonly
   */
  private readonly projected: Signal<readonly CwButton[]> = contentChildren(CwButton);

  /**
   * Property custom
   *
   * @description
   * Whether custom action buttons are projected.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly custom: Signal<boolean> = computed(() => this.projected().length > 0);

  /**
   * Property canSkip
   *
   * @description
   * Whether the current question can be skipped.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly canSkip: Signal<boolean> = computed(
    () => this.questionnaire.current()?.required() === false,
  );
  // #endregion
}
