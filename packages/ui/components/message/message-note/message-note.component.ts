import { Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorCheckCircleFill,
  phosphorInfoFill,
  phosphorWarningCircleFill,
  phosphorWarningFill,
} from '@ng-icons/phosphor-icons/fill';

import { TONE_ICONS, TONE_LABELS, toneRole } from '../message.styles';
import type { CwMessageTone, CwMessageToneLabels } from '../message.types';

/**
 * A state note under the bubbles of a message: private comment, converted to a task, flagged link,
 * blocked attachment, failed sending (Message sheet of the Design System artifact, « Note d'état »).
 *
 * Shows the filled icon of its `tone`, whose word is read first (« Avertissement : »), then the
 * projected text and `link` buttons. `error` is an alert in `text-destructive`; `info`, `success`
 * and `warning` are statuses; `default` has no icon and no live role. Projected into a
 * `cw-message`, it replaces the note the message draws from its `title`.
 */
@Component({
  selector: 'cw-message-note',
  imports: [NgIcon],
  providers: [
    provideIcons({
      phosphorCheckCircleFill,
      phosphorInfoFill,
      phosphorWarningCircleFill,
      phosphorWarningFill,
    }),
  ],
  host: {
    class:
      'flex max-w-full min-w-0 items-start gap-1 px-3 text-xs leading-4 animate-item-in motion-reduce:animate-none',
    '[class.text-muted-foreground]': 'tone() !== "error"',
    '[class.text-destructive]': 'tone() === "error"',
    '[attr.role]': 'role()',
    '[attr.data-tone]': 'tone()',
  },
  templateUrl: './message-note.component.html',
})
export class CwMessageNote {
  /** Tone of the note. */
  readonly tone = input<CwMessageTone>('default');
  /** Replaces the French tone words. */
  readonly toneLabels = input<Partial<CwMessageToneLabels>>({});

  protected readonly role = computed(() => toneRole(this.tone()));
  protected readonly icon = computed(() => {
    const tone = this.tone();
    return tone === 'default' ? null : TONE_ICONS[tone];
  });
  protected readonly toneWord = computed(() => {
    const tone = this.tone();
    return tone === 'default' ? '' : { ...TONE_LABELS, ...this.toneLabels() }[tone];
  });
}
