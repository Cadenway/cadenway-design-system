import { CwField, CwFieldError, CwFieldLabel } from '@cadenway/ui/components/field';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorGlobeBold, phosphorLockBold } from '@ng-icons/phosphor-icons/bold';
import {
  type Meta,
  type StoryObj,
  applicationConfig,
  moduleMetadata,
} from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwRadioGroupItem } from './radio-group-item/radio-group-item.component';
import { CwRadioGroup } from './radio-group.component';

/**
 * Radio Group, every state of its sheet in the Design System artifact, in the light and the dark
 * theme. Labels point at the generated id of each option (`#option` then `option.id()`), so the two
 * themes never share an id. Copy from the sheet and the mockup (space creation, list settings,
 * profile in `App.dc.html`).
 */
const meta: Meta = {
  title: 'UI/RadioGroup',
  decorators: [
    moduleMetadata({
      imports: [CwRadioGroup, CwRadioGroupItem, CwField, CwFieldError, CwFieldLabel, NgIcon],
    }),
    applicationConfig({ providers: [provideIcons({ phosphorGlobeBold, phosphorLockBold })] }),
  ],
};

export default meta;

type Story = StoryObj;

function light(canvasElement: HTMLElement): HTMLElement {
  const scope = canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

/** Vertical with descriptions; the third option disabled. */
export const Vertical: Story = {
  render: () => ({
    template: `
      <fieldset class="w-80">
        <legend class="mb-3 text-sm font-medium">Fréquence des notifications</legend>
        <cw-radio-group value="daily">
          <div class="flex items-start gap-2">
            <cw-radio-group-item #now value="now" class="mt-0.5" />
            <div class="grid gap-0.5">
              <label class="text-sm leading-5 font-medium" [for]="now.id()">Immédiatement</label>
              <p class="text-xs text-muted-foreground">Un e-mail par événement.</p>
            </div>
          </div>
          <div class="flex items-start gap-2">
            <cw-radio-group-item #daily value="daily" class="mt-0.5" />
            <div class="grid gap-0.5">
              <label class="text-sm leading-5 font-medium" [for]="daily.id()">Résumé quotidien</label>
              <p class="text-xs text-muted-foreground">À 8 h, les jours ouvrés.</p>
            </div>
          </div>
          <div class="flex items-start gap-2">
            <cw-radio-group-item #weekly value="weekly" class="mt-0.5" disabled />
            <div class="grid gap-0.5">
              <label class="text-sm leading-5 font-medium opacity-50" [for]="weekly.id()">Résumé hebdomadaire</label>
              <p class="text-xs text-muted-foreground">Réservé aux administrateurs.</p>
            </div>
          </div>
        </cw-radio-group>
      </fieldset>`,
  }),
};

/** Horizontal: two or three short options in a row. */
export const Horizontal: Story = {
  render: () => ({
    template: `
      <fieldset>
        <legend class="mb-3 text-sm font-medium">Vue par défaut</legend>
        <cw-radio-group orientation="horizontal" value="list">
          <div class="flex items-center gap-2">
            <cw-radio-group-item #list value="list" />
            <label class="text-sm leading-none font-medium select-none" [for]="list.id()">Liste</label>
          </div>
          <div class="flex items-center gap-2">
            <cw-radio-group-item #board value="board" />
            <label class="text-sm leading-none font-medium select-none" [for]="board.id()">Tableau</label>
          </div>
          <div class="flex items-center gap-2">
            <cw-radio-group-item #calendar value="calendar" />
            <label class="text-sm leading-none font-medium select-none" [for]="calendar.id()">Calendrier</label>
          </div>
        </cw-radio-group>
      </fieldset>`,
  }),
};

/** Invalid: a required group left without a value; `cw-field` names it and links the message. */
export const Invalid: Story = {
  render: () => ({
    template: `
      <cw-field invalid class="w-80">
        <label cwFieldLabel>Visibilité</label>
        <cw-radio-group orientation="horizontal" required invalid touched>
          <div class="flex items-center gap-2">
            <cw-radio-group-item #everyone value="public" />
            <label class="text-sm leading-none font-medium select-none" [for]="everyone.id()">Public</label>
          </div>
          <div class="flex items-center gap-2">
            <cw-radio-group-item #members value="private" />
            <label class="text-sm leading-none font-medium select-none" [for]="members.id()">Privé</label>
          </div>
        </cw-radio-group>
        <cw-field-error>Choisissez une visibilité.</cw-field-error>
      </cw-field>`,
  }),
  play: async ({ canvasElement }) => {
    const group = within(light(canvasElement)).getByRole('radiogroup', { name: 'Visibilité' });

    await expect(group).toHaveAttribute('aria-invalid', 'true');
    await expect(group).toHaveAccessibleDescription('Choisissez une visibilité.');
  },
};

/** Choice cards: the whole card names its radio; selected, it turns `bg-selected`. */
export const ChoiceCards: Story = {
  render: () => ({
    template: `
      <cw-radio-group ariaLabel="Visibilité de l'espace" value="private" class="w-96">
        <cw-radio-group-item variant="card" value="public">
          <span class="flex items-center gap-1.5 text-sm leading-5 font-medium">
            <ng-icon name="phosphorGlobeBold" size="1rem" class="text-muted-foreground" aria-hidden="true" />Public
          </span>
          <span class="text-xs text-muted-foreground">Tous les membres de l'instance.</span>
        </cw-radio-group-item>
        <cw-radio-group-item variant="card" value="private">
          <span class="flex items-center gap-1.5 text-sm leading-5 font-medium">
            <ng-icon name="phosphorLockBold" size="1rem" class="text-muted-foreground" aria-hidden="true" />Privé
          </span>
          <span class="text-xs text-muted-foreground">Membres invités uniquement.</span>
        </cw-radio-group-item>
      </cw-radio-group>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    const publicSpace = scope.getByRole('radio', { name: /Public/ });

    await userEvent.click(scope.getByText("Tous les membres de l'instance."));
    await expect(publicSpace).toHaveAttribute('aria-checked', 'true');
  },
};

/**
 * Tab enters on the selected option; the arrows select the next one, wrapping around and skipping
 * the disabled option.
 */
export const Keyboard: Story = {
  render: () => ({
    template: `
      <cw-radio-group ariaLabel="Vue par défaut" orientation="horizontal" value="board">
        <cw-radio-group-item value="list" variant="card">Liste</cw-radio-group-item>
        <cw-radio-group-item value="board" variant="card">Tableau</cw-radio-group-item>
        <cw-radio-group-item value="gantt" variant="card" disabled>Gantt</cw-radio-group-item>
        <cw-radio-group-item value="calendar" variant="card">Calendrier</cw-radio-group-item>
      </cw-radio-group>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));

    await userEvent.tab();
    await expect(scope.getByRole('radio', { name: 'Tableau' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(scope.getByRole('radio', { name: 'Calendrier' })).toHaveFocus();
    await expect(scope.getByRole('radio', { name: 'Calendrier' })).toBeChecked();
    await userEvent.keyboard('{ArrowDown}');
    await expect(scope.getByRole('radio', { name: 'Liste' })).toBeChecked();
    await userEvent.keyboard('{ArrowUp}');
    await expect(scope.getByRole('radio', { name: 'Calendrier' })).toBeChecked();
  },
};
