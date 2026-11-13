import { booleanAttribute, Component, computed, inject, input } from '@angular/core';
import { CwSkeleton } from '@cadenway/ui/skeleton';
import { CwSpinner } from '@cadenway/ui/spinner';
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

/* Literal class strings (Stat sheet and preview of the Design System artifact), so Tailwind finds
   them in the compiled package. */
const SIZES: Record<CwStatSize, string> = {
  default: 'grid min-w-0 content-start gap-1 p-4',
  sm: 'grid min-w-0 content-start gap-0.5 px-3 py-2.5',
};

// Alone, a stat is its own card; in a `cw-stat-group` the group draws the card.
const CARD = 'rounded-xl border bg-card text-card-foreground';

const VALUES: Record<CwStatSize, string> = {
  default: 'text-2xl font-semibold tracking-tight tabular-nums',
  sm: 'text-lg font-semibold tracking-tight tabular-nums',
};

const VALUE_SKELETONS: Record<CwStatSize, string> = {
  default: 'my-0.5 h-6 w-12 rounded-md',
  sm: 'my-0.5 h-5 w-10 rounded-md',
};

// The color follows the meaning for the team, never the sign (sheet, "États").
const INLINE_DELTAS: Record<CwStatSentiment, string> = {
  positive:
    'flex shrink-0 items-center gap-1 font-medium text-jade-text [&_ng-icon]:[--ng-icon__size:0.875rem]',
  negative:
    'flex shrink-0 items-center gap-1 font-medium text-grenat-text [&_ng-icon]:[--ng-icon__size:0.875rem]',
  neutral:
    'flex shrink-0 items-center gap-1 font-medium text-muted-foreground [&_ng-icon]:[--ng-icon__size:0.875rem]',
};

const PILL_DELTAS: Record<CwStatSentiment, string> = {
  positive:
    'inline-flex h-5 shrink-0 items-center gap-0.5 rounded-md bg-jade-soft px-1.5 font-medium text-jade-text [&_ng-icon]:[--ng-icon__size:0.75rem]',
  negative:
    'inline-flex h-5 shrink-0 items-center gap-0.5 rounded-md bg-grenat-soft px-1.5 font-medium text-grenat-text [&_ng-icon]:[--ng-icon__size:0.75rem]',
  neutral:
    'inline-flex h-5 shrink-0 items-center gap-0.5 rounded-md bg-muted px-1.5 font-medium text-muted-foreground [&_ng-icon]:[--ng-icon__size:0.75rem]',
};

const ICONS: Record<CwStatTrend, string> = {
  up: 'phosphorTrendUpBold',
  down: 'phosphorTrendDownBold',
  flat: 'phosphorArrowRightBold',
};

// French copy of the goal line (sheet preview: « 34 sur 50 engagés · 68 % »).
const GOAL_OF = 'sur';

const NUMBER = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });

/**
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
  /** Short and stable label (« Terminées cette semaine »). */
  readonly label = input.required<string>();
  /** The figure: a string is shown as given (« 3,2 j »), a number is formatted in `fr-FR`. */
  readonly value = input.required<string | number>();
  /** The change as written (« +7 », « −0,8 j »); empty hides it. */
  readonly delta = input<string>('');
  /** Direction of the change, drawn as an arrow. */
  readonly trend = input<CwStatTrend>('flat');
  /** Meaning of the change for the team, which sets its color. */
  readonly sentiment = input<CwStatSentiment>('neutral');
  /** The period compared with, always written (« par rapport à S45 »). */
  readonly comparison = input<string>('');
  /** A goal track under the value; `null` draws none. */
  readonly goal = input<CwStatGoal | null>(null);
  /** `default` on a dashboard, `sm` in a side panel. */
  readonly size = input<CwStatSize>('default');
  /** The change as text after the arrow (`inline`) or as a tinted pill (`pill`). */
  readonly deltaVariant = input<CwStatDeltaVariant>('inline');
  /** First load: shimmer blocks in place of the value and the change, `aria-busy`. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Refresh: the old value stays, a spinner follows the label. */
  readonly refreshing = input(false, { transform: booleanAttribute });
  /** Accessible name of the refresh spinner. */
  readonly refreshingLabel = input<string>('Actualisation');
  /** The words read before the change, per trend. */
  readonly trendLabels = input<CwStatTrendLabels>(CW_STAT_TREND_LABELS);

  private readonly group = inject(CwStatGroup, { optional: true });

  protected readonly hostClasses = computed(() =>
    this.group ? SIZES[this.size()] : `${SIZES[this.size()]} ${CARD}`,
  );
  protected readonly valueClasses = computed(() => VALUES[this.size()]);
  protected readonly valueSkeleton = computed(() => VALUE_SKELETONS[this.size()]);
  protected readonly shownValue = computed(() => {
    const value = this.value();
    return typeof value === 'number' ? NUMBER.format(value) : value;
  });
  protected readonly hasChange = computed(() => this.delta() !== '' || this.comparison() !== '');
  protected readonly deltaClasses = computed(() =>
    this.deltaVariant() === 'pill'
      ? PILL_DELTAS[this.sentiment()]
      : INLINE_DELTAS[this.sentiment()],
  );
  protected readonly icon = computed(() => ICONS[this.trend()]);
  protected readonly trendText = computed(() => this.trendLabels()[this.trend()]);

  protected readonly goalPercent = computed(() => {
    const goal = this.goal();
    if (!goal || goal.max <= 0) return 0;
    return Math.min(100, Math.max(0, (goal.value / goal.max) * 100));
  });
  protected readonly goalText = computed(() => {
    const goal = this.goal();
    if (!goal) return '';
    const unit = goal.unit ? ` ${goal.unit}` : '';
    const percent = NUMBER.format(Math.round(this.goalPercent()));
    return `${NUMBER.format(goal.value)} ${GOAL_OF} ${NUMBER.format(goal.max)}${unit} · ${percent} %`;
  });
}
