import { Component, booleanAttribute, inject, input } from '@angular/core';
import { CwRipple } from '@cadenway/ui/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorSmileyBold } from '@ng-icons/phosphor-icons/bold';

import { BUBBLE } from '../bubble.token';

/**
 * The reaction row under a bubble, on its side: `button[cwBubbleReaction]` pills, then the add
 * button (Bubble sheet of the Design System artifact, « Réactions »).
 *
 * Put it inside a `cw-bubble`. The add button (`addable`, named « Ajouter une réaction ») makes the
 * bubble emit `reactionAdd`.
 */
@Component({
  selector: 'cw-bubble-reactions',
  imports: [CwRipple, NgIcon],
  providers: [provideIcons({ phosphorSmileyBold })],
  host: { class: 'flex flex-wrap items-center gap-1' },
  templateUrl: './bubble-reactions.component.html',
})
export class CwBubbleReactions {
  /** Shows the add button. */
  readonly addable = input(true, { transform: booleanAttribute });
  /** Accessible name of the add button. */
  readonly addLabel = input('Ajouter une réaction');

  private readonly bubble = inject(BUBBLE, { optional: true });

  protected add(): void {
    this.bubble?.addReaction();
  }
}
