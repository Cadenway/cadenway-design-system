/** What a calendar selects: one day (`single`) or a start and an end (`range`). */
export type CwCalendarMode = 'single' | 'range';

/**
 * A selected period. `end` is `null` while only the start has been picked: the second pick closes
 * the range (an earlier day becomes the start).
 */
export interface CwDateRange {
  readonly start: Date;
  readonly end: Date | null;
}

/** The value of a calendar: a day in `single` mode, a range in `range` mode, or nothing. */
export type CwCalendarSelection = Date | CwDateRange | null;

/** The header of a calendar: the month title, or month and year lists for distant dates. */
export type CwCalendarCaptionLayout = 'label' | 'dropdown';

/** First day of the week: 0 for Sunday, 1 for Monday (the French week). */
export type CwWeekStart = 0 | 1;

/** Tells whether a day cannot be picked (public holidays, week-ends); it is shown struck through. */
export type CwDateDisabledFn = (date: Date) => boolean;
