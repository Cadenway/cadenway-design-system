import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { CwAvatar, CwAvatarGroup } from '@cadenway/ui/components/avatar';
import { CwBadge } from '@cadenway/ui/components/badge';
import {
  CW_PRIORITY_LABELS,
  CwPriorityIcon,
  type CwPriorityKey,
} from '@cadenway/ui/components/priority-icon';

import { CwKanban } from './kanban.component';
import { CwKanbanCardDef } from './kanban-card-def/kanban-card-def.directive';
import { CwKanbanEmptyDef } from './kanban-empty-def/kanban-empty-def.directive';
import { CwKanbanLaneMarkerDef } from './kanban-lane-marker-def/kanban-lane-marker-def.directive';
import type { CwKanbanColumn, CwKanbanLane } from './kanban.types';

/**
 * Constant meta
 *
 * @description
 * Kanban board examples in both themes using mockup task data.
 *
 * @type {Meta}
 */
const meta: Meta = {
  title: 'UI/Kanban',
  decorators: [
    moduleMetadata({
      imports: [
        CwAvatar,
        CwAvatarGroup,
        CwBadge,
        CwKanban,
        CwKanbanCardDef,
        CwKanbanEmptyDef,
        CwKanbanLaneMarkerDef,
        CwPriorityIcon,
      ],
    }),
  ],
};

export default meta;

/**
 * Type Story
 *
 * @description
 * Storybook configuration for kanban examples.
 *
 * @type {StoryObj}
 */
type Story = StoryObj;

/**
 * Interface StoryTask
 *
 * @description
 * Task displayed by the board examples.
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
   * Column identifier of the task.
   *
   * @type {string}
   * @readonly
   */
  readonly status: string;

  /**
   * Property priority
   *
   * @description
   * Task priority used for swimlanes.
   *
   * @type {CwPriorityKey}
   * @readonly
   */
  readonly priority: CwPriorityKey;

  /**
   * Property tags
   *
   * @description
   * Labels displayed on the card.
   *
   * @type {readonly string[]}
   * @readonly
   */
  readonly tags: readonly string[];

  /**
   * Property due
   *
   * @description
   * Displayed due date.
   *
   * @type {string}
   * @readonly
   */
  readonly due: string;

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
   * Property assignees
   *
   * @description
   * Names of assigned people.
   *
   * @type {readonly string[]}
   * @readonly
   */
  readonly assignees: readonly string[];
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
 * Constant columns
 *
 * @description
 * Columns displayed by the board.
 *
 * @type {CwKanbanColumn[]}
 */
const columns: CwKanbanColumn[] = [
  { id: 'todo', label: 'À faire', status: 'todo' },
  { id: 'progress', label: 'En cours', status: 'progress' },
  { id: 'blocked', label: 'Bloqué', status: 'blocked' },
  { id: 'done', label: 'Terminé', status: 'done' },
  { id: 'waiting', label: 'En attente', status: 'waiting' },
];

/**
 * Constant lanes
 *
 * @description
 * Priority swimlanes displayed by the board.
 *
 * @type {CwKanbanLane[]}
 */
const lanes: CwKanbanLane[] = [
  { id: 'urgente', label: 'Urgente' },
  { id: 'haute', label: 'Haute' },
  { id: 'moyenne', label: 'Normale' },
  { id: 'basse', label: 'Basse' },
];

/**
 * Constant tasks
 *
 * @description
 * Sample tasks displayed by the board.
 *
 * @type {StoryTask[]}
 */
const tasks: StoryTask[] = [
  {
    id: 'CAD-488',
    name: 'Importer les espaces depuis un export JSON',
    status: 'todo',
    priority: 'moyenne',
    tags: ['Import'],
    due: '26 nov.',
    assignees: ['Inès Duval', 'Léa Martin', 'Karim Benali', 'Samuel Roux'],
  },
  {
    id: 'CAD-485',
    name: 'Ajouter les notifications par e-mail',
    status: 'todo',
    priority: 'basse',
    tags: [],
    due: '24 nov.',
    assignees: [],
  },
  {
    id: 'CAD-482',
    name: "Corriger l'export CSV des tâches",
    status: 'progress',
    priority: 'haute',
    tags: ['API'],
    due: "Aujourd'hui",
    assignees: ['Léa Martin', 'Karim Benali'],
  },
  {
    id: 'CAD-479',
    name: 'Maquetter la vue Calendrier',
    status: 'progress',
    priority: 'moyenne',
    tags: ['Design'],
    due: '18 nov.',
    assignees: ['Inès Duval'],
  },
  {
    id: 'CAD-471',
    name: 'Migrer les pièces jointes vers un stockage compatible S3',
    status: 'progress',
    priority: 'urgente',
    tags: [],
    due: '9 nov.',
    late: true,
    assignees: ['Karim Benali'],
  },
  {
    id: 'CAD-466',
    name: "Rédiger la doc d'installation Docker",
    status: 'done',
    priority: 'basse',
    tags: ['Docs'],
    due: '7 nov.',
    assignees: ['Léa Martin'],
  },
  {
    id: 'CAD-462',
    name: 'Corriger le tri des sous-tâches',
    status: 'done',
    priority: 'moyenne',
    tags: [],
    due: '5 nov.',
    assignees: ['Samuel Roux'],
  },
  {
    id: 'CAD-458',
    name: 'Valider le contrat du stockage',
    status: 'waiting',
    priority: 'moyenne',
    tags: [],
    due: '30 nov.',
    assignees: ['Inès Duval'],
  },
];

