import {
  booleanAttribute,
  Component,
  computed,
  inject,
  input,
  type InputSignal,
  type InputSignalWithTransform,
  type Signal,
} from '@angular/core';
import { CwSkeleton } from '@cadenway/ui/components/skeleton';
import { CwSpinner } from '@cadenway/ui/components/spinner';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowRightBold,
  phosphorTrendDownBold,
  phosphorTrendUpBold,
} from '@ng-icons/phosphor-icons/bold';

import { CwStatGroup } from './stat-group/stat-group.component';
import { CW_STAT_TREND_LABELS } from './stat.constants';
import type {
  CwStatDeltaVariant,
  CwStatGoal,
  CwStatSentiment,
  CwStatSize,
  CwStatTrend,
  CwStatTrendLabels,
} from './stat.types';

/**
 * Constant SIZES
 *
 * @description
 * Literal stat layout classes for each size, discoverable by Tailwind.
 *
 * @type {Record<CwStatSize, string>}
 */
const SIZES: Record<CwStatSize, string> = {
  default: 'grid min-w-0 content-start gap-1 p-4',
  sm: 'grid min-w-0 content-start gap-0.5 px-3 py-2.5',
};

/**
 * Constant CARD
 *
 * @description
 * Card classes used by a stat outside a group.
 *
 * @type {string}
 */
const CARD: string = 'rounded-xl border bg-card text-card-foreground';

/**
 * Constant VALUES
 *
 * @description
 * Value text classes for each size.
 *
 * @type {Record<CwStatSize, string>}
 */
const VALUES: Record<CwStatSize, string> = {
  default: 'text-2xl font-semibold tracking-tight tabular-nums',
  sm: 'text-lg font-semibold tracking-tight tabular-nums',
};

/**
 * Constant VALUE_SKELETONS
 *
 * @description
 * Loading placeholder dimensions for each stat size.
 *
 * @type {Record<CwStatSize, string>}
 */
const VALUE_SKELETONS: Record<CwStatSize, string> = {
  default: 'my-0.5 h-6 w-12 rounded-md',
  sm: 'my-0.5 h-5 w-10 rounded-md',
};

/**
 * Constant INLINE_DELTAS
 *
 * @description
 * Inline change classes colored by sentiment.
 *
 * @type {Record<CwStatSentiment, string>}
 */
const INLINE_DELTAS: Record<CwStatSentiment, string> = {
  positive:
    'flex shrink-0 items-center gap-1 font-medium text-jade-text [&_ng-icon]:[--ng-icon__size:0.875rem]',
  negative:
    'flex shrink-0 items-center gap-1 font-medium text-grenat-text [&_ng-icon]:[--ng-icon__size:0.875rem]',
  neutral:
    'flex shrink-0 items-center gap-1 font-medium text-muted-foreground [&_ng-icon]:[--ng-icon__size:0.875rem]',
};

/**
 * Constant PILL_DELTAS
 *
 * @description
 * Pill change classes colored by sentiment.
 *
 * @type {Record<CwStatSentiment, string>}
 */
const PILL_DELTAS: Record<CwStatSentiment, string> = {
  positive:
    'inline-flex h-5 shrink-0 items-center gap-0.5 rounded-md bg-jade-soft px-1.5 font-medium text-jade-text [&_ng-icon]:[--ng-icon__size:0.75rem]',
  negative:
    'inline-flex h-5 shrink-0 items-center gap-0.5 rounded-md bg-grenat-soft px-1.5 font-medium text-grenat-text [&_ng-icon]:[--ng-icon__size:0.75rem]',
  neutral:
    'inline-flex h-5 shrink-0 items-center gap-0.5 rounded-md bg-muted px-1.5 font-medium text-muted-foreground [&_ng-icon]:[--ng-icon__size:0.75rem]',
};

/**
 * Constant ICONS
 *
 * @description
 * Icon names representing each trend direction.
 *
 * @type {Record<CwStatTrend, string>}
 */
const ICONS: Record<CwStatTrend, string> = {
  up: 'phosphorTrendUpBold',
  down: 'phosphorTrendDownBold',
  flat: 'phosphorArrowRightBold',
};

/**
 * Constant GOAL_OF
 *
 * @description
 * French separator between current and target goal values.
 *
 * @type {string}
 */
const GOAL_OF: string = 'sur';

/**
 * Constant NUMBER
 *
 * @description
 * French number formatter used for values and goals.
 *
 * @type {Intl.NumberFormat}
 */
