import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorDotsThreeBold,
  phosphorFunnelSimpleBold,
  phosphorPlusBold,
  phosphorTrashBold,
} from '@ng-icons/phosphor-icons/bold';
import {
  type Meta,
  type StoryObj,
  applicationConfig,
  moduleMetadata,
} from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwButton } from './button.component';

/**
 * Button, every state of its sheet in the Design System artifact; each story renders in the light
 * and the dark theme (`.storybook/preview.ts`). Copy from the mockup (`App.dc.html`).
 */
const meta: Meta = {
  title: 'UI/Button',
  decorators: [
    moduleMetadata({ imports: [CwButton, NgIcon] }),
    applicationConfig({
      providers: [
        provideIcons({
          phosphorDotsThreeBold,
          phosphorFunnelSimpleBold,
          phosphorPlusBold,
          phosphorTrashBold,
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

/** The six variants at the default size; one `default` action per view. */
export const Variants: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-2">
        <button cwButton><ng-icon name="phosphorPlusBold" /> Créer une tâche</button>
        <button cwButton variant="outline"><ng-icon name="phosphorFunnelSimpleBold" /> Filtrer</button>
        <button cwButton variant="secondary">Dupliquer</button>
        <button cwButton variant="ghost">Annuler</button>
        <button cwButton variant="destructive"><ng-icon name="phosphorTrashBold" /> Supprimer la liste</button>
        <a cwButton variant="link" href="#aide">Voir l'aide</a>
      </div>`,
  }),
};

/** Text sizes `xs` to `lg`, and the four icon sizes, each icon button named by `aria-label`. */
export const Sizes: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-2">
        <button cwButton variant="outline" size="xs">Très petit</button>
        <button cwButton variant="outline" size="sm">Petit</button>
        <button cwButton variant="outline">Par défaut</button>
        <button cwButton variant="outline" size="lg">Grand</button>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <button cwButton variant="ghost" size="icon-xs" aria-label="Plus d'actions (très petit)"><ng-icon name="phosphorDotsThreeBold" /></button>
        <button cwButton variant="ghost" size="icon-sm" aria-label="Plus d'actions (petit)"><ng-icon name="phosphorDotsThreeBold" /></button>
        <button cwButton variant="ghost" size="icon" aria-label="Plus d'actions"><ng-icon name="phosphorDotsThreeBold" /></button>
        <button cwButton variant="ghost" size="icon-lg" aria-label="Plus d'actions (grand)"><ng-icon name="phosphorDotsThreeBold" /></button>
      </div>`,
  }),
};

/** Loading: the spinner replaces the leading icon, `aria-busy`, clicks ignored, focus kept. */
export const Loading: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-2">
        <button cwButton loading><ng-icon name="phosphorPlusBold" /> Créer une tâche</button>
        <button cwButton variant="outline" loading>Enregistrer</button>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const button = within(light(canvasElement)).getByRole('button', { name: /Enregistrer/ });

    await expect(button).toHaveAttribute('aria-busy', 'true');
    await userEvent.tab();
    await expect(within(light(canvasElement)).getAllByRole('button')[0]).toHaveFocus();
  },
};

/** Disabled: native on `button`, `aria-disabled` and out of the tab order on `a`. */
export const Disabled: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-2">
        <button cwButton disabled>Créer une tâche</button>
        <button cwButton variant="outline" disabled>Filtrer</button>
        <a cwButton variant="link" href="#aide" disabled>Voir l'aide</a>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));

    await expect(scope.getByRole('button', { name: 'Créer une tâche' })).toBeDisabled();
    await expect(scope.getByRole('link', { name: "Voir l'aide" })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  },
};

/** Keyboard: Tab reaches each button, Enter activates it. */
export const Keyboard: Story = {
  render: () => ({
    props: { count: 0 },
    template: `
      <div class="flex items-center gap-3">
        <button cwButton (click)="count = count + 1">Créer une tâche</button>
        <span class="text-sm text-muted-foreground" role="status">{{ count }} créée(s)</span>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    await userEvent.tab();
    await expect(scope.getByRole('button', { name: 'Créer une tâche' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(scope.getByRole('status')).toHaveTextContent('1 créée(s)');
  },
};
