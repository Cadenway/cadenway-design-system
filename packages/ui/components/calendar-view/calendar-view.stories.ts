import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { CwButton } from '@cadenway/ui/components/button';
import { CwMenu, CwMenuItem } from '@cadenway/ui/components/menu';
import { CwStatusIcon, type CwStatusKey } from '@cadenway/ui/components/status-icon';

import { CwCalendarItemDef } from './calendar-item-def/calendar-item-def.directive';
import { CwCalendarView } from './calendar-view.component';
import type { CwCalendarItemSchedule, CwCalendarSpan } from './calendar-view.types';

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
    moduleMetadata({
      imports: [
        CdkDrag,
        CdkDropList,
        CwButton,
        CwCalendarItemDef,
        CwCalendarView,
        CwMenu,
        CwMenuItem,
        CwStatusIcon,
      ],
    }),
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

/**
 * The mockup's month (`App.dc.html`, the calendar view): `variant="outlined"` (96 px days, other
 * months on `bg-muted`, today's number filled, bordered chips, 24 px « + ») and
 * `toolbar="title"` (the month as a heading, « Aujourd’hui » and the 28 px arrows at the end),
 * without the view toggle.
 */
export const Outlined: Story = {
  render: () => ({
    props,
    template: `
      <cw-calendar-view ${VIEW} variant="outlined" toolbar="title" viewToggle="false" [maxPerDay]="2" [date]="november">
        ${ITEM}
      </cw-calendar-view>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const heading: HTMLElement | null = canvasElement.querySelector('h2');
    await expect(heading).not.toBeNull();
    const today: HTMLElement | null = canvasElement.querySelector(
      '[role="gridcell"][aria-current="date"]',
    );
    await expect(Math.round(today?.getBoundingClientRect().height ?? 0)).toBe(96);
  },
};

/**
 * Outlined month with `maxPerDay` at 3: each week is as tall as the lines its fullest day uses
 * (the mockup's `min-h-24` rows), so only the week of the 12th grows to 126 px and every chip
 * stays inside its day.
 */
export const OutlinedRowsFitContent: Story = {
  render: () => ({
    props,
    template: `
      <cw-calendar-view ${VIEW} variant="outlined" toolbar="title" viewToggle="false" [maxPerDay]="3" [date]="november">
        ${ITEM}
      </cw-calendar-view>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const cells: HTMLElement[] = Array.from(
      light(canvasElement).querySelectorAll<HTMLElement>('[role="gridcell"]'),
    );
    const heights: number[] = cells.map((cell) => Math.round(cell.getBoundingClientRect().height));
    const today: HTMLElement | undefined = cells.find((cell) => cell.ariaCurrent === 'date');
    await expect(Math.round(today?.getBoundingClientRect().height ?? 0)).toBe(126);
    await expect(heights.filter((height) => height === 126)).toHaveLength(7);
    await expect(heights.filter((height) => height === 96)).toHaveLength(35);
    for (const cell of cells) {
      const bottom: number = cell.getBoundingClientRect().bottom;
      for (const item of Array.from(
        cell.querySelectorAll<HTMLElement>('button[title], [data-more]'),
      )) {
        await expect(item.getBoundingClientRect().bottom).toBeLessThanOrEqual(bottom + 0.5);
      }
    }
    // The bar from the 16th to the 18th lies on the first line of its week, over three days
    // (`offset*` ignores the entrance transform).
    const bar: HTMLElement | null = light(canvasElement).querySelector<HTMLElement>(
      'button[title="Maquetter la vue Calendrier, du 16 au 18 nov."]',
    );
    const sixteenth: HTMLElement | undefined = cells.find((cell) =>
      cell.textContent.includes('lundi 16 novembre 2026'),
    );
    await expect(bar?.offsetTop).toBe(34);
    await expect(
      Math.abs((bar?.offsetWidth ?? 0) - (3 * (sixteenth?.offsetWidth ?? 0) - 8)),
    ).toBeLessThanOrEqual(2);
  },
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

/**
 * Pointer drag onto a day under a bar: « Notifications de mention » dragged from the 17th to the
 * 18th, both covered by the 16–18 bar, lands on the 18th, not on the bar's first day.
 */
export const DragOverBar: Story = {
  render: () => ({
    props,
    template: `<cw-calendar-view ${VIEW} [date]="november">${ITEM}</cw-calendar-view>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: {
      getByRole: (role: string, options?: { name?: string | RegExp }) => HTMLElement;
    } = within(light(canvasElement));
    const pill: HTMLElement = scope.getByRole('button', { name: 'Notifications de mention' });
    const bar: HTMLElement = scope.getByRole('button', {
      name: 'Maquetter la vue Calendrier, du 16 au 18 nov.',
    });
    const day: () => HTMLElement = () =>
      scope.getByRole('gridcell', { name: /^mercredi 18 novembre 2026/ });
    // Wait for the entrance animations, so the rectangles are final.
    await waitFor(() => expect(getComputedStyle(bar).opacity).toBe('1'));
    const from: DOMRect = pill.getBoundingClientRect();
    const over: DOMRect = bar.getBoundingClientRect();
    const cell: DOMRect = day().getBoundingClientRect();
    const start: { clientX: number; clientY: number } = {
      clientX: from.left + from.width / 2,
      clientY: from.top + from.height / 2,
    };
    const end: { clientX: number; clientY: number } = {
      clientX: cell.left + cell.width / 2,
      clientY: over.top + over.height / 2,
    };
    // At rest the bar is under that point and stays clickable.
    await expect(document.elementFromPoint(end.clientX, end.clientY)?.closest('button')).toBe(bar);
    // Real mouse events, as the CDK reads them (`buttons` and `detail` tell them from a screen
    // reader's simulated press).
    const mouse: (type: string, at: { clientX: number; clientY: number }) => MouseEvent = (
      type: string,
      at: { clientX: number; clientY: number },
    ): MouseEvent =>
      new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        button: 0,
        buttons: 1,
        detail: 1,
        ...at,
      });
    const frame: () => Promise<void> = () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => {
          resolve();
        });
      });
    pill.dispatchEvent(mouse('mousedown', start));
    document.dispatchEvent(
      mouse('mousemove', { clientX: start.clientX + 10, clientY: start.clientY }),
    );
    await frame();
    await frame();
    for (let step: number = 1; step <= 8; step++) {
      document.dispatchEvent(
        mouse('mousemove', {
          clientX: start.clientX + ((end.clientX - start.clientX) * step) / 8,
          clientY: start.clientY + ((end.clientY - start.clientY) * step) / 8,
        }),
      );
      await frame();
    }
    document.dispatchEvent(mouse('mouseup', end));
    await waitFor(() =>
      expect(within(day()).getByRole('button', { name: 'Notifications de mention' })).toBeVisible(),
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

/**
 * Function scheduleOn
 *
 * @description
 * Gives an outside task the day it was dropped on, as the consumer of `itemSchedule` does.
 *
 * @param {readonly StoryTask[]} list - Current tasks.
 * @param {CwCalendarItemSchedule} event - The scheduled task and its day.
 * @returns {StoryTask[]} Tasks with the scheduled one dated.
 */
function scheduleOn(list: readonly StoryTask[], event: CwCalendarItemSchedule): StoryTask[] {
  const scheduled: StoryTask = event.data as StoryTask;
  return list.map((task) =>
    task.id === scheduled.id
      ? { ...task, span: { start: event.date, end: event.date, allDay: true } }
      : task,
  );
}

/**
 * Function undated
 *
 * @description
 * The tasks without a date, listed beside the calendar.
 *
 * @param {readonly StoryTask[]} list - Current tasks.
 * @returns {StoryTask[]} Undated tasks.
 */
function undated(list: readonly StoryTask[]): StoryTask[] {
  return list.filter((task) => task.span === null);
}

/** Loading: the header stays, a skeleton grid named « Chargement du calendrier » replaces the days. */
export const Loading: Story = {
  render: () => ({
    props,
    template: `<cw-calendar-view ${VIEW} loading [date]="november" />`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: { getByRole: (role: string, options?: { name?: string }) => HTMLElement } = within(
      light(canvasElement),
    );
    await expect(scope.getByRole('status', { name: 'Chargement du calendrier' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
  },
};

/**
 * Undated tasks beside the month (mockup `App.dc.html`, « Sans échéance »): drag one onto a day,
 * or press Space on it, choose the day with the arrows and press Enter; `itemSchedule` dates it.
 */
export const ScheduleFromOutside: Story = {
  render: () => ({
    props: { ...props, scheduleOn, undated },
    template: `
      <div class="flex w-full flex-col gap-4 xl:flex-row">
        <cw-calendar-view #calendar ${VIEW} [date]="november"
          (itemSchedule)="tasks = scheduleOn(tasks, $event)">${ITEM}</cw-calendar-view>
        <aside class="flex w-full shrink-0 flex-col gap-2 xl:w-64"
          [attr.aria-label]="'Sans échéance' + (cwTheme === 'dark' ? ', thème sombre' : '')">
          <p class="text-xs text-muted-foreground">Glissez une tâche sur un jour pour la planifier.</p>
          <div cdkDropList cdkDropListSortingDisabled [cdkDropListConnectedTo]="calendar.dropListIds()"
            class="flex flex-col gap-1.5">
            @for (task of undated(tasks); track task.id) {
              <button type="button" cdkDrag [cdkDragData]="task"
                class="flex w-full items-center gap-2 rounded-lg border bg-card px-2.5 py-2 text-left text-sm"
                (keydown.space)="$event.preventDefault(); calendar.scheduleWithKeyboard(task, task.name)">
                <cw-status-icon [status]="task.status" />
                <span class="min-w-0 flex-1 truncate">{{ task.name }}</span>
              </button>
            } @empty {
              <p class="rounded-lg border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">
                Toutes les tâches ont une échéance.
              </p>
            }
          </div>
        </aside>
      </div>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: {
      getByRole: (role: string, options?: { name?: string | RegExp }) => HTMLElement;
      getByText: (text: string | RegExp) => HTMLElement;
    } = within(light(canvasElement));
    scope.getByRole('button', { name: 'Ajouter les notifications par e-mail' }).focus();
    await userEvent.keyboard(' ');
    await waitFor(() =>
      expect(scope.getByRole('gridcell', { name: /^jeudi 12 novembre 2026/ })).toHaveFocus(),
    );
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(
        within(scope.getByRole('gridcell', { name: /^vendredi 13 novembre 2026/ })).getByRole(
          'button',
          { name: 'Ajouter les notifications par e-mail' },
        ),
      ).toBeVisible(),
    );
    await expect(scope.getByText('Toutes les tâches ont une échéance.')).toBeVisible();
  },
};

/** Day menu (mockup `App.dc.html`): a right click on a day, or Shift + F10 on the focused day. */
export const DayMenu: Story = {
  render: () => ({
    props: { ...props, picked: '' },
    template: `
      <p class="text-sm text-muted-foreground" aria-live="polite">Last action: {{ picked || '—' }}</p>
      <cw-calendar-view ${VIEW} [date]="november" [dayMenu]="dayMenu">${ITEM}</cw-calendar-view>
      <cw-menu #dayMenu ariaLabel="Actions du jour">
        <button cwMenuItem (triggered)="picked = 'Nouvelle tâche le ' + dayMenu.data()?.date.getDate()">Nouvelle tâche ce jour-là</button>
        <button cwMenuItem (triggered)="picked = 'Aller à aujourd’hui'">Aller à aujourd’hui</button>
      </cw-menu>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: {
      getByRole: (role: string, options?: { name?: string | RegExp }) => HTMLElement;
      getByText: (text: string) => HTMLElement;
    } = within(light(canvasElement));
    const page: {
      findByRole: (role: string, options?: { name?: string }) => Promise<HTMLElement>;
    } = within(document.body);
    scope.getByRole('gridcell', { name: /^jeudi 12 novembre 2026/ }).focus();
    await userEvent.keyboard('{Shift>}{F10}{/Shift}');
    const first: HTMLElement = await page.findByRole('menuitem', {
      name: 'Nouvelle tâche ce jour-là',
    });
    await waitFor(() => expect(first).toHaveFocus());
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(scope.getByText('Last action: Nouvelle tâche le 12')).toBeVisible());
  },
};
