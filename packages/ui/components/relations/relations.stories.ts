import { CwStatusIcon } from '@cadenway/ui/components/status-icon';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwRelationLeading } from './relation-leading/relation-leading.directive';
import { CwRelationPicker } from './relation-picker/relation-picker.component';
import { CwRelations } from './relations.component';
import type {
  CwRelation,
  CwRelationItem,
  CwRelationPerson,
  CwRelationType,
} from './relations.types';

/**
 * Constant meta
 *
 * @description
 * Relations in the light and dark themes, covering the design system sheet.
 * The relation types, tasks and statuses are the consumer's data, taken from the sheet's
 * preview and the mockup (`App.dc.html`).
 *
 * @type {Meta}
 */
const meta: Meta = {
  title: 'UI/Relations',
  decorators: [
    moduleMetadata({ imports: [CwRelations, CwRelationPicker, CwRelationLeading, CwStatusIcon] }),
  ],
};

export default meta;

/**
 * Type Story
 *
 * @description
 * Storybook configuration for relation examples.
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
 * Constant TYPES
 *
 * @description
 * Relation types displayed by the example list and picker.
 *
 * @type {CwRelationType[]}
 */
const TYPES: CwRelationType[] = [
  { id: 'parent', label: 'Tâche parente' },
  { id: 'blocked-by', label: 'Bloquée par' },
  { id: 'blocks', label: 'Bloque' },
  { id: 'related', label: 'Liée à' },
  { id: 'duplicate-of', label: 'Doublon de' },
];

/**
 * Interface Task
 *
 * @description
 * Example relation item with the status used by its leading icon.
 */
interface Task extends CwRelationItem {
  // #region Properties
  /**
   * Property status
   *
   * @description
   * Status key used by the projected icon.
   *
   * @type {string}
   * @readonly
   */
  readonly status: string;
  // #endregion
}

/**
 * Constant lea
 *
 * @description
 * Example assignee Léa Martin.
 *
 * @type {CwRelationPerson}
 */
const lea: CwRelationPerson = { name: 'Léa Martin' };

/**
 * Constant karim
 *
 * @description
 * Example assignee Karim Benali.
 *
 * @type {CwRelationPerson}
 */
const karim: CwRelationPerson = { name: 'Karim Benali' };

/**
 * Constant ines
 *
 * @description
 * Example assignee Inès Duval.
 *
 * @type {CwRelationPerson}
 */
const ines: CwRelationPerson = { name: 'Inès Duval' };

/**
 * Constant samuel
 *
 * @description
 * Example assignee Samuel Roux.
 *
 * @type {CwRelationPerson}
 */
const samuel: CwRelationPerson = { name: 'Samuel Roux' };

/**
 * Constant RELATIONS
 *
 * @description
 * Example relations grouped by type in the stories.
 *
 * @type {CwRelation[]}
 */
const RELATIONS: CwRelation[] = [
  {
    id: '1',
    type: 'parent',
    item: {
      id: 'CAD-470',
      reference: 'CAD-470',
      title: 'Refonte des exports',
      href: '#CAD-470',
      assignee: lea,
      status: 'progress',
    } as Task,
  },
  {
    id: '2',
    type: 'blocked-by',
    item: {
      id: 'CAD-471',
      reference: 'CAD-471',
      title: 'Migrer les pièces jointes vers un stockage compatible S3',
      href: '#CAD-471',
      assignee: karim,
      status: 'blocked',
    } as Task,
    warning: 'Non terminée',
  },
  {
    id: '3',
    type: 'blocked-by',
    item: {
      id: 'CAD-468',
      reference: 'CAD-468',
      title: 'Mettre à jour la bibliothèque CSV',
      href: '#CAD-468',
      assignee: samuel,
      status: 'done',
    } as Task,
  },
  {
    id: '4',
    type: 'blocks',
    item: {
      id: 'CAD-488',
      reference: 'CAD-488',
      title: 'Importer les espaces depuis un export JSON',
      href: '#CAD-488',
      assignee: ines,
      status: 'todo',
    } as Task,
  },
  {
    id: '5',
    type: 'related',
    item: {
      id: 'SUP-2291',
      reference: 'SUP-2291',
      title: 'Export illisible dans Excel',
      href: '#SUP-2291',
      path: 'Support › Tickets',
      assignee: samuel,
      status: 'todo',
    } as Task,
  },
  {
    id: '6',
    type: 'duplicate-of',
    item: {
      id: 'CAD-455',
      reference: 'CAD-455',
      title: "Accents perdus dans l'export CSV",
      href: '#CAD-455',
      assignee: lea,
      status: 'done',
    } as Task,
  },
];

