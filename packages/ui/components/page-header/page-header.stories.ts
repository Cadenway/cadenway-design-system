import { CwAvatar, CwAvatarGroup } from '@cadenway/ui/components/avatar';
import { CwButton } from '@cadenway/ui/components/button';
import { CwTab, CwTabs, CwTabsList } from '@cadenway/ui/components/tabs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorCalendarBlankBold,
  phosphorCaretRightBold,
  phosphorChartBarHorizontalBold,
  phosphorDotsThreeBold,
  phosphorKanbanBold,
  phosphorListBulletsBold,
  phosphorPlusBold,
  phosphorPulseBold,
  phosphorUserPlusBold,
  phosphorUsersBold,
} from '@ng-icons/phosphor-icons/bold';
import {
  phosphorCalendarBlankFill,
  phosphorChartBarHorizontalFill,
  phosphorKanbanFill,
  phosphorListBulletsFill,
  phosphorPulseFill,
} from '@ng-icons/phosphor-icons/fill';
import {
  type Meta,
  type StoryObj,
  applicationConfig,
  moduleMetadata,
} from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwPageHeaderActions } from './page-header-actions/page-header-actions.component';
import { CwPageHeader } from './page-header.component';
import { CwPageHeaderDescription } from './page-header-description/page-header-description.component';
import { CwPageHeaderFavorite } from './page-header-favorite/page-header-favorite.component';
import { CwPageHeaderTabs } from './page-header-tabs/page-header-tabs.component';
import { CwPageHeaderTitle } from './page-header-title/page-header-title.component';

/**
 * Constant meta
 *
 * @description
 * Page Header, every variant of its sheet in the Design System artifact; each story renders in the
 * light and the dark theme (`.storybook/preview.ts`). Copy from the sheet (« Sprint 14 ») and the
 * mockup's list header (`App.dc.html`). The breadcrumb is plain markup with the Breadcrumb preview's
 * classes; landmark names carry the theme so that the two copies stay distinct.
 *
 * @type {Meta}
 */
