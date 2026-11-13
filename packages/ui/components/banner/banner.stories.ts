import { CwButton } from '@cadenway/ui/components/button';
import { provideIcons } from '@ng-icons/core';
import { phosphorArchiveBold, phosphorWrenchBold } from '@ng-icons/phosphor-icons/bold';
import {
  type Meta,
  type StoryObj,
  applicationConfig,
  moduleMetadata,
} from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwBannerActions } from './banner-actions/banner-actions.component';
import { CwBanner } from './banner.component';

/**
 * Banner, every state of its sheet in the Design System artifact, in the light and the dark theme.
 * Copy from the sheet's "Dans Cadenway" section (instance messages, archived copy, import).
 */
const meta: Meta = {
  title: 'UI/Banner',
  decorators: [
    moduleMetadata({ imports: [CwBanner, CwBannerActions, CwButton] }),
    applicationConfig({ providers: [provideIcons({ phosphorArchiveBold, phosphorWrenchBold })] }),
  ],
};

export default meta;

type Story = StoryObj;

function light(canvasElement: HTMLElement): HTMLElement {
  const scope = canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

/** The five tones, inline, with their actions and the close button. */
export const Tones: Story = {
  render: () => ({
    template: `
      <div class="grid w-full max-w-3xl gap-2">
        <cw-banner title="Cadenway 1.5.0 est disponible." description="Vue Gantt et automatisations planifiées.">
          <cw-banner-actions>
            <button cwButton variant="ghost" size="sm">Nouveautés</button>
            <button cwButton variant="outline" size="sm">Mettre à jour</button>
          </cw-banner-actions>
        </cw-banner>
        <cw-banner tone="success" title="Import terminé." description="248 tâches ajoutées à l'espace Produit.">
          <cw-banner-actions>
            <button cwButton variant="outline" size="sm">Voir l'espace</button>
          </cw-banner-actions>
        </cw-banner>
        <cw-banner tone="warning" title="Stockage presque plein." description="46 Go utilisés sur 50 Go.">
          <cw-banner-actions>
            <button cwButton variant="outline" size="sm">Gérer le stockage</button>
          </cw-banner-actions>
        </cw-banner>
        <cw-banner tone="error" title="La sauvegarde de cette nuit a échoué." description="Espace disque insuffisant sur le serveur." [dismissible]="false">
          <cw-banner-actions>
            <button cwButton variant="outline" size="sm">Voir le journal</button>
          </cw-banner-actions>
        </cw-banner>
        <cw-banner tone="neutral" icon="phosphorWrenchBold" title="Maintenance dimanche 15 nov., 02:00 – 03:00." description="L'instance sera en lecture seule." />
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    await expect(scope.getAllByRole('status')).toHaveLength(4);
    await expect(scope.getByRole('alert')).toHaveTextContent(
      'La sauvegarde de cette nuit a échoué.',
    );
  },
};

/** A title alone, without action or close button (archived copy). */
export const TitleOnly: Story = {
  render: () => ({
    template: `
      <div class="w-full max-w-xl">
        <cw-banner tone="neutral" icon="phosphorArchiveBold" title="Copie archivée de « Sprint 12 » : modifications désactivées." [dismissible]="false" />
      </div>`,
  }),
};

/** A long message on several lines: the title on its own line, the actions at the top. */
export const Multiline: Story = {
  render: () => ({
    template: `
      <div class="w-full max-w-md">
        <cw-banner multiline title="Nouvelle politique de mots de passe." description="À partir du 1er décembre : 12 caractères minimum, à changer à la prochaine connexion.">
          <cw-banner-actions>
            <button cwButton variant="ghost" size="sm">En savoir plus</button>
          </cw-banner-actions>
        </cw-banner>
      </div>`,
  }),
};

/** `top`: flat, across the window, above the application. */
export const Top: Story = {
  render: () => ({
    template: `
      <div class="w-full max-w-3xl overflow-hidden rounded-lg border">
        <cw-banner placement="top" tone="warning" title="Stockage presque plein." description="46 Go utilisés sur 50 Go.">
          <cw-banner-actions>
            <button cwButton variant="outline" size="sm">Gérer le stockage</button>
          </cw-banner-actions>
        </cw-banner>
        <div class="grid h-24 content-start gap-1 p-4">
          <p class="text-base font-semibold">Sprint 14</p>
          <p class="text-sm text-muted-foreground">12 – 26 nov. · 18 tâches ouvertes · 68 % terminé</p>
        </div>
      </div>`,
  }),
};

/** Keyboard: Tab reaches the action then « Masquer le bandeau »; Enter hides the banner. */
export const Dismiss: Story = {
  render: () => ({
    props: { hidden: 0 },
    template: `
      <div class="grid w-full max-w-3xl gap-3">
        <cw-banner tone="success" title="Import terminé." description="248 tâches ajoutées à l'espace Produit." (dismissed)="hidden = hidden + 1">
          <cw-banner-actions>
            <button cwButton variant="outline" size="sm">Voir l'espace</button>
          </cw-banner-actions>
        </cw-banner>
        <p class="text-sm text-muted-foreground">{{ hidden }} bandeau(x) masqué(s)</p>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    await userEvent.tab();
    await expect(scope.getByRole('button', { name: "Voir l'espace" })).toHaveFocus();
    await userEvent.tab();
    await expect(scope.getByRole('button', { name: 'Masquer le bandeau' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(scope.queryByRole('status')).toBeNull();
    await expect(scope.getByText('1 bandeau(x) masqué(s)')).toBeVisible();
  },
};
