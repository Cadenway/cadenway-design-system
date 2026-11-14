import { signal, type WritableSignal } from '@angular/core';
import { CwAvatar } from '@cadenway/ui/components/avatar';
import { CwField, CwFieldError, CwFieldLabel } from '@cadenway/ui/components/field';
import { CwInput } from '@cadenway/ui/components/input';
import { CwStatusIcon } from '@cadenway/ui/components/status-icon';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { CwAutocompleteGroup } from './autocomplete-group/autocomplete-group.component';
import { CwAutocompleteOption } from './autocomplete-option/autocomplete-option.component';
import { CwAutocompleteTrigger } from './autocomplete-trigger/autocomplete-trigger.directive';
import { CwAutocomplete } from './autocomplete.component';

/**
 * Constant meta
 *
 * @description
 * Autocomplete, every state of its sheet in the Design System artifact, in the light and the dark
 * theme. The panel is a native popover inserted next to its field, so it takes the theme of its
 * scope. Copy from the sheet's preview (quick search of tasks, mentions, sprint name).
 *
 * @type {Meta}
 */
const meta: Meta = {
  title: 'UI/Autocomplete',
  decorators: [
    moduleMetadata({
      imports: [
        CwAutocomplete,
        CwAutocompleteGroup,
        CwAutocompleteOption,
        CwAutocompleteTrigger,
        CwInput,
        CwAvatar,
        CwStatusIcon,
        CwField,
        CwFieldLabel,
        CwFieldError,
      ],
    }),
  ],
};

export default meta;

/**
 * Type Story
 *
 * @description
 * Storybook story for autocomplete examples.
 *
 * @type {StoryObj}
 */
type Story = StoryObj;

/**
 * Function light
 *
 * @description
 * Returns the light-theme story container.
 *
 * @param {HTMLElement} canvasElement - Story canvas containing theme scopes.
 *
 * @returns {HTMLElement} Container for the light theme.
 */
