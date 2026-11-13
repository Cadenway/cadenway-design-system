import { CwAvatar } from '@cadenway/ui/avatar';
import { CwStatusIcon } from '@cadenway/ui/status-icon';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorCalendarBold,
  phosphorCellSignalHighBold,
  phosphorCircleHalfBold,
  phosphorTagBold,
  phosphorUserBold,
} from '@ng-icons/phosphor-icons/bold';
import {
  type Meta,
  type StoryObj,
  applicationConfig,
  moduleMetadata,
} from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { CwFilterBar } from './filter-bar.component';
import type { CwFilter, CwFilterBarLabels, CwFilterField, CwSavedFilter } from './filter-bar.types';
import { CwFilterChip } from './filter-chip/filter-chip.component';
import { CwFilterOptionDef } from './filter-option/filter-option.directive';

/**
 * Filter Bar (Filter Bar sheet of the Design System artifact), in the light and the dark theme. The
 * fields are the mockup's (`App.dc.html`: Statut, Priorité, Assigné, Échéance, Étiquette), given
 * as data like an app would: the bar itself knows none of them. Status icons and avatars come
 * from `ng-template[cwFilterOption]`.
 */
const meta: Meta = {
  title: 'UI/FilterBar',
  decorators: [
    moduleMetadata({
      imports: [CwFilterBar, CwFilterChip, CwFilterOptionDef, CwStatusIcon, CwAvatar, NgIcon],
    }),
    applicationConfig({
      providers: [
        provideIcons({
          phosphorCalendarBold,
          phosphorCellSignalHighBold,
          phosphorCircleHalfBold,
          phosphorTagBold,
          phosphorUserBold,
        }),
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

const IS = { value: 'is', label: 'est' };
const IS_NOT = { value: 'not', label: 'n’est pas' };

const FIELDS: CwFilterField[] = [
  {
    key: 'status',
    label: 'Statut',
    icon: 'phosphorCircleHalfBold',
    type: 'status',
    operators: [IS, IS_NOT],
    options: [
      { value: 'todo', label: 'À faire' },
      { value: 'progress', label: 'En cours' },
      { value: 'review', label: 'En revue' },
      { value: 'waiting', label: 'En attente' },
      { value: 'blocked', label: 'Bloqué' },
      { value: 'done', label: 'Terminé' },
    ],
  },
  {
    key: 'priority',
    label: 'Priorité',
    icon: 'phosphorCellSignalHighBold',
    type: 'select',
    operators: [IS, IS_NOT],
    options: [
      { value: 'urgente', label: 'Urgente' },
      { value: 'haute', label: 'Haute' },
      { value: 'moyenne', label: 'Moyenne' },
      { value: 'basse', label: 'Basse' },
    ],
  },
  {
    key: 'people',
    label: 'Assigné',
    icon: 'phosphorUserBold',
    type: 'person',
    operators: [IS, IS_NOT],
    options: [
      { value: 'CM', label: 'Moi' },
      { value: 'IR', label: 'Inès Robert' },
      { value: 'HD', label: 'Hugo Dubois' },
      { value: 'LP', label: 'Léa Petit' },
    ],
    manyLabel: (count) => `${String(count)} personnes`,
  },
  {
    key: 'due',
    label: 'Échéance',
    icon: 'phosphorCalendarBold',
    type: 'date',
    operators: [
      { value: 'before', label: 'avant le' },
      { value: 'after', label: 'après le' },
    ],
  },
  {
    key: 'labels',
    label: 'Étiquette',
    icon: 'phosphorTagBold',
    type: 'select',
    operators: [IS, { value: 'empty', label: 'est vide', valueless: true }],
    options: [
      { value: 'bug', label: 'bug' },
      { value: 'design', label: 'design' },
    ],
  },
];

const SPRINT: CwFilter[] = [
  { field: 'status', operator: 'is', value: ['progress', 'blocked'] },
  { field: 'people', operator: 'is', value: ['CM'] },
  { field: 'due', operator: 'before', value: '2026-11-30' },
];

const SAVED: CwSavedFilter[] = [
  {
    id: 'late',
    label: 'Mes tâches en retard',
    filters: [{ field: 'people', operator: 'is', value: ['CM'] }],
  },
  { id: 'review', label: 'Revue du sprint', filters: SPRINT },
  {
    id: 'bugs',
    label: 'Bugs urgents',
    filters: [
      { field: 'labels', operator: 'is', value: ['bug'] },
      { field: 'priority', operator: 'is', value: ['urgente'] },
    ],
  },
];

/* The mockup counts tasks (« Aucun filtre · 64 tâches »); the region names differ per theme so
   the two copies of each story keep unique landmarks. */
const total = (count: number): string => `${String(count)} ${count > 1 ? 'tâches' : 'tâche'}`;
const LABELS: Record<'light' | 'dark', Partial<CwFilterBarLabels>> = {
  light: { total },
  dark: { total, region: 'Filtres actifs, thème sombre' },
};

/* Status icons and avatars: the consumer's media for its own fields. */
const MEDIA = `
  <ng-template cwFilterOption="status" let-option>
    <cw-status-icon [status]="option.value" size="3.5" />
  </ng-template>
  <ng-template cwFilterOption="people" let-option>
    <cw-avatar size="xs" [name]="option.label" />
  </ng-template>`;

function bar(attributes: string): string {
  return `
    <cw-filter-bar class="w-full" [fields]="fields" [labels]="labels[cwTheme]" ${attributes}>
      ${MEDIA}
    </cw-filter-bar>`;
}

/** Active filters of the Sprint 14 list view, saved view modified: « Enregistrer la vue » shows. */
export const Active: Story = {
  render: () => ({
    props: { fields: FIELDS, filters: SPRINT, saved: SAVED, labels: LABELS },
    template: bar('[(filters)]="filters" [savedFilters]="saved" dirty'),
  }),
};

/** No filter: « Ajouter un filtre » and the total of the view. */
export const Empty: Story = {
  render: () => ({
    props: { fields: FIELDS, filters: [], labels: LABELS },
    template: bar('[(filters)]="filters" [total]="64"'),
  }),
};

/** Chips alone: at rest, an operator without value, several values summed up. */
export const Chips: Story = {
  render: () => ({
    props: {
      due: FIELDS[3],
      labelsField: FIELDS[4],
      people: FIELDS[2],
      dueFilter: { field: 'due', operator: 'before', value: '2026-11-30' },
      emptyFilter: { field: 'labels', operator: 'empty', value: null },
      peopleFilter: { field: 'people', operator: 'is', value: ['CM', 'IR', 'HD'] },
    },
    template: `
      <div class="flex flex-wrap items-center gap-2">
        <cw-filter-chip [field]="due" [(filter)]="dueFilter" />
        <cw-filter-chip [field]="labelsField" [(filter)]="emptyFilter" />
        <cw-filter-chip [field]="people" [(filter)]="peopleFilter">
          <ng-template cwFilterOption="people" let-option>
            <cw-avatar size="xs" [name]="option.label" />
          </ng-template>
        </cw-filter-chip>
      </div>`,
  }),
};

/** « + Filtre » opens the menu of the fields; choosing one adds its chip and opens its values. */
export const AddFilter: Story = {
  render: () => ({
    props: { fields: FIELDS, filters: [SPRINT[0]], labels: LABELS },
    template: bar('[(filters)]="filters"'),
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    await userEvent.click(scope.getByRole('button', { name: 'Filtre' }));
    const fields = await within(document.body).findByRole('menu', { name: 'Champs' });
    await userEvent.click(within(fields).getByRole('menuitem', { name: 'Priorité' }));

    const chip = await scope.findByRole('group', { name: 'Filtre Priorité' });
    const values = await within(document.body).findByRole('menu', {
      name: 'Valeurs du filtre Priorité',
    });
    await waitFor(() =>
      expect(within(values).getByRole('menuitemcheckbox', { name: 'Urgente' })).toHaveFocus(),
    );
    await userEvent.keyboard(' ');
    await expect(within(chip).getByRole('button', { name: 'Urgente' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect(within(chip).getByRole('button', { name: 'Urgente' })).toHaveFocus();
  },
};

/** The values menu: ticking keeps it open, the segment reads the values in the field's order. */
export const Values: Story = {
  render: () => ({
    props: { fields: FIELDS, filters: [SPRINT[0]], labels: LABELS },
    template: bar('[(filters)]="filters"'),
  }),
  play: async ({ canvasElement }) => {
    const chip = within(light(canvasElement)).getByRole('group', { name: 'Filtre Statut' });
    const value = within(chip).getByRole('button', { name: 'En cours, Bloqué' });
    await userEvent.click(value);
    await expect(value).toHaveAttribute('aria-expanded', 'true');

    const menu = await within(document.body).findByRole('menu', {
      name: 'Valeurs du filtre Statut',
    });
    await userEvent.click(within(menu).getByRole('menuitemcheckbox', { name: 'À faire' }));
    await expect(value).toHaveAttribute('aria-expanded', 'true');
    await expect(value).toHaveTextContent('À faire, En cours, Bloqué');
  },
};

/** Saved filters: the applied one checked; choosing another replaces the filters. */
export const SavedFilters: Story = {
  render: () => ({
    props: { fields: FIELDS, filters: SAVED[0].filters, saved: SAVED, labels: LABELS },
    template: bar('[(filters)]="filters" [savedFilters]="saved"'),
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    await userEvent.click(scope.getByRole('button', { name: 'Mes tâches en retard' }));
    const menu = await within(document.body).findByRole('menu', { name: 'Filtres enregistrés' });
    await expect(
      within(menu).getByRole('menuitem', { name: 'Mes tâches en retard' }),
    ).toHaveAttribute('aria-current', 'true');
    await userEvent.click(within(menu).getByRole('menuitem', { name: 'Revue du sprint' }));
    // The new chips enter with `animate-item-in`: present at once, visible once it ends.
    await expect(await scope.findByRole('group', { name: 'Filtre Échéance' })).toBeInTheDocument();
    await expect(scope.getByRole('button', { name: 'Revue du sprint' })).toBeInTheDocument();
  },
};

/** Keyboard: Backspace on « retirer » removes the filter and the focus goes to the next chip. */
export const Keyboard: Story = {
  render: () => ({
    props: { fields: FIELDS, filters: SPRINT, labels: LABELS },
    template: bar('[(filters)]="filters"'),
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    scope.getByRole('button', { name: 'Retirer le filtre Statut' }).focus();
    await userEvent.keyboard('{Backspace}');

    await waitFor(() => expect(scope.queryByRole('group', { name: 'Filtre Statut' })).toBeNull());
    const people = scope.getByRole('group', { name: 'Filtre Assigné' });
    await expect(within(people).getByRole('button', { name: 'Opérateur : est' })).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    const operators = await within(document.body).findByRole('menu');
    await waitFor(() =>
      expect(within(operators).getByRole('menuitem', { name: 'est' })).toHaveFocus(),
    );
    await userEvent.keyboard('{Escape}');
    await expect(within(people).getByRole('button', { name: 'Opérateur : est' })).toHaveFocus();
  },
};
