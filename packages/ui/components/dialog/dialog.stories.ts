import { signal, type WritableSignal } from '@angular/core';
import { CwButton } from '@cadenway/ui/components/button';
import { CwField, CwFieldLabel } from '@cadenway/ui/components/field';
import { CwInput } from '@cadenway/ui/components/input';
import { CwKbd } from '@cadenway/ui/components/kbd';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorXBold } from '@ng-icons/phosphor-icons/bold';
import {
  type Meta,
  type StoryObj,
  applicationConfig,
  moduleMetadata,
} from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { CwDialogClose } from './dialog-close/dialog-close.directive';
import { CwDialogDescription } from './dialog-description/dialog-description.directive';
import { CwDialogFooter } from './dialog-footer/dialog-footer.component';
import { CwDialogHeader } from './dialog-header/dialog-header.component';
import { CwDialogTitle } from './dialog-title/dialog-title.directive';
import { CwDialogTrigger } from './dialog-trigger/dialog-trigger.directive';
import { CwDialog } from './dialog.component';

/**
 * Constant meta
 *
 * @description
 * Dialog, every state of its sheet in the Design System artifact, in the light and the dark theme.
 * The open window renders in a CDK overlay on the page body, outside the theme scopes: the visual
 * states are static renderings of the preview (the window in a framed page), the interactive
 * stories open the real dialog in their play function and close it again. Copy from the mockup
 * (`App.dc.html`) and the sheet.
 *
 * @type {Meta}
 */
const meta: Meta = {
  title: 'UI/Dialog',
  decorators: [
    moduleMetadata({
      imports: [
        CwButton,
        CwDialog,
        CwDialogClose,
        CwDialogDescription,
        CwDialogFooter,
        CwDialogHeader,
        CwDialogTitle,
        CwDialogTrigger,
        CwInput,
        CwField,
        CwFieldLabel,
        CwKbd,
        NgIcon,
      ],
    }),
    applicationConfig({ providers: [provideIcons({ phosphorXBold })] }),
  ],
};

export default meta;

/**
 * Type Story
 *
 * @description
 * Storybook story for dialog examples.
 *
 * @type {StoryObj}
 */
type Story = StoryObj;

/**
 * Function light
 *
 * @description
 * Returns the light-theme story container.
 *
 * @param {HTMLElement} canvasElement - Story canvas containing theme scopes.
 *
 * @returns {HTMLElement} Container for the light theme.
 */