function light(canvasElement: HTMLElement): HTMLElement {
  const scope: HTMLElement | null =
    canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

/**
 * Interface Task
 *
 * @description
 * Task suggestion shown in the examples.
 */
interface Task {
  // #region Properties
  /**
   * Property id
   * @readonly
   *
   * @description
   * Task identifier.
   *
   * @type {string}
   */
  readonly id: string;

  /**
   * Property title
   * @readonly
   *
   * @description
   * Task title.
   *
   * @type {string}
   */
  readonly title: string;

  /**
   * Property status
   * @readonly
   *
   * @description
   * Task status.
   *
   * @type {'progress' | 'todo' | 'done'}
   */
  readonly status: 'progress' | 'todo' | 'done';

  /**
   * Property archived
   * @readonly
   *
   * @description
   * Whether the task is archived.
   *
   * @type {boolean}
   */
  readonly archived: boolean;
  // #endregion
}

/**
 * Constant TASKS
 *
 * @description
 * Task suggestions in the examples.
 *
 * @type {readonly Task[]}
 */
const TASKS: readonly Task[] = [
  { id: 'CAD-482', title: "Corriger l'export CSV des tâches", status: 'progress', archived: false },
  { id: 'CAD-493', title: 'Exporter les sprints au format iCal', status: 'todo', archived: false },
  { id: 'CAD-301', title: 'Export Trello (archivée)', status: 'done', archived: true },
];

/**
 * Constant LISTS
 *
 * @description
 * List suggestions in the examples.
 *
 * @type {{ id: string; name: string; team: string }[]}
 */
const LISTS: { id: string; name: string; team: string }[] = [
  { id: 'exports', name: 'Exports et rapports', team: 'Produit' },
];

/**
 * Constant PEOPLE
 *
 * @description
 * People suggestions in the examples.
 *
 * @type {{ id: string; name: string; team: string }[]}
 */
const PEOPLE: { id: string; name: string; team: string }[] = [
  { id: 'lea', name: 'Léa Martin', team: 'Produit' },
  { id: 'leo', name: 'Léo Garnier', team: 'Marketing' },
  { id: 'ines', name: 'Inès Duval', team: 'Produit' },
];

/**
 * Function matching
 *
 * @description
 * Filters suggestions by their text.
 *
 * @param {readonly T[]} items - Suggestions to filter.
 * @param {(item: T) => string} text - Function extracting searchable text from a suggestion.
 * @param {string} query - Text to match without case differences.
 *
 * @returns {T[]} Suggestions whose extracted text includes the query.
 */
function matching<T>(items: readonly T[], text: (item: T) => string, query: string): T[] {
  const folded: string = query.toLowerCase();
  return items.filter((item) => text(item).toLowerCase().includes(folded));
}

/** Rest, free text kept, disabled, and in error inside a field; closed until something is typed. */
export const States: Story = {
  render: () => ({
    template: `
      <div class="grid w-60 gap-3">
        <input cwInput [cwAutocomplete]="rest" placeholder="Rechercher une tâche…" aria-label="Recherche" />
        <cw-autocomplete #rest />
        <input cwInput [cwAutocomplete]="free" value="Revue du sprint 14" aria-label="Nom du sprint" />
        <cw-autocomplete #free />
        <input cwInput [cwAutocomplete]="off" value="Sprint 15" disabled aria-label="Nom du sprint (désactivé)" />
        <cw-autocomplete #off />
        <cw-field invalid>
          <label cwFieldLabel>Mention</label>
          <input cwInput [cwAutocomplete]="error" trigger="@" value="@zoé" />
          <cw-autocomplete #error />
          <cw-field-error>Aucune personne « zoé » ici.</cw-field-error>
        </cw-field>
      </div>`,
  }),
};

/** The field in the three sizes of Input; the panel keeps one size. */
export const Sizes: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-end gap-6">
        <input cwInput size="sm" class="w-56" [cwAutocomplete]="small" placeholder="Rechercher une tâche…" aria-label="Recherche (sm)" />
        <cw-autocomplete #small />
        <input cwInput class="w-56" [cwAutocomplete]="medium" placeholder="Rechercher une tâche…" aria-label="Recherche (default)" />
        <cw-autocomplete #medium />
        <input cwInput size="lg" class="w-56" [cwAutocomplete]="large" placeholder="Rechercher une tâche…" aria-label="Recherche (lg)" />
        <cw-autocomplete #large />
      </div>`,
  }),
};

/** Quick search: tasks and lists in groups, the typed part in bold, a meta on the right. */
export const Grouped: Story = {
  render: () => {
    const query: WritableSignal<string> = signal('');
    return {
      props: {
        query,
        tasks: () => matching(TASKS, (task) => task.title, query()),
        lists: () => matching(LISTS, (list) => list.name, query()),
      },
      template: `
        <div class="h-72 w-88">
          <input cwInput [cwAutocomplete]="search" placeholder="Rechercher une tâche…" aria-label="Recherche" />
          <cw-autocomplete #search (query)="query.set($event)">
            @if (tasks().length) {
              <cw-autocomplete-group label="Tâches">
                @for (task of tasks(); track task.id) {
                  <cw-autocomplete-option [value]="task.id" [label]="task.title" [disabled]="task.archived">
                    <cw-status-icon [status]="task.status" /> {{ task.title }}
                    <span class="ml-auto pl-2 font-mono text-xs text-muted-foreground">{{ task.id }}</span>
                  </cw-autocomplete-option>
                }
              </cw-autocomplete-group>
            }
            @if (lists().length) {
              <cw-autocomplete-group label="Listes">
                @for (list of lists(); track list.id) {
                  <cw-autocomplete-option [value]="list.id" [label]="list.name">
                    {{ list.name }}
                    <span class="ml-auto pl-2 text-xs text-muted-foreground">{{ list.team }}</span>
                  </cw-autocomplete-option>
                }
              </cw-autocomplete-group>
            }
          </cw-autocomplete>
        </div>`,
    };
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const field: HTMLElement = within(light(canvasElement)).getByRole('combobox', {
      name: 'Recherche',
    });
    await userEvent.click(field);
    await expect(field).toHaveAttribute('aria-expanded', 'false');
    await userEvent.keyboard('export');
    await expect(field).toHaveAttribute('aria-expanded', 'true');
    const listbox: HTMLElement = within(document.body).getByRole('listbox', {
      name: 'Suggestions',
    });
    await expect(within(listbox).getAllByRole('group')).toHaveLength(2);
  },
};

/** Mentions: the panel opens after « @ », and choosing replaces the mention only. */
export const Mention: Story = {
  render: () => {
    const query: WritableSignal<string> = signal('');
    return {
      props: { query, people: () => matching(PEOPLE, (person) => person.name, query()) },
      template: `
        <div class="h-48 w-64">
          <input cwInput [cwAutocomplete]="mentions" trigger="@" aria-label="Commentaire" />
          <cw-autocomplete #mentions ariaLabel="Personnes" (query)="query.set($event)">
            @for (person of people(); track person.id) {
              <cw-autocomplete-option [value]="person.id" [label]="person.name">
                <cw-avatar [name]="person.name" size="xs" /> {{ person.name }}
                <span class="ml-auto pl-2 text-xs text-muted-foreground">{{ person.team }}</span>
              </cw-autocomplete-option>
            }
          </cw-autocomplete>
        </div>`,
    };
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const field: HTMLElement = within(light(canvasElement)).getByRole('combobox', {
      name: 'Commentaire',
    });
    await userEvent.click(field);
    await userEvent.keyboard('Merci @Lé');
    await expect(field).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await waitFor(() => expect(field).toHaveValue('Merci @Léa Martin '));
    await expect(field).toHaveAttribute('aria-expanded', 'false');
  },
};

/** A server search in progress: the spinner and « Recherche… ». */
export const Loading: Story = {
  render: () => ({
    template: `
      <div class="h-24 w-60">
        <input cwInput [cwAutocomplete]="search" placeholder="Rechercher une tâche…" aria-label="Recherche" />
        <cw-autocomplete #search loading />
      </div>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    await userEvent.type(
      within(light(canvasElement)).getByRole('combobox', { name: 'Recherche' }),
      'rev',
    );
    // The panel fades in for 300 ms (`animate-menu-in`): it starts at opacity 0.
    await waitFor(() => expect(within(document.body).getByText('Recherche…')).toBeVisible());
  },
};

/** No suggestion: the panel says that Enter keeps the text, and it does. */
export const NoSuggestion: Story = {
  render: () => ({
    template: `
      <div class="h-24 w-60">
        <input cwInput [cwAutocomplete]="sprints" aria-label="Nom du sprint" />
        <cw-autocomplete #sprints />
      </div>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const field: HTMLElement = within(light(canvasElement)).getByRole('combobox', {
      name: 'Nom du sprint',
    });
    await userEvent.type(field, 'Revue Q4');
    await waitFor(() =>
      expect(
        within(document.body).getByText('Aucune suggestion : Entrée garde « Revue Q4 ».'),
      ).toBeVisible(),
    );
    await userEvent.keyboard('{Enter}');
    await expect(field).toHaveValue('Revue Q4');
  },
};
