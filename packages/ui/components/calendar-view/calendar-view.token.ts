import { InjectionToken, type Signal, type TemplateRef } from '@angular/core';

import type { CwCalendarItemContext, CwCalendarViewLabels } from './calendar-view.types';

/* The calendar view as its day part sees it. The view provides itself under this token, so the part
   reaches its state without importing its class (it imports the part). Internal to the entry point. */

/**
 * Interface DropData
 *
 * @description
 * Where a drop list sits: a day (month, or the all-day row of the week) or a week slot.
 */
export interface DropData {
  // #region Properties
  /**
   * Property date
   *
   * @description
   * Date associated with the day or slot.
   *
   * @type {Date}
   * @readonly
   */
  readonly date: Date;

  /**
   * Property slot
   *
   * @description
   * Slot index, or null for an all-day target.
   *
   * @type {number | null}
   * @readonly
   */
  readonly slot: number | null;

  /**
   * Property allDayRow
   *
   * @description
   * Whether the target is in the all-day row.
   *
   * @type {boolean}
   * @readonly
   */
  readonly allDayRow: boolean;
  // #endregion
}

/**
 * Interface Cursor
 *
 * @description
 * The keyboard position: a day and, in the week view, a slot (`null`: the day, or all-day row).
 */
export interface Cursor {
  // #region Properties
  /**
   * Property day
   *
   * @description
   * Day index in the displayed grid.
   *
   * @type {number}
   * @readonly
   */
  readonly day: number;

  /**
   * Property date
   *
   * @description
   * Date associated with the day or slot.
   *
   * @type {Date}
   * @readonly
   */
  readonly date: Date;

  /**
   * Property slot
   *
   * @description
   * Slot index, or null for an all-day target.
   *
   * @type {number | null}
   * @readonly
   */
  readonly slot: number | null;
  // #endregion
}

/**
 * Interface ItemView
 *
 * @description
 * An item frame as the view draws it.
 */
export interface ItemView {
  // #region Properties
  /**
   * Property id
   *
   * @description
   * Stable item identifier.
   *
   * @type {string}
   * @readonly
   */
  readonly id: string;

  /**
   * Property title
   *
   * @description
   * Item title shown by the frame.
   *
   * @type {string}
   * @readonly
   */
  readonly title: string;

  /**
   * Property classes
   *
   * @description
   * Classes used to draw the item or calendar controls.
   *
   * @type {string}
   * @readonly
   */
  readonly classes: string;

  /**
   * Property delay
   *
   * @description
   * Entry animation delay.
   *
   * @type {number}
   * @readonly
   */
  readonly delay: number;

  /**
   * Property context
   *
   * @description
   * Item and span supplied to the template.
   *
   * @type {CwCalendarItemContext<unknown>}
   * @readonly
   */
  readonly context: CwCalendarItemContext<unknown>;
  // #endregion
}

/**
 * Interface BarView
 *
 * @description
 * A bar across days.
 */
export interface BarView extends ItemView {
  // #region Properties
  /**
   * Property top
   *
   * @description
   * Top position of the item.
   *
   * @type {string}
   * @readonly
   */
  readonly top: string;

  /**
   * Property left
   *
   * @description
   * Left position of the bar.
   *
   * @type {string}
   * @readonly
   */
  readonly left: string;

  /**
   * Property width
   *
   * @description
   * Width of the bar.
   *
   * @type {string}
   * @readonly
   */
  readonly width: string;

  /**
   * Property continues
   *
   * @description
   * Whether the bar continues into another week.
   *
   * @type {boolean}
   * @readonly
   */
  readonly continues: boolean;

  /**
   * Property range
   *
   * @description
   * Accessible description of the item date range.
   *
   * @type {string}
   * @readonly
   */
  readonly range: string;
  // #endregion
}

/**
 * Interface BlockView
 *
 * @description
 * A timed block of the week view.
 */
export interface BlockView extends ItemView {
  // #region Properties
  /**
   * Property top
   *
   * @description
   * Top position of the item.
   *
   * @type {number}
   * @readonly
   */
  readonly top: number;

  /**
   * Property height
   *
   * @description
   * Height of a timed block.
   *
   * @type {number}
   * @readonly
   */
  readonly height: number;

  /**
   * Property time
   *
   * @description
   * Formatted time of the block.
   *
   * @type {string}
   * @readonly
   */
  readonly time: string;
  // #endregion
}

/**
 * Interface DayView
 *
 * @description
 * A day of the month grid or of the week's all-day row.
 */
export interface DayView {
  // #region Properties
  /**
   * Property date
   *
   * @description
   * Date associated with the day or slot.
   *
   * @type {Date}
   * @readonly
   */
  readonly date: Date;

  /**
   * Property key
   *
   * @description
   * Stable key for the day.
   *
   * @type {string}
   * @readonly
   */
  readonly key: string;

  /**
   * Property label
   *
   * @description
   * Accessible day label.
   *
   * @type {string}
   * @readonly
   */
  readonly label: string;

  /**
   * Property number
   *
   * @description
   * Displayed day number.
   *
   * @type {string}
   * @readonly
   */
  readonly number: string;

  /**
   * Property numberClass
   *
   * @description
   * Classes for the day number.
   *
   * @type {string}
   * @readonly
   */
  readonly numberClass: string;

  /**
   * Property today
   *
   * @description
   * Whether the day is today.
   *
   * @type {boolean}
   * @readonly
   */
  readonly today: boolean;

