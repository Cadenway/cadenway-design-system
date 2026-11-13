import { signal } from '@angular/core';
import { CwButton } from '@cadenway/ui/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArchiveBold, phosphorTrashBold } from '@ng-icons/phosphor-icons/bold';
import { phosphorWarningCircleFill } from '@ng-icons/phosphor-icons/fill';
import {
  type Meta,
  type StoryObj,
  applicationConfig,
  moduleMetadata,
} from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { CwAlertDialogAction } from './alert-dialog-action/alert-dialog-action.directive';
import { CwAlertDialogCancel } from './alert-dialog-cancel/alert-dialog-cancel.directive';
import { CwAlertDialogDescription } from './alert-dialog-description/alert-dialog-description.directive';
import { CwAlertDialogMedia } from './alert-dialog-media/alert-dialog-media.component';
import { CwAlertDialogTitle } from './alert-dialog-title/alert-dialog-title.directive';
import { CwAlertDialogTrigger } from './alert-dialog-trigger/alert-dialog-trigger.directive';
import { CwAlertDialog } from './alert-dialog.component';

/**
 * Alert Dialog, every state of its sheet in the Design System artifact, in the light and the dark
 * theme. The open dialog renders in a CDK overlay on the page body, outside the theme scopes: the
 * visual states are static renderings of the preview (the dialog in a framed page), the interactive
 * stories open the real dialog in their play function and close it again. Copy from the mockup
 * (`App.dc.html`) and the sheet.
 */
