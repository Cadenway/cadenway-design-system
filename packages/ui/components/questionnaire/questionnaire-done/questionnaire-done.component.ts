import { Component, effect, inject, input, type InputSignal } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCheckBold } from '@ng-icons/phosphor-icons/bold';

import { QUESTIONNAIRE, type QuestionnaireRef } from '../questionnaire.token';
import type { CwQuestionnaireSummaryItem } from '../questionnaire.types';

/**
 * Component CwQuestionnaireDone
 *
 * @description
 * The confirmation screen shown in place of the questions once the answers are sent (Questionnaire sheet of the Design System artifact, « Confirmation »). Put it in a `form[cwQuestionnaire]`; it shows when the questionnaire is `done`, as a `role="status"` whose `title` is also announced. Project the sentence that says what the request became (« Elle devient la tâche CAD-491 dans Produit. ») and, as `button[cwButton]` or `a`, its action (« Voir la tâche »); `summary` lists the answers.
 */
@Component({
  selector: 'cw-questionnaire-done',
  imports: [NgIcon],
  providers: [provideIcons({ phosphorCheckBold })],
  host: {
    role: 'status',
    class: 'block rounded-xl border bg-card p-4 text-card-foreground',
    '[hidden]': '!questionnaire.done()',
  },
  templateUrl: './questionnaire-done.component.html',
})
export class CwQuestionnaireDone {
  // #region Properties
  /**
   * Property title
   *
   * @description
   * Title of the screen.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly title: InputSignal<string> = input('Demande envoyée');

  /**
   * Property summary
   *
   * @description
   * Recap of the answers.
   *
   * @type {InputSignal<readonly CwQuestionnaireSummaryItem[]>}
   * @readonly
   */
  public readonly summary: InputSignal<readonly CwQuestionnaireSummaryItem[]> = input<
    readonly CwQuestionnaireSummaryItem[]
  >([]);

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
   * Property announcer
   *
   * @description
   * Live announcer used for questionnaire feedback.
   *
   * @type {LiveAnnouncer}
   * @readonly
   */
  private readonly announcer: LiveAnnouncer = inject(LiveAnnouncer);
  // #endregion

  // #region Constructor
  /**
   * Constructor
   *
   * @description
   * Announces the confirmation screen after rendering.
   *
   * @constructor
   */
  public constructor() {
    let wasDone: boolean = this.questionnaire.done();
    effect(() => {
      const done: boolean = this.questionnaire.done();
      // A status region that appears is not always read: announce the title once.
      if (done && !wasDone) void this.announcer.announce(this.title());
      wasDone = done;
    });
  }
  // #endregion
}
