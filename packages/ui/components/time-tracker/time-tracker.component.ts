import {
  Component,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  inject,
  input,
  linkedSignal,
  model,
  numberAttribute,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { CwButton } from '@cadenway/ui/components/button';
import { CwRipple } from '@cadenway/ui/core';
import { CwMeter } from '@cadenway/ui/components/meter';
import { CwPopover, CwPopoverTrigger } from '@cadenway/ui/components/popover';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorCurrencyEurBold,
  phosphorPauseBold,
  phosphorPlayBold,
  phosphorPlusBold,
  phosphorStopBold,
} from '@ng-icons/phosphor-icons/bold';
import { phosphorPlayFill, phosphorStopFill } from '@ng-icons/phosphor-icons/fill';

import { formatDuration } from './duration';
import { CwTimeEntryForm } from './time-entry-form/time-entry-form.component';
import { CW_TIME_TRACKER_LABELS } from './time-tracker.constants';
import type {
  CwTimeStopEvent,
  CwTimeTrackerLabels,
  CwTimeTrackerState,
  CwTimeTrackerVariant,
} from './time-tracker.types';

/* Literal class strings (Time Tracker sheet and preview of the Design System artifact). The main
   button is round: start and resume in `secondary`, stop in ink while the time runs. */
const TIMER = 'flex h-10 min-w-0 items-center gap-2.5 rounded-lg border pr-3 pl-1.5';

const MAIN =
  'relative isolate inline-flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full transition-colors outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none';

const MAIN_TONES = {
  start:
    'bg-secondary text-secondary-foreground hover:bg-linear-to-b hover:from-hover hover:to-hover',
  stop: 'bg-foreground text-background hover:bg-foreground/90',
} as const;

const CHIP =
  'relative isolate inline-flex h-7 items-center gap-1.5 overflow-hidden rounded-md border border-input px-2 text-xs font-medium tabular-nums transition-colors hover:bg-accent outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none';

const DOT = 'size-2 shrink-0 animate-pulse rounded-full bg-jade motion-reduce:animate-none';

const MINUTE = 60_000;
const CLOCK = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' });

/**
 * The time tracked on an item: a timer to start, pause and stop, its total against the estimate,
 * the billable part, and the entry to add by hand (Time Tracker sheet of the Design System
 * artifact).
 *
 * `full` (default) renders the 40 px timer: the round main button (« Démarrer le minuteur », then
 * « Arrêter le minuteur et enregistrer » in ink while it runs, « Reprendre le minuteur » paused),
 * the jade dot while running, the `h:mm:ss` duration in a `role="timer"` that moves every second,
 * and on the right « Total 3 h 33 », « depuis 14:05 » with « Mettre en pause », or « En pause »
 * with « Arrêter ». With an `estimate`, a `cw-meter` sets the total against it (« 1 h 45 / 3 h »,
 * « 1 h 15 restantes »); over it, the mark at the estimate, the excess in grenat and « +33 min ».
 * `billableTotal` adds the « Facturable » line. Projected content (a `cw-time-entry-list`) follows;
 * a projected `cw-time-entry-form` opens in a popover under « Ajouter du temps » and closes when it
 * submits or cancels. `compact` renders one 28 px chip that starts, stops or resumes.
 *
 * `[(state)]` is the timer state; `elapsed` is the session's duration at the last update (pauses
 * deducted): the timer counts on from it while running. `start`, `pause`, `resume` and `stop`
 * (`{ duration, startedAt }`, rounded to the minute) report each action; the consumer persists
 * them. The start, the pause and the saved duration are announced. `readonly` hides the timer and
 * the addition. Style hooks on the host: `data-state`, `data-over`, `data-variant`.
 */
@Component({
  selector: 'cw-time-tracker',
  imports: [NgIcon, CwButton, CwRipple, CwMeter, CwPopover, CwPopoverTrigger],
  providers: [
    provideIcons({
      phosphorCurrencyEurBold,
      phosphorPauseBold,
      phosphorPlayBold,
      phosphorPlayFill,
      phosphorPlusBold,
      phosphorStopBold,
      phosphorStopFill,
    }),
  ],
  host: {
    class: 'block min-w-0',
    '[attr.data-state]': 'state()',
    '[attr.data-over]': 'over() > 0 ? "" : null',
    '[attr.data-variant]': 'variant()',
  },
  templateUrl: './time-tracker.component.html',
})
export class CwTimeTracker {
  /** State of the timer; `[(state)]`. */
  readonly state = model<CwTimeTrackerState>('stopped');
  /** Start of the running session (« depuis 14:05 »). */
  readonly startedAt = input<Date | null>(null);
  /** Duration of the session at the last update, in milliseconds, pauses deducted. */
  readonly elapsed = input(0, { transform: numberAttribute });
  /** Time tracked on the item, in milliseconds. */
  readonly total = input(0, { transform: numberAttribute });
  /** Estimate in milliseconds; shows the meter. `null` for none. */
  readonly estimate = input<number | null>(null);
  /** Billable part of the total, in milliseconds; shows the « Facturable » line. */
  readonly billableTotal = input(0, { transform: numberAttribute });
  /** The full timer, or a 28 px chip. */
  readonly variant = input<CwTimeTrackerVariant>('full');
  /** Hides the timer and the addition; the totals and the projected list stay. */
  readonly readonly = input(false, { transform: booleanAttribute });
  /** French texts, any of them overridden (`CW_TIME_TRACKER_LABELS`). */
  readonly labels = input<Partial<CwTimeTrackerLabels>>({});
  /** Emitted when the timer starts. */
  readonly start = output();
  /** Emitted when the timer pauses. */
  // The sheet names this output `pause`; no native `pause` event (a media one) reaches this host.
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly pause = output();
  /** Emitted when a paused timer resumes. */
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly resume = output();
  /** Emits the session, rounded to the minute, when the timer stops: it becomes an entry. */
  readonly stop = output<CwTimeStopEvent>();

