import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwCheckbox } from './checkbox.component';

/**
 * Checkbox, every state of its sheet in the Design System artifact, in the light and the dark theme.
 * Copy from the mockup (`App.dc.html`, `Compte.dc.html`).
 */
const meta: Meta = {
  title: 'UI/Checkbox',
  decorators: [moduleMetadata({ imports: [CwCheckbox] })],
};

export default meta;

type Story = StoryObj;

function light(canvasElement: HTMLElement): HTMLElement {
  const scope = canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

/** Unchecked, checked, indeterminate and disabled. */
export const States: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col gap-3">
        <cw-checkbox ariaLabel="Sélectionner CAD-482" />
        <cw-checkbox ariaLabel="Sélectionner CAD-483" [checked]="true" />
        <cw-checkbox ariaLabel="Tout sélectionner" [indeterminate]="true" />
        <cw-checkbox ariaLabel="Option indisponible" disabled />
        <cw-checkbox ariaLabel="Option cochée indisponible" [checked]="true" disabled />
      </div>`,
  }),
};

/** With a label and a description: the box sits on the first line of the label. */
export const WithDescription: Story = {
  render: () => ({
    template: `
      <div class="flex items-start gap-2">
        <cw-checkbox class="mt-0.5" ariaLabel="Résumé quotidien" />
        <div class="grid gap-0.5">
          <span class="text-sm leading-5 font-medium">Résumé quotidien</span>
          <span class="text-xs text-muted-foreground">Un e-mail chaque matin avec vos tâches du jour.</span>
        </div>
      </div>`,
  }),
};

/** Space and click toggle the box; a mixed box becomes checked. */
export const Keyboard: Story = {
  render: () => ({
    template: `<cw-checkbox ariaLabel="Tout sélectionner" [indeterminate]="true" />`,
  }),
  play: async ({ canvasElement }) => {
    const box = within(light(canvasElement)).getByRole('checkbox', { name: 'Tout sélectionner' });
    await expect(box).toHaveAttribute('aria-checked', 'mixed');

    await userEvent.tab();
    await expect(box).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(box).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard(' ');
    await expect(box).toHaveAttribute('aria-checked', 'false');
  },
};
