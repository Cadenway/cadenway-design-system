import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwChart } from './chart.component';
import type { CwChartDatum, CwChartSeries } from './chart.types';

/**
 * Constant meta
 *
 * @description
 * Chart states from the design system, shown in dashboard cards in both themes.
 *
 * @type {Meta}
 */
const meta: Meta = {
  title: 'UI/Chart',
  decorators: [moduleMetadata({ imports: [CwChart] })],
};

export default meta;

/**
 * Type Story
 *
 * @description
 * Storybook configuration for chart examples.
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
 * Constant WEEKS
 *
 * @description
 * Weekly data for the bar chart examples.
 *
 * @type {CwChartDatum[]}
 */
const WEEKS: CwChartDatum[] = [
  { week: 'S41', done: 12, late: 3, progress: 4, blocked: 1 },
  { week: 'S42', done: 15, late: 2, progress: 4, blocked: 2 },
  { week: 'S43', done: 9, late: 4, progress: 6, blocked: 1 },
  { week: 'S44', done: 18, late: 1, progress: 3, blocked: 0 },
  { week: 'S45', done: 14, late: 2, progress: 5, blocked: 1 },
  { week: 'S46', done: 20, late: 1, progress: 4, blocked: 2 },
];

/**
 * Constant DONE_LATE
 *
 * @description
 * Completed and late task series.
 *
 * @type {CwChartSeries[]}
 */
const DONE_LATE: CwChartSeries[] = [
  { key: 'done', label: 'Terminées', color: 'chart-2' },
  { key: 'late', label: 'En retard', color: 'chart-4' },
];

/**
 * Constant OPEN
 *
 * @description
 * Task status series for the stacked bar example.
 *
 * @type {CwChartSeries[]}
 */
const OPEN: CwChartSeries[] = [
  { key: 'done', label: 'Terminées', color: 'chart-2' },
  { key: 'progress', label: 'En cours', color: 'chart-3' },
  { key: 'blocked', label: 'Bloquées', color: 'chart-4' },
];

/**
 * Constant BURNDOWN
 *
 * @description
 * Actual and ideal remaining work by day.
 *
 * @type {CwChartDatum[]}
 */
const BURNDOWN: CwChartDatum[] = Array.from({ length: 10 }, (_, day) => ({
  day: `J${String(day + 1)}`,
  real: [30, 29, 27, 26, 22, 21, 18][day] ?? null,
  ideal: Math.round((30 - (30 / 9) * day) * 10) / 10,
}));

/**
 * Constant WEEK_DAYS
 *
 * @description
 * Created and completed task data by weekday.
 *
 * @type {CwChartDatum[]}
 */
const WEEK_DAYS: CwChartDatum[] = [
  { day: 'L', created: 5, done: 4 },
  { day: 'M', created: 8, done: 6 },
  { day: 'M', created: 6, done: 7 },
  { day: 'J', created: 9, done: 6 },
  { day: 'V', created: 7, done: 8 },
  { day: 'S', created: 3, done: 2 },
  { day: 'D', created: 2, done: 1 },
];

/**
 * Constant LOAD
 *
 * @description
 * Open task counts per person.
 *
 * @type {CwChartDatum[]}
 */
const LOAD: CwChartDatum[] = [
  { person: 'Léa M.', open: 9 },
  { person: 'Karim B.', open: 7 },
  { person: 'Inès D.', open: 5 },
  { person: 'Samuel R.', open: 3 },
];

/**
 * Constant STATUSES
 *
 * @description
 * Task counts by status for the sample sprint.
 *
 * @type {CwChartDatum[]}
 */
const STATUSES: CwChartDatum[] = [
  { sprint: 'Sprint 14', done: 12, progress: 6, blocked: 2, todo: 8 },
];

/**
 * Constant STATUS_SERIES
 *
 * @description
 * Series displayed in the status ring chart.
 *
 * @type {CwChartSeries[]}
 */
const STATUS_SERIES: CwChartSeries[] = [
  { key: 'done', label: 'Terminé', color: 'chart-2' },
  { key: 'progress', label: 'En cours', color: 'chart-3' },
  { key: 'blocked', label: 'Bloqué', color: 'chart-4' },
  { key: 'todo', label: 'À faire', color: 'chart-5' },
];

/**
 * Constant CARD
 *
 * @description
 * Classes for dashboard-style chart cards.
 *
 * @type {string}
 */
const CARD: string =
  'flex w-80 max-w-full flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground';

/**
 * Function card
 *
 * @description
 * Builds a dashboard card around a chart template.
 *
 * @param {string} title - Card heading.
 * @param {string} description - Card description.
 * @param {string} chart - Chart template markup.
 * @returns {string} Dashboard card markup.
 */
function card(title: string, description: string, chart: string): string {
  return `
    <div class="${CARD}">
      <div class="grid gap-0.5">
        <div class="truncate text-sm font-medium">${title}</div>
        <div class="truncate text-xs text-muted-foreground">${description}</div>
      </div>
      ${chart}
    </div>`;
}

