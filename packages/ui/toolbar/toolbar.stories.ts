import { CwButton } from '@cadenway/ui/button';
import { CwInputGroup, CwInputGroupAddon, CwInputGroupInput } from '@cadenway/ui/input-group';
import { CwToggleGroup, CwToggleGroupItem } from '@cadenway/ui/toggle-group';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorCalendarBlankBold,
  phosphorDownloadSimpleBold,
  phosphorFunnelSimpleBold,
  phosphorKanbanBold,
  phosphorListBulletsBold,
  phosphorMagnifyingGlassBold,
  phosphorPlusBold,
  phosphorSortAscendingBold,
  phosphorSquaresFourBold,
} from '@ng-icons/phosphor-icons/bold';
import {
  type Meta,
  type StoryObj,
  applicationConfig,
  moduleMetadata,
} from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { CwToolbarGroup } from './toolbar-group/toolbar-group.component';
import { CwToolbarItem } from './toolbar-item/toolbar-item.directive';
import { CwToolbarOverflow } from './toolbar-overflow/toolbar-overflow.component';
import { CwToolbarSeparator } from './toolbar-separator/toolbar-separator.component';
import { CwToolbarSpacer } from './toolbar-spacer/toolbar-spacer.component';
import { CwToolbar } from './toolbar.component';

/**
 * Toolbar (Toolbar sheet of the Design System artifact), in the light and the dark theme: the
 * view bar of the mockup's Liste screen (`App.dc.html`, « Outils de la vue »), in both sizes, then
 * narrowed so that the movable controls go into the « Plus » menu. Copy from the mockup and the
 * sheet's preview.
 */
