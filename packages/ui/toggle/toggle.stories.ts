import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowElbowDownRightBold,
  phosphorTextBBold,
  phosphorTextItalicBold,
  phosphorUserBold,
} from '@ng-icons/phosphor-icons/bold';
import {
  type Meta,
  type StoryObj,
  applicationConfig,
  moduleMetadata,
} from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwToggle } from './toggle.component';

/**
 * Toggle, every state of its sheet in the Design System artifact, in the light and the dark theme.
 * Copy from the sheet's "Dans Cadenway" section (view toolbar, description editor).
 */
const meta: Meta = {
  title: 'UI/Toggle',
  decorators: [
    moduleMetadata({ imports: [CwToggle, NgIcon] }),
    applicationConfig({
      providers: [
        provideIcons({
          phosphorArrowElbowDownRightBold,
          phosphorTextBBold,
          phosphorTextItalicBold,
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

/** The two variants, off and on. */
export const Variants: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-2">
        <button cwToggle><ng-icon name="phosphorArrowElbowDownRightBold" /> Sous-tâches</button>
        <button cwToggle [pressed]="true"><ng-icon name="phosphorArrowElbowDownRightBold" /> Afficher les sous-tâches</button>
        <button cwToggle variant="outline"><ng-icon name="phosphorUserBold" /> Moi uniquement</button>
        <button cwToggle variant="outline" [pressed]="true">Masquer les terminées</button>
      </div>`,
  }),
};

/** The three sizes, aligned on the buttons of the row; icon toggles named by `aria-label`. */
export const Sizes: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-2">
        <button cwToggle size="sm" aria-label="Gras (petit)"><ng-icon name="phosphorTextBBold" /></button>
        <button cwToggle aria-label="Gras"><ng-icon name="phosphorTextBBold" /></button>
        <button cwToggle size="lg" aria-label="Gras (grand)"><ng-icon name="phosphorTextBBold" /></button>
        <button cwToggle variant="outline" size="sm">Moi uniquement</button>
        <button cwToggle variant="outline">Moi uniquement</button>
        <button cwToggle variant="outline" size="lg">Moi uniquement</button>
      </div>`,
  }),
};

/** Disabled, off and on: the pressed state stays readable. */
export const Disabled: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-2">
        <button cwToggle variant="outline" disabled>Moi uniquement</button>
        <button cwToggle variant="outline" disabled [pressed]="true">Masquer les terminées</button>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const hide = within(light(canvasElement)).getByRole('button', {
      name: 'Masquer les terminées',
    });

    await expect(hide).toBeDisabled();
    await expect(hide).toHaveAttribute('aria-pressed', 'true');
  },
};

/** Keyboard: Tab reaches the toggle, Space and Enter flip it. */
export const Keyboard: Story = {
  render: () => ({
    template: `
      <div class="flex items-center gap-1">
        <button cwToggle size="sm" aria-label="Gras"><ng-icon name="phosphorTextBBold" /></button>
        <button cwToggle size="sm" aria-label="Italique"><ng-icon name="phosphorTextItalicBold" /></button>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const bold = within(light(canvasElement)).getByRole('button', { name: 'Gras' });

    await userEvent.tab();
    await expect(bold).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(bold).toHaveAttribute('aria-pressed', 'true');
    await userEvent.keyboard('{Enter}');
    await expect(bold).toHaveAttribute('aria-pressed', 'false');
  },
};
