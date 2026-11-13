import { Component, computed, inject, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorSparkleBold } from '@ng-icons/phosphor-icons/bold';

import { phosphorName } from '../message.styles';
import { MESSAGE } from '../message.token';

/**
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
  /** Phosphor icon name in kebab case for an icon disc in place of a person (`sparkle`). */
  readonly icon = input('');

  private readonly message = inject(MESSAGE, { optional: true });

  protected readonly hidden = computed(() => this.message?.isGrouped() === true);
  protected readonly iconName = computed(() =>
    this.icon() ? phosphorName(this.icon(), 'Bold') : '',
  );
}