/** Grouped bars; ← → move the active category, its band and the tooltip follow. */
export const Bar: Story = {
  render: () => ({
    props: { data: WEEKS, series: DONE_LATE, week: (x: string) => `Semaine ${x.slice(1)}` },
    template: card(
      'Tâches par semaine',
      'Espace Produit, 6 semaines',
      `<cw-chart [data]="data" x="week" [series]="series" [categoryFormat]="week"
                 ariaLabel="Tâches terminées et en retard par semaine, de S41 à S46" />`,
    ),
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const plot: HTMLElement = within(light(canvasElement)).getByRole('img', {
      name: 'Tâches terminées et en retard par semaine, de S41 à S46',
    });
    await userEvent.tab();
    await expect(plot).toHaveFocus();
    await userEvent.keyboard('{End}{ArrowLeft}');
    await expect(plot).toHaveAttribute('data-active', 'S45');
    await expect(light(canvasElement)).toHaveTextContent('Semaine 45 : Terminées 14, En retard 2');
  },
};

/** Stacked bars at size `sm`; a click on a legend item hides its series. */
export const StackedHiddenSeries: Story = {
  render: () => ({
    props: { data: WEEKS, series: OPEN },
    template: card(
      'Tâches ouvertes',
      'Par semaine, empilées',
      `<cw-chart [data]="data" x="week" [series]="series" stacked size="sm"
                 ariaLabel="Tâches terminées, en cours et bloquées par semaine, empilées" />`,
    ),
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const blocked: HTMLElement = within(light(canvasElement)).getByRole('button', {
      name: 'Bloquées',
    });
    await userEvent.click(blocked);
    await expect(blocked).toHaveAttribute('aria-pressed', 'false');
  },
};

/** Horizontal bars on a capacity track: load per person. */
export const Horizontal: Story = {
  render: () => ({
    props: { data: LOAD, series: [{ key: 'open', label: 'Ouvertes', color: 'chart-1' }] },
    template: card(
      'Charge par personne',
      'Tâches ouvertes, capacité 10',
      `<cw-chart [data]="data" x="person" [series]="series" orientation="horizontal" size="sm" [capacity]="10"
                 ariaLabel="Charge par personne : Léa Martin 9, Karim Benali 7, Inès Duval 5, Samuel Roux 3" />`,
    ),
  }),
};

/** Lines, one per series, with a dot on the last reading. */
export const Line: Story = {
  render: () => ({
    props: {
      data: WEEK_DAYS,
      series: [
        { key: 'created', label: 'Créées', color: 'chart-1' },
        { key: 'done', label: 'Terminées', color: 'chart-2' },
      ],
    },
    template: card(
      'Créées et terminées',
      'Semaine 46, par jour',
      `<cw-chart type="line" [data]="data" x="day" [series]="series"
                 ariaLabel="Tâches créées et terminées par jour, semaine 46" />`,
    ),
  }),
};

/** Burndown: the real area and the dashed ideal; the real line stops at today. */
export const AreaBurndown: Story = {
  render: () => ({
    props: {
      data: BURNDOWN,
      series: [
        { key: 'real', label: 'Réel', color: 'chart-1' },
        { key: 'ideal', label: 'Idéal', color: 'chart-5', dashed: true },
      ],
      day: (x: string) => `Jour ${x.slice(1)}`,
    },
    template: card(
      'Burndown — Sprint 14',
      'Tâches restantes, 4–20 nov.',
      `<cw-chart type="area" [data]="data" x="day" [series]="series" [categoryFormat]="day"
                 ariaLabel="Burndown du sprint 14 : 18 tâches restantes au jour 7, contre 10 prévues" />`,
    ),
  }),
};

/** A ring with its total in the center and the legend with values on the right. */
export const Donut: Story = {
  render: () => ({
    props: { data: STATUSES, series: STATUS_SERIES },
    template: card(
      'Tâches par statut',
      'Sprint 14, au 12 nov.',
      `<cw-chart type="donut" [data]="data" x="sprint" [series]="series" unit="tâches"
                 ariaLabel="28 tâches : 12 terminées, 6 en cours, 2 bloquées, 8 à faire" />`,
    ),
  }),
};

/** Loading: skeletons at the size of the plot and the legend, `aria-busy`. */
export const Loading: Story = {
  render: () => ({
    props: { data: [], series: DONE_LATE },
    template: card(
      'Tâches par semaine',
      'Espace Produit, 6 semaines',
      `<cw-chart [data]="data" x="week" [series]="series" loading size="sm" ariaLabel="Tâches par semaine" />`,
    ),
  }),
};

/** Empty: no value on the period. */
export const Empty: Story = {
  render: () => ({
    props: { data: [], series: [{ key: 'done', label: 'Terminées', color: 'chart-2' }] },
    template: card(
      'Tâches terminées',
      'Espace Infra, 7 derniers jours',
      `<cw-chart [data]="data" x="day" [series]="series" size="sm" emptyText="Aucune tâche terminée"
                 emptyDescription="sur la période choisie" ariaLabel="Tâches terminées sur 7 jours" />`,
    ),
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    await expect(light(canvasElement)).toHaveTextContent('Aucune tâche terminée');
  },
};

/** Enter on the active category emits `categorySelect` (open the list filtered on that week). */
export const Keyboard: Story = {
  render: () => ({
    props: { data: WEEKS, series: DONE_LATE, picked: '' },
    template: `
      <div class="grid gap-2">
        ${card(
          'Tâches par semaine',
          'Espace Produit, 6 semaines',
          `<cw-chart [data]="data" x="week" [series]="series" size="sm" (categorySelect)="picked = $event.x"
                     ariaLabel="Tâches terminées et en retard par semaine, de S41 à S46" />`,
        )}
        <span class="text-sm text-muted-foreground" role="status">Choisie : {{ picked || '—' }}</span>
      </div>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: { getByRole: (role: string) => HTMLElement } = within(light(canvasElement));
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}{Enter}');
    await expect(scope.getByRole('status')).toHaveTextContent('Choisie : S42');
  },
};
