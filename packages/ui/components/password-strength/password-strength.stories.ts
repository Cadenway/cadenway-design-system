import { CwInput } from '@cadenway/ui/components/input';
import { CwLabel } from '@cadenway/ui/components/label';
import {
  type Meta,
  type StoryObj,
  applicationConfig,
  moduleMetadata,
} from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwPasswordStrength } from './password-strength.component';
import { CwPasswordStrengthLevel } from './password-strength-level/password-strength-level.component';
import { provideCwPasswordStrengthLabels } from './password-strength.providers';
import type { CwPasswordRule } from './password-strength.types';

/**
 * Constant meta
 *
 * @description
 * Password strength, as the mockup shows it under the new password field (`Inscription.dc.html`,
 * `Reinitialisation.dc.html`), in the light and the dark theme.
 *
 * @type {Meta}
 */
const meta: Meta = {
  title: 'UI/PasswordStrength',
  decorators: [
    moduleMetadata({ imports: [CwPasswordStrength, CwPasswordStrengthLevel, CwInput, CwLabel] }),
  ],
};

export default meta;

/**
 * Type Story
 *
 * @description
 * Storybook configuration used for password strength examples and interactions.
 *
 * @type {StoryObj}
 */
type Story = StoryObj;

/**
 * Constant FIELD
 *
 * @description
 * The sign-up password field of the mockup (`Inscription.dc.html`): the level on the right of the
 * label, the meter and the rules under the field, which they describe. Ids carry the theme, since
 * the preview renders the story twice.
 *
 * @type {string}
 */
const FIELD: string = `
  <div class="grid w-full max-w-sm gap-2">
    <div class="flex h-4 items-center justify-between gap-3">
      <label cwLabel [for]="'password-' + cwTheme">Mot de passe</label>
      <cw-password-strength-level [for]="strength" />
    </div>
    <input cwInput type="password" autocomplete="new-password" placeholder="12 caractères minimum"
           [id]="'password-' + cwTheme" [attr.aria-describedby]="strength.rulesId"
           [value]="password" (input)="password = $any($event.target).value" />
    <cw-password-strength #strength="cwPasswordStrength" [value]="password" [rules]="rules" />
  </div>`;

/**
 * Function light
 *
 * @description
 * Locates the light-theme copy rendered by the shared Storybook preview decorator.
 *
 * @param {HTMLElement} canvasElement - Story canvas containing the theme examples.
 *
 * @returns {HTMLElement} Element containing the light-theme example.
 *
 * @throws {Error} When the expected light-theme scope is missing.
 */
function light(canvasElement: HTMLElement): HTMLElement {
  const scope: HTMLElement | null =
    canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

/** The sign-up field: type a password, the notches fill, the rules turn jade and the level rises. */
export const SignUpField: Story = {
  render: () => ({ props: { password: '', rules: undefined }, template: FIELD }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: {
      getByLabelText(label: string): HTMLElement;
      getByRole(role: string, options?: { name?: string }): HTMLElement;
      getByText(text: string, options?: { selector?: string }): HTMLElement;
    } = within(light(canvasElement));
    const field: HTMLElement = scope.getByLabelText('Mot de passe');
    const meter: HTMLElement = scope.getByRole('meter', { name: 'Robustesse du mot de passe' });

    await expect(meter).toHaveAttribute('aria-valuetext', 'Trop court');
    await expect(field).toHaveAccessibleDescription(
      [
        '12 caractères minimum : non respecté',
        'Majuscules et minuscules : non respecté',
        'Au moins un chiffre : non respecté',
        'Au moins un symbole : non respecté',
      ].join(' '),
    );
    await userEvent.type(field, 'Durable2');
    await expect(meter).toHaveAttribute('aria-valuetext', 'Moyen');
    await expect(
      scope.getByText('Moyen', { selector: 'cw-password-strength-level' }),
    ).not.toHaveAttribute('aria-hidden');
    await userEvent.type(field, '026!');
    await expect(meter).toHaveAttribute('aria-valuetext', 'Excellent');
    await expect(meter).toHaveAttribute('aria-valuenow', '4');
    await expect(scope.getByText('Au moins un symbole').parentElement).toHaveTextContent(
      'Au moins un symbole : respecté',
    );
  },
};

/** Every level, from an empty field to « Excellent », with its tone. */
export const Levels: Story = {
  render: () => ({
    props: {
      passwords: ['', 'cadenway', 'Durable', 'Durable2', 'Durable2026x', 'Durable2026!'],
    },
    template: `
      <div class="grid w-full max-w-xl gap-6">
        @for (password of passwords; track password) {
          <div class="grid gap-2">
            <div class="flex h-4 items-center justify-between gap-3 text-xs text-muted-foreground">
              <code>{{ password || '(vide)' }}</code>
              <cw-password-strength-level [for]="strength" />
            </div>
            <cw-password-strength #strength="cwPasswordStrength" [value]="password" />
          </div>
        }
      </div>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const meters: HTMLElement[] = within(light(canvasElement)).getAllByRole('meter');

    await expect(meters.map((meter: HTMLElement) => meter.getAttribute('aria-valuetext'))).toEqual([
      'Trop court',
      'Trop court',
      'Faible',
      'Moyen',
      'Bon',
      'Excellent',
    ]);
  },
};

/** Rules replacing the default ones: one notch per rule, the level by share of rules met. */
export const CustomRules: Story = {
  render: () => ({
    props: {
      password: 'cheval correct',
      rules: [
        {
          id: 'length',
          label: '16 caractères minimum',
          test: (value: string) => value.length >= 16,
        },
        {
          id: 'words',
          label: 'Au moins deux mots',
          test: (value: string) => /\S\s+\S/.test(value),
        },
        { id: 'digit', label: 'Au moins un chiffre', test: (value: string) => /\d/.test(value) },
      ] satisfies CwPasswordRule[],
    },
    template: FIELD,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const meter: HTMLElement = within(light(canvasElement)).getByRole('meter');

    await expect(meter).toHaveAttribute('aria-valuemax', '3');
    await expect(meter).toHaveAttribute('aria-valuenow', '1');
  },
};

/** English texts given by `provideCwPasswordStrengthLabels`, as an English application would. */
export const EnglishLabels: Story = {
  decorators: [
    applicationConfig({
      providers: [
        provideCwPasswordStrengthLabels({
          meter: 'Password strength',
          levels: ['Too short', 'Weak', 'Fair', 'Good', 'Excellent'],
          met: ': met',
          unmet: ': not met',
          minLength: (count: number): string => `At least ${String(count)} characters`,
          mixedCase: 'Upper and lower case letters',
          digit: 'At least one digit',
          symbol: 'At least one symbol',
        }),
      ],
    }),
  ],
  render: () => ({
    props: { password: 'Durable2' },
    template: `
      <div class="grid w-full max-w-sm gap-2">
        <cw-password-strength-level [for]="strength" />
        <cw-password-strength #strength="cwPasswordStrength" [value]="password" />
      </div>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const meter: HTMLElement = within(light(canvasElement)).getByRole('meter', {
      name: 'Password strength',
    });

    await expect(meter).toHaveAttribute('aria-valuetext', 'Fair');
  },
};
