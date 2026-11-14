import { CwButton } from '@cadenway/ui/components/button';
import { CwToggle } from '@cadenway/ui/components/toggle';
import { CwToggleGroup, CwToggleGroupItem } from '@cadenway/ui/components/toggle-group';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwTimelineToolbar } from './timeline-toolbar/timeline-toolbar.directive';
import { CwTimeline } from './timeline.component';
import type {
  CwDependency,
  CwMilestone,
  CwTimelineGroup,
  CwTimelineItem,
  CwTimelineItemChange,
} from './timeline.types';

/**
 * Constant meta
 *
 * @description
 * Timeline, every state of its sheet in the Design System artifact; each story renders in the light
 * and the dark theme (`.storybook/preview.ts`). Copy from the sheet preview and the Gantt of the
 * mockup (`App.dc.html`). The stories apply every `itemChange`, as a consumer does.
 *
 * @type {Meta}
 */
const meta: Meta = {
  title: 'UI/Timeline',
  decorators: [
    moduleMetadata({
      imports: [
        CwTimeline,
        CwTimelineToolbar,
        CwButton,
        CwToggle,
        CwToggleGroup,
        CwToggleGroupItem,
      ],
    }),
  ],
};

export default meta;

/**
 * Type Story
 *
 * @description
 * Storybook story configuration for timeline examples.
 *
 * @type {StoryObj}
 */
type Story = StoryObj;

/**
 * Function light
 *
 * @description
 * Selects the light theme copy for interaction checks.
 *
 * @param {HTMLElement} canvasElement - Story canvas containing the themed examples.
 *
 * @returns {HTMLElement} Light theme section used for interaction checks.
 */
