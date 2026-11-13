import { CwButton } from '@cadenway/ui/components/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowDownBold,
  phosphorArrowUpBold,
  phosphorCaretDownBold,
  phosphorCaretLeftBold,
  phosphorCaretRightBold,
  phosphorFunnelSimpleBold,
  phosphorPlusBold,
} from '@ng-icons/phosphor-icons/bold';
import {
  type Meta,
  type StoryObj,
  applicationConfig,
  moduleMetadata,
} from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwButtonGroupSeparator } from './button-group-separator/button-group-separator.component';
import { CwButtonGroupText } from './button-group-text/button-group-text.component';
import { CwButtonGroup } from './button-group.component';

/**
 * Button Group, every state of its sheet in the Design System artifact, in the light and the dark
 * theme. Copy from the sheet's "Dans Cadenway" section (Liste header, toolbar, Sprint and Calendrier
 * views).
 */
const meta: Meta = {
  title: 'UI/ButtonGroup',
  decorators: [
    moduleMetadata({
      imports: [CwButton, CwButtonGroup, CwButtonGroupSeparator, CwButtonGroupText, NgIcon],
    }),
    applicationConfig({
      providers: [
        provideIcons({
          phosphorArrowDownBold,
          phosphorArrowUpBold,
          phosphorCaretDownBold,
          phosphorCaretLeftBold,
          phosphorCaretRightBold,
          phosphorFunnelSimpleBold,
          phosphorPlusBold,
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

/** Split button: a `default` action, the separator, its variants. */
export const Split: Story = {
  render: () => ({
    template: `
      <cw-button-group ariaLabel="Créer">
        <button cwButton><ng-icon name="phosphorPlusBold" /> Créer une tâche</button>
        <cw-button-group-separator />
        <button cwButton size="icon" aria-label="Modèles de tâche"><ng-icon name="phosphorCaretDownBold" /></button>
      </cw-button-group>`,
  }),
};

/** `outline` buttons welded horizontally: Filtrer, Trier, Grouper. */
export const Horizontal: Story = {
  render: () => ({
    template: `
      <cw-button-group ariaLabel="Affichage">
        <button cwButton variant="outline"><ng-icon name="phosphorFunnelSimpleBold" /> Filtrer</button>
        <button cwButton variant="outline">Trier</button>
        <button cwButton variant="outline">Grouper</button>
      </cw-button-group>`,
  }),
};

/** Vertical: move up and down. */
export const Vertical: Story = {
  render: () => ({
    template: `
      <cw-button-group ariaLabel="Ordre" orientation="vertical">
        <button cwButton variant="outline" size="icon" aria-label="Monter"><ng-icon name="phosphorArrowUpBold" /></button>
        <button cwButton variant="outline" size="icon" aria-label="Descendre"><ng-icon name="phosphorArrowDownBold" /></button>
      </cw-button-group>`,
  }),
};

/** With a text that names what follows. */
export const WithText: Story = {
  render: () => ({
    template: `
      <cw-button-group ariaLabel="Déplacer">
        <cw-button-group-text>Déplacer vers</cw-button-group-text>
        <button cwButton variant="outline">Sprint 15 <ng-icon name="phosphorCaretDownBold" /></button>
      </cw-button-group>`,
  }),
};

/** Nested groups: « Aujourd'hui » and the week arrows, spaced by 8 px. */
export const Nested: Story = {
  render: () => ({
    template: `
      <cw-button-group ariaLabel="Navigation du calendrier">
        <button cwButton variant="outline">Aujourd'hui</button>
        <cw-button-group ariaLabel="Semaine">
          <button cwButton variant="outline" size="icon" aria-label="Semaine précédente"><ng-icon name="phosphorCaretLeftBold" /></button>
          <button cwButton variant="outline" size="icon" aria-label="Semaine suivante"><ng-icon name="phosphorCaretRightBold" /></button>
        </cw-button-group>
      </cw-button-group>`,
  }),
};

/** The size comes from the buttons: `sm`, `default`, `lg` with the matching icon sizes. */
export const Sizes: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-end gap-10">
        <cw-button-group ariaLabel="Sprint (petit)">
          <button cwButton variant="outline" size="icon-sm" aria-label="Sprint précédent"><ng-icon name="phosphorCaretLeftBold" /></button>
          <button cwButton variant="outline" size="sm">Sprint 14</button>
          <button cwButton variant="outline" size="icon-sm" aria-label="Sprint suivant"><ng-icon name="phosphorCaretRightBold" /></button>
        </cw-button-group>
        <cw-button-group ariaLabel="Sprint">
          <button cwButton variant="outline" size="icon" aria-label="Sprint précédent"><ng-icon name="phosphorCaretLeftBold" /></button>
          <button cwButton variant="outline">Sprint 14</button>
          <button cwButton variant="outline" size="icon" aria-label="Sprint suivant"><ng-icon name="phosphorCaretRightBold" /></button>
        </cw-button-group>
        <cw-button-group ariaLabel="Sprint (grand)">
          <button cwButton variant="outline" size="icon-lg" aria-label="Sprint précédent"><ng-icon name="phosphorCaretLeftBold" /></button>
          <button cwButton variant="outline" size="lg">Sprint 14</button>
          <button cwButton variant="outline" size="icon-lg" aria-label="Sprint suivant"><ng-icon name="phosphorCaretRightBold" /></button>
        </cw-button-group>
      </div>`,
  }),
};

/** A disabled button: that one alone at 50 %, the group keeps its shape. */
export const Disabled: Story = {
  render: () => ({
    template: `
      <cw-button-group ariaLabel="Sprint">
        <button cwButton variant="outline" size="icon" aria-label="Sprint précédent"><ng-icon name="phosphorCaretLeftBold" /></button>
        <button cwButton variant="outline">Sprint 16</button>
        <button cwButton variant="outline" size="icon" aria-label="Sprint suivant" disabled><ng-icon name="phosphorCaretRightBold" /></button>
      </cw-button-group>`,
  }),
};

/** Keyboard: every button is its own Tab stop; no arrow keys between them. */
export const Keyboard: Story = {
  render: () => ({
    template: `
      <cw-button-group ariaLabel="Sprint">
        <button cwButton variant="outline" size="icon" aria-label="Sprint précédent"><ng-icon name="phosphorCaretLeftBold" /></button>
        <button cwButton variant="outline">Sprint 14</button>
        <button cwButton variant="outline" size="icon" aria-label="Sprint suivant"><ng-icon name="phosphorCaretRightBold" /></button>
      </cw-button-group>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));

    await userEvent.tab();
    await expect(scope.getByRole('button', { name: 'Sprint précédent' })).toHaveFocus();
    await userEvent.tab();
    await expect(scope.getByRole('button', { name: 'Sprint 14' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(scope.getByRole('button', { name: 'Sprint 14' })).toHaveFocus();
  },
};
