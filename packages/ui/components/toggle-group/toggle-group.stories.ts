import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorCircleHalfBold,
  phosphorFlagBold,
  phosphorTextBBold,
  phosphorTextItalicBold,
  phosphorTextStrikethroughBold,
  phosphorTextUnderlineBold,
  phosphorUserBold,
} from '@ng-icons/phosphor-icons/bold';
import {
  type Meta,
  type StoryObj,
  applicationConfig,
  moduleMetadata,
} from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwToggleGroupItem } from './toggle-group-item/toggle-group-item.component';
import { CwToggleGroup } from './toggle-group.component';

/**
 * Constant meta
 *
 * @description
 * Toggle Group, every state of its sheet in the Design System artifact, in the light and the dark
 * theme. Copy from the sheet's "Dans Cadenway" section (description editor, Affichage menu, Tableau
 * toolbar).
 *
 * @type {Meta}
 */
const meta: Meta = {
  title: 'UI/ToggleGroup',
  decorators: [
    moduleMetadata({ imports: [CwToggleGroup, CwToggleGroupItem, NgIcon] }),
    applicationConfig({
      providers: [
        provideIcons({
          phosphorCircleHalfBold,
          phosphorFlagBold,
          phosphorTextBBold,
          phosphorTextItalicBold,
          phosphorTextStrikethroughBold,
          phosphorTextUnderlineBold,
          phosphorUserBold,
        }),
      ],
    }),
  ],
};

export default meta;

/**
 * Type Story
 *
 * @description
 * Storybook story configuration for toggle group examples.
 *
 * @type {StoryObj}
 */
type Story = StoryObj;

/**
 * Function light
 *
 * @description
 * Selects the light theme copy for interaction checks.
 *
 * @param {HTMLElement} canvasElement - Story canvas containing the themed examples.
 *
 * @returns {HTMLElement} Light theme section used for interaction checks.
 */