function light(canvasElement: HTMLElement): HTMLElement {
  const scope: HTMLElement | null =
    canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

/**
 * Function day
 *
 * @description
 * Creates a local fixture date in 2026, defaulting to November.
 *
 * @param {number} date - Day of the month.
 * @param {number} [month] - Zero-based month, defaulting to November.
 *
 * @returns {Date} Local fixture date in 2026.
 */
function day(date: number, month: number = 10): Date {
  return new Date(2026, month, date);
}

/**
 * Constant TODAY
 *
 * @description
 * Current day used by the timeline examples.
 *
 * @type {Date}
 */
const TODAY: Date = day(12);

/**
 * Constant GROUPS
 *
 * @description
 * Sprint groups used by the timeline examples.
 *
 * @type {CwTimelineGroup[]}
 */
const GROUPS: CwTimelineGroup[] = [
  { id: 's14', label: 'Sprint 14', start: day(9), end: day(20), progress: 45 },
  { id: 's15', label: 'Sprint 15', start: day(23), end: day(4, 11) },
];

/**
 * Constant ITEMS
 *
 * @description
 * Dated and undated items used by the examples.
 *
 * @type {CwTimelineItem[]}
 */
const ITEMS: CwTimelineItem[] = [
  {
    id: 'CAD-466',
    name: 'Doc Docker',
    status: 'done',
    progress: 100,
    start: day(9),
    end: day(10),
    group: 's14',
    assignee: { name: 'Léa Martin' },
  },
  {
    id: 'CAD-471',
    name: 'Migrer vers S3',
    status: 'blocked',
    progress: 30,
    start: day(9),
    end: day(11),
    group: 's14',
    assignee: { name: 'Karim Benali' },
  },
  {
    id: 'CAD-482',
    name: "Corriger l'export CSV",
    status: 'progress',
    progress: 40,
    start: day(10),
    end: day(13),
    group: 's14',
    assignee: { name: 'Léa Martin' },
  },
  {
    id: 'CAD-479',
    name: 'Maquetter la vue Calendrier',
    status: 'progress',
    progress: 60,
    start: day(11),
    end: day(17),
    group: 's14',
    assignee: { name: 'Inès Duval' },
  },
  {
    id: 'CAD-488',
    name: 'Importer les espaces',
    status: 'todo',
    progress: 0,
    start: day(16),
    end: day(18),
    group: 's14',
    assignee: { name: 'Samuel Roux' },
  },
  {
    id: 'CAD-503',
    name: 'Notifications de mention',
    status: 'todo',
    progress: 0,
    start: day(16),
    end: day(19),
    group: 's14',
    assignee: { name: 'Léa Martin' },
  },
  {
    id: 'CAD-485',
    name: 'Notifications e-mail',
    status: 'todo',
    progress: 0,
    start: day(24),
    end: day(26),
    group: 's15',
  },
  { id: 'CAD-490', name: 'Raccourcis de la Liste', status: 'todo', group: 's15' },
];

/**
 * Constant DEPENDENCIES
 *
 * @description
 * Finish-to-start links used by the examples.
 *
 * @type {CwDependency[]}
 */
const DEPENDENCIES: CwDependency[] = [
  { from: 'CAD-482', to: 'CAD-488' },
  { from: 'CAD-479', to: 'CAD-503' },
];

/**
 * Constant MILESTONES
 *
 * @description
 * Sprint milestones used by the examples.
 *
 * @type {CwMilestone[]}
 */
const MILESTONES: CwMilestone[] = [
  { id: 'review-14', label: 'Revue de sprint 14', date: day(20), group: 's14' },
  { id: 'v09', label: 'Version 0.9', date: day(27), group: 's15' },
];

/**
 * Function move
 *
 * @description
 * Applies emitted item dates to the controlled example data.
 *
 * @param {readonly CwTimelineItem[]} items - Current controlled example items.
 * @param {CwTimelineItemChange} change - Emitted date change to apply.
 *
 * @returns {CwTimelineItem[]} Updated example items.
 */
function move(items: readonly CwTimelineItem[], change: CwTimelineItemChange): CwTimelineItem[] {
  return items.map((item) =>
    item.id === change.item.id ? { ...item, start: change.start, end: change.end } : item,
  );
}

/**
 * Function schedule
 *
 * @description
 * Applies a scheduling request to the controlled example data.
 *
 * @param {readonly CwTimelineItem[]} items - Current controlled example items.
 * @param {{ item: CwTimelineItem; start: Date; end: Date }} event - Scheduling request with the item and dates.
 *
 * @returns {CwTimelineItem[]} Updated example items.
 */
function schedule(
  items: readonly CwTimelineItem[],
  event: { item: CwTimelineItem; start: Date; end: Date },
): CwTimelineItem[] {
  return items.map((item) =>
    item.id === event.item.id ? { ...item, start: event.start, end: event.end } : item,
  );
}

/**
 * Constant PROPS
 *
 * @description
 * Shared fixture data and update handlers for timeline examples.
 *
 * @type {{ items: CwTimelineItem[]; groups: CwTimelineGroup[]; dependencies: CwDependency[]; milestones: CwMilestone[]; today: Date; move: typeof move; schedule: typeof schedule; }}
 */
const PROPS: {
  items: CwTimelineItem[];
  groups: CwTimelineGroup[];
  dependencies: CwDependency[];
  milestones: CwMilestone[];
  today: Date;
  move: typeof move;
  schedule: typeof schedule;
} = {
  items: ITEMS,
  groups: GROUPS,
  dependencies: DEPENDENCIES,
  milestones: MILESTONES,
  today: TODAY,
  move,
  schedule,
};

/**
 * Day scale by sprint with its toolbar: progress by status, milestones, dependencies, a conflict
 * (« Notifications de mention » starts before the end of « Maquetter la vue Calendrier »), a late
 * bar, an undated item with « Planifier », weekends and today.
 */
export const Default: Story = {
  render: () => ({
    props: {
      ...PROPS,
      scale: 'day',
      showDependencies: true,
      range: { start: day(9), end: day(29) },
    },
    template: `
      <cw-timeline class="w-full" ariaLabel="Timeline de Produit" [items]="items" [groups]="groups"
                   [dependencies]="dependencies" [milestones]="milestones" [today]="today"
                   [(scale)]="scale" [(range)]="range" [(showDependencies)]="showDependencies"
                   (itemChange)="items = move(items, $event)" (schedule)="items = schedule(items, $event)">
        <div cwTimelineToolbar class="flex flex-wrap items-center gap-2">
          <cw-toggle-group variant="outline" ariaLabel="Échelle" [(value)]="scale">
            <button cwToggleGroupItem value="day">Jour</button>
            <button cwToggleGroupItem value="week">Semaine</button>
            <button cwToggleGroupItem value="month">Mois</button>
          </cw-toggle-group>
          <button cwButton variant="outline" (click)="range = null">Aujourd'hui</button>
          <span class="flex-1"></span>
          <button cwToggle variant="outline" [(pressed)]="showDependencies">Dépendances</button>
        </div>
      </cw-timeline>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: { getByRole(role: string, options?: { name?: string | RegExp }): HTMLElement } =
      within(light(canvasElement));
    await expect(scope.getByRole('treegrid', { name: 'Timeline de Produit' })).toBeVisible();
    await expect(
      scope.getByRole('button', {
        name: 'Notifications de mention, 0 %, À faire, du 16 au 19 nov., commence avant la fin de Maquetter la vue Calendrier',
      }),
    ).toHaveAttribute('data-conflict', '');
  },
};

/** Week scale: one 76 px column per week, today's week in amethyst, no weekend columns. */
export const WeekScale: Story = {
  render: () => ({
    props: { ...PROPS, range: { start: day(2), end: day(13, 11) } },
    template: `
      <cw-timeline class="w-full" ariaLabel="Timeline de Produit, par semaine" scale="week" [items]="items"
                   [groups]="groups" [dependencies]="dependencies" [milestones]="milestones" [today]="today"
                   [range]="range" (itemChange)="items = move(items, $event)" />`,
  }),
};

/** Month scale for a roadmap: one 114 px column per month, release milestones. */
export const MonthScale: Story = {
  render: () => ({
    props: { ...PROPS, range: { start: day(1, 9), end: day(31, 0) } },
    template: `
      <cw-timeline class="w-full" ariaLabel="Feuille de route de Produit" scale="month" [items]="items"
                   [groups]="groups" [milestones]="milestones" [today]="today" [range]="range" />`,
  }),
};

/** Flat and read-only (« Mes tâches »): no group row, no move, no « Planifier », working days only. */
export const FlatReadonly: Story = {
  render: () => ({
    props: { ...PROPS, range: { start: day(9), end: day(22) } },
    template: `
      <cw-timeline class="w-full" ariaLabel="Mes tâches" readonly [showWeekends]="false" [items]="items"
                   [today]="today" [range]="range" />`,
  }),
};

/** Keyboard: ↓ reaches a bar, → moves it by a day, Space selects it. */
export const Keyboard: Story = {
  render: () => ({
    props: { ...PROPS, range: { start: day(9), end: day(29) }, selection: [] },
    template: `
      <cw-timeline class="w-full" ariaLabel="Timeline au clavier" [items]="items" [groups]="groups"
                   [dependencies]="dependencies" [milestones]="milestones" [today]="today" [range]="range"
                   [(selection)]="selection" (itemChange)="items = move(items, $event)" />`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: { getByRole(role: string, options?: { name?: string | RegExp }): HTMLElement } =
      within(light(canvasElement));
    await userEvent.tab();
    await expect(scope.getByRole('row', { name: /Sprint 14/ })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    const bar: HTMLElement = scope.getByRole('button', { name: /^Doc Docker/ });
    await expect(bar).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(scope.getByRole('button', { name: /^Doc Docker/ })).toHaveAccessibleName(
      'Doc Docker, 100 %, Terminé, du 10 au 11 nov.',
    );
    await userEvent.keyboard(' ');
    await expect(scope.getByRole('button', { name: /^Doc Docker/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  },
};
