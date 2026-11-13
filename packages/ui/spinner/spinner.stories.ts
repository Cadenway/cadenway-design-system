import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';

import { CwLoadingOverlay } from './loading-overlay';
import { CwSpinner, CwSpinnerIndicator } from './spinner';

/**
 * Spinner, every state of its sheet in the Design System artifact, in the light and the dark theme.
 */
const meta: Meta = {
  title: 'UI/Spinner',
  decorators: [moduleMetadata({ imports: [CwSpinner, CwSpinnerIndicator, CwLoadingOverlay] })],
};

export default meta;

type Story = StoryObj;

/** The six sizes, muted. */
export const Sizes: Story = {
  render: () => ({
    template: `
      <div class="flex items-center gap-4 text-muted-foreground">
        <svg cwSpinner size="xs" label="Chargement (très petit)"></svg>
        <svg cwSpinner size="sm" label="Chargement (petit)"></svg>
        <svg cwSpinner label="Chargement"></svg>
        <svg cwSpinner size="lg" label="Chargement (grand)"></svg>
        <svg cwSpinner size="xl" label="Chargement (très grand)"></svg>
        <svg cwSpinner size="page" label="Chargement de la page"></svg>
      </div>`,
  }),
};

/** With its visible label, the wait described. */
export const WithLabel: Story = {
  render: () => ({
    template: `<cw-spinner label="Analyse des 128 tâches…" showLabel [delay]="0" />`,
  }),
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findAllByText('Analyse des 128 tâches…')).toHaveLength(
      2,
    );
  },
};

/** An area refreshing under a veil, its old content still visible. */
export const Overlay: Story = {
  render: () => ({
    template: `
      <div class="relative w-72 rounded-xl border border-border bg-card p-4"
           [cwLoadingOverlay]="true" loadingLabel="Actualisation des tâches">
        <p class="text-sm">Corriger l'export CSV des tâches</p>
        <p class="text-xs text-muted-foreground">Échéance 14 nov.</p>
      </div>`,
  }),
};
