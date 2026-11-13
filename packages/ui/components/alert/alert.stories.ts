import { CwButton } from '@cadenway/ui/components/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowClockwiseBold } from '@ng-icons/phosphor-icons/bold';
import {
  type Meta,
  type StoryObj,
  applicationConfig,
  moduleMetadata,
} from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwAlertActions } from './alert-actions/alert-actions.component';
import { CwAlertDescription } from './alert-description/alert-description.component';
import { CwAlertTitle } from './alert-title/alert-title.component';
import { CwAlert } from './alert.component';

/**
 * Alert, every state of its sheet in the Design System artifact, in the light and the dark theme.
 * Copy from the sheet's "Dans Cadenway" section (settings and administration).
 */
const meta: Meta = {
  title: 'UI/Alert',
  decorators: [
    moduleMetadata({
      imports: [CwAlert, CwAlertTitle, CwAlertDescription, CwAlertActions, CwButton, NgIcon],
    }),
    applicationConfig({ providers: [provideIcons({ phosphorArrowClockwiseBold })] }),
  ],
};

export default meta;

type Story = StoryObj;

function light(canvasElement: HTMLElement): HTMLElement {
  const scope = canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

/** The four tones: information, success (dismissible), warning with an action, error. */
export const Tones: Story = {
  render: () => ({
    template: `
      <div class="grid w-full max-w-xl gap-3">
        <cw-alert>
          <cw-alert-title>Sauvegarde planifiée</cw-alert-title>
          <cw-alert-description>La prochaine sauvegarde de l'instance a lieu cette nuit à 02:00.</cw-alert-description>
        </cw-alert>
        <cw-alert variant="success" dismissible>
          <cw-alert-title>Sauvegarde terminée</cw-alert-title>
          <cw-alert-description>2,4 Go copiés vers le stockage S3 en 3 min 12 s.</cw-alert-description>
        </cw-alert>
        <cw-alert variant="warning">
          <cw-alert-title>Stockage presque plein</cw-alert-title>
          <cw-alert-description>46 Go utilisés sur 50 Go. Les envois de pièces jointes seront bloqués à 100 %.</cw-alert-description>
          <cw-alert-actions>
            <button cwButton variant="outline" size="sm">Gérer le stockage</button>
          </cw-alert-actions>
        </cw-alert>
        <cw-alert variant="destructive" dismissible>
          <cw-alert-title>Envoi des e-mails interrompu</cw-alert-title>
          <cw-alert-description>Le serveur SMTP refuse la connexion. Vérifiez l'hôte et le port.</cw-alert-description>
          <cw-alert-actions>
            <button cwButton variant="outline" size="sm">Ouvrir les réglages</button>
            <button cwButton variant="ghost" size="sm">Réessayer</button>
          </cw-alert-actions>
        </cw-alert>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    await expect(scope.getAllByRole('status')).toHaveLength(2);
    await expect(scope.getAllByRole('alert')).toHaveLength(2);
  },
};

/** Compact, the title alone: without action, with an action at the right, dismissible. */
export const Compact: Story = {
  render: () => ({
    template: `
      <div class="grid w-full max-w-xl gap-3">
        <cw-alert size="compact">
          <cw-alert-title>Cadenway 1.4.0 est disponible.</cw-alert-title>
          <cw-alert-actions>
            <button cwButton variant="ghost" size="sm">Voir les nouveautés</button>
          </cw-alert-actions>
        </cw-alert>
        <cw-alert variant="success" size="compact" dismissible>
          <cw-alert-title>46 tâches importées, 2 ignorées.</cw-alert-title>
          <cw-alert-actions>
            <button cwButton variant="outline" size="sm">Voir le détail</button>
          </cw-alert-actions>
        </cw-alert>
        <cw-alert variant="warning" size="compact">
          <cw-alert-title>Le certificat TLS expire dans 12 jours.</cw-alert-title>
        </cw-alert>
        <cw-alert variant="destructive" size="compact">
          <cw-alert-title>La synchronisation a échoué.</cw-alert-title>
          <cw-alert-actions>
            <button cwButton variant="outline" size="sm"><ng-icon name="phosphorArrowClockwiseBold" /> Réessayer</button>
          </cw-alert-actions>
        </cw-alert>
      </div>`,
  }),
};

/** Keyboard: Tab reaches the action then « Fermer »; Escape closes and moves the focus on. */
export const Keyboard: Story = {
  render: () => ({
    props: { closed: 0 },
    template: `
      <div class="grid w-full max-w-xl gap-3">
        <cw-alert variant="destructive" dismissible (dismissed)="closed = closed + 1">
          <cw-alert-title>Envoi des e-mails interrompu</cw-alert-title>
          <cw-alert-description>Le serveur SMTP refuse la connexion. Vérifiez l'hôte et le port.</cw-alert-description>
          <cw-alert-actions>
            <button cwButton variant="outline" size="sm">Ouvrir les réglages</button>
          </cw-alert-actions>
        </cw-alert>
        <button cwButton variant="outline" class="justify-self-start">Tester la connexion</button>
        <p class="text-sm text-muted-foreground">{{ closed }} fermeture(s)</p>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    await userEvent.tab();
    await expect(scope.getByRole('button', { name: 'Ouvrir les réglages' })).toHaveFocus();
    await userEvent.tab();
    await expect(scope.getByRole('button', { name: 'Fermer' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await expect(scope.queryByRole('alert')).toBeNull();
    await expect(scope.getByRole('button', { name: 'Tester la connexion' })).toHaveFocus();
    await expect(scope.getByText('1 fermeture(s)')).toBeVisible();
  },
};
