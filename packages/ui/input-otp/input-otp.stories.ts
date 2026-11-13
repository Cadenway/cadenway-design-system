import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorWarningCircleBold } from '@ng-icons/phosphor-icons/bold';
import {
  type Meta,
  type StoryObj,
  applicationConfig,
  moduleMetadata,
} from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwInputOtpGroup } from './input-otp-group.component';
import { CwInputOtpSeparator } from './input-otp-separator.component';
import { CwInputOtpSlot } from './input-otp-slot.component';
import { CwInputOtp } from './input-otp.component';

/**
 * Input OTP, every state of its sheet in the Design System artifact, in the light and the dark
 * theme. Copy from the sheet's example (two-factor sign-in, `Otp.dc.html`).
 */
const meta: Meta = {
  title: 'UI/InputOTP',
  decorators: [
    moduleMetadata({
      imports: [CwInputOtp, CwInputOtpGroup, CwInputOtpSlot, CwInputOtpSeparator, NgIcon],
    }),
    applicationConfig({ providers: [provideIcons({ phosphorWarningCircleBold })] }),
  ],
};

export default meta;

type Story = StoryObj;

function light(canvasElement: HTMLElement): HTMLElement {
  const scope = canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

const SIX = `
  <cw-input-otp-group>
    <cw-input-otp-slot index="0" /><cw-input-otp-slot index="1" /><cw-input-otp-slot index="2" />
  </cw-input-otp-group>
  <cw-input-otp-separator />
  <cw-input-otp-group>
    <cw-input-otp-slot index="3" /><cw-input-otp-slot index="4" /><cw-input-otp-slot index="5" />
  </cw-input-otp-group>`;

/** Empty, typing and filled: six digits in 3 + 3. */
export const States: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col gap-4">
        <cw-input-otp ariaLabel="Code à 6 chiffres (vide)">${SIX}</cw-input-otp>
        <cw-input-otp ariaLabel="Code à 6 chiffres (en saisie)" value="482">${SIX}</cw-input-otp>
        <cw-input-otp ariaLabel="Code à 6 chiffres (rempli)" value="482913">${SIX}</cw-input-otp>
      </div>`,
  }),
};

/** Error: `destructive` borders and the message under the boxes. */
export const Invalid: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col items-start gap-1.5">
        <cw-input-otp ariaLabel="Code de vérification" value="482913" invalid touched>${SIX}</cw-input-otp>
        <p class="flex items-center gap-1 text-xs font-medium text-destructive">
          <ng-icon name="phosphorWarningCircleBold" size="0.875rem" aria-hidden="true" />
          Code incorrect : il vous reste 2 essais.
        </p>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const code = within(light(canvasElement)).getByRole('textbox', {
      name: 'Code de vérification',
    });
    await expect(code).toHaveAttribute('aria-invalid', 'true');
  },
};

/** Disabled, after too many attempts. */
export const Disabled: Story = {
  render: () => ({
    template: `<cw-input-otp ariaLabel="Code de vérification" value="482913" disabled>${SIX}</cw-input-otp>`,
  }),
};

/** Alphanumeric recovery code, eight boxes in 4 + 4, upper-cased. */
export const RecoveryCode: Story = {
  render: () => ({
    template: `
      <cw-input-otp ariaLabel="Code de récupération" length="8" charset="alphanumeric" value="K7QM2XPA">
        <cw-input-otp-group>
          <cw-input-otp-slot index="0" /><cw-input-otp-slot index="1" /><cw-input-otp-slot index="2" /><cw-input-otp-slot index="3" />
        </cw-input-otp-group>
        <cw-input-otp-separator />
        <cw-input-otp-group>
          <cw-input-otp-slot index="4" /><cw-input-otp-slot index="5" /><cw-input-otp-slot index="6" /><cw-input-otp-slot index="7" />
        </cw-input-otp-group>
      </cw-input-otp>`,
  }),
};

/** Keyboard: Tab focuses the field, the digits fill the boxes, letters are refused, `complete` fires. */
export const Keyboard: Story = {
  render: () => ({
    props: { code: '', completed: '' },
    template: `
      <div class="grid w-fit gap-2">
        <span class="text-sm leading-none font-medium">Code de vérification</span>
        <cw-input-otp ariaLabel="Code de vérification" [(value)]="code" (complete)="completed = $event">${SIX}</cw-input-otp>
        <p class="text-xs text-muted-foreground">Saisissez le code à 6 chiffres de votre application d'authentification.</p>
        <p class="text-xs text-muted-foreground" role="status">{{ completed ? 'Code complet : ' + completed : '' }}</p>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    const code = scope.getByRole('textbox', { name: 'Code de vérification' });

    await userEvent.tab();
    await expect(code).toHaveFocus();
    await userEvent.keyboard('48a2913');
    await expect(code).toHaveValue('482913');
    await expect(scope.getByRole('status')).toHaveTextContent('Code complet : 482913');
    await userEvent.keyboard('{Backspace}');
    await expect(code).toHaveValue('48291');
  },
};
