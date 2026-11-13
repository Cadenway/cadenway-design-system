import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorWarningCircleBold } from '@ng-icons/phosphor-icons/bold';
import { phosphorCheckCircleFill } from '@ng-icons/phosphor-icons/fill';
import {
  type Meta,
  type StoryObj,
  applicationConfig,
  moduleMetadata,
} from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';

import { CwProgress } from './progress/progress.component';

/**
 * Progress, every state of its sheet in the Design System artifact, in the light and the dark
 * theme. Copy from the sheet's "Dans Cadenway" section (sprint, import, subtasks, storage quota).
 */
const meta: Meta = {
  title: 'UI/Progress',
  decorators: [
    moduleMetadata({ imports: [CwProgress, NgIcon] }),
    applicationConfig({
      providers: [provideIcons({ phosphorCheckCircleFill, phosphorWarningCircleBold })],
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

/** The three variants at the three sizes, at 60 %. */
export const VariantsAndSizes: Story = {
  render: () => ({
    template: `
      <div class="grid w-full max-w-xl grid-cols-[5rem_1fr_1fr_1fr] items-center gap-x-5 gap-y-3 text-xs text-muted-foreground">
        <span></span><code>default</code><code>success</code><code>destructive</code>
        <span>sm · 4 px</span>
        <cw-progress size="sm" [value]="60" ariaLabel="Exemple default sm" />
        <cw-progress size="sm" variant="success" [value]="60" ariaLabel="Exemple success sm" />
        <cw-progress size="sm" variant="destructive" [value]="60" ariaLabel="Exemple destructive sm" />
        <span>default · 6 px</span>
        <cw-progress [value]="60" ariaLabel="Exemple default default" />
        <cw-progress variant="success" [value]="60" ariaLabel="Exemple success default" />
        <cw-progress variant="destructive" [value]="60" ariaLabel="Exemple destructive default" />
        <span>lg · 8 px</span>
        <cw-progress size="lg" [value]="60" ariaLabel="Exemple default lg" />
        <cw-progress size="lg" variant="success" [value]="60" ariaLabel="Exemple success lg" />
        <cw-progress size="lg" variant="destructive" [value]="60" ariaLabel="Exemple destructive lg" />
      </div>`,
  }),
};

/** Empty, in progress and complete; the value is always written next to the bar. */
export const Values: Story = {
  render: () => ({
    template: `
      <div class="grid w-full max-w-sm gap-3">
        <div class="grid grid-cols-[1fr_auto] items-center gap-3">
          <cw-progress [value]="0" ariaLabel="Avancement 0 %" />
          <span class="w-24 text-right text-xs text-muted-foreground tabular-nums">0 % · vide</span>
        </div>
        <div class="grid grid-cols-[1fr_auto] items-center gap-3">
          <cw-progress [value]="40" ariaLabel="Avancement 40 %" />
          <span class="w-24 text-right text-xs text-muted-foreground tabular-nums">40 % · en cours</span>
        </div>
        <div class="grid grid-cols-[1fr_auto] items-center gap-3">
          <cw-progress [value]="100" ariaLabel="Avancement 100 %" />
          <span class="w-24 text-right text-xs text-muted-foreground tabular-nums">100 % · terminé</span>
        </div>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    await expect(scope.getByRole('progressbar', { name: 'Avancement 100 %' })).toHaveAttribute(
      'data-state',
      'complete',
    );
    await expect(scope.getByRole('progressbar', { name: 'Avancement 40 %' })).toHaveAttribute(
      'aria-valuetext',
      '40 %',
    );
  },
};

/** An unknown amount: a pulsing segment, no `aria-valuenow` (import analysis). */
export const Indeterminate: Story = {
  render: () => ({
    template: `
      <div class="grid w-full max-w-sm gap-1.5">
        <div class="flex items-center justify-between gap-3 text-sm">
          <span class="font-medium">Analyse du fichier…</span>
          <span class="text-muted-foreground tabular-nums">export-trello.json</span>
        </div>
        <cw-progress [value]="null" ariaLabel="Analyse du fichier" />
        <div class="mt-2 grid grid-cols-2 gap-3">
          <cw-progress size="sm" [value]="null" ariaLabel="Envoi en cours" />
          <cw-progress size="lg" [value]="null" ariaLabel="Préparation" />
        </div>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const bar = within(light(canvasElement)).getByRole('progressbar', {
      name: 'Analyse du fichier',
    });
    await expect(bar).toHaveAttribute('data-state', 'indeterminate');
    await expect(bar).not.toHaveAttribute('aria-valuenow');
  },
};

/** In Cadenway: the sprint header and a JSON import. */
export const SprintAndImport: Story = {
  render: () => ({
    template: `
      <div class="grid w-full max-w-sm gap-4">
        <div class="grid gap-1.5">
          <div class="flex items-center justify-between gap-3 text-sm">
            <span class="font-medium">Sprint 14</span>
            <span class="text-muted-foreground tabular-nums">17 / 25 tâches · 68 %</span>
          </div>
          <cw-progress [value]="68" ariaLabel="Avancement du sprint 14" />
        </div>
        <div class="grid gap-1.5">
          <div class="flex items-center justify-between gap-3 text-sm">
            <span class="font-medium">Import de 48 tâches</span>
            <span class="text-muted-foreground tabular-nums">12 %</span>
          </div>
          <cw-progress size="lg" [value]="12" ariaLabel="Import de 48 tâches" />
        </div>
      </div>`,
  }),
};

/** In Cadenway: subtasks done (`success`), a finished checklist and an exceeded quota (error). */
export const SubtasksAndQuota: Story = {
  render: () => ({
    template: `
      <div class="grid w-full max-w-sm gap-4">
        <div class="flex items-center gap-3 text-sm whitespace-nowrap">
          <span class="font-medium">Sous-tâches</span>
          <div class="w-20 shrink-0">
            <cw-progress variant="success" size="sm" [value]="2" [max]="5" ariaLabel="Sous-tâches terminées" valueText="2 sur 5" />
          </div>
          <span class="text-muted-foreground tabular-nums">2 / 5</span>
        </div>
        <div class="grid gap-1.5">
          <div class="flex items-center justify-between gap-3 text-sm">
            <span class="font-medium">Checklist de recette</span>
            <span class="flex items-center gap-1.5 text-muted-foreground tabular-nums">
              5 / 5 <ng-icon name="phosphorCheckCircleFill" size="0.875rem" class="text-jade" aria-hidden="true" /> Terminé
            </span>
          </div>
          <cw-progress variant="success" [value]="5" [max]="5" ariaLabel="Checklist de recette" valueText="5 sur 5, terminé" />
        </div>
        <div class="grid gap-1.5">
          <div class="flex items-center justify-between gap-3 text-sm">
            <span class="font-medium">Stockage</span>
            <span class="text-muted-foreground tabular-nums">52 Go / 50 Go</span>
          </div>
          <cw-progress variant="destructive" [value]="100" ariaLabel="Stockage utilisé" valueText="104 %, quota dépassé" />
          <p class="flex items-center gap-1.5 text-xs text-destructive">
            <ng-icon name="phosphorWarningCircleBold" size="0.875rem" aria-hidden="true" />
            Quota dépassé : les envois sont bloqués.
          </p>
        </div>
      </div>`,
  }),
};
