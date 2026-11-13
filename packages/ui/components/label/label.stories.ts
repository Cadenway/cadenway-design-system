import { CwCheckbox } from '@cadenway/ui/components/checkbox';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwLabel } from './label.directive';

/**
 * Label, every state of its sheet in the Design System artifact, in the light and the dark theme.
 * Copy from the sheet and the mockup (`Organisation.dc.html`). Each story renders twice (one scope
 * per theme), so the labels wrap their control instead of pointing at a fixed `id`.
 */
const meta: Meta = {
  title: 'UI/Label',
  decorators: [moduleMetadata({ imports: [CwLabel, CwCheckbox] })],
};

export default meta;

type Story = StoryObj;

// The field of the preview, until `input[cwInput]` exists in this package.
const FIELD =
  'h-8 w-64 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm font-normal outline-hidden placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50';

function light(canvasElement: HTMLElement): HTMLElement {
  const scope = canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

/** Above a field, 8 px apart. */
export const AboveField: Story = {
  render: () => ({
    template: `
      <label cwLabel class="flex-col items-start">
        Nom de l'espace
        <input class="${FIELD}" value="Produit" />
      </label>`,
  }),
};

/** The optional mention, for the exception in a mostly required form. */
export const Optional: Story = {
  render: () => ({
    template: `
      <label cwLabel class="flex-col items-start">
        <span>Description <span class="font-normal text-muted-foreground">(facultatif)</span></span>
        <input class="${FIELD}" placeholder="À quoi sert cet espace ?" />
      </label>`,
  }),
};

/** Next to a checkbox: a click on the label ticks the box. */
export const NextToCheckbox: Story = {
  render: () => ({
    template: `<label cwLabel><cw-checkbox /> Afficher les sous-tâches</label>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    const box = scope.getByRole('checkbox', { name: 'Afficher les sous-tâches' });

    await userEvent.click(scope.getByText('Afficher les sous-tâches'));
    await expect(box).toHaveAttribute('aria-checked', 'true');
  },
};

/** A row: label on the left, control on the right (`justify-between`). */
export const Row: Story = {
  render: () => ({
    template: `
      <label cwLabel class="w-72 justify-between">
        Notifications par e-mail
        <cw-checkbox [checked]="true" />
      </label>`,
  }),
};

/** With a help button next to it, named by `aria-label` (the Tooltip opens from it). */
export const WithHelp: Story = {
  render: () => ({
    template: `
      <div class="flex items-end gap-1">
        <label cwLabel class="flex-col items-start">
          Préfixe des identifiants
          <input class="${FIELD}" value="CAD" />
        </label>
        <button
          type="button"
          class="mb-1.5 inline-flex size-5 items-center justify-center rounded-md text-xs text-muted-foreground outline-hidden hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Aide sur le préfixe"
        >?</button>
      </div>`,
  }),
};

/** Disabled: in a disabled field (`group/field` with `data-disabled`), the label dims. */
export const Disabled: Story = {
  render: () => ({
    template: `
      <div class="group/field" data-disabled="true">
        <label cwLabel class="flex-col items-start">
          URL de l'instance
          <input class="${FIELD}" value="https://cadenway.exemple.fr" disabled />
        </label>
      </div>`,
  }),
};
