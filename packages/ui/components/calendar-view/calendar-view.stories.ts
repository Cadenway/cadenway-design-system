import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { CwButton } from '@cadenway/ui/components/button';
import { CwStatusIcon, type CwStatusKey } from '@cadenway/ui/components/status-icon';

import { CwCalendarItemDef } from './calendar-item-def/calendar-item-def.directive';
import { CwCalendarView } from './calendar-view.component';
import type { CwCalendarSpan } from './calendar-view.types';

/**
 * Constant meta
 *
 * @description
 * Calendar view examples in both themes using the mockup task data.
 *
 * @type {Meta}
 */
const meta: Meta = {
  title: 'UI/CalendarView',
  decorators: [
    moduleMetadata({ imports: [CwButton, CwCalendarItemDef, CwCalendarView, CwStatusIcon] }),
  ],
};

export default meta;

/**
 * Type Story
 *
 * @description
 * Storybook configuration for calendar view examples.
 *
 * @type {StoryObj}
 */
type Story = StoryObj;

/**
 * Interface StoryTask
 *
 * @description
 * Task displayed by the calendar examples.
 */
interface StoryTask {
  // #region Properties
  /**
   * Property id
   *
   * @description
   * Stable task identifier.
   *
   * @type {string}
   * @readonly
   */
  readonly id: string;

  /**
   * Property name
   *
   * @description
   * Displayed task name.
   *
   * @type {string}
   * @readonly
   */
  readonly name: string;

  /**
   * Property status
   *
   * @description
   * Task status used by the status icon.
   *
   * @type {CwStatusKey}
   * @readonly
   */
  readonly status: CwStatusKey;

  /**
   * Property late
   *
   * @description
   * Whether the task is overdue.
   *
   * @type {boolean | undefined}
   * @readonly
   */
  readonly late?: boolean;

  /**
   * Property span
   *
   * @description
   * Scheduled dates and all-day state, or null.
   *
   * @type {CwCalendarSpan | null}
   * @readonly
   */
  readonly span: CwCalendarSpan | null;
  // #endregion
}

/**
 * Function light
 *
 * @description
 * Finds the light theme section of the story canvas.
 *
 * @param {HTMLElement} canvasElement - Canvas containing the themed examples.
 * @returns {HTMLElement} Light theme section.
 */
