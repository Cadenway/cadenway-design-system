import { CwButton } from '@cadenway/ui/components/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorBellBold,
  phosphorCalendarBlankBold,
  phosphorChartBarHorizontalBold,
  phosphorChatCircleBold,
  phosphorFunnelSimpleBold,
  phosphorKanbanBold,
  phosphorListBulletsBold,
  phosphorListChecksBold,
  phosphorPlugsConnectedBold,
  phosphorPulseBold,
  phosphorShieldCheckBold,
  phosphorTextAlignLeftBold,
  phosphorTimerBold,
  phosphorUserCircleBold,
} from '@ng-icons/phosphor-icons/bold';
import {
  phosphorBellFill,
  phosphorCalendarBlankFill,
  phosphorChartBarHorizontalFill,
  phosphorChatCircleFill,
  phosphorKanbanFill,
  phosphorListBulletsFill,
  phosphorListChecksFill,
  phosphorPlugsConnectedFill,
  phosphorPulseFill,
  phosphorShieldCheckFill,
  phosphorTextAlignLeftFill,
  phosphorTimerFill,
  phosphorUserCircleFill,
} from '@ng-icons/phosphor-icons/fill';
import {
  type Meta,
  type StoryObj,
  applicationConfig,
  moduleMetadata,
} from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwTab } from './tab/tab.component';
import { CwTabPanel } from './tab-panel/tab-panel.component';
import { CwTabs } from './tabs.component';
import { CwTabsList } from './tabs-list/tabs-list.component';

/**
 * Tabs, every state of its sheet in the Design System artifact; each story renders in the light and
 * the dark theme (`.storybook/preview.ts`). Copy from the mockup (`App.dc.html`: view tabs, task
 * sections, settings). The active tab's icon swaps to its Fill glyph through `#tab="cwTab"`.
 */
