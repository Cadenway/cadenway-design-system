import {
  booleanAttribute,
  Component,
  computed,
  contentChild,
  inject,
  input,
  numberAttribute,
  type InputSignal,
  type InputSignalWithTransform,
  type Signal,
  type TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { _IdGenerator } from '@angular/cdk/a11y';
import { CwAvatar } from '@cadenway/ui/components/avatar';
import { CwSkeleton } from '@cadenway/ui/components/skeleton';
import { ɵaddDays, ɵLOCALE, ɵperLocale, ɵsameDay } from '@cadenway/ui/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorPulseBold } from '@ng-icons/phosphor-icons/bold';

import { CwActivityDetailDef } from './activity-detail/activity-detail.directive';
import { CwActivityFeedEmpty } from './activity-feed-empty/activity-feed-empty.directive';
import { ACTIVITY_FEED_LABELS } from './activity-feed-labels.token';
import { CwActivitySummaryDef } from './activity-summary/activity-summary.directive';
import type {
  CwActivityEntry,
  CwActivityEntryContext,
  CwActivityFeedLabels,
  CwActivitySegment,
} from './activity-feed.types';

/**
 * Interface SegmentView
 *
 * @description
 * A summary segment ready to render.
 */
interface SegmentView {
  // #region Properties
  /**
   * Property text
   *
   * @description
   * Text of the segment.
   *
   * @type {string}
   * @readonly
   */
  readonly text: string;

  /**
   * Property classes
   *
   * @description
   * Classes of its emphasis: muted for plain text.
   *
   * @type {string}
   * @readonly
   */
  readonly classes: string;
  // #endregion
}

/**
 * Interface EntryView
 *
 * @description
 * An entry ready to render: its segments, its time and the template context.
 */
interface EntryView<T> {
  // #region Properties
  /**
   * Property entry
   *
   * @description
   * The given entry.
   *
   * @type {CwActivityEntry<T>}
   * @readonly
   */
  readonly entry: CwActivityEntry<T>;

  /**
   * Property segments
   *
   * @description
   * Summary segments with their classes.
   *
   * @type {readonly SegmentView[]}
   * @readonly
   */
  readonly segments: readonly SegmentView[];

  /**
   * Property time
   *
   * @description
   * Written time of the entry.
   *
   * @type {string}
   * @readonly
   */
  readonly time: string;

  /**
   * Property datetime
   *
   * @description
   * Machine-readable time (`time[datetime]`), empty for an invalid date.
   *
   * @type {string}
   * @readonly
   */
  readonly datetime: string;

  /**
   * Property context
   *
   * @description
   * Context of the detail and summary templates.
   *
   * @type {CwActivityEntryContext<T>}
   * @readonly
   */
  readonly context: CwActivityEntryContext<T>;
  // #endregion
}

/**
 * Interface GroupView
 *
 * @description
 * A run of entries of the same day (or every entry without grouping).
 */
interface GroupView<T> {
  // #region Properties
  /**
   * Property key
   *
   * @description
   * Identity of the group.
   *
   * @type {string}
   * @readonly
   */
  readonly key: string;

  /**
   * Property heading
   *
   * @description
   * Heading of the group, empty without grouping.
   *
   * @type {string}
   * @readonly
   */
  readonly heading: string;

  /**
   * Property count
   *
   * @description
   * Written count of the group's entries.
   *
   * @type {string}
   * @readonly
   */
  readonly count: string;

  /**
   * Property headingId
   *
   * @description
   * Identifier of the heading, naming the group.
   *
   * @type {string}
   * @readonly
   */
  readonly headingId: string;

  /**
   * Property entries
   *
   * @description
   * Entries of the group, in the given order.
   *
   * @type {readonly EntryView<T>[]}
   * @readonly
   */
  readonly entries: readonly EntryView<T>[];
  // #endregion
}

/**
 * Constant EMPHASIS
 *
 * @description
 * Classes of the summary segments by emphasis (mockup `App.dc.html`, list activity: muted verb, medium values).
 *
 * @type {Record<'plain' | 'strong' | 'code', string>}
 */
const EMPHASIS: Record<'plain' | 'strong' | 'code', string> = {
  plain: 'text-muted-foreground',
  strong: 'font-medium text-foreground',
  code: 'font-mono text-xs text-foreground',
};

/**
 * Constant SKELETON_ROWS
 *
 * @description
 * Entries drawn by the loading state and the widths of their lines (mockup `App.dc.html`, activity skeleton).
 *
 * @type {readonly string[]}
 */
const SKELETON_ROWS: readonly string[] = ['w-2/3', 'w-1/2', 'w-3/4', 'w-2/5', 'w-3/5'];

/**
 * Constant TIME_FORMAT
 *
 * @description
 * Time of day of a locale (« 14:05 »), for grouped entries.
 *
 * @type {(locale: string) => Intl.DateTimeFormat}
 */
const TIME_FORMAT: (locale: string) => Intl.DateTimeFormat = ɵperLocale(
  (locale: string) => new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }),
);

