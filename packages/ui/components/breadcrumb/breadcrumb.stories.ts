import { CwMenu, CwMenuItem, CwMenuTriggerFor } from '@cadenway/ui/components/menu';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorFolderSimpleBold,
  phosphorHouseBold,
  phosphorListBulletsBold,
} from '@ng-icons/phosphor-icons/bold';
import { phosphorCircleHalfFill } from '@ng-icons/phosphor-icons/fill';
import {
  type Meta,
  type StoryObj,
  applicationConfig,
  moduleMetadata,
} from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwBreadcrumbLink } from './breadcrumb-link/breadcrumb-link.component';
import { CwBreadcrumbPage } from './breadcrumb-page/breadcrumb-page.component';
import { CwBreadcrumb } from './breadcrumb.component';

/**
 * Constant meta
 *
 * @description
 * Breadcrumb, every state of its sheet in the Design System artifact, in the light and the dark
 * theme. Each trail is named after its theme: two navigations of a page never share a name. The
 * menus of « … » and of a level with a menu open in the real overlay, attached to the body. Copy
 * from the sheet ("Dans Cadenway").
 *
 * @type {Meta}
 */
const meta: Meta = {
  title: 'UI/Breadcrumb',
  decorators: [
    moduleMetadata({
      imports: [
        CwBreadcrumb,
        CwBreadcrumbLink,
        CwBreadcrumbPage,
        CwMenu,
        CwMenuItem,
        CwMenuTriggerFor,
        NgIcon,
      ],
    }),
    applicationConfig({
      providers: [
        provideIcons({
          phosphorCircleHalfFill,
          phosphorFolderSimpleBold,
          phosphorHouseBold,
          phosphorListBulletsBold,
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
 * Storybook configuration used for breadcrumb examples and interactions.
 *
 * @type {StoryObj}
 */
type Story = StoryObj;

/**
 * Function light
 *
 * @description
 * Locates the light-theme copy rendered by the shared Storybook preview decorator.
 *
 * @param {HTMLElement} canvasElement - Story canvas containing the theme examples.
 *
 * @returns {HTMLElement} Element containing the light-theme example.
 *
 * @throws {Error} When the expected light-theme scope is missing.
 */
function light(canvasElement: HTMLElement): HTMLElement {
  const scope: HTMLElement | null =
    canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

/** Chevron separators: space › list › task. */
export const Default: Story = {
  render: () => ({
    template: `
      <nav cwBreadcrumb ariaLabel="Fil d'Ariane {{ cwTheme }}">
        <a cwBreadcrumbLink href="#">Produit</a>
        <a cwBreadcrumbLink href="#">Sprint 14</a>
        <span cwBreadcrumbPage>CAD-482</span>
      </nav>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const nav: HTMLElement = within(light(canvasElement)).getByRole('navigation', {
      name: "Fil d'Ariane light",
    });
    await expect(within(nav).getAllByRole('listitem')).toHaveLength(3);
    await expect(within(nav).getByText('CAD-482').closest('[aria-current="page"]')).not.toBeNull();

    await userEvent.tab();
    await expect(within(nav).getByRole('link', { name: 'Produit' })).toHaveFocus();
    await userEvent.tab();
    await expect(within(nav).getByRole('link', { name: 'Sprint 14' })).toHaveFocus();
  },
};

/** An icon before each level, as at the top of a task detail. */
export const WithIcons: Story = {
  render: () => ({
    template: `
      <nav cwBreadcrumb ariaLabel="Fil d'Ariane {{ cwTheme }}">
        <a cwBreadcrumbLink href="#"><ng-icon name="phosphorHouseBold" aria-hidden="true" />Accueil</a>
        <a cwBreadcrumbLink href="#"><ng-icon name="phosphorFolderSimpleBold" aria-hidden="true" />Produit</a>
        <a cwBreadcrumbLink href="#"><ng-icon name="phosphorListBulletsBold" aria-hidden="true" />Sprint 14</a>
        <span cwBreadcrumbPage><ng-icon name="phosphorCircleHalfFill" class="text-balise" aria-hidden="true" />CAD-482</span>
      </nav>`,
  }),
};

/** Slash separators, for the settings. */
export const Slash: Story = {
  render: () => ({
    template: `
      <nav cwBreadcrumb separator="slash" ariaLabel="Fil d'Ariane {{ cwTheme }}">
        <a cwBreadcrumbLink href="#">Réglages</a>
        <a cwBreadcrumbLink href="#">Instance</a>
        <span cwBreadcrumbPage>E-mails</span>
      </nav>`,
  }),
};

/** `sm` above a Page Header title, then `default`. */
export const Sizes: Story = {
  render: () => ({
    template: `
      <nav cwBreadcrumb size="sm" ariaLabel="Fil d'Ariane sm {{ cwTheme }}">
        <a cwBreadcrumbLink href="#">Produit</a>
        <a cwBreadcrumbLink href="#">Sprint 14</a>
        <span cwBreadcrumbPage>CAD-482</span>
      </nav>
      <nav cwBreadcrumb ariaLabel="Fil d'Ariane default {{ cwTheme }}">
        <a cwBreadcrumbLink href="#">Produit</a>
        <a cwBreadcrumbLink href="#">Sprint 14</a>
        <span cwBreadcrumbPage>CAD-482</span>
      </nav>`,
  }),
};

/** A current page longer than 192 px is truncated; hovering it shows the full name. */
export const Truncated: Story = {
  render: () => ({
    template: `
      <nav cwBreadcrumb ariaLabel="Fil d'Ariane {{ cwTheme }}">
        <a cwBreadcrumbLink href="#">Produit</a>
        <a cwBreadcrumbLink href="#">Infra</a>
        <span cwBreadcrumbPage>Migrer les pièces jointes vers un stockage compatible S3</span>
      </nav>`,
  }),
};

/** Past four levels the middle ones fold into « … », which opens the hidden levels. */
export const Collapsed: Story = {
  render: () => ({
    template: `
      <nav cwBreadcrumb ariaLabel="Fil d'Ariane {{ cwTheme }}">
        <a cwBreadcrumbLink href="#">Produit</a>
        <a cwBreadcrumbLink href="#">Sprint 14</a>
        <a cwBreadcrumbLink href="#">Import JSON</a>
        <a cwBreadcrumbLink href="#">CAD-488</a>
        <span cwBreadcrumbPage>Mapper les champs</span>
      </nav>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const nav: HTMLElement = within(light(canvasElement)).getByRole('navigation', {
      name: "Fil d'Ariane light",
    });
    const ellipsis: HTMLElement = within(nav).getByRole('button', { name: 'Niveaux masqués' });
    await expect(within(nav).queryByRole('link', { name: 'Sprint 14' })).toBeNull();

    ellipsis.focus();
    await userEvent.keyboard('{Enter}');
    await expect(ellipsis).toHaveAttribute('aria-expanded', 'true');
    const menu: HTMLElement = await within(document.body).findByRole('menu', {
      name: 'Niveaux masqués',
    });
    const items: HTMLElement[] = within(menu).getAllByRole('menuitem');
    await expect(items.map((item) => item.textContent.trim())).toEqual([
      'Sprint 14',
      'Import JSON',
    ]);
    await expect(items[0]).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(items[1]).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    await expect(ellipsis).toHaveAttribute('aria-expanded', 'false');
    await expect(ellipsis).toHaveFocus();
  },
};

/** A level with a menu: « Sprint 14 ▾ » lists the sibling lists. */
export const LevelWithMenu: Story = {
  render: () => ({
    template: `
      <nav cwBreadcrumb ariaLabel="Fil d'Ariane {{ cwTheme }}">
        <a cwBreadcrumbLink href="#">Produit</a>
        <button cwBreadcrumbLink [cwMenuTriggerFor]="siblings">Sprint 14</button>
        <span cwBreadcrumbPage>CAD-482</span>
      </nav>
      <cw-menu #siblings>
        <button cwMenuItem selected><ng-icon name="phosphorListBulletsBold" aria-hidden="true" />Sprint 14</button>
        <button cwMenuItem><ng-icon name="phosphorListBulletsBold" aria-hidden="true" />Backlog</button>
        <button cwMenuItem><ng-icon name="phosphorListBulletsBold" aria-hidden="true" />Bugs</button>
      </cw-menu>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const level: HTMLElement = within(light(canvasElement)).getByRole('button', {
      name: 'Sprint 14',
    });

    await userEvent.click(level);
    await expect(level).toHaveAttribute('data-state', 'open');
    const menu: HTMLElement = await within(document.body).findByRole('menu', { name: 'Sprint 14' });
    await userEvent.click(within(menu).getByRole('menuitem', { name: 'Backlog' }));
    await expect(level).toHaveAttribute('data-state', 'closed');
  },
};