const NUMBER: Intl.NumberFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });

/**
 * Class CwStat
 * @class CwStat
 *
 * @description
 * A dashboard figure: a label, a value, and optionally its change colored by its meaning, a
 * sparkline or a goal track (Stat sheet of the Design System artifact). For a series to read in
 * detail use `cw-chart`; for the progress of one operation, `cw-progress`.
 *
 * `value` is shown as given (a number is formatted in `fr-FR`). The change row appears when
 * `delta` or `comparison` is set: the `trend` arrow, the `delta` colored by `sentiment` (never by
 * its sign) with the direction in visually hidden text (« en hausse : +7 », `trendLabels`), then
 * the `comparison` muted. `deltaVariant="pill"` writes the change as a tinted pill (period
 * comparison). Project a `cw-stat-sparkline` to draw it right of the value. `goal` adds a
 * `role="progressbar"` jade track named by the label and « 34 sur 50 · 68 % ». `loading` (first
 * load) keeps the real label and replaces the value and the change by shimmer blocks, with
 * `aria-busy`; `refreshing` keeps the old value and adds a small spinner named by
 * `refreshingLabel` after the label. Alone, it draws its own card; inside `cw-stat-group` the group
 * does. No animation of the figures. Style hooks on the host: `data-trend`, `data-sentiment`,
 * `data-size`, `aria-busy`.
 */
@Component({
  selector: 'cw-stat',
  imports: [NgIcon, CwSkeleton, CwSpinner],
  providers: [provideIcons({ phosphorArrowRightBold, phosphorTrendDownBold, phosphorTrendUpBold })],
  host: {
    '[class]': 'hostClasses()',
    '[attr.data-trend]': 'trend()',
    '[attr.data-sentiment]': 'sentiment()',
    '[attr.data-size]': 'size()',
    '[attr.aria-busy]': 'loading() ? "true" : null',
  },
  templateUrl: './stat.component.html',
})
export class CwStat {
  // #region Properties
  /**
   * Property label
   * @readonly
   *
   * @description
   * Short, stable label for the figure.
   *
   * @type {InputSignal<string>}
   */
  public readonly label: InputSignal<string> = input.required<string>();

  /**
   * Property value
   * @readonly
   *
   * @description
   * Figure shown as supplied for strings or formatted in French for numbers.
   *
   * @type {InputSignal<string | number>}
   */
  public readonly value: InputSignal<string | number> = input.required<string | number>();

  /**
   * Property delta
   * @readonly
   *
   * @description
   * Written change; an empty string hides it.
   *
   * @type {InputSignal<string>}
   */
  public readonly delta: InputSignal<string> = input<string>('');

  /**
   * Property trend
   * @readonly
   *
   * @description
   * Direction of the change, represented by an arrow.
   *
   * @type {InputSignal<CwStatTrend>}
   */
  public readonly trend: InputSignal<CwStatTrend> = input<CwStatTrend>('flat');

  /**
   * Property sentiment
   * @readonly
   *
   * @description
   * Meaning of the change, which determines its color.
   *
   * @type {InputSignal<CwStatSentiment>}
   */
  public readonly sentiment: InputSignal<CwStatSentiment> = input<CwStatSentiment>('neutral');

  /**
   * Property comparison
   * @readonly
   *
   * @description
   * Written comparison period.
   *
   * @type {InputSignal<string>}
   */
  public readonly comparison: InputSignal<string> = input<string>('');

  /**
   * Property goal
   * @readonly
   *
   * @description
   * Goal displayed under the figure, or null to hide it.
   *
   * @type {InputSignal<CwStatGoal | null>}
   */
  public readonly goal: InputSignal<CwStatGoal | null> = input<CwStatGoal | null>(null);

  /**
   * Property size
   * @readonly
   *
   * @description
   * Dashboard or smaller side-panel size.
   *
   * @type {InputSignal<CwStatSize>}
   */
  public readonly size: InputSignal<CwStatSize> = input<CwStatSize>('default');

  /**
   * Property deltaVariant
   * @readonly
   *
   * @description
   * Change displayed inline or as a tinted pill.
   *
   * @type {InputSignal<CwStatDeltaVariant>}
   */
  public readonly deltaVariant: InputSignal<CwStatDeltaVariant> =
    input<CwStatDeltaVariant>('inline');

