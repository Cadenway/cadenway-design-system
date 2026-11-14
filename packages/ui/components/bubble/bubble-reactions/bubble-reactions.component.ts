import {
  Component,
  booleanAttribute,
  inject,
  input,
  type InputSignal,
  type InputSignalWithTransform,
} from '@angular/core';
import { CwRipple } from '@cadenway/ui/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorSmileyBold } from '@ng-icons/phosphor-icons/bold';

import { BUBBLE, type BubbleRef } from '../bubble.token';

/**
 * Class CwBubbleReactions
 * @class CwBubbleReactions
 *
 * @description
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
  // #region Properties
  /**
   * Property addable
   * @readonly
   *
   * @description
   * Whether the add reaction button is shown.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly addable: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  /**
   * Property addLabel
   * @readonly
   *
   * @description
   * Accessible name of the add button.
   *
   * @type {InputSignal<string>}
   */
  public readonly addLabel: InputSignal<string> = input('Ajouter une réaction');

  /**
   * Property bubble
   * @readonly
   *
   * @description
   * Optional parent receiving reaction picker requests.
   *
   * @type {BubbleRef | null}
   */
  private readonly bubble: BubbleRef | null = inject(BUBBLE, { optional: true });
  // #endregion

  // #region Methods
  /**
   * Method add
   * @method add
   *
   * @description
   * Requests a reaction picker from the parent bubble.
   */
  protected add(): void {
    this.bubble?.addReaction();
  }
  // #endregion
}