  /**
   * Property outside
   *
   * @description
   * Whether the day is outside the displayed month.
   *
   * @type {boolean}
   * @readonly
   */
  readonly outside: boolean;

  /**
   * Property tabStop
   *
   * @description
   * Whether the day is the current keyboard tab stop.
   *
   * @type {boolean}
   * @readonly
   */
  readonly tabStop: boolean;

  /**
   * Property target
   *
   * @description
   * Whether the day is the active drop target.
   *
   * @type {boolean}
   * @readonly
   */
  readonly target: boolean;

  /**
   * Property cellClass
   *
   * @description
   * Classes for the day cell.
   *
   * @type {string}
   * @readonly
   */
  readonly cellClass: string;

  /**
   * Property drop
   *
   * @description
   * Drop target data for the day.
   *
   * @type {DropData}
   * @readonly
   */
  readonly drop: DropData;

  /**
   * Property spacers
   *
   * @description
   * Reserved lines for multi-day bars.
   *
   * @type {readonly number[]}
   * @readonly
   */
  readonly spacers: readonly number[];

  /**
   * Property pills
   *
   * @description
   * Single-day items displayed in the cell.
   *
   * @type {readonly ItemView[]}
   * @readonly
   */
  readonly pills: readonly ItemView[];

  /**
   * Property bars
   *
   * @description
   * Multi-day bars starting in the cell.
   *
   * @type {readonly BarView[]}
   * @readonly
   */
  readonly bars: readonly BarView[];

  /**
   * Property all
   *
   * @description
   * All items displayed in the day popover.
   *
   * @type {readonly ItemView[]}
   * @readonly
   */
  readonly all: readonly ItemView[];

  /**
   * Property more
   *
   * @description
   * Label for hidden items, or null.
   *
   * @type {string | null}
   * @readonly
   */
  readonly more: string | null;

  /**
   * Property popoverTitle
   *
   * @description
   * Title of the day popover.
   *
   * @type {string}
   * @readonly
   */
  readonly popoverTitle: string;

  /**
   * Property popoverLabel
   *
   * @description
   * Accessible name of the day popover.
   *
   * @type {string}
   * @readonly
   */
  readonly popoverLabel: string;

  /**
   * Property createLabel
   *
   * @description
   * Accessible name of the create control.
   *
   * @type {string}
   * @readonly
   */
  readonly createLabel: string;

  /**
   * Property addLabel
   *
   * @description
   * Accessible name of the add control.
   *
   * @type {string}
   * @readonly
   */
  readonly addLabel: string;
  // #endregion
}

/**
 * Interface CalendarViewHost
 *
 * @description
 * The state and handlers the day part reads from the view.
 */
export interface CalendarViewHost {
  // #region Properties
  /**
   * Property readonly
   *
   * @description
   * Whether modifications are disabled.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  readonly readonly: Signal<boolean>;

  /**
   * Property texts
   *
   * @description
   * Labels used by the calendar.
   *
   * @type {Signal<CwCalendarViewLabels>}
   * @readonly
   */
  readonly texts: Signal<CwCalendarViewLabels>;

  /**
   * Property itemTemplate
   *
   * @description
   * Projected template used to render items.
   *
   * @type {Signal<TemplateRef<CwCalendarItemContext<unknown>> | undefined>}
   * @readonly
   */
  readonly itemTemplate: Signal<TemplateRef<CwCalendarItemContext<unknown>> | undefined>;

  /**
   * Property classes
   *
   * @description
   * Classes used to draw the item or calendar controls.
   *
   * @type {Readonly< Record<'more' | 'add' | 'row' | 'addRow' | 'preview' | 'ghost', string> >}
   * @readonly
   */
  readonly classes: Readonly<
    Record<'more' | 'add' | 'row' | 'addRow' | 'preview' | 'ghost', string>
  >;
  // #endregion
  // #region Methods
  /**
   * Method openItem
   *
   * @description
   * Opens an item from its template context.
   *
   * @param {CwCalendarItemContext<unknown>} context - Context of the item to open.
   */
  openItem(context: CwCalendarItemContext<unknown>): void;

  /**
   * Method createOn
   *
   * @description
   * Requests creation on a day or time slot.
   *
   * @param {Date} date - Date on which to create an item.
   * @param {number | null} slot - Time slot, or null for a day.
   * @param {boolean} allDay - Whether the new item occupies the full day.
   */
  createOn(date: Date, slot: number | null, allDay: boolean): void;

  /**
   * Method onDragStart
   *
   * @description
   * Marks an item as being dragged.
   *
   * @param {string} id - Identifier of the dragged or focused item.
   */
  onDragStart(id: string): void;

  /**
   * Method onDragEnd
   *
   * @description
   * Clears drag state.
   */
  onDragEnd(): void;

  /**
   * Method onItemKeydown
   *
   * @description
   * Handles keyboard movement of an item.
   *
   * @param {KeyboardEvent} event - Keyboard event from the item.
   * @param {string} id - Identifier of the dragged or focused item.
   */
  onItemKeydown(event: KeyboardEvent, id: string): void;
  // #endregion
}

/**
 * Constant CALENDAR_VIEW
 *
 * @description
 * Provided by `cw-calendar-view` for its day part.
 *
 * @type {InjectionToken<CalendarViewHost>}
 */
export const CALENDAR_VIEW: InjectionToken<CalendarViewHost> = new InjectionToken<CalendarViewHost>(
  'CALENDAR_VIEW',
);