  /**
   * Property loading
   * @readonly
   *
   * @description
   * Replaces value and change with placeholders during the first load.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly loading: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property refreshing
   * @readonly
   *
   * @description
   * Shows a spinner while retaining the previous value.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly refreshing: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property refreshingLabel
   * @readonly
   *
   * @description
   * Accessible name of the refresh spinner.
   *
   * @type {InputSignal<string>}
   */
  public readonly refreshingLabel: InputSignal<string> = input<string>('Actualisation');

  /**
   * Property trendLabels
   * @readonly
   *
   * @description
   * Screen-reader words preceding the change for each trend.
   *
   * @type {InputSignal<CwStatTrendLabels>}
   */
  public readonly trendLabels: InputSignal<CwStatTrendLabels> =
    input<CwStatTrendLabels>(CW_STAT_TREND_LABELS);

  /**
   * Property group
   * @readonly
   *
   * @description
   * Optional parent providing a shared card around the stat.
   *
   * @type {CwStatGroup | null}
   */
  private readonly group: CwStatGroup | null = inject(CwStatGroup, { optional: true });

  /**
   * Property hostClasses
   * @readonly
   *
   * @description
   * Layout classes and standalone card styling when outside a group.
   *
   * @type {Signal<string>}
   */
  protected readonly hostClasses: Signal<string> = computed(() =>
    this.group ? SIZES[this.size()] : `${SIZES[this.size()]} ${CARD}`,
  );

  /**
   * Property valueClasses
   * @readonly
   *
   * @description
   * Value text classes for the current size.
   *
   * @type {Signal<string>}
   */
  protected readonly valueClasses: Signal<string> = computed(() => VALUES[this.size()]);

  /**
   * Property valueSkeleton
   * @readonly
   *
   * @description
   * Loading placeholder classes for the current size.
   *
   * @type {Signal<string>}
   */
  protected readonly valueSkeleton: Signal<string> = computed(() => VALUE_SKELETONS[this.size()]);

  /**
   * Property shownValue
   * @readonly
   *
   * @description
   * Display value, formatting numbers in French.
   *
   * @type {Signal<string>}
   */
  protected readonly shownValue: Signal<string> = computed(() => {
    const value: string | number = this.value();
    return typeof value === 'number' ? NUMBER.format(value) : value;
  });

  /**
   * Property hasChange
   * @readonly
   *
   * @description
   * Whether there is a change or comparison to show.
   *
   * @type {Signal<boolean>}
   */
  protected readonly hasChange: Signal<boolean> = computed(
    () => this.delta() !== '' || this.comparison() !== '',
  );

  /**
   * Property deltaClasses
   * @readonly
   *
   * @description
   * Change classes selected by presentation and sentiment.
   *
   * @type {Signal<string>}
   */
  protected readonly deltaClasses: Signal<string> = computed(() =>
    this.deltaVariant() === 'pill'
      ? PILL_DELTAS[this.sentiment()]
      : INLINE_DELTAS[this.sentiment()],
  );

  /**
   * Property icon
   * @readonly
   *
   * @description
   * Icon name for the current trend.
   *
   * @type {Signal<string>}
   */
  protected readonly icon: Signal<string> = computed(() => ICONS[this.trend()]);

  /**
   * Property trendText
   * @readonly
   *
   * @description
   * Screen-reader label for the current trend.
   *
   * @type {Signal<string>}
   */
  protected readonly trendText: Signal<string> = computed(() => this.trendLabels()[this.trend()]);

  /**
   * Property goalPercent
   * @readonly
   *
   * @description
   * Goal progress clamped between zero and one hundred percent.
   *
   * @type {Signal<number>}
   */
  protected readonly goalPercent: Signal<number> = computed(() => {
    const goal: CwStatGoal | null = this.goal();
    if (!goal || goal.max <= 0) return 0;
    return Math.min(100, Math.max(0, (goal.value / goal.max) * 100));
  });

  /**
   * Property goalText
   * @readonly
   *
   * @description
   * Formatted current value, target and percentage for the goal.
   *
   * @type {Signal<string>}
   */
  protected readonly goalText: Signal<string> = computed(() => {
    const goal: CwStatGoal | null = this.goal();
    if (!goal) return '';
    const unit: string = goal.unit ? ` ${goal.unit}` : '';
    const percent: string = NUMBER.format(Math.round(this.goalPercent()));
    return `${NUMBER.format(goal.value)} ${GOAL_OF} ${NUMBER.format(goal.max)}${unit} · ${percent} %`;
  });
  // #endregion
}
