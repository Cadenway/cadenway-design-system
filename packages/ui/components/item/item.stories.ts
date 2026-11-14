import { CwButton } from '@cadenway/ui/components/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorDotsThreeBold,
  phosphorDownloadSimpleBold,
  phosphorEnvelopeBold,
  phosphorLightningBold,
  phosphorPlugsBold,
} from '@ng-icons/phosphor-icons/bold';
import {
  type Meta,
  type StoryObj,
  applicationConfig,
  moduleMetadata,
} from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwItemActions } from './item-actions/item-actions.component';
import { CwItemContent } from './item-content/item-content.component';
import { CwItemDescription } from './item-description/item-description.component';
import { CwItemGroup } from './item-group/item-group.component';
import { CwItemMedia } from './item-media/item-media.component';
import { CwItemSeparator } from './item-separator/item-separator.component';
import { CwItemTitle } from './item-title/item-title.component';
import { CwItem } from './item.component';

/**
 * Constant meta
 *
 * @description
 * Item, every variant, size and state of its sheet in the Design System artifact, in the light and
 * the dark theme. Copy from the mockup (`App.dc.html`: inbox, settings › members and integrations).
 *
 * @type {Meta}
 */
const meta: Meta = {
  title: 'UI/Item',
  decorators: [
    moduleMetadata({
      imports: [
        CwItem,
        CwItemGroup,
        CwItemMedia,
        CwItemContent,
        CwItemTitle,
        CwItemDescription,
        CwItemActions,
        CwItemSeparator,
        CwButton,
        NgIcon,
      ],
    }),
    applicationConfig({
      providers: [
        provideIcons({
          phosphorDotsThreeBold,
          phosphorDownloadSimpleBold,
          phosphorEnvelopeBold,
          phosphorLightningBold,
          phosphorPlugsBold,
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
 * Storybook story for the item examples.
 *
 * @type {StoryObj}
 */
type Story = StoryObj;

// Initials of a member, until `cw-avatar` is used here.
/**
 * Constant INITIALS
 *
 * @description
 * Classes for member initials in the examples.
 *
 * @type {string}
 */
const INITIALS: string =
  'flex size-8 items-center justify-center rounded-full bg-secondary text-xs leading-none font-semibold text-secondary-foreground';

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

/** The three variants: `default`, `outline` (isolated item), `muted` (soft highlight). */
export const Variants: Story = {
  render: () => ({
    template: `
      <div class="grid w-[28rem] gap-2">
        <cw-item>
          <cw-item-media variant="icon"><ng-icon name="phosphorPlugsBold" /></cw-item-media>
          <cw-item-content>
            <cw-item-title>Webhook sortant</cw-item-title>
            <cw-item-description>Changements de statut</cw-item-description>
          </cw-item-content>
          <cw-item-actions><button cwButton variant="outline" size="sm">Configurer</button></cw-item-actions>
        </cw-item>
        <cw-item variant="outline">
          <cw-item-media variant="icon"><ng-icon name="phosphorEnvelopeBold" /></cw-item-media>
          <cw-item-content>
            <cw-item-title>Serveur SMTP</cw-item-title>
            <cw-item-description>smtp.exemple.fr:587</cw-item-description>
          </cw-item-content>
          <cw-item-actions><button cwButton variant="outline" size="sm">Configurer</button></cw-item-actions>
        </cw-item>
        <cw-item variant="muted">
          <cw-item-media variant="icon"><ng-icon name="phosphorLightningBold" /></cw-item-media>
          <cw-item-content>
            <cw-item-title>Sauvegardes S3</cw-item-title>
            <cw-item-description>Chaque nuit à 02:00</cw-item-description>
          </cw-item-content>
          <cw-item-actions><button cwButton variant="outline" size="sm">Configurer</button></cw-item-actions>
        </cw-item>
      </div>`,
  }),
};

/** The three sizes: `default` (60 px with a description), `sm` (40 px), `xs` (32 px). */
export const Sizes: Story = {
  render: () => ({
    template: `
      <div class="grid w-[28rem] gap-2">
        <cw-item variant="outline">
          <cw-item-media><span class="${INITIALS}">LM</span></cw-item-media>
          <cw-item-content>
            <cw-item-title>Léa Martin</cw-item-title>
            <cw-item-description>Admin · lea.martin&#64;exemple.fr</cw-item-description>
          </cw-item-content>
        </cw-item>
        <cw-item variant="outline" size="sm">
          <cw-item-media variant="icon"><ng-icon name="phosphorPlugsBold" /></cw-item-media>
          <cw-item-content><cw-item-title>Import depuis un export JSON</cw-item-title></cw-item-content>
        </cw-item>
        <cw-item variant="outline" size="xs">
          <cw-item-media variant="image">
            <svg viewBox="0 0 40 40" class="size-full bg-muted" aria-hidden="true">
              <rect x="6" y="8" width="28" height="4" rx="2" class="fill-foreground" />
              <rect x="6" y="16" width="18" height="3" rx="1.5" class="fill-line-control" />
            </svg>
          </cw-item-media>
          <cw-item-content>
            <cw-item-title>export-taches.csv</cw-item-title>
            <cw-item-description>12 Ko</cw-item-description>
          </cw-item-content>
          <cw-item-actions>
            <button cwButton variant="ghost" size="icon-xs" aria-label="Télécharger export-taches.csv">
              <ng-icon name="phosphorDownloadSimpleBold" />
            </button>
          </cw-item-actions>
        </cw-item>
      </div>`,
  }),
};

/** Clickable rows (`sm`): rest, selected, disabled. */
export const States: Story = {
  render: () => ({
    template: `
      <div class="grid w-80 gap-2">
        <button cwItem size="sm">
          <cw-item-content><cw-item-title>Karim Benali</cw-item-title></cw-item-content>
        </button>
        <button cwItem size="sm" [selected]="true">
          <cw-item-content><cw-item-title>Inès Duval</cw-item-title></cw-item-content>
        </button>
        <button cwItem size="sm" disabled>
          <cw-item-content><cw-item-title>Samuel Roux</cw-item-title></cw-item-content>
        </button>
      </div>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const disabled: HTMLElement = within(light(canvasElement)).getByRole('button', {
      name: 'Samuel Roux',
    });
    await expect(disabled).toHaveAttribute('aria-disabled', 'true');
  },
};

/** The inbox: links in a group, unread rows `muted` with a dot and a hidden « (non lu) ». */
export const Inbox: Story = {
  render: () => ({
    template: `
      <cw-item-group aria-label="Notifications" class="w-[28rem] rounded-xl border p-1">
        <a cwItem unread href="#CAD-482">
          <cw-item-media><span class="${INITIALS}">KB</span></cw-item-media>
          <cw-item-content>
            <cw-item-title>Karim Benali vous a mentionné</cw-item-title>
            <cw-item-description>« &#64;Léa tu peux relire l'export ? » — CAD-482</cw-item-description>
          </cw-item-content>
          <cw-item-actions><span class="text-xs text-muted-foreground">10:42</span></cw-item-actions>
        </a>
        <a cwItem unread href="#CAD-479">
          <cw-item-media><span class="${INITIALS}">ID</span></cw-item-media>
          <cw-item-content>
            <cw-item-title>Inès Duval vous a assigné CAD-479</cw-item-title>
            <cw-item-description>Maquetter la vue Calendrier · échéance le 18 nov.</cw-item-description>
          </cw-item-content>
          <cw-item-actions><span class="text-xs text-muted-foreground">09:15</span></cw-item-actions>
        </a>
        <cw-item-separator />
        <a cwItem href="#automatisations">
          <cw-item-media variant="icon"><ng-icon name="phosphorLightningBold" /></cw-item-media>
          <cw-item-content>
            <cw-item-title>Automatisation exécutée</cw-item-title>
            <cw-item-description>« Clore les tâches terminées » a déplacé 4 tâches vers Terminé.</cw-item-description>
          </cw-item-content>
          <cw-item-actions><span class="text-xs text-muted-foreground">Hier</span></cw-item-actions>
        </a>
      </cw-item-group>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: {
      getByRole: (role: string, options?: { name: string }) => HTMLElement;
      getAllByRole: (role: string) => HTMLElement[];
    } = within(light(canvasElement));
    const [first, second, third]: HTMLElement[] = scope.getAllByRole('link');

    await userEvent.tab();
    await expect(first).toHaveFocus();
    await expect(first).toHaveAccessibleName(expect.stringContaining('(non lu)'));
    await userEvent.keyboard('{ArrowDown}');
    await expect(second).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect(third).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(first).toHaveFocus();
  },
};

/** Members (`sm`): one tab stop for the rows, Tab then reaches the actions of the row. */
export const Members: Story = {
  render: () => ({
    template: `
      <cw-item-group aria-label="Membres" class="w-[28rem]">
        <cw-item size="sm">
          <cw-item-media><span class="${INITIALS}">LM</span></cw-item-media>
          <cw-item-content>
            <cw-item-title>Léa Martin</cw-item-title>
            <cw-item-description>Admin</cw-item-description>
          </cw-item-content>
          <cw-item-actions>
            <button cwButton variant="ghost" size="icon-sm" aria-label="Actions de Léa Martin"><ng-icon name="phosphorDotsThreeBold" /></button>
          </cw-item-actions>
        </cw-item>
        <cw-item size="sm">
          <cw-item-media><span class="${INITIALS}">KB</span></cw-item-media>
          <cw-item-content>
            <cw-item-title>Karim Benali</cw-item-title>
            <cw-item-description>Membre</cw-item-description>
          </cw-item-content>
          <cw-item-actions>
            <button cwButton variant="ghost" size="icon-sm" aria-label="Actions de Karim Benali"><ng-icon name="phosphorDotsThreeBold" /></button>
          </cw-item-actions>
        </cw-item>
      </cw-item-group>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: {
      getByRole: (role: string, options?: { name: string }) => HTMLElement;
      getAllByRole: (role: string) => HTMLElement[];
    } = within(light(canvasElement));
    const [lea, karim]: HTMLElement[] = scope.getAllByRole('listitem');

    await userEvent.tab();
    await expect(lea).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(karim).toHaveFocus();
    await userEvent.tab();
    await expect(scope.getByRole('button', { name: 'Actions de Karim Benali' })).toHaveFocus();
  },
};

/** A selectable group: a multi-selection listbox, Space toggles the focused option. */
export const Selectable: Story = {
  render: () => ({
    template: `
      <cw-item-group aria-label="Pièces jointes" selectable class="w-80">
        <cw-item size="xs">
          <cw-item-content><cw-item-title>export-taches.csv</cw-item-title></cw-item-content>
        </cw-item>
        <cw-item size="xs" [selected]="true">
          <cw-item-content><cw-item-title>maquette-calendrier.png</cw-item-title></cw-item-content>
        </cw-item>
        <cw-item size="xs">
          <cw-item-content><cw-item-title>notes-reunion.pdf</cw-item-title></cw-item-content>
        </cw-item>
      </cw-item-group>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: {
      getByRole: (role: string, options?: { name: string }) => HTMLElement;
      getAllByRole: (role: string) => HTMLElement[];
    } = within(light(canvasElement));
    const [csv]: HTMLElement[] = scope.getAllByRole('option');

    await expect(scope.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true');
    await userEvent.tab();
    await expect(csv).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(csv).toHaveAttribute('aria-selected', 'true');
  },
};
