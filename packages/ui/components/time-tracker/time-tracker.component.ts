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
  type OutputRefSubscription,
  signal,
  untracked,
  viewChild,
  type InputSignalWithTransform,
  type InputSignal,
  type ModelSignal,
  type OutputEmitterRef,
  type WritableSignal,
  type Signal,
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
/**
 * Constant TIMER
 *
 * @description
 * Classes for the full timer.
 *
 * @type {string}
 */
const TIMER: string = 'flex h-10 min-w-0 items-center gap-2.5 rounded-lg border pr-3 pl-1.5';

/**
 * Constant MAIN
 *
 * @description
 * Classes for the main timer button.
 *
 * @type {string}
 */
const MAIN: string =
  'relative isolate inline-flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full transition-colors outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none';

/**
 * Constant MAIN_TONES
 *
 * @description
 * Button colors for starting and stopping.
 *
 * @type {{ readonly start: "bg-secondary text-secondary-foreground hover:bg-linear-to-b hover:from-hover hover:to-hover"; readonly stop: "bg-foreground text-background hover:bg-foreground/90"; }}
 */
const MAIN_TONES: {
  readonly start: 'bg-secondary text-secondary-foreground hover:bg-linear-to-b hover:from-hover hover:to-hover';
  readonly stop: 'bg-foreground text-background hover:bg-foreground/90';
} = {
  start:
    'bg-secondary text-secondary-foreground hover:bg-linear-to-b hover:from-hover hover:to-hover',
  stop: 'bg-foreground text-background hover:bg-foreground/90',
} as const;

/**
 * Constant CHIP
 *
 * @description
 * Classes for the compact timer.
 *
 * @type {string}
 */
const CHIP: string =
  'relative isolate inline-flex h-7 items-center gap-1.5 overflow-hidden rounded-md border border-input px-2 text-xs font-medium tabular-nums transition-colors hover:bg-accent outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none';

/**
 * Constant DOT
 *
 * @description
 * Classes for the running timer indicator.
 *
 * @type {string}
 */
const DOT: string = 'size-2 shrink-0 animate-pulse rounded-full bg-jade motion-reduce:animate-none';

/**
 * Constant MINUTE
 *
 * @description
 * Number of milliseconds in one minute.
 *
 * @type {60000}
 */
const MINUTE: 60000 = 60_000;
/**
 * Constant CLOCK
 *
 * @description
 * French formatter for a session start time.
 *
 * @type {Intl.DateTimeFormat}
 */
const CLOCK: Intl.DateTimeFormat = new Intl.DateTimeFormat('fr-FR', {
  hour: '2-digit',
  minute: '2-digit',
});

