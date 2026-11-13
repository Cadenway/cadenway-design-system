import { CwButton } from '@cadenway/ui/button';
import { CwInput } from '@cadenway/ui/input';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwStep } from './step/step.component';
import { CwStepper } from './stepper.component';

/**
 * Stepper, every state of its sheet in the Design System artifact, in the light and the dark
 * theme. Copy from the sheet ("Dans Cadenway": first installation, JSON import).
 */
const meta: Meta = {
  title: 'UI/Stepper',
  decorators: [moduleMetadata({ imports: [CwStepper, CwStep, CwButton, CwInput] })],
};

export default meta;

type Story = StoryObj;

function light(canvasElement: HTMLElement): HTMLElement {
  const scope = canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

/** Done, current, to come and optional steps, the position under the row. */
export const Horizontal: Story = {
  render: () => ({
    props: { step: 2 },
    template: `
      <cw-stepper #setup class="w-full" ariaLabel="Première installation" [(selected)]="step">
        <cw-step label="Instance" completed />
        <cw-step label="Compte administrateur" completed />
        <cw-step label="Équipe" description="invitez les personnes avec qui vous travaillez.">
          <div class="flex items-center gap-2">
            <button cwButton (click)="setup.next()">Continuer</button>
            <button cwButton variant="ghost" (click)="setup.previous()">Retour</button>
          </div>
        </cw-step>
        <cw-step label="Serveur e-mail" optional />
        <cw-step label="Premier espace" />
      </cw-stepper>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    const list = scope.getByRole('list', { name: 'Première installation' });
    await expect(within(list).getAllByRole('button')).toHaveLength(2);
    await expect(scope.getByText(/Étape 3 sur 5/)).toBeVisible();

    await userEvent.click(scope.getByRole('button', { name: 'Continuer' }));
    await expect(scope.getByText(/Étape 4 sur 5/)).toBeVisible();
    await expect(within(list).getAllByRole('button')).toHaveLength(3);
  },
};

/** A step in error: the message under the row, in text, never the color alone. */
export const WithError: Story = {
  render: () => ({
    template: `
      <cw-stepper class="w-full" ariaLabel="Import JSON" [selected]="1">
        <cw-step label="Fichier" completed />
        <cw-step label="Correspondance des champs"
                 error="Deux colonnes n'ont pas de champ correspondant : Sprint et Points." />
        <cw-step label="Vérification" />
        <cw-step label="Import" />
      </cw-stepper>`,
  }),
};

/** One column: descriptions, an optional step in error, the current step's panel unfolded. */
export const Vertical: Story = {
  render: () => ({
    template: `
      <cw-stepper orientation="vertical" ariaLabel="Première installation" [selected]="2">
        <cw-step label="Instance" description="cadenway.exemple.fr · version 1.5.0" completed />
        <cw-step label="Serveur e-mail" optional
                 error="Connexion SMTP refusée : vérifiez l'hôte et le port, ou passez cette étape." />
        <cw-step label="Équipe" description="Invitez les personnes avec qui vous travaillez.">
          <div class="flex items-center gap-2">
            <input cwInput class="w-60" placeholder="karim.benali@exemple.fr" aria-label="Adresse e-mail" />
            <button cwButton variant="outline">Inviter</button>
          </div>
          <div class="flex items-center gap-2">
            <button cwButton>Continuer</button>
            <button cwButton variant="ghost">Passer</button>
          </div>
        </cw-step>
        <cw-step label="Premier espace" description="Un espace regroupe des listes et des tableaux." />
        <cw-step label="Importer des tâches" description="Depuis un export JSON ou CSV." optional />
      </cw-stepper>`,
  }),
};

/** `sm`, 16 px indicators, in the import dialog. */
export const Small: Story = {
  render: () => ({
    template: `
      <cw-stepper size="sm" class="w-full max-w-md" ariaLabel="Import JSON" [selected]="1">
        <cw-step label="Fichier" completed />
        <cw-step label="Correspondance" />
        <cw-step label="Vérification" />
        <cw-step label="Import" />
      </cw-stepper>`,
  }),
};

/** Tab reaches the done steps, the arrows move between them, Enter goes back to one. */
export const Keyboard: Story = {
  render: () => ({
    props: { step: 2 },
    template: `
      <cw-stepper class="w-full" ariaLabel="Création d'un espace" [(selected)]="step">
        <cw-step label="Nom" completed />
        <cw-step label="Membres" completed />
        <cw-step label="Listes"><h2 class="text-base font-semibold">Listes de l'espace</h2></cw-step>
        <cw-step label="Résumé" />
      </cw-stepper>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    const list = scope.getByRole('list', { name: "Création d'un espace" });
    const [name, members] = within(list).getAllByRole('button');

    await userEvent.tab();
    await expect(name).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(members).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(name).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(scope.getByText(/Étape 1 sur 4/)).toBeVisible();
  },
};
