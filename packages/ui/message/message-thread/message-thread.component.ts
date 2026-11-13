import { Component, computed, input, numberAttribute, output } from '@angular/core';
import { CwAvatar } from '@cadenway/ui/avatar';
import { CwRipple } from '@cadenway/ui/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCaretRightBold } from '@ng-icons/phosphor-icons/bold';

import { clockTime, messageTime, sameDay } from '../message.format';
import type { CwMessageThreadLabels } from '../message.types';

const LABELS: CwMessageThreadLabels = {
  reply: 'réponse',
  replies: 'réponses',
  last: 'Dernière',
  at: 'à',
  justNow: "à l'instant",
};

/**
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
  /** Number of replies. */
  readonly count = input.required({ transform: numberAttribute });
  /** Time of the last reply. */
  readonly lastReplyAt = input<Date | null>(null);
  /** Names of the people who replied; the first three are shown. */
  readonly participants = input<readonly string[]>([]);
  /** Replaces the French texts. */
  readonly labels = input<Partial<CwMessageThreadLabels>>({});

  /** The summary was activated: open the thread. */
  readonly open = output();

  protected readonly text = computed(() => ({ ...LABELS, ...this.labels() }));
  protected readonly shown = computed(() => this.participants().slice(0, 3));
  protected readonly countText = computed(
    () => `${String(this.count())} ${this.count() === 1 ? this.text().reply : this.text().replies}`,
  );
  protected readonly lastText = computed(() => {
    const last = this.lastReplyAt();
    if (!last) return '';
    const now = new Date();
    const elapsed = now.getTime() - last.getTime();
    // « Dernière à 11:05 » the same day, after the first hour; a relative time otherwise.
    if (sameDay(last, now) && elapsed >= 3_600_000) {
      return `${this.text().last} ${this.text().at} ${clockTime(last)}`;
    }
    return `${this.text().last} ${messageTime(last, now, this.text().justNow)}`;
  });
}
