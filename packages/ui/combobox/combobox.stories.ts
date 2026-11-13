import { CwAvatar } from '@cadenway/ui/avatar';
import { CwField, CwFieldError, CwFieldLabel } from '@cadenway/ui/field';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { CwComboboxEmpty } from './combobox-empty/combobox-empty.component';
import { CwComboboxGroup } from './combobox-group/combobox-group.component';
import { CwComboboxOption } from './combobox-option/combobox-option.component';
import { CwCombobox } from './combobox.component';

/**
 * Combobox, every state of its sheet in the Design System artifact, in the light and the dark
 * theme. The panel is a native popover inserted next to its trigger, so it takes the theme of its
 * scope. Copy from the sheet's preview (assignees, labels, invitation).
 */
const meta: Meta = {
  title: 'UI/Combobox',
  decorators: [
    moduleMetadata({
      imports: [
        CwCombobox,
        CwComboboxGroup,
        CwComboboxOption,
        CwComboboxEmpty,
        CwAvatar,
        CwField,
        CwFieldLabel,
        CwFieldError,
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

const PEOPLE = `
  <cw-combobox-group label="Équipe Produit">
    <cw-combobox-option value="lea" [keywords]="['lea.martin@cadenway.fr']"><cw-avatar name="Léa Martin" size="xs" /> Léa Martin</cw-combobox-option>
    <cw-combobox-option value="karim"><cw-avatar name="Karim Benali" size="xs" /> Karim Benali</cw-combobox-option>
    <cw-combobox-option value="ines"><cw-avatar name="Inès Duval" size="xs" /> Inès Duval</cw-combobox-option>
  </cw-combobox-group>
  <cw-combobox-group label="Autres membres">
    <cw-combobox-option value="leo"><cw-avatar name="Léo Garnier" size="xs" /> Léo Garnier</cw-combobox-option>
    <cw-combobox-option value="samuel" disabled><cw-avatar name="Samuel Roux" size="xs" /> Samuel Roux</cw-combobox-option>
  </cw-combobox-group>`;

const LABELS = `
  <cw-combobox-option value="web">Mobile web</cw-combobox-option>
  <cw-combobox-option value="app">Application mobile</cw-combobox-option>
  <cw-combobox-option value="api">API publique</cw-combobox-option>`;

const people = (count: number): string => `${String(count)} personnes`;

/** Closed: empty, one value, several values, disabled, and in error inside a field. */
export const States: Story = {
  render: () => ({
    props: { people },
    template: `
      <div class="grid w-full max-w-md grid-cols-2 gap-x-3 gap-y-3">
        <cw-combobox multiple placeholder="Assigner" ariaLabel="Assignés (vide)">${PEOPLE}</cw-combobox>
        <cw-combobox value="lea" ariaLabel="Responsable">${PEOPLE}</cw-combobox>
        <cw-combobox multiple [value]="['lea', 'karim', 'ines']" [summary]="people" ariaLabel="Assignés">${PEOPLE}</cw-combobox>
        <cw-combobox value="karim" disabled ariaLabel="Responsable indisponible">${PEOPLE}</cw-combobox>
        <cw-field invalid>
          <label cwFieldLabel>Responsable</label>
          <cw-combobox placeholder="Choisir une personne">${PEOPLE}</cw-combobox>
          <cw-field-error>Un responsable est requis.</cw-field-error>
        </cw-field>
      </div>`,
  }),
};

/** The trigger in `sm`, `default` and `lg`; the search field of the panel stays 36 px. */
export const Sizes: Story = {
  render: () => ({
    props: { count: (value: number) => String(value) },
    template: `
      <div class="flex items-end gap-3">
        <cw-combobox class="w-28" size="sm" multiple [value]="['lea', 'karim']" [summary]="count" ariaLabel="Assignés (sm)">${PEOPLE}</cw-combobox>
        <cw-combobox class="w-28" multiple [value]="['lea', 'karim']" [summary]="count" ariaLabel="Assignés (default)">${PEOPLE}</cw-combobox>
        <cw-combobox class="w-28" size="lg" multiple [value]="['lea', 'karim']" [summary]="count" ariaLabel="Assignés (lg)">${PEOPLE}</cw-combobox>
      </div>`,
  }),
};

/** Open in `multiple`: groups, two people ticked, a disabled one with its mention. */
export const MultipleGrouped: Story = {
  render: () => ({
    props: { people },
    template: `
      <div class="h-96 w-56">
        <cw-combobox multiple [open]="true" [value]="['lea', 'karim']" [summary]="people"
                     searchPlaceholder="Rechercher une personne…" ariaLabel="Assignés">${PEOPLE}</cw-combobox>
      </div>`,
  }),
};

/** Server search in progress: the spinner and « Recherche… » replace the list. */
export const Loading: Story = {
  render: () => ({
    template: `
      <div class="h-32 w-56">
        <cw-combobox multiple loading [open]="true" searchPlaceholder="Rechercher une personne…" ariaLabel="Assignés" />
      </div>`,
  }),
};

/** A search without result offers the invitation, the empty message quoting the search. */
export const NoResultInvite: Story = {
  render: () => ({
    props: {
      empty: (query: string) => `Aucun résultat pour « ${query} ».`,
      invite: (query: string) => `Inviter « ${query} » par e-mail`,
    },
    template: `
      <div class="h-72 w-56">
        <cw-combobox multiple creatable [emptyText]="empty" [createLabel]="invite"
                     searchPlaceholder="Rechercher une personne…" ariaLabel="Assignés">${PEOPLE}</cw-combobox>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(light(canvasElement)).getByRole('combobox', { name: 'Assignés' }));
    await userEvent.keyboard('zoé');
    const listbox = within(document.body).getByRole('listbox', { name: 'Assignés' });
    // The panel fades in for 300 ms (`animate-menu-in`): it starts at opacity 0.
    await waitFor(() =>
      expect(
        within(listbox).getByRole('option', { name: 'Inviter « zoé » par e-mail' }),
      ).toBeVisible(),
    );
    await expect(within(document.body).getByText('Aucun résultat pour « zoé ».')).toBeVisible();
  },
};

/** Labels: the search highlights matches and offers to create the exact text typed. */
export const SearchAndCreate: Story = {
  render: () => ({
    props: { create: (query: string) => `Créer l'étiquette « ${query} »` },
    template: `
      <div class="h-56 w-56">
        <cw-combobox multiple creatable [value]="['app']" [createLabel]="create"
                     searchPlaceholder="Rechercher une étiquette…" ariaLabel="Étiquettes">${LABELS}</cw-combobox>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(light(canvasElement)).getByRole('combobox', { name: 'Étiquettes' }),
    );
    await userEvent.keyboard('mobile');
    const listbox = within(document.body).getByRole('listbox', { name: 'Étiquettes' });
    await expect(within(listbox).getAllByRole('option')).toHaveLength(3);
    // The panel fades in for 300 ms (`animate-menu-in`): it starts at opacity 0.
    await waitFor(() =>
      expect(
        within(listbox).getByRole('option', { name: "Créer l'étiquette « mobile »" }),
      ).toBeVisible(),
    );
  },
};

/** ↓ opens with the focus in the search; typing filters; Enter chooses and closes; Escape clears. */
export const Keyboard: Story = {
  render: () => ({
    template: `
      <div class="h-96 w-56">
        <cw-combobox placeholder="Choisir une personne" searchPlaceholder="Rechercher une personne…" ariaLabel="Responsable">${PEOPLE}</cw-combobox>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const trigger = within(light(canvasElement)).getByRole('combobox', { name: 'Responsable' });
    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}');
    const search = within(document.body).getByRole('combobox', {
      name: 'Rechercher une personne…',
    });
    await waitFor(() => expect(search).toHaveFocus());

    await userEvent.keyboard('ines');
    const listbox = within(document.body).getByRole('listbox', { name: 'Responsable' });
    const ines = within(listbox).getByRole('option', { name: /Inès Duval/ });
    await expect(search).toHaveAttribute('aria-activedescendant', ines.id);

    await userEvent.keyboard('{Enter}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(trigger).toHaveTextContent('Inès Duval'));
    await expect(trigger).toHaveFocus();
  },
};
