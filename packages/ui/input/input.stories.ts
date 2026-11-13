import { CwButton } from '@cadenway/ui/button';
import { CwField, CwFieldDescription, CwFieldError, CwFieldLabel } from '@cadenway/ui/field';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwInput } from './input/input.directive';

/**
 * Input, every state of its sheet in the Design System artifact, in the light and the dark theme.
 * Labels, help and errors come from `cw-field`, which wires the ids. Copy from the sheet and the
 * mockup (`App.dc.html`, `Compte.dc.html`).
 */
const meta: Meta = {
  title: 'UI/Input',
  decorators: [
    moduleMetadata({
      imports: [CwInput, CwButton, CwField, CwFieldDescription, CwFieldError, CwFieldLabel],
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

/** Rest with a placeholder, filled with help, read-only, disabled and in error. */
export const States: Story = {
  render: () => ({
    template: `
      <div class="grid w-80 gap-5">
        <cw-field>
          <label cwFieldLabel>Nom de la tâche</label>
          <input cwInput placeholder="Ex. : Préparer la revue de sprint" />
        </cw-field>
        <cw-field>
          <label cwFieldLabel>Préfixe des identifiants</label>
          <input cwInput value="CAD" />
          <cw-field-description>Utilisé dans CAD-482.</cw-field-description>
        </cw-field>
        <cw-field>
          <label cwFieldLabel>Identifiant de l'espace</label>
          <input cwInput value="spc_8f2k1q" readonly />
          <cw-field-description>Généré automatiquement.</cw-field-description>
        </cw-field>
        <cw-field disabled>
          <label cwFieldLabel>URL de l'instance</label>
          <input cwInput value="https://cadenway.exemple.fr" disabled />
          <cw-field-description>Définie à l'installation.</cw-field-description>
        </cw-field>
        <cw-field invalid>
          <label cwFieldLabel>Adresse d'expédition</label>
          <input cwInput type="email" value="notifications@" />
          <cw-field-error>Adresse incomplète : ajoutez le domaine.</cw-field-error>
        </cw-field>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));

    await expect(scope.getByLabelText("Adresse d'expédition")).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    await expect(scope.getByLabelText("Adresse d'expédition")).toHaveAccessibleDescription(
      'Adresse incomplète : ajoutez le domaine.',
    );
    await expect(scope.getByLabelText("URL de l'instance")).toBeDisabled();
  },
};

/** The three sizes, each next to the button of the same height. */
export const Sizes: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-end gap-8">
        <div class="flex items-center gap-2">
          <input cwInput size="sm" class="w-44" placeholder="Filtrer les tâches…" aria-label="Filtrer les tâches (petit)" />
          <button cwButton variant="outline" size="sm">Appliquer</button>
        </div>
        <div class="flex items-center gap-2">
          <input cwInput class="w-44" placeholder="Filtrer les tâches…" aria-label="Filtrer les tâches" />
          <button cwButton variant="outline">Appliquer</button>
        </div>
        <div class="flex items-center gap-2">
          <input cwInput size="lg" class="w-44" placeholder="Filtrer les tâches…" aria-label="Filtrer les tâches (grand)" />
          <button cwButton variant="outline" size="lg">Appliquer</button>
        </div>
      </div>`,
  }),
};

/** Native types: same look, the mobile keyboard and the autofill change. */
export const NativeTypes: Story = {
  render: () => ({
    template: `
      <div class="grid w-80 gap-5">
        <cw-field>
          <label cwFieldLabel>Adresse e-mail</label>
          <input cwInput type="email" autocomplete="email" value="lea.martin@exemple.fr" />
        </cw-field>
        <cw-field>
          <label cwFieldLabel>Mot de passe</label>
          <input cwInput type="password" autocomplete="current-password" value="cadenway-2026" />
        </cw-field>
        <cw-field>
          <label cwFieldLabel>Capacité du sprint (points)</label>
          <input cwInput type="number" min="0" value="34" />
        </cw-field>
      </div>`,
  }),
};

/** Tab enters the field and the typed text fills it; the halo follows the keyboard focus. */
export const Keyboard: Story = {
  render: () => ({
    template: `
      <cw-field class="w-80">
        <label cwFieldLabel>Nom de la liste</label>
        <input cwInput placeholder="Sprint 15" />
      </cw-field>`,
  }),
  play: async ({ canvasElement }) => {
    const field = within(light(canvasElement)).getByLabelText('Nom de la liste');

    await userEvent.tab();
    await expect(field).toHaveFocus();
    await userEvent.keyboard('Sprint 15');
    await expect(field).toHaveValue('Sprint 15');
  },
};