/**
 * Constant RESULTS
 *
 * @description
 * Example search results supplied to the relation picker.
 *
 * @type {Task[]}
 */
const RESULTS: Task[] = [
  { id: 'CAD-479', reference: 'CAD-479', title: 'Maquetter la vue Calendrier', status: 'progress' },
  { id: 'CAD-471', reference: 'CAD-471', title: 'Migrer les pièces jointes', status: 'blocked' },
  {
    id: 'SUP-2291',
    reference: 'SUP-2291',
    title: 'Export illisible dans Excel',
    path: 'Support › Tickets',
    status: 'todo',
  },
];

/**
 * Constant LEADING
 *
 * @description
 * Projected status-icon template used before relation items.
 *
 * @type {string}
 */
const LEADING: string = `
  <ng-template cwRelationLeading let-item>
    <cw-status-icon [status]="item.status" />
  </ng-template>`;

/** Groups in order, a blocking item not done (« Non terminée »), an item of another space. */
export const Groups: Story = {
  render: () => ({
    props: { types: TYPES, relations: RELATIONS, results: RESULTS },
    template: `<cw-relations class="w-full max-w-md" [types]="types" [relations]="relations" [results]="results">${LEADING}</cw-relations>`,
  }),
};

/** No relation: « Aucune relation. » and « Ajouter une relation ». */
export const Empty: Story = {
  render: () => ({
    props: { types: TYPES },
    template: `<cw-relations class="w-full max-w-md" [types]="types" />`,
  }),
};

/** Read-only: no addition, no menu. */
export const ReadOnly: Story = {
  render: () => ({
    props: { types: TYPES, relations: RELATIONS },
    template: `<cw-relations class="w-full max-w-md" readonly [types]="types" [relations]="relations">${LEADING}</cw-relations>`,
  }),
};

/** The picker alone: the type, then the search among the results. */
export const Picker: Story = {
  render: () => ({
    props: { types: TYPES, results: RESULTS, linked: ['CAD-471'] },
    template: `
      <cw-relation-picker class="w-80" [types]="types" defaultType="blocks" [results]="results" [linkedIds]="linked">
        ${LEADING}
      </cw-relation-picker>`,
  }),
};

/** Keyboard: Tab reaches a title, Shift + F10 opens its menu, Escape closes it. */
export const Keyboard: Story = {
  render: () => ({
    props: { types: TYPES, relations: RELATIONS.slice(0, 2) },
    template: `<cw-relations class="w-full max-w-md" [types]="types" [relations]="relations">${LEADING}</cw-relations>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: { getByRole: (role: string, options: { name: string }) => HTMLElement } = within(
      light(canvasElement),
    );
    const title: HTMLElement = scope.getByRole('link', { name: 'Refonte des exports' });
    title.focus();
    await userEvent.keyboard('{Shift>}{F10}{/Shift}');
    const more: HTMLElement = scope.getByRole('button', { name: 'Actions de la relation CAD-470' });
    await expect(more).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{Escape}');
    await expect(more).toHaveAttribute('aria-expanded', 'false');
    await Promise.allSettled(document.getAnimations().map((animation) => animation.finished));
  },
};