/**
 * Component CwTimeTracker
 *
 * @description
 * The time tracked on an item: a timer to start, pause and stop, its total against the estimate, the billable part, and the entry to add by hand (Time Tracker sheet of the Design System artifact). `full` (default) renders the 40 px timer: the round main button (« Démarrer le minuteur », then « Arrêter le minuteur et enregistrer » in ink while it runs, « Reprendre le minuteur » paused), the jade dot while running, the `h:mm:ss` duration in a `role="timer"` that moves every second, and on the right « Total 3 h 33 », « depuis 14:05 » with « Mettre en pause », or « En pause » with « Arrêter ». With an `estimate`, a `cw-meter` sets the total against it (« 1 h 45 / 3 h », « 1 h 15 restantes »); over it, the mark at the estimate, the excess in grenat and « +33 min ». `billableTotal` adds the « Facturable » line. Projected content (a `cw-time-entry-list`) follows; a projected `cw-time-entry-form` opens in a popover under « Ajouter du temps » and closes when it submits or cancels. `compact` renders one 28 px chip that starts, stops or resumes. `[(state)]` is the timer state; `elapsed` is the session's duration at the last update (pauses deducted): the timer counts on from it while running. `start`, `pause`, `resume` and `stop` (`{ duration, startedAt }`, rounded to the minute) report each action; the consumer persists them. The start, the pause and the saved duration are announced. `readonly` hides the timer and the addition. Style hooks on the host: `data-state`, `data-over`, `data-variant`.
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
  // #region Properties
  /**
   * Property state
   *
   * @description
   * State of the timer; `[(state)]`.
   *
   * @type {ModelSignal<CwTimeTrackerState>}
   * @readonly
   */
  public readonly state: ModelSignal<CwTimeTrackerState> = model<CwTimeTrackerState>('stopped');

  /**
   * Property startedAt
   *
   * @description
   * Start of the running session (« depuis 14:05 »).
   *
   * @type {InputSignal<Date | null>}
   * @readonly
   */
  public readonly startedAt: InputSignal<Date | null> = input<Date | null>(null);

  /**
   * Property elapsed
   *
   * @description
   * Duration of the session at the last update, in milliseconds, pauses deducted.
   *
   * @type {InputSignalWithTransform<number, unknown>}
   * @readonly
   */
  public readonly elapsed: InputSignalWithTransform<number, unknown> = input(0, {
    transform: numberAttribute,
  });

  /**
   * Property total
   *
   * @description
   * Time tracked on the item, in milliseconds.
   *
   * @type {InputSignalWithTransform<number, unknown>}
   * @readonly
   */
  public readonly total: InputSignalWithTransform<number, unknown> = input(0, {
    transform: numberAttribute,
  });

  /**
   * Property estimate
   *
   * @description
   * Estimate in milliseconds; shows the meter. `null` for none.
   *
   * @type {InputSignal<number | null>}
   * @readonly
   */
  public readonly estimate: InputSignal<number | null> = input<number | null>(null);

  /**
   * Property billableTotal
   *
   * @description
   * Billable part of the total, in milliseconds; shows the « Facturable » line.
   *
   * @type {InputSignalWithTransform<number, unknown>}
   * @readonly
   */
  public readonly billableTotal: InputSignalWithTransform<number, unknown> = input(0, {
    transform: numberAttribute,
  });

  /**
   * Property variant
   *
   * @description
   * The full timer, or a 28 px chip.
   *
   * @type {InputSignal<CwTimeTrackerVariant>}
   * @readonly
   */
  public readonly variant: InputSignal<CwTimeTrackerVariant> = input<CwTimeTrackerVariant>('full');

  /**
   * Property readonly
   *
   * @description
   * Hides the timer and the addition; the totals and the projected list stay.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly readonly: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property labels
   *
   * @description
   * French texts, any of them overridden (`CW_TIME_TRACKER_LABELS`).
   *
   * @type {InputSignal<Partial<CwTimeTrackerLabels>>}
   * @readonly
   */
  public readonly labels: InputSignal<Partial<CwTimeTrackerLabels>> = input<
    Partial<CwTimeTrackerLabels>
  >({});

  /**
   * Property start
   *
   * @description
   * Emitted when the timer starts.
   *
   * @type {OutputEmitterRef<void>}
   * @readonly
   */
  public readonly start: OutputEmitterRef<void> = output();

  /**
   * Property pause
   *
   * @description
   * Emitted when the timer pauses.
   *
   * @type {OutputEmitterRef<void>}
   * @readonly
   */
  public readonly pause: OutputEmitterRef<void> = output();

  /**
   * Property resume
   *
   * @description
   * Emitted when a paused timer resumes.
   *
   * @type {OutputEmitterRef<void>}
   * @readonly
   */
  public readonly resume: OutputEmitterRef<void> = output();

  /**
   * Property stop
   *
   * @description
   * Emits the session, rounded to the minute, when the timer stops: it becomes an entry.
   *
   * @type {OutputEmitterRef<CwTimeStopEvent>}
   * @readonly
   */
  public readonly stop: OutputEmitterRef<CwTimeStopEvent> = output<CwTimeStopEvent>();

  /**
   * Property announcer
   *
   * @description
   * Announces timer actions to assistive technology.
   *
   * @type {LiveAnnouncer}
   * @readonly
   */
  private readonly announcer: LiveAnnouncer = inject(LiveAnnouncer);

  /**
   * Property form
   *
   * @description
   * Projected time entry form, if present.
   *
   * @type {Signal<CwTimeEntryForm | undefined>}
   * @readonly
   */
  private readonly form: Signal<CwTimeEntryForm | undefined> = contentChild(CwTimeEntryForm);

  /**
   * Property popover
   *
   * @description
   * Popover containing the projected entry form.
   *
   * @type {Signal<CwPopover | undefined>}
   * @readonly
   */
  private readonly popover: Signal<CwPopover | undefined> = viewChild(CwPopover);

  /**
   * Property now
   *
   * @description
   * Current time used for the running timer.
   *
   * @type {WritableSignal<number>}
   * @readonly
   */
  private readonly now: WritableSignal<number> = signal(Date.now());

  /**
   * Property base
   *
   * @description
   * Session duration at the last timer state change.
   * It starts from elapsed and freezes on pause.
   *
   * @type {WritableSignal<number>}
   * @readonly
   */
  private readonly base: WritableSignal<number> = linkedSignal(() => this.elapsed());

  /**
   * Property anchor
   *
   * @description
   * Time from which the running duration is measured.
   * A running timer counts from the last elapsed update.
   *
   * @type {WritableSignal<number>}
   * @readonly
   */
  private readonly anchor: WritableSignal<number> = linkedSignal({
    source: () => [this.state(), this.elapsed()] as const,
    computation: () => Date.now(),
  });

  /**
   * Property text
   *
   * @description
   * Default labels merged with consumer overrides.
   *
   * @type {Signal<{ start: string; stop: string; resume: string; pause: string; stopShort: string; elapsed: string; since: (time: string) => string; paused: string; total: string; started: string; saved: (duration: string) => string; compactStart: (total: string) => string; compactStop: (clock: string) => string; compactResume: (clock: string) => string; tracked: string; estimate: string; meterValue: (total: string, estimate: string) => string; remaining: (duration: string) => string; over: (duration: string) => string; billable: string; of: string; addTime: string; }>}
   * @readonly
   */
  protected readonly text: Signal<{
    start: string;
    stop: string;
    resume: string;
    pause: string;
    stopShort: string;
    elapsed: string;
    since: (time: string) => string;
    paused: string;
    total: string;
    started: string;
    saved: (duration: string) => string;
    compactStart: (total: string) => string;
    compactStop: (clock: string) => string;
    compactResume: (clock: string) => string;
    tracked: string;
    estimate: string;
    meterValue: (total: string, estimate: string) => string;
    remaining: (duration: string) => string;
    over: (duration: string) => string;
    billable: string;
    of: string;
    addTime: string;
  }> = computed(() => ({ ...CW_TIME_TRACKER_LABELS, ...this.labels() }));

  /**
   * Property timerClasses
   *
   * @description
   * Classes for the full timer.
   *
   * @type {string}
   * @readonly
   */
  protected readonly timerClasses: string = TIMER;

  /**
   * Property chipClasses
   *
   * @description
   * Classes for the compact timer.
   *
   * @type {string}
   * @readonly
   */
  protected readonly chipClasses: string = CHIP;

  /**
   * Property dotClasses
   *
   * @description
   * Classes for the running indicator.
   *
   * @type {string}
   * @readonly
   */
  protected readonly dotClasses: string = DOT;

  /**
   * Property hasForm
   *
   * @description
   * Whether a time entry form is projected.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly hasForm: Signal<boolean> = computed(() => !!this.form());

  /**
   * Property live
   *
   * @description
   * Elapsed session time including the current running interval.
   *
   * @type {Signal<number>}
   * @readonly
   */
  protected readonly live: Signal<number> = computed(() =>
    this.state() === 'running'
      ? this.base() + Math.max(0, this.now() - this.anchor())
      : this.base(),
  );

  /**
   * Property clock
   *
   * @description
   * Live duration formatted as a clock.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly clock: Signal<string> = computed(() =>
    formatDuration(this.live(), { clock: true }),
  );

  /**
   * Property totalText
   *
   * @description
   * Formatted total tracked time.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly totalText: Signal<string> = computed(() => formatDuration(this.total()));

  /**
   * Property since
   *
   * @description
   * Formatted session start time.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly since: Signal<string> = computed(() => {
    const startedAt: Date | null = this.startedAt();
    return startedAt ? this.text().since(CLOCK.format(startedAt)) : '';
  });

  /**
   * Property mainClasses
   *
   * @description
   * Classes for the main button in the current state.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly mainClasses: Signal<string> = computed(
    () => `${MAIN} ${MAIN_TONES[this.state() === 'running' ? 'stop' : 'start']}`,
  );

  /**
   * Property mainLabel
   *
   * @description
   * Accessible label for the main timer button.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly mainLabel: Signal<string> = computed(() => {
    const text: {
      start: string;
      stop: string;
      resume: string;
      pause: string;
      stopShort: string;
      elapsed: string;
      since: (time: string) => string;
      paused: string;
      total: string;
      started: string;
      saved: (duration: string) => string;
      compactStart: (total: string) => string;
      compactStop: (clock: string) => string;
      compactResume: (clock: string) => string;
      tracked: string;
      estimate: string;
      meterValue: (total: string, estimate: string) => string;
      remaining: (duration: string) => string;
      over: (duration: string) => string;
      billable: string;
      of: string;
      addTime: string;
    } = this.text();
    if (this.state() === 'running') return text.stop;
    return this.state() === 'paused' ? text.resume : text.start;
  });

  /**
   * Property compactLabel
   *
   * @description
   * Accessible label for the compact timer.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly compactLabel: Signal<string> = computed(() => {
    const text: {
      start: string;
      stop: string;
      resume: string;
      pause: string;
      stopShort: string;
      elapsed: string;
      since: (time: string) => string;
      paused: string;
      total: string;
      started: string;
      saved: (duration: string) => string;
      compactStart: (total: string) => string;
      compactStop: (clock: string) => string;
      compactResume: (clock: string) => string;
      tracked: string;
      estimate: string;
      meterValue: (total: string, estimate: string) => string;
      remaining: (duration: string) => string;
      over: (duration: string) => string;
      billable: string;
      of: string;
      addTime: string;
    } = this.text();
    if (this.state() === 'running') return text.compactStop(this.clock());
    if (this.state() === 'paused') return text.compactResume(this.clock());
    return text.compactStart(this.totalText());
  });

  /**
   * Property over
   *
   * @description
   * Amount by which tracked time exceeds the estimate.
   *
   * @type {Signal<number>}
   * @readonly
   */
  protected readonly over: Signal<number> = computed(() => {
    const estimate: number | null = this.estimate();
    return estimate === null ? 0 : Math.max(0, this.total() - estimate);
  });

  /**
   * Property meterMax
   *
   * @description
   * Maximum displayed by the time meter.
   *
   * @type {Signal<number>}
   * @readonly
   */
  protected readonly meterMax: Signal<number> = computed(() =>
    Math.max(this.total(), this.estimate() ?? 0, 1),
  );

  /**
   * Property meterFormat
   *
   * @description
   * Formats the meter value and estimate.
   *
   * @type {(value: number) => string}
   * @readonly
   */
  protected readonly meterFormat: (value: number) => string = (value: number): string =>
    this.text().meterValue(formatDuration(value), formatDuration(this.estimate() ?? 0));

  /**
   * Property formatAmount
   *
   * @description
   * Formats a duration for the meter.
   *
   * @type {(value: number) => string}
   * @readonly
   */
  protected readonly formatAmount: (value: number) => string = (value: number): string =>
    formatDuration(value);

  /**
   * Property meterNote
   *
   * @description
   * Remaining time or amount over estimate.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly meterNote: Signal<string> = computed(() => {
    const estimate: number | null = this.estimate();
    if (estimate === null) return '';
    const over: number = this.over();
    return over > 0
      ? this.text().over(formatDuration(over))
      : this.text().remaining(formatDuration(estimate - this.total()));
  });

  /**
   * Property billableText
   *
   * @description
   * Formatted billable total.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly billableText: Signal<string> = computed(() =>
    formatDuration(this.billableTotal()),
  );
  // #endregion

  // #region Constructor
  /**
   * Constructor
   *
   * @description
   * Updates the running clock and closes the form popover after completion.
   *
   * @constructor
   */
  public constructor() {
    // The duration moves every second while the timer runs, without announcing it (sheet,
    // "Accessibilité": the timer region is not live).
    effect((onCleanup) => {
      if (this.state() !== 'running') return;
      untracked(() => {
        this.now.set(Date.now());
      });
      const timer: ReturnType<typeof setInterval> = setInterval(() => {
        this.now.set(Date.now());
      }, 1000);
      onCleanup(() => {
        clearInterval(timer);
      });
    });

    // The entry form closes its popover once it has added or cancelled.
    effect((onCleanup) => {
      const form: CwTimeEntryForm | undefined = this.form();
      if (!form) return;
      const close: () => void = (): void => {
        this.popover()?.open.set(false);
      };
      const submitted: OutputRefSubscription = form.submit.subscribe(close);
      const cancelled: OutputRefSubscription = form.cancel.subscribe(close);
      onCleanup(() => {
        submitted.unsubscribe();
        cancelled.unsubscribe();
      });
    });
  }
  // #endregion

  // #region Methods
  /**
   * Method onMain
   *
   * @description
   * Starts, resumes or stops the timer according to its state.
   */
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

  /**
   * Method onPause
   *
   * @description
   * Pauses the timer and records its elapsed duration.
   */
  protected onPause(): void {
    this.base.set(this.live());
    this.state.set('paused');
    this.pause.emit();
    void this.announcer.announce(this.text().paused, 'polite');
  }

  /**
   * Method finish
   *
   * @description
   * Stops the timer and emits the rounded session.
   */
  protected finish(): void {
    const duration: number = Math.round(this.live() / MINUTE) * MINUTE;
    const startedAt: Date = this.startedAt() ?? new Date(Date.now() - this.live());
    this.base.set(0);
    this.state.set('stopped');
    this.stop.emit({ duration, startedAt });
    void this.announcer.announce(this.text().saved(formatDuration(duration)), 'polite');
  }
  // #endregion
}