/**
 * Constant DATE_TIME_FORMAT
 *
 * @description
 * Short date and time of a locale (« 23 nov., 14:05 »), for ungrouped entries.
 *
 * @type {(locale: string) => Intl.DateTimeFormat}
 */
const DATE_TIME_FORMAT: (locale: string) => Intl.DateTimeFormat = ɵperLocale(
  (locale: string) =>
    new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
    }),
);

/**
 * Constant DAY_FORMAT
 *
 * @description
 * Long day of a locale (« lundi 23 novembre »), for the heading of an older group.
 *
 * @type {(locale: string) => Intl.DateTimeFormat}
 */
const DAY_FORMAT: (locale: string) => Intl.DateTimeFormat = ɵperLocale(
  (locale: string) =>
    new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' }),
);

/**
 * Constant DAY_YEAR_FORMAT
 *
 * @description
 * Long day with its year, for a group of another year.
 *
 * @type {(locale: string) => Intl.DateTimeFormat}
 */
const DAY_YEAR_FORMAT: (locale: string) => Intl.DateTimeFormat = ɵperLocale(
  (locale: string) =>
    new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
);

/**
 * Function toDate
 *
 * @description
 * Reads the time of an entry.
 *
 * @param {Date | string | number} at - A date, an ISO 8601 string or a timestamp.
 * @returns {Date} The date, invalid when it cannot be read.
 */
function toDate(at: Date | string | number): Date {
  return at instanceof Date ? at : new Date(at);
}

/**
 * Component CwActivityFeed
 *
 * @description
 * A log of what happened, newest first as given: the list's Activity view and the task detail's Activity tab (mockup `App.dc.html`, list activity). Each entry shows its actor (a `cw-avatar`, or an icon for a form, an automation or a Git provider), the actor's name followed by a rich-text `summary` (plain text muted, `strong` or `code` parts emphasized; `ng-template[cwActivitySummary]` replaces the segments for richer content), an optional `quote`, content from `ng-template[cwActivityDetail]` (a task chip) and its time in a `time[datetime]`, linked by a thread line. With `groupByDay`, consecutive entries of the same local day form a group under a heading (« Today », « Yesterday », or the long day, with the year when it differs) and its count; times are then times of day, otherwise a short date and time; `timeFormat` replaces both. Days are read against `now` (the current time by default) in the locale of `provideCwLocale`. Accessibility: an ordered list per group, each day a `role="group"` named by its heading (`headingLevel`, 3 by default; a group, not a landmark, so that several feeds of a page stay distinct); avatars are hidden since the name is written. `loading` draws skeleton entries with a status; without entries the empty state shows `emptyText` and the projected `[cwActivityFeedEmpty]` content. Texts come from `provideCwActivityFeedLabels` and the `labels` input (French defaults from the mockup). An entry row takes the muted hover of the mockup (`hover:bg-muted`).
 */
@Component({
  selector: 'cw-activity-feed',
  imports: [CwAvatar, CwSkeleton, NgIcon, NgTemplateOutlet],
  providers: [provideIcons({ phosphorPulseBold })],
  host: {
    class: 'flex min-w-0 flex-col',
    '[attr.aria-busy]': 'loading() ? "true" : null',
  },
  templateUrl: './activity-feed.component.html',
})
export class CwActivityFeed<T> {
  // #region Properties
  /**
   * Property entries
   *
   * @description
   * Entries of the feed, in display order (newest first).
   *
   * @type {InputSignal<readonly CwActivityEntry<T>[]>}
   * @readonly
   */
  public readonly entries: InputSignal<readonly CwActivityEntry<T>[]> =
    input.required<readonly CwActivityEntry<T>[]>();