function light(canvasElement: HTMLElement): HTMLElement {
  const scope: HTMLElement | null =
    canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

// The page behind the static window, from the preview: a framed view under the backdrop.
/**
 * Constant PAGE
 *
 * @description
 * Framed page shown behind static dialog examples.
 *
 * @type {string}
 */
const PAGE: string = `
  <div class="flex h-full" aria-hidden="true">
    <div class="w-36 shrink-0 space-y-2.5 border-r p-3">
      <div class="h-2.5 w-16 rounded-full bg-secondary"></div>
      <div class="h-2 w-24 rounded-full bg-secondary"></div>
      <div class="h-2 w-20 rounded-full bg-secondary"></div>
    </div>
    <div class="flex-1 p-4"><div class="mb-4 h-3 w-40 rounded-full bg-secondary"></div></div>
  </div>
  <div class="absolute inset-0 bg-black/30 dark:bg-black/60" aria-hidden="true"></div>`;

/** Simple (`default` size): header, one field, footer with « Annuler » and the action, close button. */
export const Simple: Story = {
  render: () => ({
    template: `
      <div class="relative isolate h-[290px] w-full max-w-xl overflow-hidden rounded-lg border bg-background">
        ${PAGE}
        <div class="absolute top-1/2 left-1/2 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl border bg-popover p-6 text-popover-foreground shadow-xl">
          <cw-dialog-header class="pr-6">
            <h2 cwDialogTitle>Renommer la liste</h2>
            <p cwDialogDescription>Le nouveau nom est visible par tous les membres de l'espace Produit.</p>
          </cw-dialog-header>
          <cw-field>
            <label cwFieldLabel>Nom</label>
            <input cwInput value="Sprint 14 — export CSV" />
          </cw-field>
          <cw-dialog-footer>
            <button cwButton variant="outline">Annuler</button>
            <button cwButton>Renommer</button>
          </cw-dialog-footer>
          <span class="absolute top-3 right-3 flex">
            <button cwButton variant="ghost" size="icon-sm" class="text-muted-foreground" aria-label="Fermer">
              <ng-icon name="phosphorXBold" aria-hidden="true" />
            </button>
          </span>
        </div>
      </div>`,
  }),
};

/** Footer while `pending`: « Annuler » dimmed, the action shows the spinner and keeps its width. */
export const PendingFooter: Story = {
  render: () => ({
    template: `
      <div class="flex w-full max-w-md items-center justify-between gap-2 rounded-xl border bg-popover px-6 py-4">
        <span class="text-xs text-muted-foreground">Échap et clic sur le voile ignorés</span>
        <cw-dialog-footer>
          <button cwButton variant="outline" disabled>Annuler</button>
          <button cwButton loading>Renommer</button>
        </cw-dialog-footer>
      </div>`,
  }),
};

/** Opens from its trigger, focuses the first field, closes on Escape and gives the focus back. */
export const Keyboard: Story = {
  render: () => ({
    template: `
      <button cwButton variant="outline" [cwDialogTrigger]="rename">Renommer</button>
      <cw-dialog #rename>
        <cw-dialog-header>
          <h2 cwDialogTitle>Renommer la liste</h2>
          <p cwDialogDescription>Le nouveau nom est visible par tous les membres de l'espace Produit.</p>
        </cw-dialog-header>
        <cw-field>
          <label cwFieldLabel>Nom</label>
          <input cwInput value="Sprint 14" />
        </cw-field>
        <cw-dialog-footer>
          <button cwButton variant="outline" cwDialogClose>Annuler</button>
          <button cwButton (click)="rename.close()">Renommer</button>
        </cw-dialog-footer>
      </cw-dialog>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const trigger: HTMLElement = within(light(canvasElement)).getByRole('button', {
      name: 'Renommer',
    });
    await userEvent.click(trigger);
    const dialog: HTMLElement = await within(document.body).findByRole('dialog', {
      name: 'Renommer la liste',
    });
    await waitFor(() => expect(within(dialog).getByRole('textbox', { name: 'Nom' })).toHaveFocus());

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(document.body.querySelector('[role="dialog"]')).toBeNull());
    await expect(trigger).toHaveFocus();
  },
};

/**
 * Scrollable body without a close button (`lg`, `scrollable`, `showClose=false`): header and footer
 * stay in place, the body scrolls; « Fermer » in the footer closes it.
 */
export const ScrollableWithoutClose: Story = {
  render: () => ({
    props: {
      shortcuts: [
        ['Ouvrir la palette de commandes', 'Ctrl K'],
        ['Afficher les raccourcis', '?'],
        ['Créer une tâche', 'C'],
        ['Changer le statut', 'S'],
        ['Assigner à moi', 'I'],
        ["Fixer l'échéance", 'D'],
        ['Aller à la boîte de réception', 'G I'],
        ['Aller à mes tâches', 'G M'],
      ],
    },
    template: `
      <button cwButton variant="outline" [cwDialogTrigger]="keys">Raccourcis clavier</button>
      <cw-dialog #keys size="lg" scrollable showClose="false">
        <cw-dialog-header>
          <h2 cwDialogTitle>Raccourcis clavier</h2>
          <p cwDialogDescription>Disponibles dans toutes les vues.</p>
        </cw-dialog-header>
        @for (shortcut of shortcuts; track shortcut[0]) {
          <div class="flex h-8 items-center justify-between gap-4 text-sm">
            <span>{{ shortcut[0] }}</span><kbd cwKbd>{{ shortcut[1] }}</kbd>
          </div>
        }
        <cw-dialog-footer>
          <span class="mr-auto flex items-center gap-1.5 text-xs text-muted-foreground"><kbd cwKbd>?</kbd> rouvre cette fenêtre</span>
          <button cwButton variant="outline" cwDialogClose>Fermer</button>
        </cw-dialog-footer>
      </cw-dialog>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    await userEvent.click(
      within(light(canvasElement)).getByRole('button', { name: 'Raccourcis clavier' }),
    );
    const dialog: HTMLElement = await within(document.body).findByRole('dialog', {
      name: 'Raccourcis clavier',
    });
    await expect(within(dialog).queryAllByRole('button', { name: 'Fermer' })).toHaveLength(1);

    await userEvent.click(within(dialog).getByRole('button', { name: 'Fermer' }));
    await waitFor(() => expect(document.body.querySelector('[role="dialog"]')).toBeNull());
  },
};

/** The four sizes: `sm` 384 px, `default` 448 px, `lg` 672 px, `full` the screen less 16 px. */
export const Sizes: Story = {
  render: () => ({
    props: { sizes: ['sm', 'default', 'lg', 'full'] },
    template: `
      <div class="flex flex-wrap gap-2">
        @for (size of sizes; track size) {
          <button cwButton variant="outline" [cwDialogTrigger]="sized">{{ size }}</button>
          <cw-dialog #sized [size]="size">
            <cw-dialog-header>
              <h2 cwDialogTitle>Taille {{ size }}</h2>
              <p cwDialogDescription>La fenêtre garde 16 px de marge avec les bords de l'écran.</p>
            </cw-dialog-header>
            <cw-dialog-footer>
              <button cwButton variant="outline" cwDialogClose>Fermer</button>
            </cw-dialog-footer>
          </cw-dialog>
        }
      </div>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    await userEvent.click(within(light(canvasElement)).getByRole('button', { name: 'lg' }));
    const dialog: HTMLElement = await within(document.body).findByRole('dialog', {
      name: 'Taille lg',
    });
    await expect(dialog.firstElementChild).toHaveAttribute('data-size', 'lg');

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(document.body.querySelector('[role="dialog"]')).toBeNull());
  },
};

/** While `pending`, Escape and the close buttons are ignored; the consumer closes it when done. */
export const Pending: Story = {
  render: () => {
    const pending: WritableSignal<boolean> = signal(false);
    // The consumer's submission: pending for a moment, then it closes the window itself.
    const save: (dialog: CwDialog) => void = (dialog: CwDialog): void => {
      pending.set(true);
      setTimeout(() => {
        pending.set(false);
        dialog.close();
      }, 800);
    };
    return {
      props: { pending, save },
      template: `
      <button cwButton variant="outline" [cwDialogTrigger]="busy">Renommer</button>
      <cw-dialog #busy [pending]="pending()">
        <cw-dialog-header>
          <h2 cwDialogTitle>Renommer la liste</h2>
        </cw-dialog-header>
        <cw-dialog-footer>
          <button cwButton variant="outline" cwDialogClose>Annuler</button>
          <button cwButton [loading]="pending()" (click)="save(busy)">Renommer</button>
        </cw-dialog-footer>
      </cw-dialog>`,
    };
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    await userEvent.click(within(light(canvasElement)).getByRole('button', { name: 'Renommer' }));
    const dialog: HTMLElement = await within(document.body).findByRole('dialog', {
      name: 'Renommer la liste',
    });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Renommer' }));
    await waitFor(() => expect(dialog.firstElementChild).toHaveAttribute('aria-busy', 'true'));

    await userEvent.keyboard('{Escape}');
    await expect(within(document.body).getByRole('dialog')).toBeInTheDocument();
    await expect(within(dialog).getByRole('button', { name: 'Annuler' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    await waitFor(() => expect(document.body.querySelector('[role="dialog"]')).toBeNull(), {
      timeout: 3000,
    });
  },
};
