import { Component, computed, input, numberAttribute, output } from '@angular/core';
import type {
  InputSignal,
  InputSignalWithTransform,
  OutputEmitterRef,
  Signal,
} from '@angular/core';
import { CwAvatar } from '@cadenway/ui/components/avatar';
import { CwRipple, ɵsameDay } from '@cadenway/ui/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCaretRightBold } from '@ng-icons/phosphor-icons/bold';

import { clockTime, messageTime } from '../message.format';
import type { CwMessageThreadLabels, CwMessageTimeFormatter } from '../message.types';

/**
 * Type ReplyCountInput
 *
 * @description
 * Required reply count after Angular's numeric input transform.
 *
 * @type {InputSignalWithTransform<number, unknown>}
 */
type ReplyCountInput = InputSignalWithTransform<number, unknown>;

/**
 * Type ThreadText
 *
 * @description
 * Reactive French labels used by the thread summary.
 *
 * @type {Signal<CwMessageThreadLabels>}
 */
type ThreadText = Signal<CwMessageThreadLabels>;

/**
 * Constant LABELS
 *
 * @description
 * Default French text used in the thread summary.
 *
 * @type {CwMessageThreadLabels}
 */
const LABELS: CwMessageThreadLabels = {
  reply: 'réponse',
  replies: 'réponses',
  last: 'Dernière',
  at: 'à',
  justNow: "à l'instant",
};

/**
 * Component CwMessageThread
 *
 * @description
 * The summary of the replies to a message, opening its thread (Message sheet of the Design System
 * artifact, `cw-message-thread`).
 *
 * One button: up to three participant avatars (`participants`, names), « 3 réponses » and
 * « Dernière à 11:05 » (`lastReplyAt`; « Dernière hier 17:20 » on another day), then a chevron. It
 * emits `open`; the thread opens in the same panel.
 */
@Component({
  selector: 'cw-message-thread',
  imports: [CwAvatar, CwRipple, NgIcon],
  providers: [provideIcons({ phosphorCaretRightBold })],
  host: { class: 'block' },
  templateUrl: './message-thread.component.html',
})
export class CwMessageThread {
  // #region Properties
  /**
   * Property count
   * @readonly
   *
   * @description
   * Required number of replies displayed by the summary.
   *
   * @type {ReplyCountInput}
   */
  public readonly count: ReplyCountInput = input.required({ transform: numberAttribute });

  /**
   * Property lastReplyAt
   * @readonly
   *
   * @description
   * Time of the most recent reply, or null when it is unavailable.
   *
   * @type {InputSignal<Date | null>}
   * @default null
   */
  public readonly lastReplyAt: InputSignal<Date | null> = input<Date | null>(null);

  /**
   * Property formatTime
   *
   * @description
   * Optional formatter for the last reply timestamp; defaults to the French time display.
   *
   * @type {InputSignal<CwMessageTimeFormatter | null>}
   * @readonly
   */
  public readonly formatTime: InputSignal<CwMessageTimeFormatter | null> =
    input<CwMessageTimeFormatter | null>(null);

  /**
   * Property participants
   * @readonly
   *
   * @description
   * Names of participants; at most the first three are shown as avatars.
   *
   * @type {InputSignal<readonly string[]>}
   * @default []
   */
  public readonly participants: InputSignal<readonly string[]> = input<readonly string[]>([]);

  /**
   * Property labels
   * @readonly
   *
   * @description
   * Overrides for the default French summary text.
   *
   * @type {InputSignal<Partial<CwMessageThreadLabels>>}
   * @default {}
   */
  public readonly labels: InputSignal<Partial<CwMessageThreadLabels>> = input<
    Partial<CwMessageThreadLabels>
  >({});

  /**
   * Property open
   * @readonly
   *
   * @description
   * Emits when the summary is activated to open the thread.
   *
   * @type {OutputEmitterRef<void>}
   */
  public readonly open: OutputEmitterRef<void> = output();

  /**
   * Property text
   * @readonly
   *
   * @description
   * Default labels combined with caller overrides.
   *
   * @type {ThreadText}
   */
  protected readonly text: ThreadText = computed(() => ({ ...LABELS, ...this.labels() }));

  /**
   * Property shown
   * @readonly
   *
   * @description
   * First three participant names shown by the summary.
   *
   * @type {Signal<string[]>}
   */
  protected readonly shown: Signal<string[]> = computed(() => this.participants().slice(0, 3));

  /**
   * Property countText
   * @readonly
   *
   * @description
   * Reply count with its singular or plural label.
   *
   * @type {Signal<string>}
   */
  protected readonly countText: Signal<string> = computed(
    () => `${String(this.count())} ${this.count() === 1 ? this.text().reply : this.text().replies}`,
  );

  /**
   * Property lastText
   * @readonly
   *
   * @description
   * Formatted time of the last reply, or an empty string when no timestamp is available.
   *
   * @type {Signal<string>}
   */
  protected readonly lastText: Signal<string> = computed(() => {
    const last: Date | null = this.lastReplyAt();
    if (!last) return '';
    const now: Date = new Date();
    const format: CwMessageTimeFormatter | null = this.formatTime();
    if (format) return `${this.text().last} ${format(last, now)}`;
    const elapsed: number = now.getTime() - last.getTime();
    // « Dernière à 11:05 » the same day, after the first hour; a relative time otherwise.
    if (ɵsameDay(last, now) && elapsed >= 3_600_000) {
      return `${this.text().last} ${this.text().at} ${clockTime(last)}`;
    }
    return `${this.text().last} ${messageTime(last, now, this.text().justNow)}`;
  });
  // #endregion
}