const meta: Meta = {
  title: 'UI/PageHeader',
  decorators: [
    moduleMetadata({
      imports: [
        CwPageHeader,
        CwPageHeaderTitle,
        CwPageHeaderFavorite,
        CwPageHeaderDescription,
        CwPageHeaderActions,
        CwPageHeaderTabs,
        CwTabs,
        CwTabsList,
        CwTab,
        CwButton,
        CwAvatar,
        CwAvatarGroup,
        NgIcon,
      ],
    }),
    applicationConfig({
      providers: [
        provideIcons({
          phosphorCalendarBlankBold,
          phosphorCalendarBlankFill,
          phosphorCaretRightBold,
          phosphorChartBarHorizontalBold,
          phosphorChartBarHorizontalFill,
          phosphorDotsThreeBold,
          phosphorKanbanBold,
          phosphorKanbanFill,
          phosphorListBulletsBold,
          phosphorListBulletsFill,
          phosphorPlusBold,
          phosphorPulseBold,
          phosphorPulseFill,
          phosphorUserPlusBold,
          phosphorUsersBold,
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
 * Storybook configuration used for page-header examples and interactions.
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

/**
 * Function breadcrumb
 *
 * @description
 * Builds the mockup breadcrumb markup used in page-header examples with a theme-specific name.
 *
 * @param {'xs' | 'sm'} size - Text size for the breadcrumb trail.
 *
 * @returns {string} Angular template markup for the breadcrumb.
 */
function breadcrumb(size: 'xs' | 'sm'): string {
  const text: string = size === 'xs' ? 'text-xs' : 'text-sm';
  return `
    <nav cwBreadcrumb [attr.aria-label]="cwTheme === 'light' ? 'Fil d\\'Ariane' : 'Fil d\\'Ariane, thème sombre'">
      <ol class="flex items-center gap-1 ${text} text-muted-foreground">
        <li class="flex items-center gap-1"><a href="#produit" class="rounded-sm transition-colors outline-hidden hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">Produit</a></li>
        <li class="flex items-center gap-1"><ng-icon name="phosphorCaretRightBold" aria-hidden="true" class="shrink-0 [--ng-icon__size:0.75rem]" /><a href="#sprints" class="rounded-sm transition-colors outline-hidden hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">Sprints</a></li>
      </ol>
    </nav>`;
}

/**
 * Constant MEMBERS
 *
 * @description
 * Avatar-group markup representing the four sprint members in the header examples.
 *
 * @type {string}
 */
const MEMBERS: string = `
  <cw-avatar-group ariaLabel="4 membres sur ce sprint">
    <cw-avatar name="Léa Martin" />
    <cw-avatar name="Karim Benali" />
    <cw-avatar name="Inès Duval" />
    <cw-avatar name="Samuel Roux" />
  </cw-avatar-group>`;

/**
 * Constant VIEW_TABS
 *
 * @description
 * Mockup list-view tab markup with active fill icons and an action to add a view.
 *
 * @type {string}
 */
const VIEW_TABS: string = `
  <cw-page-header-tabs>
    <cw-tabs [(value)]="view">
      <cw-tabs-list ariaLabel="Vues">
        <button cwTab value="liste" #liste="cwTab">
          <ng-icon [name]="liste.isActive() ? 'phosphorListBulletsFill' : 'phosphorListBulletsBold'" />Liste</button>
        <button cwTab value="tableau" #tableau="cwTab">
          <ng-icon [name]="tableau.isActive() ? 'phosphorKanbanFill' : 'phosphorKanbanBold'" />Tableau</button>
        <button cwTab value="calendrier" #calendrier="cwTab">
          <ng-icon [name]="calendrier.isActive() ? 'phosphorCalendarBlankFill' : 'phosphorCalendarBlankBold'" />Calendrier</button>
        <button cwTab value="gantt" #gantt="cwTab">
          <ng-icon [name]="gantt.isActive() ? 'phosphorChartBarHorizontalFill' : 'phosphorChartBarHorizontalBold'" />Gantt</button>
      </cw-tabs-list>
    </cw-tabs>
    <button cwButton variant="ghost" size="xs"><ng-icon name="phosphorPlusBold" />Vue</button>
  </cw-page-header-tabs>`;

/** Default: breadcrumb, title, favorite on, summary, people, actions, then the view tabs. */
export const Default: Story = {
  render: () => ({
    props: { favorite: true, view: 'liste' },
    template: `
      <cw-page-header class="w-full">
        ${breadcrumb('xs')}
        <cw-page-header-title>Sprint 14</cw-page-header-title>
        <cw-page-header-favorite [(favorite)]="favorite" />
        <cw-page-header-description>12 – 26 nov. · 18 tâches ouvertes · 68 % terminé</cw-page-header-description>
        <cw-page-header-actions>
          ${MEMBERS}
          <button cwButton variant="outline"><ng-icon name="phosphorUsersBold" />Partager</button>
          <button cwButton><ng-icon name="phosphorPlusBold" />Créer une tâche</button>
          <button cwButton variant="ghost" size="icon" aria-label="Actions du sprint"><ng-icon name="phosphorDotsThreeBold" /></button>
        </cw-page-header-actions>
        ${VIEW_TABS}
      </cw-page-header>`,
  }),
};

/** The mockup's view header: the list name, the view tabs and « Créer une tâche ». */
export const ListView: Story = {
  render: () => ({
    props: { favorite: false, view: 'tableau' },
    template: `
      <cw-page-header class="w-full">
        <cw-page-header-title>Sprint 14</cw-page-header-title>
        <cw-page-header-favorite [(favorite)]="favorite" />
        <cw-page-header-description>12 – 26 nov. · 18 tâches ouvertes · 68 % terminé</cw-page-header-description>
        <cw-page-header-actions>
          <button cwButton><ng-icon name="phosphorPlusBold" />Créer une tâche</button>
        </cw-page-header-actions>
        ${VIEW_TABS}
      </cw-page-header>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: { getByRole(role: string, options?: { name?: string }): HTMLElement } = within(
      light(canvasElement),
    );
    const views: HTMLElement = scope.getByRole('tablist', { name: 'Vues' });
    const board: HTMLElement = within(views).getByRole('tab', { name: 'Tableau' });
    await expect(board).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(within(views).getByRole('tab', { name: 'Calendrier' }));
    await expect(within(views).getByRole('tab', { name: 'Calendrier' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await userEvent.keyboard('{ArrowLeft}');
    await expect(board).toHaveFocus();
    await expect(board).toHaveAttribute('aria-selected', 'true');
  },
};

/** Routed views: the tabs are links in a « Vues » navigation, the active one the current page. */
export const RoutedViews: Story = {
  render: () => ({
    props: {
      route: 'liste',
      go(event: Event, route: string) {
        // Stands for `routerLink` and `routerLinkActive`: the story has no router.
        event.preventDefault();
        (this as { route: string }).route = route;
      },
    },
    template: `
      <cw-page-header class="w-full">
        <cw-page-header-title>Sprint 14</cw-page-header-title>
        <cw-page-header-actions>
          <button cwButton><ng-icon name="phosphorPlusBold" />Créer une tâche</button>
        </cw-page-header-actions>
        <cw-page-header-tabs>
          <cw-tabs>
            <cw-tabs-list [ariaLabel]="cwTheme === 'light' ? 'Vues' : 'Vues, thème sombre'">
              <a cwTab value="liste" href="#liste" [active]="route === 'liste'" (click)="go($event, 'liste')">
                <ng-icon [name]="route === 'liste' ? 'phosphorListBulletsFill' : 'phosphorListBulletsBold'" />Liste</a>
              <a cwTab value="tableau" href="#tableau" [active]="route === 'tableau'" (click)="go($event, 'tableau')">
                <ng-icon [name]="route === 'tableau' ? 'phosphorKanbanFill' : 'phosphorKanbanBold'" />Tableau</a>
              <a cwTab value="activite" href="#activite" [active]="route === 'activite'" (click)="go($event, 'activite')">
                <ng-icon [name]="route === 'activite' ? 'phosphorPulseFill' : 'phosphorPulseBold'" />Activité</a>
            </cw-tabs-list>
          </cw-tabs>
        </cw-page-header-tabs>
      </cw-page-header>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: { getByRole(role: string, options?: { name?: string }): HTMLElement } = within(
      light(canvasElement),
    );
    const nav: HTMLElement = scope.getByRole('navigation', { name: 'Vues' });
    await expect(within(nav).getByRole('link', { name: 'Liste' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await userEvent.click(within(nav).getByRole('link', { name: 'Activité' }));
    await expect(within(nav).getByRole('link', { name: 'Activité' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  },
};

/** Default without tabs: settings, a fixed title and one action; the header draws its rule. */
export const WithoutTabs: Story = {
  render: () => ({
    template: `
      <cw-page-header class="w-full">
        <nav cwBreadcrumb [attr.aria-label]="cwTheme === 'light' ? 'Fil d\\'Ariane' : 'Fil d\\'Ariane, thème sombre'">
          <ol class="flex items-center gap-1 text-xs text-muted-foreground">
            <li class="flex items-center gap-1"><a href="#reglages" class="rounded-sm transition-colors outline-hidden hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">Réglages</a></li>
          </ol>
        </nav>
        <cw-page-header-title>Membres</cw-page-header-title>
        <cw-page-header-description>4 membres · 2 invitations en attente</cw-page-header-description>
        <cw-page-header-actions>
          <button cwButton><ng-icon name="phosphorUserPlusBold" />Inviter</button>
        </cw-page-header-actions>
      </cw-page-header>`,
  }),
};

/** Compact: one 44 px row, breadcrumb › title, favorite, `sm` actions. */
export const Compact: Story = {
  render: () => ({
    props: { favorite: false },
    template: `
      <cw-page-header size="compact" class="w-full">
        ${breadcrumb('sm')}
        <cw-page-header-title>Sprint 14</cw-page-header-title>
        <cw-page-header-favorite [(favorite)]="favorite" />
        <cw-page-header-actions>
          <button cwButton variant="outline" size="sm"><ng-icon name="phosphorUsersBold" />Partager</button>
          <button cwButton size="sm"><ng-icon name="phosphorPlusBold" />Créer une tâche</button>
          <button cwButton variant="ghost" size="icon-sm" aria-label="Actions du sprint"><ng-icon name="phosphorDotsThreeBold" /></button>
        </cw-page-header-actions>
      </cw-page-header>`,
  }),
};

/** Compact with views: title, a vertical separator, the `bar` tabs over the row's full height. */
export const CompactWithViews: Story = {
  render: () => ({
    props: { favorite: true, view: 'tableau' },
    template: `
      <cw-page-header size="compact" class="w-full">
        <cw-page-header-title>
          <ng-icon name="phosphorKanbanBold" aria-hidden="true" class="[--ng-icon__color:var(--muted-foreground)] [--ng-icon__size:1rem]" />Sprint 14
        </cw-page-header-title>
        <cw-page-header-favorite [(favorite)]="favorite" />
        <cw-page-header-actions>
          <button cwButton size="sm"><ng-icon name="phosphorPlusBold" />Créer une tâche</button>
        </cw-page-header-actions>
        <cw-page-header-tabs>
          <cw-tabs [(value)]="view">
            <cw-tabs-list ariaLabel="Vues">
              <button cwTab value="liste" #liste="cwTab">
                <ng-icon [name]="liste.isActive() ? 'phosphorListBulletsFill' : 'phosphorListBulletsBold'" />Liste</button>
              <button cwTab value="tableau" #tableau="cwTab">
                <ng-icon [name]="tableau.isActive() ? 'phosphorKanbanFill' : 'phosphorKanbanBold'" />Tableau</button>
              <button cwTab value="calendrier" #calendrier="cwTab">
                <ng-icon [name]="calendrier.isActive() ? 'phosphorCalendarBlankFill' : 'phosphorCalendarBlankBold'" />Calendrier</button>
            </cw-tabs-list>
          </cw-tabs>
        </cw-page-header-tabs>
      </cw-page-header>`,
  }),
};

/** Favorite: Enter and click flip `aria-pressed`; the name stays « Favori ». */
export const Favorite: Story = {
  render: () => ({
    props: { favorite: false },
    template: `
      <cw-page-header class="w-full">
        <cw-page-header-title>Sprint 14</cw-page-header-title>
        <cw-page-header-favorite [(favorite)]="favorite" />
      </cw-page-header>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const star: HTMLElement = within(light(canvasElement)).getByRole('button', { name: 'Favori' });
    await expect(star).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(star);
    await expect(star).toHaveAttribute('aria-pressed', 'true');
    await userEvent.keyboard('{Enter}');
    await expect(star).toHaveAttribute('aria-pressed', 'false');
  },
};