  /**
   * Property groupByDay
   *
   * @description
   * Groups consecutive entries of the same local day under a heading; off by default.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly groupByDay: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property now
   *
   * @description
   * Reference time for « Today » and « Yesterday »; `null` (the default) reads the clock when the groups are built.
   *
   * @type {InputSignal<Date | null>}
   * @readonly
   */
  public readonly now: InputSignal<Date | null> = input<Date | null>(null);

  /**
   * Property timeFormat
   *
   * @description
   * Writes the time of an entry (relative times: « 2 min ago »); `null` (the default) writes a time of day when grouped, a short date and time otherwise, in the provided locale.
   *
   * @type {InputSignal<((at: Date) => string) | null>}
   * @readonly
   */
  public readonly timeFormat: InputSignal<((at: Date) => string) | null> = input<
    ((at: Date) => string) | null
  >(null);

  /**
   * Property headingLevel
   *
   * @description
   * Level of the group headings in the page outline, 3 by default.
   *
   * @type {InputSignalWithTransform<number, unknown>}
   * @readonly
   */
  public readonly headingLevel: InputSignalWithTransform<number, unknown> = input(3, {
    transform: numberAttribute,
  });

  /**
   * Property ariaLabel
   *
   * @description
   * Accessible name of the list without grouping (« Activity of CAD-482 »); none by default.
   *
   * @type {InputSignal<string | null>}
   * @readonly
   */
  public readonly ariaLabel: InputSignal<string | null> = input<string | null>(null);

  /**
   * Property loading
   *
   * @description
   * Draws skeleton entries in place of the feed, with `aria-busy`.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly loading: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property labels
   *
   * @description
   * Texts of this feed, over the provided ones.
   *
   * @type {InputSignal<Partial<CwActivityFeedLabels>>}
   * @readonly
   */
  public readonly labels: InputSignal<Partial<CwActivityFeedLabels>> = input<
    Partial<CwActivityFeedLabels>
  >({});

  /**
   * Property detailDef
   *
   * @description
   * The projected detail template, when given.
   *
   * @type {Signal<CwActivityDetailDef<T> | undefined>}
   * @readonly
   */
  private readonly detailDef: Signal<CwActivityDetailDef<T> | undefined> =
    contentChild<CwActivityDetailDef<T>>(CwActivityDetailDef);

  /**
   * Property summaryDef
   *
   * @description
   * The projected summary template, when given.
   *
   * @type {Signal<CwActivitySummaryDef<T> | undefined>}
   * @readonly
   */
  private readonly summaryDef: Signal<CwActivitySummaryDef<T> | undefined> =
    contentChild<CwActivitySummaryDef<T>>(CwActivitySummaryDef);

  /**
   * Property projectedEmpty
   *
   * @description
   * The projected empty-state content, when given.
   *
   * @type {Signal<CwActivityFeedEmpty | undefined>}
   * @readonly
   */
  private readonly projectedEmpty: Signal<CwActivityFeedEmpty | undefined> =
    contentChild(CwActivityFeedEmpty);

  /**
   * Property providedLabels
   *
   * @description
   * Texts provided for this injector.
   *
   * @type {CwActivityFeedLabels}
   * @readonly
   */
  private readonly providedLabels: CwActivityFeedLabels = inject(ACTIVITY_FEED_LABELS);

  /**
   * Property locale
   *
   * @description
   * Locale of the dates and times.
   *
   * @type {string}
   * @readonly
   */
  private readonly locale: string = inject(ɵLOCALE);

  /**
   * Property idPrefix
   *
   * @description
   * Prefix of the group heading identifiers.
   *
   * @type {string}
   * @readonly
   */
  private readonly idPrefix: string = inject(_IdGenerator).getId('cw-activity-feed-');

  /**
   * Property skeletonRows
   *
   * @description
   * Line widths of the loading state.
   *
   * @type {readonly string[]}
   * @readonly
   */
  protected readonly skeletonRows: readonly string[] = SKELETON_ROWS;

  /**
   * Property copy
   *
   * @description
   * The merged texts.
   *
   * @type {Signal<CwActivityFeedLabels>}
   * @readonly
   */
  protected readonly copy: Signal<CwActivityFeedLabels> = computed<CwActivityFeedLabels>(() => ({
    ...this.providedLabels,
    ...this.labels(),
  }));

