import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwInlineEdit } from './inline-edit.component';

/**
 * Inline Edit, every state of its sheet in the Design System artifact, in the light and the dark
 * theme. Copy from the mockup (`App.dc.html`, task panel title).
 */
const meta: Meta = {
  title: 'UI/InlineEdit',
  decorators: [moduleMetadata({ imports: [CwInlineEdit] })],
};

export default meta;

type Story = StoryObj;

function light(canvasElement: HTMLElement): HTMLElement {
  const scope = canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

/** Reading: the bare text in its context size; the pencil shows on hover and focus. */
export const Reading: Story = {
  render: () => ({
    template: `
      <div class="grid w-80 gap-3">
        <p class="text-2xl font-semibold tracking-tight"><cw-inline-edit value="Sprint 14" ariaLabel="Nom du sprint" /></p>
        <p class="text-lg font-semibold"><cw-inline-edit value="Corriger l'export CSV des tâches" ariaLabel="Titre de la tâche" /></p>
        <p class="text-sm font-medium"><cw-inline-edit value="En revue" ariaLabel="Nom de la colonne" /></p>
      </div>`,
  }),
};

/** Empty: the placeholder in muted ink. */
export const Empty: Story = {
  render: () => ({
    template: `
      <p class="w-80 text-sm">
        <cw-inline-edit placeholder="Ajouter une description…" ariaLabel="Description" />
      </p>`,
  }),
};

/** Editing: the field at the same place, text selected, the help line in keys. */
export const Editing: Story = {
  render: () => ({
    template: `
      <p class="w-80 text-lg font-semibold">
        <cw-inline-edit value="Corriger l'export CSV des tâches (UTF-8)" [editing]="true" ariaLabel="Titre de la tâche" />
      </p>`,
  }),
};

/** Saving: the text with the spinner and « Enregistrement… », `aria-busy`, not clickable. */
export const Saving: Story = {
  render: () => ({
    template: `
      <p class="w-80 text-lg font-semibold">
        <cw-inline-edit value="Corriger l'export CSV des tâches" saving ariaLabel="Titre de la tâche" />
      </p>`,
  }),
};

/** Error: the field stays open, `aria-invalid`, the message under it. */
export const ServerError: Story = {
  render: () => ({
    template: `
      <p class="w-80 text-lg font-semibold">
        <cw-inline-edit value="" required placeholder="Titre de la tâche" ariaLabel="Titre de la tâche"
          [editing]="true" error="Le titre ne peut pas être vide." />
      </p>`,
  }),
};

/** Read-only: bare text, no hover nor pencil, a lock. */
export const ReadOnly: Story = {
  render: () => ({
    template: `
      <p class="w-80 text-lg font-semibold">
        <cw-inline-edit value="Rédiger la doc d'installation Docker" readonly />
      </p>`,
  }),
};

/** Multiline: a textarea that grows; Ctrl + Enter validates. */
export const Multiline: Story = {
  render: () => ({
    template: `
      <div class="grid w-80 gap-4 text-sm">
        <cw-inline-edit multiline ariaLabel="Description"
          value="L'export coupe les accents des titres. Forcer l'UTF-8 avec BOM pour Excel." />
        <cw-inline-edit multiline [editing]="true" ariaLabel="Description de la liste"
          value="L'export coupe les accents des titres. Forcer l'UTF-8 avec BOM pour Excel, et garder la virgule comme séparateur." />
      </div>`,
  }),
};

/** Keyboard: Enter opens the field, typing and Enter validate, the focus returns to the text. */
export const Keyboard: Story = {
  render: () => ({
    props: { saved: '' },
    template: `
      <div class="grid w-80 gap-2">
        <p class="text-lg font-semibold">
          <cw-inline-edit value="Corriger l'export CSV" ariaLabel="Titre de la tâche" (save)="saved = $event" />
        </p>
        <p class="text-xs text-muted-foreground" role="status">{{ saved }}</p>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    const read = scope.getByRole('button', { name: "Corriger l'export CSV" });

    await userEvent.click(read);
    const input = scope.getByRole('textbox', { name: 'Titre de la tâche' });
    await expect(input).toHaveFocus();
    await userEvent.keyboard('{End} des tâches{Enter}');
    await expect(scope.getByRole('status')).toHaveTextContent("Corriger l'export CSV des tâches");
    await expect(
      scope.getByRole('button', { name: "Corriger l'export CSV des tâches" }),
    ).toHaveFocus();
  },
};
