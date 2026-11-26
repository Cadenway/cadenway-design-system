import { CwStatusIcon } from '@cadenway/ui/components/status-icon';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwHeatGridChipDef } from './heat-grid-chip/heat-grid-chip.directive';
import { CwHeatGridTotalDef } from './heat-grid-total/heat-grid-total.directive';
import { CwHeatGrid } from './heat-grid.component';
import type { CwHeatGridColumn, CwHeatGridLabels, CwHeatGridRow } from './heat-grid.types';

/**
 * Constant meta
 *
 * @description
 * Heat grid states from the workload view of the mockup (`App.dc.html`), in both themes.
 *
 * @type {Meta}
 */
const meta: Meta = {
  title: 'UI/HeatGrid',
  decorators: [
    moduleMetadata({ imports: [CwHeatGrid, CwHeatGridChipDef, CwHeatGridTotalDef, CwStatusIcon] }),
  ],
};

export default meta;

/**
 * Type Story
 *
 * @description
 * Storybook configuration for heat grid examples.
 *
 * @type {StoryObj}
 */
type Story = StoryObj;

/**
 * Interface Task
 *
 * @description
 * A task chip of the workload example.
 */
interface Task {
  // #region Properties
  /**
   * Property id
   *
   * @description
   * Task key.
   *
   * @type {string}
   * @readonly
   */
  readonly id: string;