  /**
   * Property detailTemplate
   *
   * @description
   * The detail template, `null` without one.
   *
   * @type {Signal<TemplateRef<CwActivityEntryContext<T>> | null>}
   * @readonly
   */
  protected readonly detailTemplate: Signal<TemplateRef<CwActivityEntryContext<T>> | null> =
    computed(() => this.detailDef()?.template ?? null);

  /**
   * Property summaryTemplate
   *
   * @description
   * The summary template, `null` without one.
   *
   * @type {Signal<TemplateRef<CwActivityEntryContext<T>> | null>}
   * @readonly
   */
  protected readonly summaryTemplate: Signal<TemplateRef<CwActivityEntryContext<T>> | null> =
    computed(() => this.summaryDef()?.template ?? null);

  /**
   * Property hasProjectedEmpty
   *
   * @description
   * Whether empty-state content is projected.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly hasProjectedEmpty: Signal<boolean> = computed(() => !!this.projectedEmpty());

  /**
   * Property groups
   *
   * @description
   * Entries ready to render, in runs of the same day when grouped, else one group.
   *
   * @type {Signal<readonly GroupView<T>[]>}
   * @readonly
   */
  protected readonly groups: Signal<readonly GroupView<T>[]> = computed(() => {
    const copy: CwActivityFeedLabels = this.copy();
    const grouped: boolean = this.groupByDay();
    const custom: ((at: Date) => string) | null = this.timeFormat();
    const clock: Intl.DateTimeFormat = grouped
      ? TIME_FORMAT(this.locale)
      : DATE_TIME_FORMAT(this.locale);
    const now: Date = this.now() ?? new Date();
    const runs: { day: Date | null; entries: EntryView<T>[] }[] = [];
    for (const entry of this.entries()) {
      const at: Date = toDate(entry.at);
      const valid: boolean = !Number.isNaN(at.getTime());
      const view: EntryView<T> = {
        entry,
        segments: entry.summary.map((segment) => this.segmentOf(segment)),
        time: valid ? (custom ? custom(at) : clock.format(at)) : '',
        datetime: valid ? at.toISOString() : '',
        context: { $implicit: entry, entry, data: entry.data },
      };
      const last: { day: Date | null; entries: EntryView<T>[] } | undefined = runs.at(-1);
      const day: Date | null = grouped && valid ? at : null;
      const same: boolean =
        !!last &&
        (!grouped || (last.day === null ? day === null : !!day && ɵsameDay(last.day, day)));
      if (last && same) last.entries.push(view);
      else runs.push({ day, entries: [view] });
    }
    return runs.map((run, index) => ({
      key: run.day ? run.day.toDateString() : `run-${String(index)}`,
      heading: grouped ? this.dayLabel(run.day, now, copy) : '',
      count: copy.count(run.entries.length),
      headingId: `${this.idPrefix}-${String(index)}`,
      entries: run.entries,
    }));
  });
  // #endregion

  // #region Methods
  /**
   * Method segmentOf
   *
   * @description
   * Gives a summary segment its text and classes.
   *
   * @param {CwActivitySegment} segment - Plain text or an emphasized part.
   * @returns {SegmentView} The segment ready to render.
   */
  private segmentOf(segment: CwActivitySegment): SegmentView {
    return typeof segment === 'string'
      ? { text: segment, classes: EMPHASIS.plain }
      : { text: segment.text, classes: EMPHASIS[segment.emphasis ?? 'strong'] };
  }

  /**
   * Method dayLabel
   *
   * @description
   * Heading of a day group: « Today », « Yesterday », or the long day capitalized, with its year when it is not the year of `now`.
   *
   * @param {Date | null} day - A time of the day, `null` for an unreadable date.
   * @param {Date} now - Reference time.
   * @param {CwActivityFeedLabels} copy - Merged texts.
   * @returns {string} The heading, empty for an unreadable date.
   */
  private dayLabel(day: Date | null, now: Date, copy: CwActivityFeedLabels): string {
    if (!day) return '';
    if (ɵsameDay(day, now)) return copy.today;
    if (ɵsameDay(day, ɵaddDays(now, -1))) return copy.yesterday;
    const format: Intl.DateTimeFormat =
      day.getFullYear() === now.getFullYear()
        ? DAY_FORMAT(this.locale)
        : DAY_YEAR_FORMAT(this.locale);
    const text: string = format.format(day);
    return text.charAt(0).toLocaleUpperCase(this.locale) + text.slice(1);
  }
  // #endregion
}