/**
 * Constant accessors
 *
 * @description
 * Functions used to read task fields.
 *
 * @type {{ id: (task: StoryTask) => string; status: (task: StoryTask) => string; priority: (task: StoryTask) => string; label: (task: StoryTask) => string; done: (task: StoryTask) => boolean; }}
 */
const accessors: {
  id: (task: StoryTask) => string;
  status: (task: StoryTask) => string;
  priority: (task: StoryTask) => string;
  label: (task: StoryTask) => string;
  done: (task: StoryTask) => boolean;
} = {
  id: (task: StoryTask): string => task.id,
  status: (task: StoryTask): string => task.status,
  priority: (task: StoryTask): string => task.priority,
  label: (task: StoryTask): string => `${task.id} — ${task.name}`,
  done: (task: StoryTask): boolean => task.status === 'done',
};

/**
 * Constant props
 *
 * @description
 * Shared board data and task accessors.
 *
 * @type {typeof accessors & { columns: CwKanbanColumn[]; lanes: CwKanbanLane[]; tasks: StoryTask[]; limits: { progress: number }; priorityLabels: typeof CW_PRIORITY_LABELS; }}
 */
const props: typeof accessors & {
  columns: CwKanbanColumn[];
  lanes: CwKanbanLane[];
  tasks: StoryTask[];
  limits: { progress: number };
  priorityLabels: typeof CW_PRIORITY_LABELS;
} = {
  columns,
  lanes,
  tasks,
  ...accessors,
  limits: { progress: 2 },
  priorityLabels: CW_PRIORITY_LABELS,
};

/* The card content, as the webapp's task card draws it (mockup `App.dc.html`, vue Tableau). */
/**
 * Constant CARD
 *
 * @description
 * Projected card template with task details.
 *
 * @type {string}
 */
const CARD: string = `
  <ng-template cwKanbanCard [cwKanbanCardOf]="tasks" let-task let-density="density">
    @if (density === 'compact') {
      <p class="min-w-0 flex-1 truncate text-sm font-medium" [class.text-muted-foreground]="task.status === 'done'" [attr.title]="task.name">{{ task.name }}</p>
      <cw-priority-icon [priority]="task.priority" />
      @if (task.assignees[0]; as person) { <cw-avatar size="xs" [name]="person" /> }
    } @else {
      <div class="flex items-center justify-between gap-2">
        <span class="font-mono text-xs text-muted-foreground">{{ task.id }}</span>
        <span class="flex items-center gap-1.5 text-xs text-muted-foreground"><cw-priority-icon [priority]="task.priority" size="3.5" />{{ priorityLabels[task.priority] }}</span>
      </div>
      <p class="line-clamp-2 text-sm font-medium" [class.text-muted-foreground]="task.status === 'done'">{{ task.name }}</p>
      @if (task.tags.length) {
        <div class="flex flex-wrap gap-1">
          @for (tag of task.tags; track tag) { <span cwBadge variant="outline">{{ tag }}</span> }
        </div>
      }
      <div class="flex h-6 items-center gap-2 whitespace-nowrap">
        <span class="text-xs font-medium" [class.text-grenat-text]="task.late" [class.text-muted-foreground]="!task.late">
          {{ task.due }}@if (task.late) {<span class="sr-only"> (en retard)</span>}
        </span>
        <span class="flex-1"></span>
        @if (task.assignees.length) {
          <cw-avatar-group>
            @for (person of task.assignees; track person) { <cw-avatar [name]="person" /> }
          </cw-avatar-group>
        }
      </div>
    }
  </ng-template>`;

/* A region per theme: its name must be unique on the page. */
/**
 * Constant NAME
 *
 * @description
 * Theme-specific accessible name for the board.
 *
 * @type {string}
 */
const NAME: string = `[ariaLabel]="'Tableau de Sprint 14' + (cwTheme === 'dark' ? ', thème sombre' : '')"`;

/** Detailed board: limit of 2 exceeded on « En cours », an empty column, « En attente » folded. */
export const Detailed: Story = {
  render: () => ({
    props: { ...props, collapsed: ['waiting'] },
    template: `
      <cw-kanban ${NAME} [columns]="columns" [items]="tasks" [trackBy]="id" [groupBy]="status"
        [itemLabel]="label" [dimmedBy]="done" [wipLimits]="limits" [columnWidth]="236"
        [collapsedColumns]="collapsed" class="w-full">
        ${CARD}
        <ng-template cwKanbanEmpty><div class="text-sm font-medium">Aucune tâche bloquée</div></ng-template>
      </cw-kanban>`,
  }),
};

