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
import { provideCwDialogLabels } from './dialog.providers';

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

/**
 * The window sizes: `sm` 384 px, `default` 448 px, `md` 512 px (Space statuses), `lg` 672 px,
 * `xl` 896 px (sprint report), `2xl` 1024 px, `full` the screen less 16 px.
 */
export const Sizes: Story = {
  render: () => ({
    props: { sizes: ['sm', 'default', 'md', 'lg', 'xl', '2xl', 'full'] },
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

    await userEvent.click(within(light(canvasElement)).getByRole('button', { name: 'md' }));
    const medium: HTMLElement = await within(document.body).findByRole('dialog', {
      name: 'Taille md',
    });
    await expect(medium.firstElementChild).toHaveAttribute('data-size', 'md');

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(document.body.querySelector('[role="dialog"]')).toBeNull());

    await userEvent.click(within(light(canvasElement)).getByRole('button', { name: 'xl' }));
    const wide: HTMLElement = await within(document.body).findByRole('dialog', {
      name: 'Taille xl',
    });
    await expect(wide.firstElementChild).toHaveAttribute('data-size', 'xl');

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(document.body.querySelector('[role="dialog"]')).toBeNull());
  },
};

/**
 * Task creation (mockup `App.dc.html`): `xl`, pinned 8vh from the top (`placement="top"`) so it
 * grows downwards, unpadded body (`padding="none"`) and a `bar` header with the mockup's `px-5`.
 */
export const PinnedWithBarHeader: Story = {
  render: () => ({
    template: `
      <button cwButton variant="outline" [cwDialogTrigger]="create">Créer une tâche</button>
      <cw-dialog #create size="xl" placement="top" padding="none" scrollable>
        <cw-dialog-header variant="bar" class="px-5">
          <h2 cwDialogTitle>Créer une tâche</h2>
          <span class="text-sm text-muted-foreground">dans</span>
          <button cwButton variant="outline" size="sm">Sprint 14</button>
        </cw-dialog-header>
        <div class="flex flex-col gap-3 px-5 py-4">
          <p class="text-sm text-muted-foreground">Titre, description et propriétés de la tâche.</p>
        </div>
        <cw-dialog-footer class="px-5">
          <button cwButton variant="outline" cwDialogClose>Annuler</button>
          <button cwButton cwDialogClose>Créer la tâche</button>
        </cw-dialog-footer>
      </cw-dialog>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    await userEvent.click(
      within(light(canvasElement)).getByRole('button', { name: 'Créer une tâche' }),
    );
    const dialog: HTMLElement = await within(document.body).findByRole('dialog', {
      name: 'Créer une tâche',
    });
    const top: number = dialog.getBoundingClientRect().top;
    await expect(Math.abs(top - window.innerHeight * 0.08)).toBeLessThan(2);

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(document.body.querySelector('[role="dialog"]')).toBeNull());
  },
};

/**
 * Detail sheet (mockup `App.dc.html`, the task sheet): `tall`, 1024 px wide and 88 % of the
 * viewport high, centered so it sits 6vh from the top and the bottom, a `bar` header (16 px sides)
 * and an unpadded body whose sections draw their own edges.
 */
export const Tall: Story = {
  render: () => ({
    template: `
      <button cwButton variant="outline" [cwDialogTrigger]="sheet">Ouvrir CAD-482</button>
      <cw-dialog #sheet size="tall" padding="none">
        <cw-dialog-header variant="bar">
          <h2 cwDialogTitle>Page quotas organisation</h2>
        </cw-dialog-header>
        <div class="grid h-full grid-cols-[1fr_18rem] max-md:grid-cols-1">
          <div class="p-4 text-sm">Description et activité.</div>
          <div class="border-l p-4 text-sm max-md:border-t max-md:border-l-0">Propriétés.</div>
        </div>
      </cw-dialog>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    await userEvent.click(
      within(light(canvasElement)).getByRole('button', { name: 'Ouvrir CAD-482' }),
    );
    const dialog: HTMLElement = await within(document.body).findByRole('dialog', {
      name: 'Page quotas organisation',
    });
    await expect(dialog.firstElementChild).toHaveAttribute('data-size', 'tall');

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(document.body.querySelector('[role="dialog"]')).toBeNull());
  },
};