function light(canvasElement: HTMLElement): HTMLElement {
  const scope: HTMLElement | null =
    canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

/** Multiple choice, `outline`, welded: the formatting of a description. */
export const Multiple: Story = {
  render: () => ({
    props: { marks: ['bold', 'italic'] },
    template: `
      <cw-toggle-group type="multiple" variant="outline" ariaLabel="Mise en forme" [(value)]="marks">
        <button cwToggleGroupItem value="bold" aria-label="Gras"><ng-icon name="phosphorTextBBold" /></button>
        <button cwToggleGroupItem value="italic" aria-label="Italique"><ng-icon name="phosphorTextItalicBold" /></button>
        <button cwToggleGroupItem value="underline" aria-label="Souligné"><ng-icon name="phosphorTextUnderlineBold" /></button>
        <button cwToggleGroupItem value="strike" aria-label="Barré"><ng-icon name="phosphorTextStrikethroughBold" /></button>
      </cw-toggle-group>`,
  }),
};

/** Single choice, `default`, spaced: the density of the Affichage menu. */
export const SingleSpaced: Story = {
  render: () => ({
    props: { density: 'compact' },
    template: `
      <cw-toggle-group spacing="1" ariaLabel="Densité" [(value)]="density">
        <button cwToggleGroupItem value="compact">Compacte</button>
        <button cwToggleGroupItem value="comfortable">Confortable</button>
      </cw-toggle-group>`,
  }),
};

/** Single choice, `outline`, icon and text: « Grouper par » of the Tableau toolbar. */
export const SingleOutline: Story = {
  render: () => ({
    props: { groupBy: 'status' },
    template: `
      <cw-toggle-group variant="outline" ariaLabel="Grouper par" [(value)]="groupBy">
        <button cwToggleGroupItem value="status"><ng-icon name="phosphorCircleHalfBold" /> Statut</button>
        <button cwToggleGroupItem value="priority"><ng-icon name="phosphorFlagBold" /> Priorité</button>
        <button cwToggleGroupItem value="assignee"><ng-icon name="phosphorUserBold" /> Assigné</button>
      </cw-toggle-group>`,
  }),
};

/** The three sizes; `sm` items keep `rounded-md` corners. */
export const Sizes: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-end gap-8">
        <cw-toggle-group type="multiple" variant="outline" size="sm" ariaLabel="Mise en forme (petit)" [value]="['bold']">
          <button cwToggleGroupItem value="bold" aria-label="Gras"><ng-icon name="phosphorTextBBold" /></button>
          <button cwToggleGroupItem value="italic" aria-label="Italique"><ng-icon name="phosphorTextItalicBold" /></button>
          <button cwToggleGroupItem value="underline" aria-label="Souligné"><ng-icon name="phosphorTextUnderlineBold" /></button>
        </cw-toggle-group>
        <cw-toggle-group type="multiple" variant="outline" ariaLabel="Mise en forme" [value]="['bold']">
          <button cwToggleGroupItem value="bold" aria-label="Gras"><ng-icon name="phosphorTextBBold" /></button>
          <button cwToggleGroupItem value="italic" aria-label="Italique"><ng-icon name="phosphorTextItalicBold" /></button>
          <button cwToggleGroupItem value="underline" aria-label="Souligné"><ng-icon name="phosphorTextUnderlineBold" /></button>
        </cw-toggle-group>
        <cw-toggle-group type="multiple" variant="outline" size="lg" ariaLabel="Mise en forme (grand)" [value]="['bold']">
          <button cwToggleGroupItem value="bold" aria-label="Gras"><ng-icon name="phosphorTextBBold" /></button>
          <button cwToggleGroupItem value="italic" aria-label="Italique"><ng-icon name="phosphorTextItalicBold" /></button>
          <button cwToggleGroupItem value="underline" aria-label="Souligné"><ng-icon name="phosphorTextUnderlineBold" /></button>
        </cw-toggle-group>
      </div>`,
  }),
};

/** Vertical: top and bottom corners, the arrows ↑ ↓. */
export const Vertical: Story = {
  render: () => ({
    template: `
      <cw-toggle-group variant="outline" orientation="vertical" ariaLabel="Densité" value="compact">
        <button cwToggleGroupItem value="compact">Compacte</button>
        <button cwToggleGroupItem value="comfortable">Confortable</button>
      </cw-toggle-group>`,
  }),
};

/** A disabled item (skipped by the arrows) and a disabled group. */
export const Disabled: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-end gap-8">
        <cw-toggle-group variant="outline" ariaLabel="Grouper par" value="status">
          <button cwToggleGroupItem value="status">Statut</button>
          <button cwToggleGroupItem value="priority" disabled>Priorité</button>
          <button cwToggleGroupItem value="assignee">Assigné</button>
        </cw-toggle-group>
        <cw-toggle-group spacing="1" ariaLabel="Densité" value="compact" disabled>
          <button cwToggleGroupItem value="compact">Compacte</button>
          <button cwToggleGroupItem value="comfortable">Confortable</button>
        </cw-toggle-group>
      </div>`,
  }),
};

/** Keyboard: Tab enters on the item that is on, the arrows move and select, skipping disabled items. */
export const Keyboard: Story = {
  render: () => ({
    props: { groupBy: 'status' },
    template: `
      <cw-toggle-group variant="outline" ariaLabel="Grouper par" [(value)]="groupBy">
        <button cwToggleGroupItem value="status">Statut</button>
        <button cwToggleGroupItem value="priority" disabled>Priorité</button>
        <button cwToggleGroupItem value="assignee">Assigné</button>
      </cw-toggle-group>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: { getByRole(role: string, options?: { name?: string }): HTMLElement } = within(
      light(canvasElement),
    );
    const status: HTMLElement = scope.getByRole('radio', { name: 'Statut' });
    const assignee: HTMLElement = scope.getByRole('radio', { name: 'Assigné' });

    await userEvent.tab();
    await expect(status).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(assignee).toHaveFocus();
    await expect(assignee).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard('{Home}');
    await expect(status).toHaveAttribute('aria-checked', 'true');
  },
};
