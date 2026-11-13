import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { CwButton } from '@cadenway/ui/button';
import { CwStatusIcon, type CwStatusKey } from '@cadenway/ui/status-icon';

import { CwCalendarItemDef } from './calendar-item-def/calendar-item-def.directive';
import { CwCalendarView } from './calendar-view.component';
import type { CwCalendarSpan } from './calendar-view.types';

/**
 * Calendar View, every state of its sheet in the Design System artifact, in the light and the dark
 * theme. The view is generic: these stories give it the mockup's November 2026 (`App.dc.html`, vue
 * Calendrier; today is Thursday 12 November, 10:12) as plain data, and draw each item with the status
 * icon and the name, as the webapp does.
 */
const meta: Meta = {
  title: 'UI/CalendarView',
  decorators: [
    moduleMetadata({ imports: [CwButton, CwCalendarItemDef, CwCalendarView, CwStatusIcon] }),
  ],
};

export default meta;

type Story = StoryObj;

interface StoryTask {
  readonly id: string;
  readonly name: string;
  readonly status: CwStatusKey;
  readonly late?: boolean;
  readonly span: CwCalendarSpan | null;
}

function light(canvasElement: HTMLElement): HTMLElement {
  const scope = canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

function at(month: number, date: number, hours = 0, minutes = 0): Date {
  return new Date(2026, month, date, hours, minutes);
}

function day(date: number, to = date, month = 10): CwCalendarSpan {
  return { start: at(month, date), end: at(month, to), allDay: true };
}

function slot(date: number, from: [number, number], to: [number, number]): CwCalendarSpan {
  return { start: at(10, date, ...from), end: at(10, date, ...to), allDay: false };
}

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

const props = {
  tasks,
  today: at(10, 12, 10, 12),
  november: at(10, 12),
  id: (task: StoryTask): string => task.id,
  name: (task: StoryTask): string => task.name,
  span: (task: StoryTask): CwCalendarSpan | null => task.span,
};

/* The item content, as the webapp draws it: status icon, then the name (muted when done, grenat and
   « (en retard) » when late). */
const ITEM = `
  <ng-template cwCalendarItem [cwCalendarItemOf]="tasks" let-task>
    <cw-status-icon [status]="task.status" size="3" class="shrink-0" />
    <span class="min-w-0 truncate" [class.text-muted-foreground]="task.status === 'done'"
      [class.text-grenat-text]="task.late">{{ task.name }}</span>
    @if (task.late) { <span class="sr-only"> (en retard)</span> }
  </ng-template>`;

const VIEW = `[items]="tasks" [trackBy]="id" [itemLabel]="name" [itemSpan]="span" [today]="today"
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
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    const more = scope.getByRole('button', { name: '+3 autres' });
    await userEvent.click(more);
    const dialog = await within(document.body).findByRole('dialog', {
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
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    const today = scope.getByRole('gridcell', { name: /^jeudi 12 novembre 2026, 4 tâches/ });
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
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    const item = scope.getByRole('button', { name: 'Planifier le sprint 15' });
    item.focus();
    await userEvent.keyboard(' ');
    await userEvent.keyboard('{ArrowRight}');
    const target = scope.getByRole('gridcell', { name: /^mardi 24 novembre 2026/ });
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