/**
 * Edge to edge (`size="screen"`), the onboarding assistant of the mockup (`App.dc.html`): the whole
 * viewport on the canvas surface, no border, radius or backdrop; the consumer lays out a centered
 * column and names the window with its own `h1` (`[id]="dialog.titleId"`). Here only the explicit
 * button closes it (`closeOnEscape`, `closeOnOverlayClick` and `showClose` off); the focus stays
 * trapped inside and returns to the trigger. `closeOnNavigation` is off too: unless the
 * application's `DEFAULT_DIALOG_CONFIG` says otherwise, a browser Back or Forward closes a dialog,
 * which a flow whose consumer binds `[open]` one way would lose.
 * English source copy, as the webapp writes it.
 */
export const Screen: Story = {
  render: () => ({
    template: `
      <button cwButton variant="outline" [cwDialogTrigger]="setup">Set up the workspace</button>
      <cw-dialog
        #setup
        size="screen"
        [closeOnEscape]="false"
        [closeOnOverlayClick]="false"
        [closeOnNavigation]="false"
        [showClose]="false"
      >
        <div class="flex min-h-full items-start justify-center px-4 py-8 sm:items-center sm:py-10">
          <div class="flex w-full max-w-xl flex-col gap-6">
            <div class="flex items-center gap-2">
              <span class="text-base font-bold">Cadenway</span>
              <button cwButton variant="ghost" size="sm" class="ml-auto" cwDialogClose>Set up later</button>
            </div>
            <div class="flex flex-col gap-6 rounded-xl border bg-card p-5 sm:p-8">
              <div class="flex flex-col gap-1">
                <p class="text-xs font-medium text-muted-foreground">Step 1 of 4</p>
                <h1 class="text-2xl font-semibold tracking-tight" [id]="setup.titleId">Welcome to Atelier Nord</h1>
              </div>
              <cw-field>
                <label cwFieldLabel>Space name</label>
                <input cwInput value="Product" />
              </cw-field>
              <div class="flex justify-end">
                <button cwButton>Continue</button>
              </div>
            </div>
          </div>
        </div>
      </cw-dialog>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const trigger: HTMLElement = within(light(canvasElement)).getByRole('button', {
      name: 'Set up the workspace',
    });
    await userEvent.click(trigger);
    const dialog: HTMLElement = await within(document.body).findByRole('dialog', {
      name: 'Welcome to Atelier Nord',
    });
    await expect(dialog.firstElementChild).toHaveAttribute('data-size', 'screen');
    await expect(document.body.querySelector('.cdk-overlay-backdrop')).toHaveAttribute('hidden');
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));

    await userEvent.keyboard('{Escape}');
    await expect(within(document.body).getByRole('dialog')).toBeInTheDocument();

    window.dispatchEvent(new PopStateEvent('popstate'));
    await expect(within(document.body).getByRole('dialog')).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('button', { name: 'Set up later' }));
    await waitFor(() => expect(document.body.querySelector('[role="dialog"]')).toBeNull());
    await expect(trigger).toHaveFocus();
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

/**
 * Provided labels: an application that writes its source copy in English provides the texts once
 * (`provideCwDialogLabels`, translated with `$localize`); the close button is then « Close ».
 */
export const ProvidedLabels: Story = {
  decorators: [applicationConfig({ providers: [provideCwDialogLabels({ close: 'Close' })] })],
  render: () => ({
    template: `
      <button cwButton variant="outline" [cwDialogTrigger]="rename">Rename</button>
      <cw-dialog #rename>
        <cw-dialog-header>
          <h2 cwDialogTitle>Rename the list</h2>
        </cw-dialog-header>
        <cw-dialog-footer>
          <button cwButton (click)="rename.close()">Rename</button>
        </cw-dialog-footer>
      </cw-dialog>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    await userEvent.click(within(light(canvasElement)).getByRole('button', { name: 'Rename' }));
    const dialog: HTMLElement = await within(document.body).findByRole('dialog', {
      name: 'Rename the list',
    });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(document.body.querySelector('[role="dialog"]')).toBeNull());
  },
};
