import { CwField, CwFieldError, CwFieldLabel } from '@cadenway/ui/field';
import { CwPriorityIcon } from '@cadenway/ui/priority-icon';
import { CwStatusIcon } from '@cadenway/ui/status-icon';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { CwSelectEmpty } from './select-empty/select-empty.component';
import { CwSelectGroup } from './select-group/select-group.component';
import { CwSelectOption } from './select-option/select-option.component';
import { CwSelectSeparator } from './select-separator/select-separator.component';
import { CwSelect } from './select.component';

/**
 * Select, every state of its sheet in the Design System artifact, in the light and the dark theme.
 * The panel is a native popover inserted next to its trigger, so it takes the theme of its scope.
 * Copy from the sheet's preview (task panel: status, priority, sprint, destination list).
 */
const meta: Meta = {
  title: 'UI/Select',
  decorators: [
    moduleMetadata({
      imports: [
        CwSelect,
        CwSelectGroup,
        CwSelectOption,
        CwSelectSeparator,
        CwSelectEmpty,
        CwStatusIcon,
        CwPriorityIcon,
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

const STATUS_OPTIONS = `
  <cw-select-group label="Pas commencé">
    <cw-select-option value="todo"><cw-status-icon status="todo" /> À faire</cw-select-option>
    <cw-select-option value="waiting" disabled><cw-status-icon status="waiting" /> En attente</cw-select-option>
  </cw-select-group>
  <cw-select-separator />
  <cw-select-group label="Actif">
    <cw-select-option value="progress"><cw-status-icon status="progress" /> En cours</cw-select-option>
    <cw-select-option value="blocked"><cw-status-icon status="blocked" /> Bloqué</cw-select-option>
  </cw-select-group>
  <cw-select-separator />
  <cw-select-group label="Fermé">
    <cw-select-option value="done"><cw-status-icon status="done" /> Terminé</cw-select-option>
  </cw-select-group>`;

const PRIORITY_OPTIONS = `
  <cw-select-option value="urgente"><cw-priority-icon priority="urgente" /> Urgente</cw-select-option>
  <cw-select-option value="haute"><cw-priority-icon priority="haute" /> Haute</cw-select-option>
  <cw-select-option value="moyenne"><cw-priority-icon priority="moyenne" /> Moyenne</cw-select-option>
  <cw-select-option value="basse"><cw-priority-icon priority="basse" /> Basse</cw-select-option>`;

/** Closed: empty (placeholder), filled (glyph and word), disabled, and in error inside a field. */
export const States: Story = {
  render: () => ({
    template: `
      <div class="grid w-full max-w-md grid-cols-2 gap-x-4 gap-y-3">
        <cw-select placeholder="Choisir un statut" ariaLabel="Statut vide">${STATUS_OPTIONS}</cw-select>
        <cw-select value="progress" ariaLabel="Statut rempli">${STATUS_OPTIONS}</cw-select>
        <cw-select value="done" disabled ariaLabel="Statut indisponible">${STATUS_OPTIONS}</cw-select>
        <cw-field invalid>
          <label cwFieldLabel>Liste</label>
          <cw-select placeholder="Choisir une liste">
            <cw-select-option value="backlog">Backlog</cw-select-option>
          </cw-select>
          <cw-field-error>Choisissez une liste.</cw-field-error>
        </cw-field>
      </div>`,
  }),
};

/** `sm` (28 px, list view cell), `default` (32 px) and `lg` (36 px); the panel keeps one size. */
export const Sizes: Story = {
  render: () => ({
    template: `
      <div class="flex items-end gap-3">
        <cw-select class="w-32" size="sm" value="haute" ariaLabel="Priorité (sm)">${PRIORITY_OPTIONS}</cw-select>
        <cw-select class="w-32" value="haute" ariaLabel="Priorité (default)">${PRIORITY_OPTIONS}</cw-select>
        <cw-select class="w-32" size="lg" value="haute" ariaLabel="Priorité (lg)">${PRIORITY_OPTIONS}</cw-select>
      </div>`,
  }),
};

/** Open: statuses by category, the chosen one checked on the right, a disabled one dimmed. */
export const Grouped: Story = {
  render: () => ({
    template: `
      <div class="h-80 w-52">
        <cw-select value="progress" [open]="true" ariaLabel="Statut">${STATUS_OPTIONS}</cw-select>
      </div>`,
  }),
};

/** Open: the four priorities with the Cadenway bars. */
export const Priority: Story = {
  render: () => ({
    template: `
      <div class="h-56 w-44">
        <cw-select value="haute" [open]="true" ariaLabel="Priorité">${PRIORITY_OPTIONS}</cw-select>
      </div>`,
  }),
};

/** Open without options: the projected message (« Aucun sprint planifié. »). */
export const EmptyList: Story = {
  render: () => ({
    template: `
      <div class="h-32 w-52">
        <cw-select placeholder="Choisir un sprint" [open]="true" ariaLabel="Sprint">
          <cw-select-empty>Aucun sprint planifié.</cw-select-empty>
        </cw-select>
      </div>`,
  }),
};

/** ↓ opens on the chosen option, ↓ skips the disabled one, Enter chooses, Escape closes. */
export const Keyboard: Story = {
  render: () => ({
    template: `
      <div class="h-80 w-52">
        <cw-select value="todo" ariaLabel="Statut">${STATUS_OPTIONS}</cw-select>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const trigger = within(light(canvasElement)).getByRole('combobox', { name: 'Statut' });
    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.keyboard('{ArrowDown}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const listbox = within(document.body).getByRole('listbox', { name: 'Statut' });
    const todo = within(listbox).getByRole('option', { name: 'À faire' });
    await expect(trigger).toHaveAttribute('aria-activedescendant', todo.id);

    await userEvent.keyboard('{ArrowDown}');
    const progress = within(listbox).getByRole('option', { name: 'En cours' });
    await expect(trigger).toHaveAttribute('aria-activedescendant', progress.id);

    await userEvent.keyboard('{Enter}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(trigger).toHaveTextContent('En cours'));
    await expect(trigger).toHaveFocus();
  },
};
