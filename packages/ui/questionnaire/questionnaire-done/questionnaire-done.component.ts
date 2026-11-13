import { Component, effect, inject, input } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCheckBold } from '@ng-icons/phosphor-icons/bold';

import { QUESTIONNAIRE } from '../questionnaire.token';
import type { CwQuestionnaireSummaryItem } from '../questionnaire.types';

/**
 * The confirmation screen shown in place of the questions once the answers are sent
 * (Questionnaire sheet of the Design System artifact, « Confirmation »).
 *
 * Put it in a `form[cwQuestionnaire]`; it shows when the questionnaire is `done`, as a
 * `role="status"` whose `title` is also announced. Project the sentence that says what the request
 * became (« Elle devient la tâche CAD-491 dans Produit. ») and, as `button[cwButton]` or `a`, its
 * action (« Voir la tâche »); `summary` lists the answers.
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
  /** Title of the screen. */
  readonly title = input('Demande envoyée');
  /** Recap of the answers. */
  readonly summary = input<readonly CwQuestionnaireSummaryItem[]>([]);

  protected readonly questionnaire = inject(QUESTIONNAIRE);
  private readonly announcer = inject(LiveAnnouncer);

  constructor() {
    let wasDone = this.questionnaire.done();
    effect(() => {
      const done = this.questionnaire.done();
      // A status region that appears is not always read: announce the title once.
      if (done && !wasDone) void this.announcer.announce(this.title());
      wasDone = done;
    });
  }
}
