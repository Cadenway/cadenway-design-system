import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwTimeEntryForm } from './time-entry-form/time-entry-form.component';
import { CwTimeEntryList } from './time-entry-list/time-entry-list.component';
import { CwTimeTracker } from './time-tracker.component';
import type { CwTimeEntry } from './time-tracker.types';

/**
 * Constant meta
 *
 * @description
 * Time tracker states in both themes, using the design system preview data.
 *
 * @type {Meta}
 */
const meta: Meta = {
  title: 'UI/TimeTracker',
  decorators: [moduleMetadata({ imports: [CwTimeTracker, CwTimeEntryList, CwTimeEntryForm] })],
};

export default meta;

/**
 * Type Story
 *
 * @description
 * Storybook configuration for time tracker examples.
 *
 * @type {StoryObj}
 */
type Story = StoryObj;

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
 * Constant MINUTE
 *
 * @description
 * Number of milliseconds in one minute.
 *
 * @type {number}
 */
const MINUTE: number = 60_000;
/**
 * Constant NOW
 *
 * @description
 * Current date used for the running example.
 *
 * @type {Date}
 */
const NOW: Date = new Date();
/**
 * Constant YESTERDAY
 *
 * @description
 * Previous date used for an entry example.
 *
 * @type {Date}
 */
const YESTERDAY: Date = new Date(NOW.getTime() - 24 * 60 * MINUTE);

/**
 * Constant ENTRIES
 *
 * @description
 * Sample time entries displayed in the list.
 *
 * @type {CwTimeEntry[]}
 */
const ENTRIES: CwTimeEntry[] = [
  {
    id: '1',
    person: { name: 'Léa Martin' },
    date: NOW,
    duration: 42 * MINUTE + 10_000,
    note: "Correctif de l'export",
    billable: true,
    running: true,
  },
  {
    id: '2',
    person: { name: 'Karim Benali' },
    date: YESTERDAY,
    duration: 90 * MINUTE,
    note: 'Revue du correctif',
    billable: true,
  },
  {
    id: '3',
    person: { name: 'Léa Martin' },
    date: new Date(2026, 10, 10),
    duration: 33 * MINUTE,
    note: 'Reproduction avec 2 000 lignes',
  },
  { id: '4', person: { name: 'Inès Duval' }, date: new Date(2026, 10, 9), duration: 48 * MINUTE },
];

/** The timer stopped, running (dot, live duration, « depuis 14:05 ») and paused. */
export const States: Story = {
  render: () => ({
    props: { startedAt: new Date(2026, 10, 13, 14, 5), total: 213 * MINUTE },
    template: `
      <div class="grid w-80 gap-3">
        <cw-time-tracker [total]="total" />
        <cw-time-tracker state="running" [startedAt]="startedAt" [elapsed]="${String(42 * MINUTE + 10_000)}" [total]="total" />
        <cw-time-tracker state="paused" [startedAt]="startedAt" [elapsed]="${String(42 * MINUTE + 10_000)}" [total]="total" />
      </div>`,
  }),
};

/** Within the estimate: the fill in ink, « 1 h 15 restantes ». */
export const WithinEstimate: Story = {
  render: () => ({
    props: { total: 105 * MINUTE, estimate: 180 * MINUTE },
    template: `<cw-time-tracker class="w-80" [total]="total" [estimate]="estimate" />`,
  }),
};

/** Over the estimate: the mark at the estimate, the excess in grenat, « +33 min »; billable line. */
export const OverEstimate: Story = {
  render: () => ({
    props: { total: 213 * MINUTE, estimate: 180 * MINUTE, billable: 180 * MINUTE },
    template: `<cw-time-tracker class="w-80" [total]="total" [estimate]="estimate" [billableTotal]="billable" />`,
  }),
};

/** Compact: the 28 px chip of a task header, stopped, running and paused. */
export const Compact: Story = {
  render: () => ({
    props: { total: 213 * MINUTE, elapsed: 42 * MINUTE + 10_000 },
    template: `
      <div class="flex flex-wrap gap-3">
        <cw-time-tracker variant="compact" [total]="total" />
        <cw-time-tracker variant="compact" state="running" [elapsed]="elapsed" [total]="total" />
        <cw-time-tracker variant="compact" state="paused" [elapsed]="elapsed" [total]="total" />
      </div>`,
  }),
};

/** The entry form alone: shortcuts, the duration read as typed, date, note, billable. */
export const EntryForm: Story = {
  render: () => ({
    template: `<cw-time-entry-form class="w-80" />`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: {
      getByRole: (role: string, options?: { name?: string | RegExp }) => HTMLElement;
      getByText: (text: string) => HTMLElement;
    } = within(light(canvasElement));
    const field: HTMLElement = scope.getByRole('textbox', { name: 'Durée' });
    await userEvent.type(field, '1h30');
    await expect(scope.getByText('= 1 h 30')).toBeInTheDocument();
  },
};

/** An unreadable duration: `aria-invalid` and the format help. */
export const EntryFormError: Story = {
  render: () => ({
    template: `<cw-time-entry-form class="w-80" />`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: {
      getByRole: (role: string, options?: { name?: string | RegExp }) => HTMLElement;
      getByText: (text: string) => HTMLElement;
    } = within(light(canvasElement));
    const field: HTMLElement = scope.getByRole('textbox', { name: 'Durée' });
    await userEvent.type(field, '1h3O{Enter}');
    await expect(field).toHaveAttribute('aria-invalid', 'true');
  },
};

/** The entries: running, billable, without note; the totals below. */
export const Entries: Story = {
  render: () => ({
    props: { entries: ENTRIES },
    template: `<cw-time-entry-list class="w-full" [entries]="entries" />`,
  }),
};

/** No entry yet. */
export const NoEntries: Story = {
  render: () => ({
    template: `<cw-time-entry-list class="w-full" />`,
  }),
};

/** The full section of the task panel; Enter starts the timer, the form opens from its button. */
export const Full: Story = {
  render: () => ({
    props: { state: 'stopped', total: 213 * MINUTE, estimate: 180 * MINUTE, entries: ENTRIES },
    template: `
      <cw-time-tracker class="w-full" [(state)]="state" [total]="total" [estimate]="estimate">
        <cw-time-entry-list [entries]="entries" />
        <cw-time-entry-form />
      </cw-time-tracker>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: {
      getByRole: (role: string, options?: { name?: string | RegExp }) => HTMLElement;
      getByText: (text: string) => HTMLElement;
    } = within(light(canvasElement));
    const start: HTMLElement = scope.getByRole('button', { name: 'Démarrer le minuteur' });
    start.focus();
    await userEvent.keyboard('{Enter}');
    await expect(
      scope.getByRole('button', { name: 'Arrêter le minuteur et enregistrer' }),
    ).toBeInTheDocument();
    await userEvent.keyboard('{Enter}');
    await expect(scope.getByRole('button', { name: 'Démarrer le minuteur' })).toBeInTheDocument();
  },
};
