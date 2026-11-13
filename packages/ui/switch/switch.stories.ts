import {
  CwField,
  CwFieldContent,
  CwFieldDescription,
  CwFieldError,
  CwFieldLabel,
} from '@cadenway/ui/field';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwSwitch } from './switch.component';

/**
 * Switch, every state of its sheet in the Design System artifact, in the light and the dark theme.
 * Copy from the sheet and the mockup (space notification settings in `App.dc.html`).
 */
const meta: Meta = {
  title: 'UI/Switch',
  decorators: [
    moduleMetadata({
      imports: [CwSwitch, CwField, CwFieldContent, CwFieldDescription, CwFieldError, CwFieldLabel],
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

/** Off, on, disabled off and on, in error. */
export const States: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-6">
        <cw-switch ariaLabel="Résumé quotidien" />
        <cw-switch ariaLabel="Notifications par e-mail" [checked]="true" />
        <cw-switch ariaLabel="Notifications Slack" disabled />
        <cw-switch ariaLabel="Automatisation active" [checked]="true" disabled />
        <cw-switch ariaLabel="Synchroniser le calendrier" [checked]="true" invalid touched />
      </div>`,
  }),
};

/** `default` 36 × 20 px and `sm` 28 × 16 px, off and on. */
export const Sizes: Story = {
  render: () => ({
    template: `
      <div class="flex items-center gap-8">
        <div class="flex items-center gap-3">
          <cw-switch ariaLabel="Résumé quotidien (par défaut)" />
          <cw-switch ariaLabel="Notifications par e-mail (par défaut)" [checked]="true" />
        </div>
        <div class="flex items-center gap-3">
          <cw-switch size="sm" ariaLabel="Résumé quotidien (petit)" />
          <cw-switch size="sm" ariaLabel="Notifications par e-mail (petit)" [checked]="true" />
        </div>
      </div>`,
  }),
};

/** Settings of a space: label and description on the left, the switch on the right. */
export const Settings: Story = {
  render: () => ({
    template: `
      <div class="w-[28rem] divide-y rounded-lg border px-4">
        <cw-field orientation="horizontal" class="py-3">
          <cw-field-content>
            <label cwFieldLabel>Notifications par e-mail</label>
            <cw-field-description>Assignations, mentions et échéances.</cw-field-description>
          </cw-field-content>
          <cw-switch [checked]="true" />
        </cw-field>
        <cw-field orientation="horizontal" class="py-3">
          <cw-field-content>
            <label cwFieldLabel>Résumé quotidien</label>
          </cw-field-content>
          <cw-switch />
        </cw-field>
        <cw-field orientation="horizontal" class="py-3" invalid>
          <cw-field-content>
            <label cwFieldLabel>Synchroniser le calendrier</label>
            <cw-field-error>Connexion expirée : reconnectez votre compte.</cw-field-error>
          </cw-field-content>
          <cw-switch [checked]="true" />
        </cw-field>
        <cw-field orientation="horizontal" class="py-3" disabled>
          <cw-field-content>
            <label cwFieldLabel>Notifications Slack</label>
            <cw-field-description>Configurez d'abord un webhook dans Intégrations.</cw-field-description>
          </cw-field-content>
          <cw-switch disabled />
        </cw-field>
        <cw-field orientation="horizontal" class="py-3">
          <cw-field-content>
            <label cwFieldLabel>Pause des automatisations</label>
            <cw-field-description>Taille sm, dans une ligne dense.</cw-field-description>
          </cw-field-content>
          <cw-switch size="sm" />
        </cw-field>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const sync = within(light(canvasElement)).getByRole('switch', {
      name: 'Synchroniser le calendrier',
    });

    await expect(sync).toHaveAttribute('aria-invalid', 'true');
    await expect(sync).toHaveAccessibleDescription('Connexion expirée : reconnectez votre compte.');
  },
};

/** Tab reaches the switch; Space and Enter toggle it. */
export const Keyboard: Story = {
  render: () => ({
    template: `<cw-switch ariaLabel="Notifications par e-mail" />`,
  }),
  play: async ({ canvasElement }) => {
    const mail = within(light(canvasElement)).getByRole('switch', {
      name: 'Notifications par e-mail',
    });

    await userEvent.tab();
    await expect(mail).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(mail).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard('{Enter}');
    await expect(mail).toHaveAttribute('aria-checked', 'false');
  },
};
