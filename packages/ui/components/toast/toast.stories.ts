import { inject, provideAppInitializer } from '@angular/core';
import { CwButton } from '@cadenway/ui/components/button';
import {
  type Meta,
  type StoryObj,
  applicationConfig,
  moduleMetadata,
} from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { CwToastItem } from './toast-item/toast-item.component';
import { CwToastService } from './toast.service';
import type { CwToast } from './toast.types';
import { CwToaster } from './toaster/toaster.component';

// The service of the story's application, captured at bootstrap: the props call it from the
// template (a render function runs outside any injection context).
/**
 * Constant toasts
 *
 * @description
 * Holds the story application's service after bootstrap for template callbacks.
 *
 * @type {CwToastService | undefined}
 */
let toasts: CwToastService | undefined;

/**
 * Function service
 *
 * @description
 * Retrieves the service captured during the story application's initialization.
 *
 * @returns {CwToastService} Initialized toast service.
 */
function service(): CwToastService {
  if (!toasts) throw new Error('CwToastService not ready');
  return toasts;
}

/**
 * Constant meta
 *
 * @description
 * Configures toast stories and captures the service at application bootstrap. Static tones and
 * interactive stacks cover the light and dark themes from the design system sheet.
 *
 * @type {Meta}
 */
const meta: Meta = {
  title: 'UI/Toast',
  decorators: [
    moduleMetadata({ imports: [CwButton, CwToastItem, CwToaster] }),
    applicationConfig({
      providers: [
        provideAppInitializer(() => {
          toasts = inject(CwToastService);
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
 * Defines the Storybook object used by the toast examples.
 *
 * @type {StoryObj}
 */
type Story = StoryObj;

/**
 * Function light
 *
 * @description
 * Locates the light theme section rendered within the story canvas.
 *
 * @param {HTMLElement} canvasElement - Root element of the story canvas.
 * @returns {HTMLElement} Light theme section.
 */
function light(canvasElement: HTMLElement): HTMLElement {
  const scope: HTMLElement | null =
    canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

// The toasts of a region: `role="status"`, and `role="alert"` for an error.
/**
 * Function live
 *
 * @description
 * Collects status and alert notifications within a toaster region.
 *
 * @param {HTMLElement} region - Toaster region to inspect.
 * @returns {HTMLElement[]} Notifications exposed through live roles.
 */
function live(region: HTMLElement): HTMLElement[] {
  const scope: { queryAllByRole: (role: string) => HTMLElement[] } = within(region);
  return [...scope.queryAllByRole('status'), ...scope.queryAllByRole('alert')];
}

/**
 * Function toast
 *
 * @description
 * Creates a static toast record for visual examples.
 *
 * @param {string} id - Identifier of the example toast.
 * @param {CwToast['tone']} tone - Visual tone of the example.
 * @param {string} title - Primary notification text.
 * @param {string} description - Optional text beneath the title.
 * @returns {CwToast} Open toast record without a close button.
 */
function toast(id: string, tone: CwToast['tone'], title: string, description?: string): CwToast {
  return {
    id,
    tone,
    title,
    closable: false,
    state: 'open',
    ...(description ? { description } : {}),
  };
}

// Both themes side by side, each with its own toaster; the dark one answers F9 so F8 stays light's.
/**
 * Function themes
 *
 * @description
 * Builds the two themed story sections with separate toaster hotkeys.
 *
 * @param {string} content - Markup displayed in the light section.
 * @param {string} toaster - Optional attributes applied to both toasters.
 * @returns {string} Angular template for both themes.
 */
function themes(content: string, toaster: string = ''): string {
  return `
    <div class="grid gap-4 lg:grid-cols-2">
      <div data-theme="light" class="flex min-h-48 min-w-0 flex-col items-start gap-4 rounded-xl bg-background p-6 text-foreground">
        ${content}
        <cw-toaster ${toaster} />
      </div>
      <div data-theme="dark" class="flex min-h-48 min-w-0 flex-col items-start gap-4 rounded-xl bg-background p-6 text-foreground">
        <cw-toaster position="bottom-left" hotkey="F9" ariaLabel="Notifications, thème sombre (F9)" ${toaster} />
      </div>
    </div>`;
}

/** The six tones, without and with a description; the error is `role="alert"`. */
export const Tones: Story = {
  render: () => ({
    props: {
      toasts: [
        toast('t1', 'default', 'Lien copié'),
        toast('t2', 'success', 'Tâche archivée', "CAD-466 · Doc d'installation Docker"),
        toast(
          't3',
          'info',
          'Synchronisation reprise',
          'Toutes les modifications sont enregistrées.',
        ),
        toast('t4', 'warning', 'Connexion instable', 'Les modifications sont mises en file.'),
        toast(
          't5',
          'error',
          "Impossible d'enregistrer",
          'Connexion perdue. Nouvel essai dans 10 s.',
        ),
        toast('t6', 'loading', 'Import de 48 tâches…', 'Espace Produit · export-trello.json'),
      ],
    },
    template: `
      <ol class="grid w-full max-w-[356px] gap-3">
        @for (item of toasts; track item.id) {
          <li><cw-toast-item [toast]="item" /></li>
        }
      </ol>`,
  }),
};

/** With the action (« Annuler », « Réessayer ») and the close button. */
export const ActionAndClose: Story = {
  render: () => ({
    props: {
      undo: {
        ...toast(
          'a1',
          'success',
          'Tâche déplacée vers Terminé',
          "CAD-466 · Doc d'installation Docker",
        ),
        action: { label: 'Annuler', run: () => undefined },
      },
      retry: {
        ...toast('a2', 'error', 'Import interrompu', '2 lignes illisibles dans le fichier.'),
        action: { label: 'Réessayer', run: () => undefined },
        closable: true,
      },
    },
    template: `
      <ol class="grid w-full max-w-[356px] gap-3">
        <li><cw-toast-item [toast]="undo" /></li>
        <li><cw-toast-item [toast]="retry" /></li>
      </ol>`,
  }),
};

/**
 * Folded stack: five toasts, the three newest shown (−8 px and 96 % per rank), « +2 »; hovering
 * the region unfolds it (« +2 plus anciennes ») and pauses the durations.
 */
export const Stack: Story = {
  parameters: { themes: false },
  render: () => {
    return {
      props: {
        fill: () => {
          service().success('Tâche déplacée vers Terminé', {
            description: "CAD-466 · Doc d'installation Docker",
          });
          service().info('Synchronisation reprise');
          service().success('Tâche archivée', { description: 'CAD-470 · Revoir les filtres' });
          service().error('Import interrompu', {
            description: '2 lignes illisibles dans le fichier.',
            action: { label: 'Réessayer', run: () => undefined },
          });
          service().loading('Export de 120 tâches…', { description: 'Espace Produit · CSV' });
        },
        clear: () => {
          service().dismiss();
        },
      },
      template: themes(`
        <div class="flex gap-2">
          <button cwButton variant="outline" (click)="fill()">Afficher cinq toasts</button>
          <button cwButton variant="ghost" (click)="clear()">Tout fermer</button>
        </div>`),
    };
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: { getByRole: (role: string, options: { name: string }) => HTMLElement } = within(
      light(canvasElement),
    );
    await userEvent.click(scope.getByRole('button', { name: 'Afficher cinq toasts' }));
    const region: HTMLElement = scope.getByRole('region', { name: 'Notifications (F8)' });
    await waitFor(() => expect(live(region)).toHaveLength(3));
    await expect(region).toHaveTextContent('+2');

    await userEvent.hover(region);
    await waitFor(() => expect(region).toHaveAttribute('data-expanded'));
    await expect(region).toHaveTextContent('+2 plus anciennes');

    await userEvent.unhover(region);
    await userEvent.click(scope.getByRole('button', { name: 'Tout fermer' }));
    await waitFor(() => expect(live(region)).toHaveLength(0));
  },
};

/** « Annuler » runs the undo and closes the toast; « Ouvrir » opens the restored task. */
export const UndoAndOpen: Story = {
  parameters: { themes: false },
  render: () => {
    return {
      props: {
        move() {
          service().success('Tâche déplacée vers Terminé', {
            description: "CAD-466 · Doc d'installation Docker",
            undo: () => {
              service().show('Déplacement annulé');
            },
          });
        },
        restore() {
          service().success('CAD-482 restaurée', {
            description: 'De retour dans sa liste.',
            action: { label: 'Ouvrir', run: () => undefined },
          });
        },
      },
      template: themes(`
        <div class="flex gap-2">
          <button cwButton variant="outline" (click)="move()">Déplacer vers Terminé</button>
          <button cwButton variant="outline" (click)="restore()">Restaurer CAD-482</button>
        </div>`),
    };
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: { getByRole: (role: string, options: { name: string }) => HTMLElement } = within(
      light(canvasElement),
    );
    await userEvent.click(scope.getByRole('button', { name: 'Déplacer vers Terminé' }));
    const region: HTMLElement = scope.getByRole('region', { name: 'Notifications (F8)' });
    await userEvent.click(await within(region).findByRole('button', { name: 'Annuler' }));

    await waitFor(() => expect(region).toHaveTextContent('Déplacement annulé'));
    // The undone toast is hidden at once and leaves the page after its exit animation.
    await waitFor(() => expect(region).not.toHaveTextContent('Tâche déplacée vers Terminé'));
    await userEvent.click(scope.getByRole('button', { name: 'Restaurer CAD-482' }));
    await userEvent.click(await within(region).findByRole('button', { name: 'Ouvrir' }));
    await waitFor(() => expect(region).not.toHaveTextContent('CAD-482 restaurée'));
  },
};

/** F8 moves the focus into the region; Tab reaches the action; Escape closes the toast and returns. */
export const Keyboard: Story = {
  parameters: { themes: false },
  render: () => {
    return {
      props: {
        fail: () => {
          service().error("Impossible d'enregistrer", {
            description: 'Connexion perdue. Nouvel essai dans 10 s.',
            action: { label: 'Réessayer', run: () => undefined },
          });
        },
      },
      template: themes(`<button cwButton variant="outline" (click)="fail()">Enregistrer</button>`),
    };
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: { getByRole: (role: string, options: { name: string }) => HTMLElement } = within(
      light(canvasElement),
    );
    const save: HTMLElement = scope.getByRole('button', { name: 'Enregistrer' });
    await userEvent.click(save);
    const region: HTMLElement = scope.getByRole('region', { name: 'Notifications (F8)' });
    await within(region).findByRole('alert');

    await userEvent.keyboard('{F8}');
    await expect(region).toHaveFocus();
    await userEvent.tab();
    await expect(within(region).getByRole('button', { name: 'Réessayer' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');

    await waitFor(() => expect(within(region).queryByRole('alert')).toBeNull());
    await expect(save).toHaveFocus();
  },
};