const meta: Meta = {
  title: 'UI/Tabs',
  decorators: [
    moduleMetadata({ imports: [CwTabs, CwTabsList, CwTab, CwTabPanel, CwButton, NgIcon] }),
    applicationConfig({
      providers: [
        provideIcons({
          phosphorBellBold,
          phosphorBellFill,
          phosphorCalendarBlankBold,
          phosphorCalendarBlankFill,
          phosphorChartBarHorizontalBold,
          phosphorChartBarHorizontalFill,
          phosphorChatCircleBold,
          phosphorChatCircleFill,
          phosphorFunnelSimpleBold,
          phosphorKanbanBold,
          phosphorKanbanFill,
          phosphorListBulletsBold,
          phosphorListBulletsFill,
          phosphorListChecksBold,
          phosphorListChecksFill,
          phosphorPlugsConnectedBold,
          phosphorPlugsConnectedFill,
          phosphorPulseBold,
          phosphorPulseFill,
          phosphorShieldCheckBold,
          phosphorShieldCheckFill,
          phosphorTextAlignLeftBold,
          phosphorTextAlignLeftFill,
          phosphorTimerBold,
          phosphorTimerFill,
          phosphorUserCircleBold,
          phosphorUserCircleFill,
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

/* The counter is read after the label (« Tableau, 4 »); the browser puts a space around the hidden
   comma, since the tab's children are flex items. */
const COUNTED_BOARD = /^Tableau\s*,\s*4$/;

const VIEW_TABS = `
  <cw-tabs-list ariaLabel="Vues de la liste">
    <button cwTab value="liste" #liste="cwTab">
      <ng-icon [name]="liste.isActive() ? 'phosphorListBulletsFill' : 'phosphorListBulletsBold'" />Liste</button>
    <button cwTab value="tableau" [count]="4" #tableau="cwTab">
      <ng-icon [name]="tableau.isActive() ? 'phosphorKanbanFill' : 'phosphorKanbanBold'" />Tableau</button>
    <button cwTab value="calendrier" #calendrier="cwTab">
      <ng-icon [name]="calendrier.isActive() ? 'phosphorCalendarBlankFill' : 'phosphorCalendarBlankBold'" />Calendrier</button>
    <button cwTab value="gantt" disabled>
      <ng-icon name="phosphorChartBarHorizontalBold" />Gantt</button>
  </cw-tabs-list>`;

/** `segmented`, the default, 32 px: icons, a counter, a disabled tab. */
export const Segmented: Story = {
  render: () => ({
    props: { view: 'liste' },
    template: `<cw-tabs [(value)]="view">${VIEW_TABS}</cw-tabs>`,
  }),
};

/** `segmented` `sm`, 28 px: the calendar's period switch, words only. */
export const SegmentedSmall: Story = {
  render: () => ({
    props: { period: 'semaine' },
    template: `
      <cw-tabs size="sm" [(value)]="period">
        <cw-tabs-list ariaLabel="Période">
          <button cwTab value="jour">Jour</button>
          <button cwTab value="semaine">Semaine</button>
          <button cwTab value="mois">Mois</button>
        </cw-tabs-list>
      </cw-tabs>`,
  }),
};

/** In a toolbar: icon-only tabs, named by `aria-label`, aligned on the 32 px buttons. */
export const InToolbar: Story = {
  render: () => ({
    props: { view: 'liste' },
    template: `
      <div class="flex items-center gap-2">
        <button cwButton variant="outline"><ng-icon name="phosphorFunnelSimpleBold" />Filtrer</button>
        <cw-tabs [(value)]="view">
          <cw-tabs-list ariaLabel="Vue">
            <button cwTab value="liste" aria-label="Liste" #liste="cwTab">
              <ng-icon [name]="liste.isActive() ? 'phosphorListBulletsFill' : 'phosphorListBulletsBold'" />
            </button>
            <button cwTab value="tableau" aria-label="Tableau" #tableau="cwTab">
              <ng-icon [name]="tableau.isActive() ? 'phosphorKanbanFill' : 'phosphorKanbanBold'" />
            </button>
            <button cwTab value="calendrier" aria-label="Calendrier" #calendrier="cwTab">
              <ng-icon [name]="calendrier.isActive() ? 'phosphorCalendarBlankFill' : 'phosphorCalendarBlankBold'" />
            </button>
          </cw-tabs-list>
        </cw-tabs>
      </div>`,
  }),
};

/** `bar`, 36 px: the sections of a task, counters, a disabled tab and the panels. */
export const Bar: Story = {
  render: () => ({
    props: { section: 'details' },
    template: `
      <cw-tabs variant="bar" class="w-full max-w-xl" [(value)]="section">
        <cw-tabs-list ariaLabel="Sections de la tâche">
          <button cwTab value="details" #details="cwTab">
            <ng-icon [name]="details.isActive() ? 'phosphorTextAlignLeftFill' : 'phosphorTextAlignLeftBold'" />Détails</button>
          <button cwTab value="sous-taches" [count]="5" #subtasks="cwTab">
            <ng-icon [name]="subtasks.isActive() ? 'phosphorListChecksFill' : 'phosphorListChecksBold'" />Sous-tâches</button>
          <button cwTab value="commentaires" [count]="12" #comments="cwTab">
            <ng-icon [name]="comments.isActive() ? 'phosphorChatCircleFill' : 'phosphorChatCircleBold'" />Commentaires</button>
          <button cwTab value="activite" #activity="cwTab">
            <ng-icon [name]="activity.isActive() ? 'phosphorPulseFill' : 'phosphorPulseBold'" />Activité</button>
          <button cwTab value="temps" disabled>
            <ng-icon name="phosphorTimerBold" />Temps passé</button>
        </cw-tabs-list>
        <cw-tab-panel value="details" class="text-sm text-muted-foreground">L'export CSV perd les accents dans les noms de colonnes.</cw-tab-panel>
        <cw-tab-panel value="sous-taches" class="text-sm">5 sous-tâches</cw-tab-panel>
        <cw-tab-panel value="commentaires" class="text-sm">12 commentaires</cw-tab-panel>
        <cw-tab-panel value="activite" class="text-sm">Activité de la tâche</cw-tab-panel>
        <cw-tab-panel value="temps" class="text-sm">Temps passé</cw-tab-panel>
      </cw-tabs>`,
  }),
};

/** `bar` `sm`, 28 px: words only. */
export const BarSmall: Story = {
  render: () => ({
    props: { view: 'liste' },
    template: `
      <cw-tabs variant="bar" size="sm" class="w-full max-w-md" [(value)]="view">
        <cw-tabs-list ariaLabel="Vues">
          <button cwTab value="liste">Liste</button>
          <button cwTab value="tableau">Tableau</button>
          <button cwTab value="calendrier">Calendrier</button>
          <button cwTab value="activite">Activité</button>
        </cw-tabs-list>
      </cw-tabs>`,
  }),
};

/** `bar` vertical: the settings pages, a counter pushed to the end, a disabled page. */
export const Vertical: Story = {
  render: () => ({
    props: { page: 'notifications' },
    template: `
      <cw-tabs variant="bar" orientation="vertical" class="w-full" [(value)]="page">
        <cw-tabs-list ariaLabel="Réglages">
          <button cwTab value="profil" #profile="cwTab">
            <ng-icon [name]="profile.isActive() ? 'phosphorUserCircleFill' : 'phosphorUserCircleBold'" />Profil</button>
          <button cwTab value="notifications" [count]="3" #notifications="cwTab">
            <ng-icon [name]="notifications.isActive() ? 'phosphorBellFill' : 'phosphorBellBold'" />Notifications</button>
          <button cwTab value="securite" #security="cwTab">
            <ng-icon [name]="security.isActive() ? 'phosphorShieldCheckFill' : 'phosphorShieldCheckBold'" />Sécurité</button>
          <button cwTab value="integrations" disabled>
            <ng-icon name="phosphorPlugsConnectedBold" />Intégrations</button>
        </cw-tabs-list>
        <cw-tab-panel value="profil" class="text-sm">Profil</cw-tab-panel>
        <cw-tab-panel value="notifications" class="text-sm">Tâche assignée à moi</cw-tab-panel>
        <cw-tab-panel value="securite" class="text-sm">Sécurité</cw-tab-panel>
        <cw-tab-panel value="integrations" class="text-sm">Intégrations</cw-tab-panel>
      </cw-tabs>`,
  }),
};

/** Links: the routed views of a page are a navigation, the active link the current page. */
export const Links: Story = {
  render: () => ({
    props: {
      route: 'tableau',
      go(event: Event, route: string) {
        // Stands for `routerLink`: the story has no router, so it only moves the active link.
        event.preventDefault();
        (this as { route: string }).route = route;
      },
    },
    template: `
      <cw-tabs variant="bar" class="w-full max-w-md">
        <cw-tabs-list [ariaLabel]="cwTheme === 'light' ? 'Vues' : 'Vues, thème sombre'">
          <a cwTab value="liste" href="#liste" [active]="route === 'liste'" (click)="go($event, 'liste')">Liste</a>
          <a cwTab value="tableau" href="#tableau" [active]="route === 'tableau'" (click)="go($event, 'tableau')">Tableau</a>
          <a cwTab value="calendrier" href="#calendrier" [active]="route === 'calendrier'" (click)="go($event, 'calendrier')">Calendrier</a>
          <a cwTab value="gantt" href="#gantt" disabled>Gantt</a>
        </cw-tabs-list>
      </cw-tabs>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    const nav = scope.getByRole('navigation', { name: 'Vues' });
    const table = within(nav).getByRole('link', { name: 'Tableau' });
    await expect(table).toHaveAttribute('aria-current', 'page');

    await userEvent.click(within(nav).getByRole('link', { name: 'Liste' }));
    await expect(within(nav).getByRole('link', { name: 'Liste' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await userEvent.keyboard('{ArrowRight}');
    await expect(table).toHaveFocus();
    await expect(table).toHaveAttribute('aria-current', 'page');
  },
};

/** Arrows move and activate, skip the disabled tab and wrap; Home and End reach the ends. */
export const Keyboard: Story = {
  render: () => ({
    props: { view: 'liste' },
    template: `<cw-tabs [(value)]="view">${VIEW_TABS}</cw-tabs>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    const list = scope.getByRole('tab', { name: 'Liste' });
    const calendar = scope.getByRole('tab', { name: 'Calendrier' });

    await userEvent.tab();
    await expect(list).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    const board = scope.getByRole('tab', { name: COUNTED_BOARD });
    await expect(board).toHaveFocus();
    await expect(board).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{End}');
    await expect(calendar).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(list).toHaveFocus();
    await expect(list).toHaveAttribute('aria-selected', 'true');
  },
};

/** `activation="manual"`: the arrows only move the focus, Enter activates. */
export const ManualActivation: Story = {
  render: () => ({
    props: { view: 'liste' },
    template: `<cw-tabs activation="manual" [(value)]="view">${VIEW_TABS}</cw-tabs>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    const list = scope.getByRole('tab', { name: 'Liste' });
    const board = scope.getByRole('tab', { name: COUNTED_BOARD });

    await userEvent.click(list);
    await userEvent.keyboard('{ArrowRight}');
    await expect(board).toHaveFocus();
    await expect(board).toHaveAttribute('aria-selected', 'false');
    await userEvent.keyboard('{Enter}');
    await expect(board).toHaveAttribute('aria-selected', 'true');
  },
};
