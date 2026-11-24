import { CwAvatar } from '@cadenway/ui/components/avatar';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorChartBarBold,
  phosphorCheckSquareBold,
  phosphorFileTextBold,
  phosphorHouseBold,
  phosphorMagnifyingGlassBold,
  phosphorMegaphoneBold,
  phosphorMoonBold,
  phosphorRocketBold,
  phosphorSquaresFourBold,
  phosphorTargetBold,
  phosphorTrayBold,
} from '@ng-icons/phosphor-icons/bold';
import {
  phosphorChartBarFill,
  phosphorCheckSquareFill,
  phosphorFileTextFill,
  phosphorHouseFill,
  phosphorSquaresFourFill,
} from '@ng-icons/phosphor-icons/fill';
import {
  type Meta,
  type StoryObj,
  applicationConfig,
  moduleMetadata,
} from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { CwAppRailFooter } from './app-rail-footer/app-rail-footer.component';
import { CwAppRailGroup } from './app-rail-group/app-rail-group.component';
import { CwAppRailItem } from './app-rail-item/app-rail-item.component';
import { CwAppRailSeparator } from './app-rail-separator/app-rail-separator.component';
import { CwAppRail } from './app-rail.component';

/**
 * Constant meta
 *
 * @description
 * The applications rail of the app shell, in the light and the dark theme. Items, labels and counts
 * are the mockup's (`App.dc.html`); the brick knows none of them.
 *
 * @type {Meta}
 */
const meta: Meta = {
  title: 'UI/AppRail',
  parameters: {
    // The organization switcher and the account button show initials (« AN », « CM ») and are
    // named by the full name, as in the mockup: axe's experimental Label in Name rule flags that
    // pair. Every other item is an icon, which this rule leaves alone.
    a11y: {
      config: {
        rules: [
          {
            id: 'label-content-name-mismatch',
            selector: 'nav [aria-haspopup="menu"]',
            enabled: false,
          },
        ],
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [
        CwAppRail,
        CwAppRailGroup,
        CwAppRailSeparator,
        CwAppRailFooter,
        CwAppRailItem,
        CwAvatar,
        NgIcon,
      ],
    }),
    applicationConfig({
      providers: [
        provideIcons({
          phosphorChartBarBold,
          phosphorChartBarFill,
          phosphorCheckSquareBold,
          phosphorCheckSquareFill,
          phosphorFileTextBold,
          phosphorFileTextFill,
          phosphorHouseBold,
          phosphorHouseFill,
          phosphorMagnifyingGlassBold,
          phosphorMegaphoneBold,
          phosphorMoonBold,
          phosphorRocketBold,
          phosphorSquaresFourBold,
          phosphorSquaresFourFill,
          phosphorTargetBold,
          phosphorTrayBold,
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
 * Storybook configuration for the rail examples.
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
 *
 * @returns {HTMLElement} Light theme section.
 *
 * @throws {Error} When the light theme section is missing.
 */
function light(canvasElement: HTMLElement): HTMLElement {
  const scope: HTMLElement | null =
    canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

/**
 * Constant RAIL
 *
 * @description
 * The mockup's rail: organization switcher, applications with the inbox count, two favorite
 * spaces, then search, theme and account at the bottom.
 *
 * @type {string}
 */
const RAIL: string = `
  <nav cwAppRail [ariaLabel]="cwTheme === 'dark' ? 'Applications, thème sombre' : 'Applications'">
    <cw-app-rail-group desktopOnly>
      <button cwAppRailItem variant="primary" aria-haspopup="menu"><span cwAppRailItemMedia>AN</span>Atelier Nord</button>
    </cw-app-rail-group>
    <cw-app-rail-separator />
    <cw-app-rail-group>
      <a cwAppRailItem href="#home" icon="phosphorHouseBold" current>Accueil</a>
      <button cwAppRailItem icon="phosphorTrayBold" activeIcon="phosphorTrayBold" badge="3" badgeLabel="3 non lues">Boîte de réception</button>
      <a cwAppRailItem href="#mine" icon="phosphorCheckSquareBold">Mes tâches</a>
      <a cwAppRailItem href="#spaces" icon="phosphorSquaresFourBold">Espaces</a>
      <a cwAppRailItem href="#dash" icon="phosphorChartBarBold">Tableaux de bord</a>
      <a cwAppRailItem href="#goals" icon="phosphorTargetBold" activeIcon="phosphorTargetBold">Objectifs</a>
      <a cwAppRailItem href="#docs" icon="phosphorFileTextBold">Documents</a>
    </cw-app-rail-group>
    <cw-app-rail-separator />
    <cw-app-rail-group desktopOnly>
      <a cwAppRailItem href="#produit" icon="phosphorRocketBold">Produit</a>
      <a cwAppRailItem href="#marketing" icon="phosphorMegaphoneBold">Marketing</a>
    </cw-app-rail-group>
    <cw-app-rail-footer>
      <button cwAppRailItem icon="phosphorMagnifyingGlassBold" tooltip="Rechercher" [shortcut]="['Ctrl', 'K']">Rechercher (Ctrl K)</button>
      <button cwAppRailItem icon="phosphorMoonBold" desktopOnly>Thème sombre</button>
      <button cwAppRailItem aria-haspopup="menu"><cw-avatar cwAppRailItemMedia name="Camille Martin" size="sm" presence="online" aria-hidden="true" />Camille Martin, en ligne</button>
    </cw-app-rail-footer>
  </nav>`;

/** The rail at the left of the shell, from 768 px: 56 px wide, its footer pushed to the bottom. */
export const Default: Story = {
  render: () => ({
    template: `<div class="flex h-[34rem] rounded-lg border border-border bg-canvas">${RAIL}</div>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const rail: HTMLElement = within(light(canvasElement)).getByRole('navigation', {
      name: 'Applications',
    });
    await expect(within(rail).getByRole('link', { name: 'Accueil' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(
      within(rail).getByRole('button', { name: 'Boîte de réception, 3 non lues' }),
    ).toBeVisible();
  },
};

/** Keyboard: Tab walks the items in order; the focused item shows its tooltip on the right. */
export const KeyboardTooltip: Story = {
  render: () => ({
    template: `<div class="flex h-[34rem] rounded-lg border border-border bg-canvas">${RAIL}</div>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const rail: HTMLElement = within(light(canvasElement)).getByRole('navigation', {
      name: 'Applications',
    });
    within(rail).getByRole('button', { name: 'Atelier Nord' }).focus();
    await userEvent.tab();
    await expect(within(rail).getByRole('link', { name: 'Accueil' })).toHaveFocus();
    await waitFor(() =>
      expect(within(document.body).getByRole('tooltip')).toHaveTextContent('Accueil'),
    );
    await userEvent.tab();
    await expect(
      within(rail).getByRole('button', { name: 'Boîte de réception, 3 non lues' }),
    ).toHaveFocus();
  },
};

/**
 * Below 768 px the rail is a 56 px tab bar fixed at the bottom of the screen: the applications,
 * search and account share one row; the switcher, the spaces and the theme stay on the desktop.
 */
export const PhoneTabBar: Story = {
  parameters: { themes: false },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  render: () => ({
    template: `<div data-theme="light" class="min-h-[22rem] bg-canvas pb-14 text-foreground">${RAIL}</div>`,
  }),
};
