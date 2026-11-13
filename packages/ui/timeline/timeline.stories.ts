import { CwButton } from '@cadenway/ui/button';
import { CwToggle } from '@cadenway/ui/toggle';
import { CwToggleGroup, CwToggleGroupItem } from '@cadenway/ui/toggle-group';
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
 * Timeline, every state of its sheet in the Design System artifact; each story renders in the light
 * and the dark theme (`.storybook/preview.ts`). Copy from the sheet preview and the Gantt of the
 * mockup (`App.dc.html`). The stories apply every `itemChange`, as a consumer does.
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

type Story = StoryObj;

function light(canvasElement: HTMLElement): HTMLElement {
  const scope = canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

function day(date: number, month = 10): Date {
  return new Date(2026, month, date);
}

const TODAY = day(12);

const GROUPS: CwTimelineGroup[] = [
  { id: 's14', label: 'Sprint 14', start: day(9), end: day(20), progress: 45 },
  { id: 's15', label: 'Sprint 15', start: day(23), end: day(4, 11) },
];

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

const DEPENDENCIES: CwDependency[] = [
  { from: 'CAD-482', to: 'CAD-488' },
  { from: 'CAD-479', to: 'CAD-503' },
];

const MILESTONES: CwMilestone[] = [
  { id: 'review-14', label: 'Revue de sprint 14', date: day(20), group: 's14' },
  { id: 'v09', label: 'Version 0.9', date: day(27), group: 's15' },
];

function move(items: readonly CwTimelineItem[], change: CwTimelineItemChange): CwTimelineItem[] {
  return items.map((item) =>
    item.id === change.item.id ? { ...item, start: change.start, end: change.end } : item,
  );
}

function schedule(
  items: readonly CwTimelineItem[],
  event: { item: CwTimelineItem; start: Date; end: Date },
): CwTimelineItem[] {
  return items.map((item) =>
    item.id === event.item.id ? { ...item, start: event.start, end: event.end } : item,
  );
}

const PROPS = {
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
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
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
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    await userEvent.tab();
    await expect(scope.getByRole('row', { name: /Sprint 14/ })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    const bar = scope.getByRole('button', { name: /^Doc Docker/ });
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
