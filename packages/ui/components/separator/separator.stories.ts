import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';

import { CwSeparator } from './separator.component';

/**
 * Separator, every state of its sheet in the Design System artifact, in the light and the dark
 * theme. Copy from the sheet and the mockup (`App.dc.html`, task panel and activity feed).
 */
const meta: Meta = {
  title: 'UI/Separator',
  decorators: [moduleMetadata({ imports: [CwSeparator] })],
};

export default meta;

type Story = StoryObj;

function light(canvasElement: HTMLElement): HTMLElement {
  const scope = canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

/** Horizontal, `my-3` between two sections of a panel; decorative. */
export const Horizontal: Story = {
  render: () => ({
    template: `
      <div class="w-80">
        <div class="text-sm font-medium">CAD-482</div>
        <p class="text-sm text-muted-foreground">Corriger l'export CSV des tâches</p>
        <cw-separator class="my-3" />
        <p class="text-xs text-muted-foreground">Créée par Léa Martin le 2 nov.</p>
      </div>`,
  }),
};

/** Vertical: `h-4` in a toolbar, stretched between links in a line of text. */
export const Vertical: Story = {
  render: () => ({
    template: `
      <div class="grid gap-4">
        <div class="flex items-center gap-2 text-sm">
          <span>Liste</span>
          <cw-separator orientation="vertical" class="h-4" />
          <span>Filtrer</span>
          <span>Trier</span>
        </div>
        <div class="flex h-5 items-center gap-3 text-sm">
          <a href="#details" class="rounded-sm hover:underline">Détails</a>
          <cw-separator orientation="vertical" />
          <a href="#sous-taches" class="rounded-sm hover:underline">Sous-tâches</a>
          <cw-separator orientation="vertical" />
          <a href="#activite" class="rounded-sm hover:underline">Activité</a>
        </div>
      </div>`,
  }),
};

/** With a label: a date in the activity feed, « ou » between two choices; semantic. */
export const WithLabel: Story = {
  render: () => ({
    template: `
      <div class="grid w-80 gap-4">
        <cw-separator [decorative]="false">Aujourd'hui</cw-separator>
        <cw-separator [decorative]="false">ou</cw-separator>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const separators = within(light(canvasElement)).getAllByRole('separator');
    await expect(separators).toHaveLength(2);
  },
};

/** In a menu, `-mx-1 my-1`: the line touches the edges of the panel. */
export const InMenu: Story = {
  render: () => ({
    template: `
      <div class="w-56 rounded-lg border bg-popover p-1 text-sm text-popover-foreground shadow-md">
        <div class="rounded-md px-2 py-1.5">Dupliquer</div>
        <div class="rounded-md px-2 py-1.5">Copier le lien</div>
        <cw-separator class="-mx-1 my-1" />
        <div class="rounded-md px-2 py-1.5 text-destructive">Supprimer</div>
      </div>`,
  }),
};
