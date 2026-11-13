import { Component, computed, contentChildren, inject, input } from '@angular/core';
import { CwButton } from '@cadenway/ui/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCaretLeftBold } from '@ng-icons/phosphor-icons/bold';

import { QUESTIONNAIRE } from '../questionnaire.token';

/**
 * The buttons under the current question: Précédent on the left, Passer (optional questions) and
 * Suivant or Envoyer on the right (Questionnaire sheet of the Design System artifact, « Actions »).
 *
 * Put it in a `form[cwQuestionnaire]`. Précédent shows from the second question; Envoyer replaces
 * Suivant on the last one; Suivant and Envoyer check the required answer. Project your own
 * `button[cwButton]`s to replace the defaults. Hidden on the confirmation screen.
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
  /** Text of the back button. */
  readonly previousLabel = input('Précédent');
  /** Text of the skip button. */
  readonly skipLabel = input('Passer');
  /** Text of the next button. */
  readonly nextLabel = input('Suivant');
  /** Text of the send button, on the last question. */
  readonly submitLabel = input('Envoyer');

  protected readonly questionnaire = inject(QUESTIONNAIRE);
  private readonly projected = contentChildren(CwButton);

  protected readonly custom = computed(() => this.projected().length > 0);
  protected readonly canSkip = computed(() => this.questionnaire.current()?.required() === false);
}