  private readonly announcer = inject(LiveAnnouncer);
  private readonly form = contentChild(CwTimeEntryForm);
  private readonly popover = viewChild(CwPopover);
  private readonly now = signal(Date.now());
  // The session's duration when the timer last changed: `elapsed`, or the time frozen by a pause.
  private readonly base = linkedSignal(() => this.elapsed());
  // When `elapsed` was last given: a running timer counts on from there.
  private readonly anchor = linkedSignal({
    source: () => [this.state(), this.elapsed()] as const,
    computation: () => Date.now(),
  });

  protected readonly text = computed(() => ({ ...CW_TIME_TRACKER_LABELS, ...this.labels() }));
  protected readonly timerClasses = TIMER;
  protected readonly chipClasses = CHIP;
  protected readonly dotClasses = DOT;
  protected readonly hasForm = computed(() => !!this.form());
  protected readonly live = computed(() =>
    this.state() === 'running'
      ? this.base() + Math.max(0, this.now() - this.anchor())
      : this.base(),
  );
  protected readonly clock = computed(() => formatDuration(this.live(), { clock: true }));
  protected readonly totalText = computed(() => formatDuration(this.total()));
  protected readonly since = computed(() => {
    const startedAt = this.startedAt();
    return startedAt ? this.text().since(CLOCK.format(startedAt)) : '';
  });
  protected readonly mainClasses = computed(
    () => `${MAIN} ${MAIN_TONES[this.state() === 'running' ? 'stop' : 'start']}`,
  );
  protected readonly mainLabel = computed(() => {
    const text = this.text();
    if (this.state() === 'running') return text.stop;
    return this.state() === 'paused' ? text.resume : text.start;
  });
  protected readonly compactLabel = computed(() => {
    const text = this.text();
    if (this.state() === 'running') return text.compactStop(this.clock());
    if (this.state() === 'paused') return text.compactResume(this.clock());
    return text.compactStart(this.totalText());
  });
  protected readonly over = computed(() => {
    const estimate = this.estimate();
    return estimate === null ? 0 : Math.max(0, this.total() - estimate);
  });
  protected readonly meterMax = computed(() => Math.max(this.total(), this.estimate() ?? 0, 1));
  protected readonly meterFormat = (value: number): string =>
    this.text().meterValue(formatDuration(value), formatDuration(this.estimate() ?? 0));
  protected readonly formatAmount = (value: number): string => formatDuration(value);
  protected readonly meterNote = computed(() => {
    const estimate = this.estimate();
    if (estimate === null) return '';
    const over = this.over();
    return over > 0
      ? this.text().over(formatDuration(over))
      : this.text().remaining(formatDuration(estimate - this.total()));
  });
  protected readonly billableText = computed(() => formatDuration(this.billableTotal()));

  constructor() {
    // The duration moves every second while the timer runs, without announcing it (sheet,
    // "Accessibilité": the timer region is not live).
    effect((onCleanup) => {
      if (this.state() !== 'running') return;
      untracked(() => {
        this.now.set(Date.now());
      });
      const timer = setInterval(() => {
        this.now.set(Date.now());
      }, 1000);
      onCleanup(() => {
        clearInterval(timer);
      });
    });

    // The entry form closes its popover once it has added or cancelled.
    effect((onCleanup) => {
      const form = this.form();
      if (!form) return;
      const close = (): void => {
        this.popover()?.open.set(false);
      };
      const submitted = form.submit.subscribe(close);
      const cancelled = form.cancel.subscribe(close);
      onCleanup(() => {
        submitted.unsubscribe();
        cancelled.unsubscribe();
      });
    });
  }

  protected onMain(): void {
    switch (this.state()) {
      case 'running':
        this.finish();
        return;
      case 'paused':
        this.anchor.set(Date.now());
        this.state.set('running');
        this.resume.emit();
        void this.announcer.announce(this.text().started, 'polite');
        return;
      default:
        this.state.set('running');
        this.start.emit();
        void this.announcer.announce(this.text().started, 'polite');
    }
  }

  protected onPause(): void {
    this.base.set(this.live());
    this.state.set('paused');
    this.pause.emit();
    void this.announcer.announce(this.text().paused, 'polite');
  }

  protected finish(): void {
    const duration = Math.round(this.live() / MINUTE) * MINUTE;
    const startedAt = this.startedAt() ?? new Date(Date.now() - this.live());
    this.base.set(0);
    this.state.set('stopped');
    this.stop.emit({ duration, startedAt });
    void this.announcer.announce(this.text().saved(formatDuration(duration)), 'polite');
  }
}
