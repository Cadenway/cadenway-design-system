import { Component, computed, input, type InputSignal, type Signal } from '@angular/core';
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
 * Component CwMessageNote
 *
 * @description
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
  // #region Properties
  /**
   * Property tone
   * @readonly
   *
   * @description
   * Tone controlling the note's icon, color and live role.
   *
   * @type {InputSignal<CwMessageTone>}
   * @default 'default'
   */
  public readonly tone: InputSignal<CwMessageTone> = input<CwMessageTone>('default');

  /**
   * Property toneLabels
   * @readonly
   *
   * @description
   * Overrides for the default French tone words.
   *
   * @type {InputSignal<Partial<CwMessageToneLabels>>}
   * @default {}
   */
  public readonly toneLabels: InputSignal<Partial<CwMessageToneLabels>> = input<
    Partial<CwMessageToneLabels>
  >({});

  /**
   * Property role
   * @readonly
   *
   * @description
   * Live role associated with the current tone, or null for the default tone.
   *
   * @type {Signal<'alert' | 'status' | null>}
   */
  protected readonly role: Signal<'alert' | 'status' | null> = computed(() =>
    toneRole(this.tone()),
  );

  /**
   * Property icon
   * @readonly
   *
   * @description
   * Filled icon and color for the current tone, or null for the default tone.
   *
   * @type {Signal<{ name: string; color: string } | null>}
   */
  protected readonly icon: Signal<{ name: string; color: string } | null> = computed(() => {
    const tone: CwMessageTone = this.tone();
    return tone === 'default' ? null : TONE_ICONS[tone];
  });

  /**
   * Property toneWord
   * @readonly
   *
   * @description
   * Tone word read before the note, or an empty string for the default tone.
   *
   * @type {Signal<string>}
   */
  protected readonly toneWord: Signal<string> = computed(() => {
    const tone: CwMessageTone = this.tone();
    return tone === 'default' ? '' : { ...TONE_LABELS, ...this.toneLabels() }[tone];
  });
  // #endregion
}
