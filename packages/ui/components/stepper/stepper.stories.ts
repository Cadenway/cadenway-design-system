import { CwButton } from '@cadenway/ui/components/button';
import { CwInput } from '@cadenway/ui/components/input';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwStep } from './step/step.component';
import { CwStepper } from './stepper.component';

/**
 * Constant meta
 *
 * @description
 * Stepper, every state of its sheet in the Design System artifact, in the light and the dark
 * theme. Copy from the sheet ("Dans Cadenway": first installation, JSON import).
 *
 * @type {Meta}
 */
const meta: Meta = {
  title: 'UI/Stepper',
  decorators: [moduleMetadata({ imports: [CwStepper, CwStep, CwButton, CwInput] })],
};

export default meta;

/**
 * Type Story
 *
 * @description
 * Storybook story configuration for stepper examples.
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
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: {
      getByRole(role: string, options?: { name?: string }): HTMLElement;
      getByText(text: RegExp): HTMLElement;
    } = within(light(canvasElement));
    const list: HTMLElement = scope.getByRole('list', { name: 'Première installation' });
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
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: {
      getByRole(role: string, options?: { name?: string }): HTMLElement;
      getByText(text: RegExp): HTMLElement;
    } = within(light(canvasElement));
    const list: HTMLElement = scope.getByRole('list', { name: "Création d'un espace" });
    const [name, members]: HTMLElement[] = within(list).getAllByRole('button');

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

/**
 * Segmented bar in the mockup's violet (`tone="primary"`, `App.dc.html`, the onboarding
 * assistant): the done and current bars in `bg-primary`.
 */
export const SegmentsPrimary: Story = {
  render: () => ({
    template: `
      <div class="w-full max-w-xl">
        <cw-stepper variant="segments" tone="primary" ariaLabel="Steps" [selected]="1">
          <cw-step label="Space" />
          <cw-step label="Template" />
          <cw-step label="Team" />
          <cw-step label="Import" />
        </cw-stepper>
      </div>`,
  }),
};

/**
 * Segmented bar (`variant="segments"`), the onboarding assistant of the mockup (`App.dc.html`): one
 * bar per step, filled up to the current one, the labels below, no step clickable and no position
 * line; the consumer writes « Step 2 of 4 » and moves with its own buttons. English source copy, as
 * the webapp writes it.
 */
export const Segments: Story = {
  render: () => ({
    props: { step: 1 },
    template: `
      <div class="flex w-full max-w-xl flex-col gap-6">
        <cw-stepper #wizard variant="segments" ariaLabel="Steps" [(selected)]="step">
          <cw-step label="Space" />
          <cw-step label="Template" />
          <cw-step label="Team" />
          <cw-step label="Import" />
        </cw-stepper>
        <div class="flex flex-col gap-4 rounded-xl border bg-card p-5">
          <p class="text-xs font-medium text-muted-foreground">Step {{ step + 1 }} of 4</p>
          <div class="flex items-center gap-2">
            <button cwButton variant="ghost" (click)="wizard.previous()">Back</button>
            <button cwButton class="ml-auto" (click)="wizard.next()">Continue</button>
          </div>
        </div>
      </div>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: {
      getByRole(role: string, options?: { name?: string }): HTMLElement;
      getByText(text: RegExp): HTMLElement;
    } = within(light(canvasElement));
    const list: HTMLElement = scope.getByRole('list', { name: 'Steps' });
    await expect(within(list).queryAllByRole('button')).toHaveLength(0);
    await expect(within(list).getAllByRole('listitem')[1]).toHaveAttribute('aria-current', 'step');
    await expect(scope.getByText(/Step 2 of 4/)).toBeVisible();

    await userEvent.click(scope.getByRole('button', { name: 'Continue' }));
    await expect(within(list).getAllByRole('listitem')[2]).toHaveAttribute('aria-current', 'step');
    await expect(scope.getByText(/Step 3 of 4/)).toBeVisible();

    await userEvent.click(scope.getByRole('button', { name: 'Back' }));
    await expect(within(list).getAllByRole('listitem')[1]).toHaveAttribute('aria-current', 'step');
  },
};