  /**
   * Property status
   *
   * @description
   * Status key drawn by the status icon.
   *
   * @type {string}
   * @readonly
   */
  readonly status: string;
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
 * Constant DAYS
 *
 * @description
 * Ten weekdays over two weeks, today on Wednesday 25.
 *
 * @type {readonly CwHeatGridColumn[]}
 */
const DAYS: readonly CwHeatGridColumn[] = [
  ['lun.', 23, 'Lundi'],
  ['mar.', 24, 'Mardi'],
  ['mer.', 25, 'Mercredi'],
  ['jeu.', 26, 'Jeudi'],
  ['ven.', 27, 'Vendredi'],
  ['lun.', 30, 'Lundi'],
  ['mar.', 1, 'Mardi'],
  ['mer.', 2, 'Mercredi'],
  ['jeu.', 3, 'Jeudi'],
  ['ven.', 4, 'Vendredi'],
].map(([caption, day, name]: (string | number)[], index: number) => ({
  key: `d${String(index)}`,
  label: `${String(name)} ${String(day)} ${index < 6 ? 'novembre' : 'décembre'}`,
  caption: String(caption),
  short: String(day),
  current: index === 2,
  groupStart: index === 5,
}));

/**
 * Function load
 *
 * @description
 * Builds the cells of a person from hours per day and the tasks behind them.
 *
 * @param {readonly number[]} hours - Hours for each of the ten days.
 * @param {readonly Task[]} tasks - Tasks spread over the loaded days.
 * @returns {CwHeatGridRow<Task>['cells']} Cells by day key.
 */
function load(hours: readonly number[], tasks: readonly Task[]): CwHeatGridRow<Task>['cells'] {
  return Object.fromEntries(
    hours.map((value, index) => [
      `d${String(index)}`,
      {
        value,
        items: value > 0 ? tasks.slice(0, value > 6 ? 3 : value > 3 ? 2 : 1) : [],
      },
    ]),
  );
}

/**
 * Constant TASKS
 *
 * @description
 * Tasks of the example.
 *
 * @type {readonly Task[]}
 */
const TASKS: readonly Task[] = [
  { id: 'CAD-482', status: 'progress' },
  { id: 'CAD-479', status: 'todo' },
  { id: 'CAD-471', status: 'blocked' },
];

/**
 * Constant PEOPLE
 *
 * @description
 * Four people and the unassigned row (mockup `App.dc.html`, workload).
 *
 * @type {readonly CwHeatGridRow<Task>[]}
 */
const PEOPLE: readonly CwHeatGridRow<Task>[] = [
  {
    key: 'cm',
    label: 'Camille Martin',
    capacity: 60,
    cells: load([6, 7.5, 4, 6, 3, 2, 6, 6, 0, 4], TASKS),
  },
  {
    key: 'ir',
    label: 'Inès Roux',
    capacity: 60,
    cells: load([3, 2, 5.5, 0, 2, 4, 3, 1, 2, 0], TASKS),
  },
  {
    key: 'hd',
    label: 'Hugo Durand',
    capacity: 60,
    cells: load([8, 6, 7, 6, 6, 7, 6, 8, 5, 6], TASKS),
  },
  {
    key: 'lp',
    label: 'Léa Petit',
    capacity: 60,
    cells: load([0, 0, 2, 2, 0, 0, 1, 0, 0, 0], TASKS),
  },
  {
    key: 'none',
    label: 'Non assigné',
    placeholder: true,
    cells: load([0, 2, 0, 0, 3, 0, 0, 0, 1, 0], TASKS),
  },
];

/**
 * Constant TOTAL
 *
 * @description
 * The mockup's total header with the two-week capacity (`App.dc.html`, « Total · 60 h »).
 *
 * @type {Partial<CwHeatGridLabels>}
 */
const TOTAL: Partial<CwHeatGridLabels> = { totalHeader: 'Total · 60 h' };

/* A chip per task: its status and key (mockup `App.dc.html`, workload cells and day popover). */
/**
 * Constant CHIP
 *
 * @description
 * Item template of the examples.
 *
 * @type {string}
 */
const CHIP: string = `
  <ng-template cwHeatGridChip let-task let-placement="placement">
    <button type="button"
            class="flex w-full min-w-0 items-center gap-1 rounded-md border bg-card px-1.5 py-0.5 text-left text-[11px] hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            [class.py-1.5]="placement === 'popover'">
      <cw-status-icon [status]="task.status" size="3" />
      <span class="min-w-0 truncate font-mono">{{ task.id }}</span>
    </button>
  </ng-template>`;

/**
 * Constant PROPS
 *
 * @description
 * Shared props of the examples.
 *
 * @type {{ people: readonly CwHeatGridRow<Task>[]; days: readonly CwHeatGridColumn[]; total: Partial<CwHeatGridLabels>; hours: (value: number) => string }}
 */
const PROPS: {
  people: readonly CwHeatGridRow<Task>[];
  days: readonly CwHeatGridColumn[];
  total: Partial<CwHeatGridLabels>;
  hours: (value: number) => string;
} = {
  people: PEOPLE,
  days: DAYS,
  total: TOTAL,
  hours: (value: number): string => `${new Intl.NumberFormat('fr-FR').format(value)} h`,
};

/** The workload: two weeks of weekdays, today tinted, jade, balise and grenat bars, chips and the totals with their meters. */
export const Workload: Story = {
  render: () => ({
    props: PROPS,
    template: `
      <cw-heat-grid class="h-[28rem] w-full" ariaLabel="Charge de travail du 23 novembre au 4 décembre, capacité 6 h par jour"
                    [rows]="people" [columns]="days" [capacity]="6" [valueFormat]="hours" [labels]="total">
        ${CHIP}
        <ng-template cwHeatGridTotal let-row>
          @if (!row.placeholder) {
            <span class="text-xs text-muted-foreground tabular-nums">Passé : 12 h</span>
          }
        </ng-template>
      </cw-heat-grid>`,
  }),
};

/** A click on a cell opens its day popover: the title, the sum and every task; Escape closes it. */
export const DayPopover: Story = {
  render: () => ({
    props: PROPS,
    template: `
      <cw-heat-grid class="w-full" ariaLabel="Charge de travail" [rows]="people" [columns]="days" [capacity]="6"
                    [valueFormat]="hours" [labels]="total">
        ${CHIP}
      </cw-heat-grid>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const cell: HTMLElement = within(light(canvasElement)).getByRole('gridcell', {
      name: /^Camille Martin, Mardi 24 novembre : 7,5 h sur 6 h, surcharge, 3 tâches/,
    });
    await userEvent.click(cell);
    const dialog: HTMLElement = await within(document.body).findByRole('dialog', {
      name: 'Camille Martin · Mardi 24 novembre',
    });
    await expect(dialog).toHaveTextContent('7,5 h sur 6 h');
    await expect(cell).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{Escape}');
    await expect(cell).toHaveAttribute('aria-expanded', 'false');
  },
};

/** One tab stop: the arrows move between the cells, Enter opens the active day. */
export const Keyboard: Story = {
  render: () => ({
    props: PROPS,
    template: `
      <cw-heat-grid class="w-full" ariaLabel="Charge de travail" [rows]="people" [columns]="days" [capacity]="6"
                    [valueFormat]="hours" [labels]="total">
        ${CHIP}
      </cw-heat-grid>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: HTMLElement = light(canvasElement);
    await userEvent.tab();
    await expect(
      within(scope).getByRole('gridcell', { name: /^Camille Martin, Lundi 23 novembre/ }),
    ).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}{ArrowRight}');
    const target: HTMLElement = within(scope).getByRole('gridcell', {
      name: /^Inès Roux, Mardi 24 novembre/,
    });
    await expect(target).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(target).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{Escape}');
  },
};

/** Without capacity: bars relative to the largest value, no levels and no meters. */
export const WithoutCapacity: Story = {
  render: () => ({
    props: {
      people: PEOPLE.map((person) => ({ ...person, capacity: null })),
      days: DAYS.slice(0, 5),
    },
    template: `
      <cw-heat-grid class="w-full" ariaLabel="Hours per day" [rows]="people" [columns]="days">${CHIP}</cw-heat-grid>`,
  }),
};

/** Loading: skeleton rows under the header, `aria-busy`. */
export const Loading: Story = {
  render: () => ({
    props: PROPS,
    template: `
      <cw-heat-grid class="w-full" ariaLabel="Charge de travail" [rows]="[]" [columns]="days" loading [labels]="total" />`,
  }),
};

/** Empty: no person matches the filters. */
export const Empty: Story = {
  render: () => ({
    props: PROPS,
    template: `
      <cw-heat-grid class="w-full" ariaLabel="Charge de travail" [rows]="[]" [columns]="days" [labels]="total" />`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    await expect(within(light(canvasElement)).getByRole('status')).toHaveTextContent(
      'Aucune tâche ne correspond à la recherche ou aux filtres.',
    );
  },
};
