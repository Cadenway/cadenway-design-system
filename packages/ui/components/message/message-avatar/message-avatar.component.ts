import { Component, computed, inject, input, type InputSignal, type Signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorSparkleBold } from '@ng-icons/phosphor-icons/bold';

import { phosphorName } from '../message.styles';
import { MESSAGE, type MessageRef } from '../message.token';

/**
 * Component CwMessageAvatar
 *
 * @description
 * The avatar column of an incoming message, 32 px wide, aligned on the first bubble under the
 * header (Message sheet of the Design System artifact, « Avatar »).
 *
 * Project a `cw-avatar` into it, or set `icon` (a Phosphor name in kebab case, `sparkle` for the
 * assistant, provided) for a neutral icon disc. In a grouped message the column keeps its width,
 * so the bubbles stay aligned, and hides its content.
 */
@Component({
  selector: 'cw-message-avatar',
  imports: [NgIcon],
  providers: [provideIcons({ phosphorSparkleBold })],
  host: {
    class: 'flex w-8 shrink-0 pt-5',
    '[class.invisible]': 'hidden()',
    '[attr.aria-hidden]': 'hidden() ? "true" : null',
  },
  templateUrl: './message-avatar.component.html',
})
export class CwMessageAvatar {
  // #region Properties
  /**
   * Property icon
   * @readonly
   *
   * @description
   * Kebab-case Phosphor icon name for a neutral disc; an empty string leaves projected content.
   *
   * @type {InputSignal<string>}
   * @default ''
   */
  public readonly icon: InputSignal<string> = input('');

  /**
   * Property message
   * @readonly
   *
   * @description
   * Parent message context, or null when the avatar is rendered alone.
   *
   * @type {MessageRef | null}
   */
  private readonly message: MessageRef | null = inject(MESSAGE, { optional: true });

  /**
   * Property hidden
   * @readonly
   *
   * @description
   * Whether a grouped message hides the avatar while retaining its column width.
   *
   * @type {Signal<boolean>}
   */
  protected readonly hidden: Signal<boolean> = computed(() => this.message?.isGrouped() === true);

  /**
   * Property iconName
   * @readonly
   *
   * @description
   * Registered bold Phosphor icon name, or an empty string when no icon is requested.
   *
   * @type {Signal<string>}
   */
  protected readonly iconName: Signal<string> = computed(() =>
    this.icon() ? phosphorName(this.icon(), 'Bold') : '',
  );
  // #endregion
}
