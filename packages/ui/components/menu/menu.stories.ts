import { CwAvatar } from '@cadenway/ui/components/avatar';
import { CwButton } from '@cadenway/ui/components/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArchiveBold,
  phosphorArrowRightBold,
  phosphorCircleHalfBold,
  phosphorCopyBold,
  phosphorDotsThreeBold,
  phosphorFolderSimpleBold,
  phosphorGearBold,
  phosphorKeyboardBold,
  phosphorListBulletsBold,
  phosphorMoonBold,
  phosphorPencilSimpleBold,
  phosphorSignOutBold,
  phosphorSlidersHorizontalBold,
  phosphorTrashBold,
  phosphorUserBold,
} from '@ng-icons/phosphor-icons/bold';
import {
  type Meta,
  type StoryObj,
  applicationConfig,
  moduleMetadata,
} from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { CwMenuGroup } from './menu-group/menu-group.component';
import { CwMenuItemCheckbox } from './menu-item-checkbox/menu-item-checkbox.component';
import { CwMenuItemRadio } from './menu-item-radio/menu-item-radio.component';
import { CwMenuItem } from './menu-item/menu-item.component';
import { CwMenuLabel } from './menu-label/menu-label.component';
import { CwMenuRadioGroup } from './menu-radio-group/menu-radio-group.component';
import { CwMenuSeparator } from './menu-separator/menu-separator.component';
import { CwMenuShortcut } from './menu-shortcut/menu-shortcut.component';
import { CwMenuTriggerFor } from './menu-trigger-for/menu-trigger-for.directive';
import { CwMenu } from './menu.component';

/**
 * Constant meta
 *
 * @description
 * Menu examples in light and dark themes from the design system sheet. The
 * visual states render `inline` panels, as the sheet's preview does; the open, keyboard and
 * submenu paths open the real overlay, attached to the body. Copy from the mockup (`App.dc.html`).
 *
 * @type {Meta}
 */