const meta: Meta = {
  title: 'UI/AlertDialog',
  decorators: [
    moduleMetadata({
      imports: [
        CwAlertDialog,
        CwAlertDialogAction,
        CwAlertDialogCancel,
        CwAlertDialogDescription,
        CwAlertDialogMedia,
        CwAlertDialogTitle,
        CwAlertDialogTrigger,
        CwButton,
        NgIcon,
      ],
    }),
    applicationConfig({
      providers: [
        provideIcons({ phosphorArchiveBold, phosphorTrashBold, phosphorWarningCircleFill }),
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

async function closed(timeout = 1000): Promise<void> {
  await waitFor(() => expect(document.body.querySelector('[role="alertdialog"]')).toBeNull(), {
    timeout,
  });
}

// A framed page under the backdrop, from the preview.
function frame(window: string): string {
  return `
    <div class="relative isolate h-[200px] w-full max-w-xl overflow-hidden rounded-lg border bg-background">
      <div class="h-full w-36 space-y-2.5 border-r p-3" aria-hidden="true">
        <div class="h-2.5 w-16 rounded-full bg-secondary"></div>
        <div class="h-2 w-24 rounded-full bg-secondary"></div>
      </div>
      <div class="absolute inset-0 bg-black/30 dark:bg-black/60" aria-hidden="true"></div>
      <div class="absolute top-1/2 left-1/2 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl border bg-popover p-6 text-popover-foreground shadow-xl">
        ${window}
      </div>
    </div>`;
}

/** `destructive`: the action is a `destructive` button with the trash icon; focus starts on Annuler. */
export const Destructive: Story = {
  render: () => ({
    template: frame(`
      <div class="flex flex-col gap-2">
        <h2 cwAlertDialogTitle>Supprimer la liste « Backlog » ?</h2>
        <p cwAlertDialogDescription>Ses 64 tâches, leurs sous-tâches et leurs commentaires seront supprimés définitivement.</p>
      </div>
      <div class="flex justify-end gap-2">
        <button cwButton variant="outline">Annuler</button>
        <button cwButton variant="destructive"><ng-icon name="phosphorTrashBold" /> Supprimer la liste</button>
      </div>`),
  }),
};

/** `default`: a heavy but reversible action, in ink. */
export const Default: Story = {
  render: () => ({
    template: frame(`
      <div class="flex flex-col gap-2">
        <h2 cwAlertDialogTitle>Archiver le sprint 13 ?</h2>
        <p cwAlertDialogDescription>Ses 4 tâches non terminées passeront dans le sprint 14. Le sprint archivé reste consultable.</p>
      </div>
      <div class="flex justify-end gap-2">
        <button cwButton variant="outline">Annuler</button>
        <button cwButton><ng-icon name="phosphorArchiveBold" /> Archiver le sprint</button>
      </div>`),
  }),
};

/** The action's states: rest, disabled until the name is typed, running (`pending`). */
export const ActionStates: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-start gap-6">
        <button cwButton variant="destructive"><ng-icon name="phosphorTrashBold" /> Supprimer</button>
        <button cwButton variant="destructive" disabled><ng-icon name="phosphorTrashBold" /> Supprimer</button>
        <button cwButton variant="destructive" loading><ng-icon name="phosphorTrashBold" /> Suppression…</button>
      </div>`,
  }),
};

/** Keyboard: focus on Annuler at opening, Escape cancels and gives the focus back to the trigger. */
export const Keyboard: Story = {
  render: () => ({
    template: `
      <button cwButton variant="outline" [cwAlertDialogTrigger]="remove">Supprimer la liste</button>
      <cw-alert-dialog #remove variant="destructive">
        <h2 cwAlertDialogTitle>Supprimer la liste « Backlog » ?</h2>
        <p cwAlertDialogDescription>Ses 64 tâches, leurs sous-tâches et leurs commentaires seront supprimés définitivement.</p>
        <button cwButton variant="outline" cwAlertDialogCancel>Annuler</button>
        <button cwButton variant="destructive" cwAlertDialogAction><ng-icon name="phosphorTrashBold" /> Supprimer la liste</button>
      </cw-alert-dialog>`,
  }),
  play: async ({ canvasElement }) => {
    const trigger = within(light(canvasElement)).getByRole('button', {
      name: 'Supprimer la liste',
    });
    await userEvent.click(trigger);
    const dialog = await within(document.body).findByRole('alertdialog', {
      name: 'Supprimer la liste « Backlog » ?',
    });
    await waitFor(() =>
      expect(within(dialog).getByRole('button', { name: 'Annuler' })).toHaveFocus(),
    );

    await userEvent.keyboard('{Escape}');
    await closed();
    await expect(trigger).toHaveFocus();
  },
};

/** `sm`: centered, the `warning-circle` media above the title, the two buttons side by side. */
export const SmallWithMedia: Story = {
  render: () => ({
    template: `
      <button cwButton variant="outline" [cwAlertDialogTrigger]="leave">Retirer Samuel Roux</button>
      <cw-alert-dialog #leave variant="destructive" size="sm">
        <cw-alert-dialog-media><ng-icon name="phosphorWarningCircleFill" /></cw-alert-dialog-media>
        <h2 cwAlertDialogTitle>Retirer Samuel Roux ?</h2>
        <p cwAlertDialogDescription>Il perd l'accès à l'espace Produit. Ses 6 tâches restent assignées.</p>
        <button cwButton variant="outline" cwAlertDialogCancel>Annuler</button>
        <button cwButton variant="destructive" cwAlertDialogAction>Retirer</button>
      </cw-alert-dialog>`,
  }),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(light(canvasElement)).getByRole('button', { name: 'Retirer Samuel Roux' }),
    );
    const dialog = await within(document.body).findByRole('alertdialog', {
      name: 'Retirer Samuel Roux ?',
    });
    await expect(dialog.firstElementChild).toHaveAttribute('data-size', 'sm');

    await userEvent.click(within(dialog).getByRole('button', { name: 'Retirer' }));
    await closed();
  },
};

/**
 * Typed confirmation (`confirmText`): the action stays disabled until « Marketing » is typed;
 * Enter in the field then confirms. The spaces concerned are listed, eight then « + n autres ».
 */
export const ConfirmText: Story = {
  render: () => ({
    props: {
      lists: [
        'Campagnes',
        'Contenus',
        'Événements',
        'Partenariats',
        'Presse',
        'Réseaux sociaux',
        'Salons',
        'Site',
        'Newsletters',
        'Vidéos',
      ],
    },
    template: `
      <button cwButton variant="outline" [cwAlertDialogTrigger]="space">Supprimer l'espace</button>
      <cw-alert-dialog #space variant="destructive" confirmText="Marketing" [items]="lists">
        <h2 cwAlertDialogTitle>Supprimer l'espace « Marketing » ?</h2>
        <p cwAlertDialogDescription>Ses 10 listes et 32 tâches seront supprimées définitivement.</p>
        <button cwButton variant="outline" cwAlertDialogCancel>Annuler</button>
        <button cwButton variant="destructive" cwAlertDialogAction><ng-icon name="phosphorTrashBold" /> Supprimer l'espace</button>
      </cw-alert-dialog>`,
  }),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(light(canvasElement)).getByRole('button', { name: "Supprimer l'espace" }),
    );
    const dialog = await within(document.body).findByRole('alertdialog', {
      name: "Supprimer l'espace « Marketing » ?",
    });
    await expect(within(dialog).getByText('+ 2 autres')).toBeInTheDocument();
    const field = within(dialog).getByRole('textbox', {
      name: 'Pour confirmer, saisissez Marketing',
    });
    const action = within(dialog).getByRole('button', { name: "Supprimer l'espace" });
    await waitFor(() => expect(field).toHaveFocus());
    await expect(action).toHaveAttribute('aria-disabled', 'true');

    await userEvent.type(field, 'Market');
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    await userEvent.type(field, 'ing');
    await expect(action).not.toHaveAttribute('aria-disabled');
    await userEvent.keyboard('{Enter}');
    await closed();
  },
};

/** Running action (`pending`): spinner and participle label, Annuler and Escape blocked. */
export const Pending: Story = {
  render: () => {
    const pending = signal(false);
    // The consumer's deletion: pending for a moment, then it closes the dialog itself.
    const remove = (dialog: CwAlertDialog): void => {
      pending.set(true);
      setTimeout(() => {
        pending.set(false);
        dialog.close();
      }, 800);
    };
    return {
      props: { pending, remove },
      template: `
        <button cwButton variant="outline" [cwAlertDialogTrigger]="automation">Supprimer l'automatisation</button>
        <cw-alert-dialog #automation variant="destructive" [pending]="pending()" (confirm)="remove(automation)">
          <h2 cwAlertDialogTitle>Supprimer l'automatisation ?</h2>
          <p cwAlertDialogDescription>Elle ne s'exécutera plus sur les nouvelles tâches.</p>
          <button cwButton variant="outline" cwAlertDialogCancel>Annuler</button>
          <button cwButton variant="destructive" cwAlertDialogAction [loading]="pending()">
            <ng-icon name="phosphorTrashBold" /> {{ pending() ? 'Suppression…' : 'Supprimer' }}
          </button>
        </cw-alert-dialog>`,
    };
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(light(canvasElement)).getByRole('button', { name: "Supprimer l'automatisation" }),
    );
    const dialog = await within(document.body).findByRole('alertdialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Supprimer' }));
    await waitFor(() => expect(dialog.firstElementChild).toHaveAttribute('aria-busy', 'true'));

    await userEvent.keyboard('{Escape}');
    await expect(within(document.body).getByRole('alertdialog')).toBeInTheDocument();
    await expect(within(dialog).getByRole('button', { name: 'Annuler' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    await closed(3000);
  },
};
