import {
  CwMenu,
  CwMenuGroup,
  CwMenuItem,
  CwMenuItemCheckbox,
  CwMenuItemRadio,
  CwMenuLabel,
  CwMenuRadioGroup,
  CwMenuSeparator,
  CwMenuShortcut,
  CwMenuTriggerFor,
} from '@cadenway/ui/menu';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowSquareOutBold,
  phosphorCircleHalfBold,
  phosphorLinkBold,
  phosphorTrashBold,
} from '@ng-icons/phosphor-icons/bold';
import {
  type Meta,
  type StoryObj,
  applicationConfig,
  moduleMetadata,
} from '@storybook/angular-vite';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';

import { CwContextMenuTriggerFor } from './context-menu.directive';

/**
 * Context menu (ContextMenu sheet of the Design System artifact), in the light and the dark
 * theme. The targeted state renders the card `data-state="open"` next to an `inline` panel, as the
 * sheet's preview does; the right click and keyboard paths open the real overlay at the pointer.
 * Copy from the mockup (`App.dc.html`, board card).
 */
const meta: Meta = {
  title: 'UI/ContextMenu',
  decorators: [
    moduleMetadata({
      imports: [
        CwContextMenuTriggerFor,
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
        NgIcon,
      ],
    }),
    applicationConfig({
      providers: [
        provideIcons({
          phosphorArrowSquareOutBold,
          phosphorCircleHalfBold,
          phosphorLinkBold,
          phosphorTrashBold,
        }),
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

const CARD_CLASSES =
  'grid w-64 gap-2 rounded-lg border bg-card p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-selected';

const ITEMS = `
  <button cwMenuItem aria-keyshortcuts="Control+Enter"><ng-icon name="phosphorArrowSquareOutBold" /> Ouvrir dans un onglet <cw-menu-shortcut>Ctrl Entrée</cw-menu-shortcut></button>
  <button cwMenuItem [cwMenuTriggerFor]="status"><ng-icon name="phosphorCircleHalfBold" /> Statut</button>
  <button cwMenuItem (triggered)="last = 'Copier le lien de ' + (menu.data()?.key ?? '')"><ng-icon name="phosphorLinkBold" /> Copier le lien</button>
  <button cwMenuItem disabled>Convertir en sous-tâche</button>
  <cw-menu-separator />
  <cw-menu-group>
    <cw-menu-label inset>Afficher sur la carte</cw-menu-label>
    <button cwMenuItemCheckbox [checked]="true">Sous-tâches</button>
    <button cwMenuItemCheckbox>Étiquettes</button>
  </cw-menu-group>
  <cw-menu-separator />
  <button cwMenuItem variant="destructive" aria-keyshortcuts="Delete"><ng-icon name="phosphorTrashBold" /> Supprimer <cw-menu-shortcut>Suppr</cw-menu-shortcut></button>`;

const STATUS = `
  <button cwMenuItem>À faire</button>
  <button cwMenuItem selected>En cours</button>
  <button cwMenuItem>Terminé</button>`;

/** The targeted card turns `bg-selected` while its menu is open; options-only header menu. */
export const Targeted: Story = {
  render: () => ({
    props: { last: '' },
    template: `
      <div class="flex flex-wrap items-start gap-4">
        <article data-state="open" class="${CARD_CLASSES}">
          <span class="font-mono text-xs text-muted-foreground">CAD-482</span>
          <span>Page quotas organisation</span>
        </article>
        <cw-menu #menu inline ariaLabel="Actions de CAD-482">${ITEMS}</cw-menu>
        <cw-menu inline ariaLabel="Colonne En cours">
          <cw-menu-radio-group value="compacte">
            <cw-menu-label inset>Densité</cw-menu-label>
            <button cwMenuItemRadio value="compacte">Compacte</button>
            <button cwMenuItemRadio value="confortable">Confortable</button>
          </cw-menu-radio-group>
          <cw-menu-separator />
          <button cwMenuItem>Masquer la colonne</button>
        </cw-menu>
      </div>
      <cw-menu #status>${STATUS}</cw-menu>`,
  }),
};

const INTERACTIVE = `
  <article tabindex="0" aria-label="CAD-482 Page quotas organisation" class="${CARD_CLASSES}"
           [cwContextMenuTriggerFor]="menu" [cwContextMenuData]="{ key: 'CAD-482' }">
    <span class="font-mono text-xs text-muted-foreground">CAD-482</span>
    <span>Page quotas organisation</span>
  </article>
  <span class="text-sm" role="status">{{ last || 'Aucune action' }}</span>
  <cw-menu #menu ariaLabel="Actions de CAD-482">${ITEMS}</cw-menu>
  <cw-menu #status>${STATUS}</cw-menu>`;

/** Right click: the menu opens at the pointer and acts on the card's data. */
export const RightClick: Story = {
  render: () => ({ props: { last: '' }, template: INTERACTIVE }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    const card = scope.getByRole('article', { name: /CAD-482/ });
    const { left, top } = card.getBoundingClientRect();

    await fireEvent.contextMenu(card, { clientX: left + 40, clientY: top + 20 });
    await waitFor(() => expect(card).toHaveAttribute('data-state', 'open'));
    const menu = await within(document.body).findByRole('menu', { name: 'Actions de CAD-482' });
    await userEvent.click(within(menu).getByRole('menuitem', { name: 'Copier le lien' }));

    await expect(scope.getByRole('status')).toHaveTextContent('Copier le lien de CAD-482');
    await expect(card).toHaveAttribute('data-state', 'closed');
  },
};

/** Keyboard: Shift + F10 on the focused card opens the menu on its first item, Escape closes it
 *  and gives the focus back to the card. */
export const Keyboard: Story = {
  render: () => ({ props: { last: '' }, template: INTERACTIVE }),
  play: async ({ canvasElement }) => {
    const card = within(light(canvasElement)).getByRole('article', { name: /CAD-482/ });
    card.focus();

    await userEvent.keyboard('{Shift>}{F10}{/Shift}');
    const menu = await within(document.body).findByRole('menu', { name: 'Actions de CAD-482' });
    await waitFor(() =>
      expect(within(menu).getByRole('menuitem', { name: /Ouvrir dans un onglet/ })).toHaveFocus(),
    );

    await userEvent.keyboard('{Escape}');
    await expect(card).toHaveFocus();
    await expect(card).toHaveAttribute('data-state', 'closed');
  },
};