const meta: Meta = {
  title: 'UI/Menu',
  decorators: [
    moduleMetadata({
      imports: [
        CwMenu,
        CwMenuTriggerFor,
        CwMenuItem,
        CwMenuItemCheckbox,
        CwMenuItemRadio,
        CwMenuRadioGroup,
        CwMenuGroup,
        CwMenuLabel,
        CwMenuSeparator,
        CwMenuShortcut,
        CwButton,
        CwAvatar,
        NgIcon,
      ],
    }),
    applicationConfig({
      providers: [
        provideIcons({
          phosphorArchiveBold,
          phosphorArrowRightBold,
          phosphorCircleHalfBold,
          phosphorCopyBold,
          phosphorDotsThreeBold,
          phosphorFolderSimpleBold,
          phosphorGearBold,
          phosphorKeyboardBold,
          phosphorListBulletsBold,
          phosphorMoonBold,
          phosphorPencilSimpleBold,
          phosphorSignOutBold,
          phosphorSlidersHorizontalBold,
          phosphorTrashBold,
          phosphorUserBold,
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
 * Storybook configuration for menu examples.
 *
 * @type {StoryObj}
 */
type Story = StoryObj;

/**
 * Function light
 *
 * @description
 * Finds the light theme section of the story canvas.
 *
 * @param {HTMLElement} canvasElement - Canvas containing the themed examples.
 * @returns {HTMLElement} Light theme section.
 */
function light(canvasElement: HTMLElement): HTMLElement {
  const scope: HTMLElement | null =
    canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

/* The task actions of the mockup's `…` button, with their submenus (closed in the static view). */
/**
 * Constant ACTIONS
 *
 * @description
 * Task action menu markup used by the stories.
 *
 * @type {string}
 */
const ACTIONS: string = `
  <cw-menu-label><span class="font-mono">CAD-482</span></cw-menu-label>
  <button cwMenuItem aria-keyshortcuts="Enter"><ng-icon name="phosphorArrowRightBold" /> Ouvrir <cw-menu-shortcut>Entrée</cw-menu-shortcut></button>
  <button cwMenuItem aria-keyshortcuts="F2"><ng-icon name="phosphorPencilSimpleBold" /> Renommer <cw-menu-shortcut>F2</cw-menu-shortcut></button>
  <button cwMenuItem aria-keyshortcuts="Control+D"><ng-icon name="phosphorCopyBold" /> Dupliquer <cw-menu-shortcut>Ctrl D</cw-menu-shortcut></button>
  <cw-menu-separator />
  <button cwMenuItem [cwMenuTriggerFor]="move"><ng-icon name="phosphorFolderSimpleBold" /> Déplacer vers…</button>
  <button cwMenuItem [cwMenuTriggerFor]="status"><ng-icon name="phosphorCircleHalfBold" /> Changer le statut</button>
  <button cwMenuItem disabled><ng-icon name="phosphorArchiveBold" /> Archiver</button>
  <cw-menu-separator />
  <button cwMenuItem variant="destructive" aria-keyshortcuts="Delete"><ng-icon name="phosphorTrashBold" /> Supprimer <cw-menu-shortcut>Suppr</cw-menu-shortcut></button>`;

/**
 * Constant MOVE
 *
 * @description
 * Move-to submenu markup used by the stories.
 *
 * @type {string}
 */
const MOVE: string = `
  <cw-menu-label>Produit</cw-menu-label>
  <button cwMenuItem selected disabled><ng-icon name="phosphorListBulletsBold" /> Sprint 14</button>
  <button cwMenuItem><ng-icon name="phosphorListBulletsBold" /> Backlog</button>
  <button cwMenuItem><ng-icon name="phosphorListBulletsBold" /> Bugs</button>
  <cw-menu-separator />
  <cw-menu-label>Marketing</cw-menu-label>
  <button cwMenuItem><ng-icon name="phosphorListBulletsBold" /> Lancement v2</button>`;

/**
 * Constant STATUS
 *
 * @description
 * Status submenu markup used by the stories.
 *
 * @type {string}
 */
const STATUS: string = `
  <button cwMenuItem>À faire</button>
  <button cwMenuItem>En cours</button>
  <button cwMenuItem>Terminé</button>`;

/** Actions: object label, icons and shortcuts, submenus, disabled, destructive last; next to it
 *  the "Déplacer vers" submenu with the current list checked on the right. */
export const Actions: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-start gap-1">
        <cw-menu inline ariaLabel="Actions de la tâche">${ACTIONS}</cw-menu>
        <cw-menu inline ariaLabel="Déplacer vers">${MOVE}</cw-menu>
      </div>
      <cw-menu #move>${MOVE}</cw-menu>
      <cw-menu #status>${STATUS}</cw-menu>`,
  }),
};

/** Options: checkbox groups and a radio group under inset labels; ticking keeps the menu open. */
export const Options: Story = {
  render: () => ({
    props: { subtasks: true, labels: true, done: false, groupBy: 'statut' },
    template: `
      <cw-menu inline ariaLabel="Affichage">
        <cw-menu-group>
          <cw-menu-label inset>Afficher</cw-menu-label>
          <button cwMenuItemCheckbox [(checked)]="subtasks">Sous-tâches</button>
          <button cwMenuItemCheckbox [(checked)]="labels">Étiquettes</button>
          <button cwMenuItemCheckbox [(checked)]="done">Tâches terminées</button>
        </cw-menu-group>
        <cw-menu-separator />
        <cw-menu-radio-group [(value)]="groupBy">
          <cw-menu-label inset>Grouper par</cw-menu-label>
          <button cwMenuItemRadio value="statut">Statut</button>
          <button cwMenuItemRadio value="assigne">Assigné</button>
          <button cwMenuItemRadio value="priorite">Priorité</button>
          <button cwMenuItemRadio value="sprint" disabled>Sprint</button>
        </cw-menu-radio-group>
      </cw-menu>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const menu: HTMLElement = within(light(canvasElement)).getByRole('menu', { name: 'Affichage' });
    const done: HTMLElement = within(menu).getByRole('menuitemcheckbox', {
      name: 'Tâches terminées',
    });
    await userEvent.click(done);
    await expect(done).toHaveAttribute('aria-checked', 'true');
    const assignee: HTMLElement = within(menu).getByRole('menuitemradio', { name: 'Assigné' });
    await userEvent.click(assignee);
    await expect(assignee).toHaveAttribute('aria-checked', 'true');
    await expect(within(menu).getByRole('menuitemradio', { name: 'Statut' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  },
};

/** Account: header with avatar, name and address, settings, the Thème submenu, sign out. */
export const Account: Story = {
  render: () => ({
    template: `
      <cw-menu inline ariaLabel="Compte">
        <div class="flex items-center gap-2 px-2 py-1.5">
          <cw-avatar name="Léa Martin" />
          <div class="grid min-w-0 leading-tight">
            <span class="truncate text-sm font-medium">Léa Martin</span>
            <span class="truncate text-xs text-muted-foreground">lea.martin@atelier.fr</span>
          </div>
        </div>
        <cw-menu-separator />
        <button cwMenuItem><ng-icon name="phosphorUserBold" /> Profil</button>
        <button cwMenuItem aria-keyshortcuts="Control+,"><ng-icon name="phosphorGearBold" /> Réglages <cw-menu-shortcut>Ctrl ,</cw-menu-shortcut></button>
        <button cwMenuItem aria-keyshortcuts="?"><ng-icon name="phosphorKeyboardBold" /> Raccourcis clavier <cw-menu-shortcut>?</cw-menu-shortcut></button>
        <button cwMenuItem [cwMenuTriggerFor]="theme"><ng-icon name="phosphorMoonBold" /> Thème</button>
        <cw-menu-separator />
        <button cwMenuItem><ng-icon name="phosphorSignOutBold" /> Se déconnecter</button>
      </cw-menu>
      <cw-menu #theme>
        <button cwMenuItem selected>Clair</button>
        <button cwMenuItem>Sombre</button>
        <button cwMenuItem>Système</button>
      </cw-menu>`,
  }),
};

/** The `…` button of a task row (`align="end"`): a click opens the menu, an action closes it and
 *  gives the focus back to the button. */
export const Dropdown: Story = {
  render: () => ({
    props: { last: '' },
    template: `
      <div class="flex w-72 items-center justify-between gap-2">
        <span class="text-sm" role="status">{{ last || 'Aucune action' }}</span>
        <button cwButton variant="ghost" size="icon-sm" aria-label="Actions de la tâche" [cwMenuTriggerFor]="actions">
          <ng-icon name="phosphorDotsThreeBold" />
        </button>
      </div>
      <cw-menu #actions align="end">
        <button cwMenuItem (triggered)="last = 'Renommer'"><ng-icon name="phosphorPencilSimpleBold" /> Renommer <cw-menu-shortcut>F2</cw-menu-shortcut></button>
        <button cwMenuItem (triggered)="last = 'Dupliquer'"><ng-icon name="phosphorCopyBold" /> Dupliquer</button>
        <cw-menu-separator />
        <button cwMenuItem variant="destructive" (triggered)="last = 'Supprimer'"><ng-icon name="phosphorTrashBold" /> Supprimer</button>
      </cw-menu>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: { getByRole: (role: string, options?: { name: string }) => HTMLElement } = within(
      light(canvasElement),
    );
    const trigger: HTMLElement = scope.getByRole('button', { name: 'Actions de la tâche' });

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const menu: HTMLElement = await within(document.body).findByRole('menu', {
      name: 'Actions de la tâche',
    });
    await userEvent.click(within(menu).getByRole('menuitem', { name: /Dupliquer/ }));

    await expect(scope.getByRole('status')).toHaveTextContent('Dupliquer');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toHaveFocus();
  },
};

/** Keyboard: Enter opens on the first item, the arrows move, Space ticks without closing, Escape
 *  closes and gives the focus back. */
export const Keyboard: Story = {
  render: () => ({
    props: { subtasks: false },
    template: `
      <button cwButton variant="outline" size="sm" [cwMenuTriggerFor]="display">
        <ng-icon name="phosphorSlidersHorizontalBold" /> Affichage
      </button>
      <cw-menu #display>
        <cw-menu-group>
          <cw-menu-label inset>Afficher</cw-menu-label>
          <button cwMenuItemCheckbox [(checked)]="subtasks">Sous-tâches</button>
          <button cwMenuItemCheckbox>Étiquettes</button>
        </cw-menu-group>
      </cw-menu>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const trigger: HTMLElement = within(light(canvasElement)).getByRole('button', {
      name: 'Affichage',
    });
    trigger.focus();

    await userEvent.keyboard('{Enter}');
    const menu: HTMLElement = await within(document.body).findByRole('menu', { name: 'Affichage' });
    const subtasks: HTMLElement = within(menu).getByRole('menuitemcheckbox', {
      name: 'Sous-tâches',
    });
    await waitFor(() => expect(subtasks).toHaveFocus());

    await userEvent.keyboard(' ');
    await expect(subtasks).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard('{ArrowDown}');
    await expect(within(menu).getByRole('menuitemcheckbox', { name: 'Étiquettes' })).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    await expect(trigger).toHaveFocus();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

/** Submenu: → opens "Déplacer vers…" on its first enabled item, ← closes it back to its item. */
export const Submenu: Story = {
  render: () => ({
    template: `
      <button cwButton variant="ghost" size="icon-sm" aria-label="Actions de la tâche" [cwMenuTriggerFor]="actions">
        <ng-icon name="phosphorDotsThreeBold" />
      </button>
      <cw-menu #actions>${ACTIONS}</cw-menu>
      <cw-menu #move>${MOVE}</cw-menu>
      <cw-menu #status>${STATUS}</cw-menu>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const trigger: HTMLElement = within(light(canvasElement)).getByRole('button', {
      name: 'Actions de la tâche',
    });
    trigger.focus();

    await userEvent.keyboard('{ArrowDown}');
    const menu: HTMLElement = await within(document.body).findByRole('menu', {
      name: 'Actions de la tâche',
    });
    const move: HTMLElement = within(menu).getByRole('menuitem', { name: 'Déplacer vers…' });
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    await expect(move).toHaveFocus();

    await userEvent.keyboard('{ArrowRight}');
    const submenu: HTMLElement = await within(document.body).findByRole('menu', {
      name: 'Déplacer vers…',
    });
    await expect(move).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() =>
      expect(within(submenu).getByRole('menuitem', { name: 'Backlog' })).toHaveFocus(),
    );

    await userEvent.keyboard('{ArrowLeft}');
    await expect(move).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await expect(trigger).toHaveFocus();
  },
};
