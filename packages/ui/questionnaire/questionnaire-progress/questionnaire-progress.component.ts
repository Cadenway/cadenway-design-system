import { Component, computed, inject, input } from '@angular/core';

import { QUESTIONNAIRE } from '../questionnaire.token';

/**
 * Where the questionnaire stands: « Question 2 sur 4 », its name, and one segment per question,
 * in ink once answered (Questionnaire sheet of the Design System artifact, « Progression »).
 *
 * Put it in a `form[cwQuestionnaire]`; it counts the questions itself. The bar is a
 * `role="progressbar"` whose value text repeats « Question 2 sur 4 ». Hidden on the confirmation
 * screen.
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
  /** Word before the number (« Question »). */
  readonly label = input('Question');
  /** Word between the numbers (« sur »). */
  readonly ofLabel = input('sur');
  /** Accessible name of the bar. */
  readonly ariaLabel = input('Progression du formulaire');

  protected readonly questionnaire = inject(QUESTIONNAIRE);

  protected readonly text = computed(
    () =>
      `${this.label()} ${String(Math.min(this.questionnaire.step() + 1, this.questionnaire.count()))} ${this.ofLabel()} ${String(this.questionnaire.count())}`,
  );
  protected readonly segments = computed(() =>
    Array.from({ length: this.questionnaire.count() }, (_, index) =>
      this.questionnaire.isAnswered(index),
    ),
  );
}