function light(canvasElement: HTMLElement): HTMLElement {
  const scope: HTMLElement | null =
    canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

/**
 * Function at
 *
 * @description
 * Creates a date in the sample year.
 *
 * @param {number} month - Zero-based month.
 * @param {number} date - Day of the month.
 * @param {number} hours - Hour of the date.
 * @param {number} minutes - Minute of the date.
 * @returns {Date} Date in the sample year.
 */
function at(month: number, date: number, hours: number = 0, minutes: number = 0): Date {
  return new Date(2026, month, date, hours, minutes);
}

/**
 * Function day
 *
 * @description
 * Creates an all-day span for the examples.
 *
 * @param {number} date - Day of the month.
 * @param {number} to - End day or time of the span.
 * @param {number} month - Zero-based month.
 * @returns {CwCalendarSpan} All-day calendar span.
 */
function day(date: number, to: number = date, month: number = 10): CwCalendarSpan {
  return { start: at(month, date), end: at(month, to), allDay: true };
}

/**
 * Function slot
 *
 * @description
 * Creates a timed span for the examples.
 *
 * @param {number} date - Day of the month.
 * @param {[number, number]} from - Start hour and minute.
 * @param {[number, number]} to - End day or time of the span.
 * @returns {CwCalendarSpan} Timed calendar span.
 */
function slot(date: number, from: [number, number], to: [number, number]): CwCalendarSpan {
  return { start: at(10, date, ...from), end: at(10, date, ...to), allDay: false };
}

/**
 * Constant tasks
 *
 * @description
 * Sample tasks displayed by the calendar.
 *
 * @type {StoryTask[]}
 */
const tasks: StoryTask[] = [
  { id: 'CAD-450', name: 'Planifier le sprint 14', status: 'done', span: day(30, 30, 9) },
  { id: 'CAD-455', name: 'Mettre à jour Docker Compose', status: 'done', span: day(2) },
  { id: 'CAD-466', name: "Rédiger la doc d'installation Docker", status: 'done', span: day(6) },
  {
    id: 'CAD-471',
    name: 'Migrer les pièces jointes vers S3',
    status: 'blocked',
    late: true,
    span: day(9),
  },
  {
    id: 'CAD-462',
    name: 'Corriger le tri des sous-tâches',
    status: 'done',
    span: slot(10, [9, 0], [10, 0]),
  },
  { id: 'CAD-487', name: 'Relire les maquettes', status: 'todo', span: day(10) },
  { id: 'CAD-482', name: "Corriger l'export CSV des tâches", status: 'progress', span: day(12) },
  {
    id: 'CAD-490',
    name: 'Revue du correctif CSV',
    status: 'todo',
    span: slot(12, [11, 0], [12, 0]),
  },
  {
    id: 'CAD-491',
    name: 'Préparer la démo du sprint',
    status: 'todo',
    span: slot(13, [10, 0], [11, 0]),
  },
  { id: 'CAD-492', name: 'Mettre à jour le changelog', status: 'todo', span: day(12) },
  { id: 'CAD-493', name: 'Trier les retours de la bêta', status: 'todo', span: day(12) },
  { id: 'CAD-479', name: 'Maquetter la vue Calendrier', status: 'progress', span: day(16, 18) },
  { id: 'CAD-494', name: 'Notifications de mention', status: 'todo', span: day(17) },
  { id: 'CAD-495', name: 'Planifier le sprint 15', status: 'todo', span: day(23) },
  { id: 'CAD-496', name: 'Publier la version 0.9', status: 'todo', span: day(30) },
  { id: 'CAD-497', name: 'Rétrospective du sprint 15', status: 'todo', span: day(2, 2, 11) },
  { id: 'CAD-485', name: 'Ajouter les notifications par e-mail', status: 'todo', span: null },
];

/**
 * Constant props
 *
 * @description
 * Shared calendar data and item accessors for the examples.
 *
 * @type {{ tasks: StoryTask[]; today: Date; november: Date; id: (task: StoryTask) => string; name: (task: StoryTask) => string; span: (task: StoryTask) => CwCalendarSpan | null; }}
 */
const props: {
  tasks: StoryTask[];
  today: Date;
  november: Date;
  id: (task: StoryTask) => string;
  name: (task: StoryTask) => string;
  span: (task: StoryTask) => CwCalendarSpan | null;
} = {
  tasks,
  today: at(10, 12, 10, 12),
  november: at(10, 12),
  id: (task: StoryTask): string => task.id,
  name: (task: StoryTask): string => task.name,
  span: (task: StoryTask): CwCalendarSpan | null => task.span,
};

/* The item content, as the webapp draws it: status icon, then the name (muted when done, grenat and
   « (en retard) » when late). */
/**
 * Constant ITEM
 *
 * @description
 * Projected item template with status icon and name.
 *
 * @type {string}
 */
const ITEM: string = `
  <ng-template cwCalendarItem [cwCalendarItemOf]="tasks" let-task>
    <cw-status-icon [status]="task.status" size="3" class="shrink-0" />
    <span class="min-w-0 truncate" [class.text-muted-foreground]="task.status === 'done'"
      [class.text-grenat-text]="task.late">{{ task.name }}</span>
    @if (task.late) { <span class="sr-only"> (en retard)</span> }
  </ng-template>`;

/**
 * Constant VIEW
 *
 * @description
 * Common bindings applied to the calendar examples.
 *
 * @type {string}
 */
const VIEW: string = `[items]="tasks" [trackBy]="id" [itemLabel]="name" [itemSpan]="span" [today]="today"
  [unscheduledCount]="1" class="w-full"`;

/** Month: Monday first, today, outside days, a bar over three days, « +3 autres », a late item. */
export const Month: Story = {
  render: () => ({
    props,
    template: `
      <cw-calendar-view ${VIEW} [date]="november">
        <button cwButton cwCalendarActions>Créer une tâche</button>
        ${ITEM}
      </cw-calendar-view>`,
  }),
};

/** Week: the all-day row, hourly slots from 9:00 to 13:00, timed blocks and the current time. */
export const Week: Story = {
  render: () => ({
    props: { ...props, hours: [9, 13] },
    template: `<cw-calendar-view ${VIEW} view="week" [date]="november" [hours]="hours">${ITEM}</cw-calendar-view>`,
  }),
};

/** Without the weekends: five columns, Monday to Friday. */
export const WithoutWeekends: Story = {
  render: () => ({
    props,
    template: `<cw-calendar-view ${VIEW} [date]="november" [showWeekends]="false">${ITEM}</cw-calendar-view>`,
  }),
};

/** Read-only: no « + », no dragging. */
export const ReadOnly: Story = {
  render: () => ({
    props,
    template: `<cw-calendar-view ${VIEW} readonly [date]="november">${ITEM}</cw-calendar-view>`,
  }),
};

/** « +3 autres » opens the day in a popover; Escape brings the focus back. */
export const DayPopover: Story = {
  render: () => ({
    props,
    template: `<cw-calendar-view ${VIEW} [date]="november">${ITEM}</cw-calendar-view>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: {
      getByRole: (role: string, options?: { name?: string | RegExp }) => HTMLElement;
    } = within(light(canvasElement));
    const more: HTMLElement = scope.getByRole('button', { name: '+3 autres' });
    await userEvent.click(more);
    const dialog: HTMLElement = await within(document.body).findByRole('dialog', {
      name: 'Jeudi 12 novembre, 4 tâches',
    });
    await expect(within(dialog).getAllByRole('listitem')).toHaveLength(4);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(more).toHaveFocus());
  },
};

/** Arrows move between the days; Page Down changes month; T comes back to today. */
export const Keyboard: Story = {
  render: () => ({
    props,
    template: `<cw-calendar-view ${VIEW} [date]="november">${ITEM}</cw-calendar-view>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: {
      getByRole: (role: string, options?: { name?: string | RegExp }) => HTMLElement;
    } = within(light(canvasElement));
    const today: HTMLElement = scope.getByRole('gridcell', {
      name: /^jeudi 12 novembre 2026, 4 tâches/,
    });
    today.focus();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() =>
      expect(scope.getByRole('gridcell', { name: /^vendredi 13 novembre 2026/ })).toHaveFocus(),
    );
    await userEvent.keyboard('{PageDown}');
    await waitFor(() => expect(scope.getByRole('grid', { name: 'Décembre 2026' })).toBeVisible());
    await userEvent.keyboard('t');
    await waitFor(() =>
      expect(
        scope.getByRole('gridcell', { name: /^jeudi 12 novembre 2026, 4 tâches/ }),
      ).toHaveFocus(),
    );
  },
};

/** Space grabs an item, the arrows choose the day, Space drops it there. */
export const KeyboardMove: Story = {
  render: () => ({
    props: { ...props, moves: [] as string[] },
    template: `
      <cw-calendar-view ${VIEW} [date]="november"
        (itemMove)="moves.push($event.start.toDateString())">${ITEM}</cw-calendar-view>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: {
      getByRole: (role: string, options?: { name?: string | RegExp }) => HTMLElement;
    } = within(light(canvasElement));
    const item: HTMLElement = scope.getByRole('button', { name: 'Planifier le sprint 15' });
    item.focus();
    await userEvent.keyboard(' ');
    await userEvent.keyboard('{ArrowRight}');
    const target: HTMLElement = scope.getByRole('gridcell', { name: /^mardi 24 novembre 2026/ });
    await waitFor(() => expect(target).toHaveAttribute('data-drop-target'));
    await userEvent.keyboard(' ');
    await waitFor(() =>
      expect(
        within(scope.getByRole('gridcell', { name: /^mardi 24 novembre 2026, 1 tâche/ })).getByRole(
          'button',
          { name: 'Planifier le sprint 15' },
        ),
      ).toBeVisible(),
    );
  },
};
