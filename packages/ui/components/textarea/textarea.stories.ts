import { CwField, CwFieldDescription, CwFieldError, CwFieldLabel } from '@cadenway/ui/field';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwTextarea } from './textarea.directive';

/**
 * Textarea, every state of its sheet in the Design System artifact, in the light and the dark theme.
 * Labels, help and errors come from `cw-field`, which wires the ids. Copy from the sheet and the
 * mockup (task panel of `App.dc.html`).
 */
const meta: Meta = {
  title: 'UI/Textarea',
  decorators: [
    moduleMetadata({
      imports: [CwTextarea, CwField, CwFieldDescription, CwFieldError, CwFieldLabel],
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

/** Rest, filled with help and counter, read-only, disabled and in error. */
export const States: Story = {
  render: () => ({
    template: `
      <div class="grid w-96 gap-5">
        <cw-field>
          <label cwFieldLabel>Description</label>
          <textarea cwTextarea placeholder="Ajoutez du contexte, des liens, des critères d'acceptation…"></textarea>
        </cw-field>
        <cw-field>
          <label cwFieldLabel>Description de la correction</label>
          <textarea cwTextarea maxlength="5000">L'export CSV perd les accents dans les noms de colonnes. Forcer l'UTF-8 avec BOM pour qu'Excel les lise correctement.</textarea>
          <div class="flex justify-between gap-2">
            <cw-field-description>Markdown accepté.</cw-field-description>
            <span class="text-xs text-muted-foreground tabular-nums">118 / 5 000</span>
          </div>
        </cw-field>
        <cw-field>
          <label cwFieldLabel>Description d'origine</label>
          <textarea cwTextarea readonly>Importée depuis Trello le 3 nov. 2026.</textarea>
          <cw-field-description>Conservée telle quelle après l'import.</cw-field-description>
        </cw-field>
        <cw-field disabled>
          <label cwFieldLabel>Message d'automatisation</label>
          <textarea cwTextarea disabled [value]="'La tâche {nom} est passée à Terminé.'"></textarea>
        </cw-field>
        <cw-field invalid>
          <label cwFieldLabel>Motif du blocage</label>
          <textarea cwTextarea placeholder="Ce qui empêche d'avancer"></textarea>
          <cw-field-error>Expliquez ce qui bloque la tâche.</cw-field-error>
        </cw-field>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const reason = within(light(canvasElement)).getByLabelText('Motif du blocage');

    await expect(reason).toHaveAttribute('aria-invalid', 'true');
    await expect(reason).toHaveAccessibleDescription('Expliquez ce qui bloque la tâche.');
  },
};

/** `autoResize` off: the height comes from `rows`. */
export const FixedHeight: Story = {
  render: () => ({
    template: `
      <cw-field class="w-96">
        <label cwFieldLabel>Note de version</label>
        <textarea cwTextarea [autoResize]="false" rows="4">Export CSV : les accents sont conservés.</textarea>
      </cw-field>`,
  }),
};

/** Tab enters the field, Enter inserts a line, the height follows the lines. */
export const Keyboard: Story = {
  render: () => ({
    template: `
      <cw-field class="w-96">
        <label cwFieldLabel>Motif du blocage</label>
        <textarea cwTextarea></textarea>
      </cw-field>`,
  }),
  play: async ({ canvasElement }) => {
    const reason = within(light(canvasElement)).getByLabelText('Motif du blocage');

    await userEvent.tab();
    await expect(reason).toHaveFocus();
    await userEvent.keyboard('En attente de la revue{Enter}de sécurité.');
    await expect(reason).toHaveValue('En attente de la revue\nde sécurité.');
  },
};