const meta: Meta = {
  title: 'UI/Toolbar',
  decorators: [
    moduleMetadata({
      imports: [
        CwToolbar,
        CwToolbarGroup,
        CwToolbarItem,
        CwToolbarOverflow,
        CwToolbarSeparator,
        CwToolbarSpacer,
        CwButton,
        CwInputGroup,
        CwInputGroupAddon,
        CwInputGroupInput,
        CwToggleGroup,
        CwToggleGroupItem,
        NgIcon,
      ],
    }),
    applicationConfig({
      providers: [
        provideIcons({
          phosphorCalendarBlankBold,
          phosphorDownloadSimpleBold,
          phosphorFunnelSimpleBold,
          phosphorKanbanBold,
          phosphorListBulletsBold,
          phosphorMagnifyingGlassBold,
          phosphorPlusBold,
          phosphorSortAscendingBold,
          phosphorSquaresFourBold,
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

/* The filter count is hidden from screen readers: the number is in the button's name (sheet,
   "Accessibilité"). */
const COUNT =
  'inline-flex h-4 min-w-4 items-center justify-center rounded-sm bg-secondary px-1 text-[11px] leading-none font-semibold tabular-nums text-secondary-foreground';

function bar(size: 'default' | 'sm', search: string): string {
  const button = size === 'sm' ? 'sm' : 'default';
  return `
    <cw-toolbar-group ariaLabel="Affichage">
      <button cwButton variant="outline" size="${button}" cwToolbarItem pinned aria-label="Filtrer, 2 filtres actifs">
        <ng-icon name="phosphorFunnelSimpleBold" /> Filtrer <span aria-hidden="true" class="${COUNT}">2</span>
      </button>
      <button cwButton variant="outline" size="${button}" cwToolbarItem overflowIcon="phosphorSortAscendingBold">
        <ng-icon name="phosphorSortAscendingBold" /> Trier
      </button>
      <button cwButton variant="outline" size="${button}" cwToolbarItem overflowIcon="phosphorSquaresFourBold">
        <ng-icon name="phosphorSquaresFourBold" /> Grouper
      </button>
    </cw-toolbar-group>
    <cw-toolbar-separator />
    <cw-toggle-group ariaLabel="Vue" size="${size}" [(value)]="view">
      <button cwToggleGroupItem value="liste" aria-label="Liste"><ng-icon name="phosphorListBulletsBold" /></button>
      <button cwToggleGroupItem value="tableau" aria-label="Tableau"><ng-icon name="phosphorKanbanBold" /></button>
      <button cwToggleGroupItem value="calendrier" aria-label="Calendrier"><ng-icon name="phosphorCalendarBlankBold" /></button>
    </cw-toggle-group>
    <cw-toolbar-spacer />
    <cw-input-group size="${size}" class="${search}">
      <cw-input-group-addon><ng-icon name="phosphorMagnifyingGlassBold" aria-hidden="true" /></cw-input-group-addon>
      <input cwInputGroupInput placeholder="Rechercher" aria-label="Rechercher dans la liste" />
    </cw-input-group>`;
}

const CREATE = (size: 'default' | 'sm'): string => `
  <cw-toolbar-overflow />
  <button cwButton size="${size}" cwToolbarItem pinned><ng-icon name="phosphorPlusBold" /> Créer une tâche</button>`;

/** Default size, 32 px: a group, a separator, the active view, the search and the primary action. */
export const Default: Story = {
  render: () => ({
    props: { view: 'liste' },
    template: `
      <cw-toolbar ariaLabel="Vue Liste">
        ${bar('default', 'w-56')}
        ${CREATE('default')}
      </cw-toolbar>`,
  }),
};

/** Size `sm`, 28 px for every control: the task panel and the dashboard widgets. */
export const Small: Story = {
  render: () => ({
    props: { view: 'liste' },
    template: `
      <cw-toolbar ariaLabel="Panneau de tâche" size="sm">
        ${bar('sm', 'w-44')}
        ${CREATE('sm')}
      </cw-toolbar>`,
  }),
};

/** A disabled control: 50 % opacity, skipped by the arrows. */
export const Disabled: Story = {
  render: () => ({
    template: `
      <cw-toolbar ariaLabel="Vue Tableau">
        <cw-toolbar-group ariaLabel="Affichage">
          <button cwButton variant="outline" cwToolbarItem pinned><ng-icon name="phosphorFunnelSimpleBold" /> Filtrer</button>
          <button cwButton variant="outline" cwToolbarItem><ng-icon name="phosphorSortAscendingBold" /> Trier</button>
          <button cwButton variant="outline" cwToolbarItem disabled><ng-icon name="phosphorSquaresFourBold" /> Colonnes</button>
        </cw-toolbar-group>
        <cw-toolbar-spacer />
        ${CREATE('default')}
      </cw-toolbar>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    scope.getByRole('button', { name: 'Trier' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(scope.getByRole('button', { name: 'Créer une tâche' })).toHaveFocus();
  },
};

/** Narrow width (500 px): Grouper, Exporter and the search go into « Plus » ; Filtrer and Créer une
 *  tâche are pinned. The menu opens aligned on the button's right edge. */
export const Overflow: Story = {
  render: () => ({
    props: { view: 'liste', count: 0 },
    template: `
      <cw-toolbar ariaLabel="Vue Liste, largeur réduite" class="w-[500px]" (overflowChange)="count = $event">
        <cw-toolbar-group ariaLabel="Affichage">
          <button cwButton variant="outline" cwToolbarItem pinned><ng-icon name="phosphorFunnelSimpleBold" /> Filtrer</button>
          <button cwButton variant="outline" cwToolbarItem overflowIcon="phosphorSortAscendingBold"><ng-icon name="phosphorSortAscendingBold" /> Trier</button>
          <button cwButton variant="outline" cwToolbarItem overflowIcon="phosphorSquaresFourBold"><ng-icon name="phosphorSquaresFourBold" /> Grouper</button>
        </cw-toolbar-group>
        <cw-toolbar-separator />
        <cw-toggle-group ariaLabel="Vue" [(value)]="view">
          <button cwToggleGroupItem value="liste" aria-label="Liste"><ng-icon name="phosphorListBulletsBold" /></button>
          <button cwToggleGroupItem value="tableau" aria-label="Tableau"><ng-icon name="phosphorKanbanBold" /></button>
          <button cwToggleGroupItem value="calendrier" aria-label="Calendrier"><ng-icon name="phosphorCalendarBlankBold" /></button>
        </cw-toggle-group>
        <cw-toolbar-spacer />
        <button cwButton variant="outline" cwToolbarItem overflowIcon="phosphorMagnifyingGlassBold"><ng-icon name="phosphorMagnifyingGlassBold" /> Rechercher</button>
        <button cwButton variant="outline" cwToolbarItem overflowIcon="phosphorDownloadSimpleBold" overflowLabel="Exporter en CSV"><ng-icon name="phosphorDownloadSimpleBold" /> Exporter</button>
        ${CREATE('default')}
      </cw-toolbar>
      <p class="text-xs text-muted-foreground">{{ count }} élément(s) dans « Plus »</p>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    const more = await scope.findByRole('button', { name: 'Plus d’options' });
    await waitFor(() => expect(more).toBeVisible());
    await expect(scope.getByRole('toolbar')).toHaveAttribute('data-overflowing');
    await expect(scope.getByRole('button', { name: 'Filtrer' })).toBeVisible();

    await userEvent.click(more);
    await expect(more).toHaveAttribute('aria-expanded', 'true');
    const menu = await within(document.body).findByRole('menu', { name: 'Plus d’options' });
    await expect(
      within(menu).getByRole('menuitem', { name: 'Exporter en CSV' }),
    ).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect(more).toHaveFocus();
  },
};

/** Keyboard: one Tab stop for the buttons, ← → in a loop, Home and End; the view switch keeps
 *  its own stop and its own arrows. */
export const Keyboard: Story = {
  render: () => ({
    props: { view: 'liste' },
    template: `
      <cw-toolbar ariaLabel="Vue Liste">
        <cw-toolbar-group ariaLabel="Affichage">
          <button cwButton variant="outline" cwToolbarItem pinned><ng-icon name="phosphorFunnelSimpleBold" /> Filtrer</button>
          <button cwButton variant="outline" cwToolbarItem><ng-icon name="phosphorSortAscendingBold" /> Trier</button>
        </cw-toolbar-group>
        <cw-toolbar-separator />
        <cw-toggle-group ariaLabel="Vue" [(value)]="view">
          <button cwToggleGroupItem value="liste" aria-label="Liste"><ng-icon name="phosphorListBulletsBold" /></button>
          <button cwToggleGroupItem value="tableau" aria-label="Tableau"><ng-icon name="phosphorKanbanBold" /></button>
        </cw-toggle-group>
        <cw-toolbar-spacer />
        ${CREATE('default')}
      </cw-toolbar>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    const filter = scope.getByRole('button', { name: 'Filtrer' });
    const create = scope.getByRole('button', { name: 'Créer une tâche' });
    filter.focus();

    await userEvent.keyboard('{ArrowRight}');
    await expect(scope.getByRole('button', { name: 'Trier' })).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect(create).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(filter).toHaveFocus();
    await expect(create).toHaveAttribute('tabindex', '-1');
    await expect(filter).toHaveAttribute('tabindex', '0');

    await userEvent.tab();
    await expect(scope.getByRole('radio', { name: 'Liste' })).toHaveFocus();
  },
};
