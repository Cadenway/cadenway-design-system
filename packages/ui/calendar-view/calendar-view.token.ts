import { InjectionToken, type Signal, type TemplateRef } from '@angular/core';

import type { CwCalendarItemContext, CwCalendarViewLabels } from './calendar-view.types';

/* The calendar view as its day part sees it. The view provides itself under this token, so the part
   reaches its state without importing its class (it imports the part). Internal to the entry point. */

/** Where a drop list sits: a day (month, or the all-day row of the week) or a week slot. */
export interface DropData {
  readonly date: Date;
  readonly slot: number | null;
  readonly allDayRow: boolean;
}

/** The keyboard position: a day and, in the week view, a slot (`null`: the day, or all-day row). */
export interface Cursor {
  readonly day: number;
  readonly date: Date;
  readonly slot: number | null;
}

/** An item frame as the view draws it. */
export interface ItemView {
  readonly id: string;
  readonly title: string;
  readonly classes: string;
  readonly delay: number;
  readonly context: CwCalendarItemContext<unknown>;
}

/** A bar across days. */
export interface BarView extends ItemView {
  readonly top: string;
  readonly left: string;
  readonly width: string;
  readonly continues: boolean;
  readonly range: string;
}

/** A timed block of the week view. */
export interface BlockView extends ItemView {
  readonly top: number;
  readonly height: number;
  readonly time: string;
}

/** A day of the month grid or of the week's all-day row. */
export interface DayView {
  readonly date: Date;
  readonly key: string;
  readonly label: string;
  readonly number: string;
  readonly numberClass: string;
  readonly today: boolean;
  readonly outside: boolean;
  readonly tabStop: boolean;
  readonly target: boolean;
  readonly cellClass: string;
  readonly drop: DropData;
  readonly spacers: readonly number[];
  readonly pills: readonly ItemView[];
  readonly bars: readonly BarView[];
  readonly all: readonly ItemView[];
  readonly more: string | null;
  readonly popoverTitle: string;
  readonly popoverLabel: string;
  readonly createLabel: string;
  readonly addLabel: string;
}

/** The state and handlers the day part reads from the view. */
export interface CalendarViewHost {
  readonly readonly: Signal<boolean>;
  readonly texts: Signal<CwCalendarViewLabels>;
  readonly itemTemplate: Signal<TemplateRef<CwCalendarItemContext<unknown>> | undefined>;
  readonly classes: Readonly<
    Record<'more' | 'add' | 'row' | 'addRow' | 'preview' | 'ghost', string>
  >;
  openItem(context: CwCalendarItemContext<unknown>): void;
  createOn(date: Date, slot: number | null, allDay: boolean): void;
  onDragStart(id: string): void;
  onDragEnd(): void;
  onItemKeydown(event: KeyboardEvent, id: string): void;
}

/** Provided by `cw-calendar-view` for its day part. */
export const CALENDAR_VIEW = new InjectionToken<CalendarViewHost>('CALENDAR_VIEW');
