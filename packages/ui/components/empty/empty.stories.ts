import { CwButton } from '@cadenway/ui/components/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowClockwiseBold,
  phosphorCheckCircleBold,
  phosphorListChecksBold,
  phosphorMagnifyingGlassBold,
  phosphorPlusBold,
  phosphorTrayBold,
  phosphorWarningCircleBold,
} from '@ng-icons/phosphor-icons/bold';
import {
  type Meta,
  type StoryObj,
  applicationConfig,
  moduleMetadata,
} from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';

import { CwEmptyContent } from './empty-content/empty-content.component';
import { CwEmptyDescription } from './empty-description/empty-description.component';
import { CwEmptyHeader } from './empty-header/empty-header.component';
import { CwEmptyMedia } from './empty-media/empty-media.component';
import { CwEmptyTitle } from './empty-title/empty-title.component';
import { CwEmpty } from './empty.component';

/**
 * Constant meta
 *
 * @description
 * Empty, every state of its sheet in the Design System artifact and the loading error panel of the
 * integration guide, in the light and the dark theme. Copy from the mockup (`App.dc.html`).
 *
 * @type {Meta}
 */
const meta: Meta = {
  title: 'UI/Empty',
  decorators: [
    moduleMetadata({
      imports: [
        CwEmpty,
        CwEmptyHeader,
        CwEmptyMedia,
        CwEmptyTitle,
        CwEmptyDescription,
        CwEmptyContent,
        CwButton,
        NgIcon,
      ],
    }),
    applicationConfig({
      providers: [
        provideIcons({
          phosphorArrowClockwiseBold,
          phosphorCheckCircleBold,
          phosphorListChecksBold,
          phosphorMagnifyingGlassBold,
          phosphorPlusBold,
          phosphorTrayBold,
          phosphorWarningCircleBold,
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
 * Storybook configuration used for empty-state and error-panel examples.
 *
 * @type {StoryObj}
 */
type Story = StoryObj;

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

/** Empty list: `outline`, create a task or import a CSV file. */
export const EmptyList: Story = {
  render: () => ({
    template: `
      <cw-empty variant="outline" class="w-[28rem]">
        <cw-empty-header>
          <cw-empty-media><ng-icon name="phosphorTrayBold" /></cw-empty-media>
          <cw-empty-title>Aucune tâche dans cette liste</cw-empty-title>
          <cw-empty-description>Créez une première tâche ou importez un fichier CSV.</cw-empty-description>
        </cw-empty-header>
        <cw-empty-content>
          <button cwButton><ng-icon name="phosphorPlusBold" /> Créer une tâche</button>
          <button cwButton variant="outline">Importer un CSV</button>
        </cw-empty-content>
      </cw-empty>`,
  }),
};

/** No result: filters or search active, announced as a status; clear the filters. */
export const NoResults: Story = {
  render: () => ({
    template: `
      <cw-empty role="status" class="w-[28rem]">
        <cw-empty-header>
          <cw-empty-media><ng-icon name="phosphorMagnifyingGlassBold" /></cw-empty-media>
          <cw-empty-title>Aucun résultat pour « export pdf »</cw-empty-title>
          <cw-empty-description>Vérifiez l'orthographe ou retirez des filtres.</cw-empty-description>
        </cw-empty-header>
        <cw-empty-content>
          <button cwButton variant="outline">Effacer les filtres</button>
        </cw-empty-content>
      </cw-empty>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    await expect(within(light(canvasElement)).getByRole('status')).toHaveTextContent(
      'Aucun résultat pour « export pdf »',
    );
  },
};

/** Empty section of a panel: `sm`, a `ghost` action. */
export const Section: Story = {
  render: () => ({
    template: `
      <div class="w-80 rounded-xl border">
        <div class="flex h-10 items-center gap-2 border-b px-3 text-sm font-medium">
          Sous-tâches <span class="text-xs text-muted-foreground tabular-nums">0</span>
        </div>
        <cw-empty size="sm">
          <cw-empty-header>
            <cw-empty-media><ng-icon name="phosphorListChecksBold" /></cw-empty-media>
            <cw-empty-title>Aucune sous-tâche</cw-empty-title>
            <cw-empty-description>Découpez la tâche en étapes.</cw-empty-description>
          </cw-empty-header>
          <cw-empty-content>
            <button cwButton variant="ghost" size="sm"><ng-icon name="phosphorPlusBold" /> Ajouter une sous-tâche</button>
          </cw-empty-content>
        </cw-empty>
      </div>`,
  }),
};

/** Up to date: a positive state, no action, in a popover. */
export const UpToDate: Story = {
  render: () => ({
    template: `
      <div class="w-80 rounded-lg border bg-popover text-popover-foreground shadow-md">
        <cw-empty size="sm">
          <cw-empty-header>
            <cw-empty-media><ng-icon name="phosphorCheckCircleBold" /></cw-empty-media>
            <cw-empty-title>Vous êtes à jour</cw-empty-title>
            <cw-empty-description>Aucune notification non lue.</cw-empty-description>
          </cw-empty-header>
        </cw-empty>
      </div>`,
  }),
};

/** Loading error of a section: `outline` `sm`, the icon in `destructive`, Réessayer. */
export const LoadError: Story = {
  render: () => ({
    template: `
      <cw-empty variant="outline" size="sm" class="w-80">
        <cw-empty-header>
          <cw-empty-media tone="destructive"><ng-icon name="phosphorWarningCircleBold" /></cw-empty-media>
          <cw-empty-title>Impossible de charger l'activité</cw-empty-title>
          <cw-empty-description>La connexion au serveur a échoué.</cw-empty-description>
        </cw-empty-header>
        <cw-empty-content>
          <button cwButton variant="outline" size="sm"><ng-icon name="phosphorArrowClockwiseBold" /> Réessayer</button>
        </cw-empty-content>
      </cw-empty>`,
  }),
};

/**
 * The loading error panel of a view (integration guide, "Erreurs"; mockup `App.dc.html`): an
 * Empty composition in a `role="alert"` container, with Réessayer, État du service and the error
 * code under the actions.
 */
export const ErrorPanel: Story = {
  render: () => ({
    props: { retries: 0 },
    template: `
      <div role="alert" class="flex w-[32rem] items-center justify-center">
        <cw-empty>
          <cw-empty-header>
            <cw-empty-media tone="destructive"><ng-icon name="phosphorWarningCircleBold" /></cw-empty-media>
            <cw-empty-title>Impossible de charger les tâches</cw-empty-title>
            <cw-empty-description>Le serveur n'a pas répondu à temps. Vos données ne sont pas perdues : réessayez dans un instant.</cw-empty-description>
          </cw-empty-header>
          <cw-empty-content>
            <button cwButton variant="outline" (click)="retries = retries + 1"><ng-icon name="phosphorArrowClockwiseBold" /> Réessayer</button>
            <button cwButton variant="ghost">État du service</button>
          </cw-empty-content>
          <p class="font-mono text-xs text-muted-foreground">Erreur 503 · réf. PRODUITL</p>
        </cw-empty>
      </div>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const alert: HTMLElement = within(light(canvasElement)).getByRole('alert');
    await expect(alert).toHaveTextContent('Impossible de charger les tâches');
    await expect(within(alert).getByRole('button', { name: 'Réessayer' })).toBeEnabled();
  },
};