/** Compact density: one 34 px line per card. */
export const Compact: Story = {
  render: () => ({
    props,
    template: `
      <cw-kanban ${NAME} density="compact" [columns]="columns" [items]="tasks" [trackBy]="id"
        [groupBy]="status" [itemLabel]="label" [dimmedBy]="done" [wipLimits]="limits"
        [columnWidth]="220" class="w-full">
        ${CARD}
      </cw-kanban>`,
  }),
};

/** A selected card: selected veil and stronger border, its name ends with « sélectionnée ». */
export const Selected: Story = {
  render: () => ({
    props: { ...props, selection: ['CAD-482'] },
    template: `
      <cw-kanban ${NAME} [columns]="columns.slice(0, 2)" [items]="tasks" [trackBy]="id"
        [groupBy]="status" [itemLabel]="label" [(selection)]="selection" class="w-full">
        ${CARD}
      </cw-kanban>`,
  }),
};

/** Swimlanes by priority, compact; the « Haute » lane folded. */
export const Swimlanes: Story = {
  render: () => ({
    props: { ...props, folded: ['haute'] },
    template: `
      <cw-kanban ${NAME} density="compact" [columns]="columns.slice(0, 4)" [items]="tasks"
        [trackBy]="id" [groupBy]="status" [itemLabel]="label" [dimmedBy]="done"
        [lanes]="lanes" [swimlaneBy]="priority" [wipLimits]="limits" [columnWidth]="220"
        [collapsedLanes]="folded" class="w-full">
        ${CARD}
        <ng-template cwKanbanLaneMarker let-lane><cw-priority-icon [priority]="lane.id" /></ng-template>
      </cw-kanban>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: {
      getByRole: (role: string, options?: { name?: string | RegExp }) => HTMLElement;
      findByRole: (role: string, options?: { name?: string | RegExp }) => Promise<HTMLElement>;
      queryByRole: (role: string) => HTMLElement | null;
    } = within(light(canvasElement));
    const haute: HTMLElement = scope.getByRole('button', { name: /^Haute/ });
    await expect(haute).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(haute);
    await expect(haute).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => expect(scope.getByRole('list', { name: 'En cours, Haute' })).toBeVisible());
  },
};

/** Read-only (guests, closed sprint): no dragging, no quick add. */
export const ReadOnly: Story = {
  render: () => ({
    props,
    template: `
      <cw-kanban ${NAME} readonly [columns]="columns.slice(0, 3)" [items]="tasks" [trackBy]="id"
        [groupBy]="status" [itemLabel]="label" class="w-full">
        ${CARD}
      </cw-kanban>`,
  }),
};

/** The quick add opens from « + », creates on Enter, stays open and closes on Escape. */
export const QuickAdd: Story = {
  render: () => ({
    props: { ...props, created: [] as string[] },
    template: `
      <cw-kanban ${NAME} [columns]="columns.slice(0, 2)" [items]="tasks" [trackBy]="id"
        [groupBy]="status" [itemLabel]="label" (created)="created.push($event.title)" class="w-full">
        ${CARD}
      </cw-kanban>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: {
      getByRole: (role: string, options?: { name?: string | RegExp }) => HTMLElement;
      findByRole: (role: string, options?: { name?: string | RegExp }) => Promise<HTMLElement>;
      queryByRole: (role: string) => HTMLElement | null;
    } = within(light(canvasElement));
    await userEvent.click(scope.getByRole('button', { name: 'Ajouter une tâche dans À faire' }));
    const field: HTMLElement = await scope.findByRole('textbox', { name: 'Nom de la tâche' });
    await waitFor(() => expect(field).toHaveFocus());
    await userEvent.type(field, 'Préparer la démo du sprint{Enter}');
    await expect(field).toHaveValue('');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(scope.queryByRole('textbox')).toBeNull());
  },
};

/** Keyboard move: Space grabs, the arrows move, Space drops; the board shows the card moved. */
export const KeyboardMove: Story = {
  render: () => ({
    props,
    template: `
      <cw-kanban ${NAME} [columns]="columns.slice(0, 3)" [items]="tasks" [trackBy]="id"
        [groupBy]="status" [itemLabel]="label" [wipLimits]="limits" class="w-full">
        ${CARD}
      </cw-kanban>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: {
      getByRole: (role: string, options?: { name?: string | RegExp }) => HTMLElement;
      findByRole: (role: string, options?: { name?: string | RegExp }) => Promise<HTMLElement>;
      queryByRole: (role: string) => HTMLElement | null;
    } = within(light(canvasElement));
    const card: HTMLElement = scope.getByRole('article', { name: /^CAD-488/ });
    card.focus();
    await userEvent.keyboard(' ');
    await expect(card).toHaveAttribute('data-grabbed');
    await userEvent.keyboard('{ArrowRight}');
    const blocked: HTMLElement = scope.getByRole('list', { name: 'Bloqué' });
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() =>
      expect(within(blocked).getByRole('article', { name: /^CAD-488/ })).toHaveFocus(),
    );
    await userEvent.keyboard(' ');
    await expect(within(blocked).getByRole('article', { name: /^CAD-488/ })).not.toHaveAttribute(
      'data-grabbed',
    );
  },
};
