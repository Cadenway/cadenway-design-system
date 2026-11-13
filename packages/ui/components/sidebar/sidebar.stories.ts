import { CwAvatar } from '@cadenway/ui/components/avatar';
import { CwButton } from '@cadenway/ui/components/button';
import { CwKbd } from '@cadenway/ui/components/kbd';
import { CwProgress } from '@cadenway/ui/components/progress';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorBugBold,
  phosphorCaretUpDownBold,
  phosphorCheckSquareBold,
  phosphorDotsThreeBold,
  phosphorHouseBold,
  phosphorListBulletsBold,
  phosphorMagnifyingGlassBold,
  phosphorMegaphoneBold,
  phosphorPencilSimpleBold,
  phosphorPlusBold,
  phosphorRocketBold,
  phosphorSidebarSimpleBold,
  phosphorSquaresFourBold,
  phosphorStackBold,
  phosphorTrayBold,
} from '@ng-icons/phosphor-icons/bold';
import {
  phosphorBugFill,
  phosphorCheckSquareFill,
  phosphorHouseFill,
  phosphorListBulletsFill,
  phosphorStackFill,
  phosphorTrayFill,
} from '@ng-icons/phosphor-icons/fill';
import {
  type Meta,
  type StoryObj,
  applicationConfig,
  moduleMetadata,
} from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { CwSidebarFooter } from './sidebar-footer/sidebar-footer.component';
import { CwSidebarGroup } from './sidebar-group/sidebar-group.component';
import { CwSidebarHeader } from './sidebar-header/sidebar-header.component';
import { CwSidebarItem } from './sidebar-item/sidebar-item.component';
import { CwSidebarSpace } from './sidebar-space/sidebar-space.component';
import { CwSidebarToggle } from './sidebar-toggle/sidebar-toggle.directive';
import { CwSidebar } from './sidebar.component';
import type { CwSidebarCollapsible, CwSidebarState } from './sidebar.types';

/**
 * Sidebar, every state of its sheet in the Design System artifact, in the light and the dark theme.
 * Content and copy from the sheet's preview and the mockup (`App.dc.html`, « Navigation des
 * espaces »): the spaces, lists, counts and account are the consumer's, the brick knows none.
 */
const meta: Meta = {
  title: 'UI/Sidebar',
  decorators: [
    moduleMetadata({
      imports: [
        CwSidebar,
        CwSidebarHeader,
        CwSidebarGroup,
        CwSidebarItem,
        CwSidebarSpace,
        CwSidebarFooter,
        CwSidebarToggle,
        CwButton,
        CwKbd,
        CwAvatar,
        CwProgress,
        NgIcon,
      ],
    }),
    applicationConfig({
      providers: [
        provideIcons({
          phosphorBugBold,
          phosphorBugFill,
          phosphorCaretUpDownBold,
          phosphorCheckSquareBold,
          phosphorCheckSquareFill,
          phosphorDotsThreeBold,
          phosphorHouseBold,
          phosphorHouseFill,
          phosphorListBulletsBold,
          phosphorListBulletsFill,
          phosphorMagnifyingGlassBold,
          phosphorMegaphoneBold,
          phosphorPencilSimpleBold,
          phosphorPlusBold,
          phosphorRocketBold,
          phosphorSidebarSimpleBold,
          phosphorSquaresFourBold,
          phosphorStackBold,
          phosphorStackFill,
          phosphorTrayBold,
          phosphorTrayFill,
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

/* The consumer's controls in the header and the footer: full in the expanded sidebar, icon-only
   in the rail (the consumer owns the state). */
const HEADER = `
  <cw-sidebar-header>
    @if (sb.rail()) {
      <button cwButton variant="ghost" size="icon" aria-label="Changer d'instance : Cadenway">
        <span class="flex size-7 items-center justify-center rounded-md bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground" aria-hidden="true">C</span>
      </button>
      <button cwButton variant="ghost" size="icon" class="text-muted-foreground" aria-label="Rechercher">
        <ng-icon name="phosphorMagnifyingGlassBold" />
      </button>
    } @else {
      <div class="flex h-9 items-center gap-1">
        <button type="button" class="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1.5 py-1 text-left transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset">
          <span class="flex size-7 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground" aria-hidden="true">C</span>
          <span class="flex min-w-0 flex-col"><span class="truncate text-sm leading-4 font-semibold">Cadenway</span><span class="truncate text-xs text-muted-foreground">atelier.exemple.fr</span></span>
          <ng-icon name="phosphorCaretUpDownBold" class="ml-auto text-muted-foreground" aria-hidden="true" />
        </button>
        <button cwButton variant="ghost" size="icon-sm" cwSidebarToggle><ng-icon name="phosphorSidebarSimpleBold" /></button>
      </div>
      <button cwButton variant="outline" class="w-full justify-start font-normal text-muted-foreground">
        <ng-icon name="phosphorMagnifyingGlassBold" />Rechercher…
        <span class="ml-auto inline-flex gap-1"><kbd cwKbd>Ctrl</kbd><kbd cwKbd>K</kbd></span>
      </button>
    }
  </cw-sidebar-header>`;

const NAVIGATION = `
  <cw-sidebar-group>
    <a cwSidebarItem href="#" icon="phosphorHouseBold" (click)="$event.preventDefault()">Accueil</a>
    <a cwSidebarItem href="#" icon="phosphorTrayBold" [count]="3" countLabel="3 non lus" (click)="$event.preventDefault()">Boîte de réception</a>
    <a cwSidebarItem href="#" icon="phosphorCheckSquareBold" [count]="12" countLabel="12 ouvertes" (click)="$event.preventDefault()">Mes tâches</a>
  </cw-sidebar-group>
  <cw-sidebar-group label="Espaces">
    <button cwButton variant="ghost" size="icon-xs" cwSidebarGroupAction class="text-muted-foreground" aria-label="Créer un espace">
      <ng-icon name="phosphorPlusBold" />
    </button>
    <cw-sidebar-space name="Produit" icon="phosphorRocketBold" color="amethyste" [count]="89" [expanded]="true">
      <button cwButton variant="ghost" size="icon-xs" cwSidebarSpaceAction class="text-muted-foreground" aria-label="Modifier l'espace Produit"><ng-icon name="phosphorPencilSimpleBold" /></button>
      <button cwButton variant="ghost" size="icon-xs" cwSidebarSpaceAction class="text-muted-foreground" aria-label="Vue d'ensemble de Produit"><ng-icon name="phosphorSquaresFourBold" /></button>
      <a cwSidebarItem href="#" icon="phosphorListBulletsBold" [count]="18" active (click)="$event.preventDefault()">Sprint 14</a>
      <a cwSidebarItem href="#" icon="phosphorStackBold" [count]="64" (click)="$event.preventDefault()">Backlog</a>
      <a cwSidebarItem href="#" icon="phosphorBugBold" [count]="7" (click)="$event.preventDefault()">Bugs</a>
    </cw-sidebar-space>
    <cw-sidebar-space name="Marketing" icon="phosphorMegaphoneBold" color="cornaline" [count]="32">
      <a cwSidebarItem href="#" icon="phosphorListBulletsBold" [count]="23" (click)="$event.preventDefault()">Lancement v2</a>
      <a cwSidebarItem href="#" icon="phosphorListBulletsBold" [count]="9" (click)="$event.preventDefault()">Contenus</a>
    </cw-sidebar-space>
    <cw-sidebar-space name="Opérations" color="ardoise" [count]="5">
      <a cwSidebarItem href="#" icon="phosphorListBulletsBold" [count]="5" (click)="$event.preventDefault()">Astreinte</a>
    </cw-sidebar-space>
  </cw-sidebar-group>`;

const FOOTER = `
  <cw-sidebar-footer>
    @if (sb.rail()) {
      <button cwButton variant="ghost" size="icon" aria-haspopup="menu"><cw-avatar name="Léa Martin" size="sm" /></button>
    } @else {
      <div class="grid gap-1.5 px-1">
        <div class="flex items-center justify-between text-xs"><span class="font-medium">Sprint 14</span><span class="text-muted-foreground tabular-nums">68 %</span></div>
        <cw-progress ariaLabel="Avancement du sprint 14" variant="success" size="sm" [value]="68" />
        <div class="text-xs text-muted-foreground">Fin le 20 nov. · 6 jours</div>
      </div>
      <button type="button" aria-haspopup="menu" class="flex h-11 w-full min-w-0 items-center gap-2.5 rounded-md px-1.5 text-left text-sm transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset">
        <cw-avatar name="Léa Martin" size="sm" />
        <span class="grid min-w-0 flex-1 leading-tight"><span class="truncate font-medium">Léa Martin</span><span class="truncate text-xs text-muted-foreground">Administratrice</span></span>
        <ng-icon name="phosphorDotsThreeBold" class="ml-auto text-muted-foreground" aria-hidden="true" />
      </button>
    }
  </cw-sidebar-footer>`;

/* The sidebar next to its content, in a 528 px frame (the preview's). The landmark names differ
   per theme: the stories render every copy twice on one page. */
function frame(state: CwSidebarState, collapsible: CwSidebarCollapsible = 'icon'): string {
  return `
    <div class="relative flex h-[528px] w-full max-w-xl overflow-hidden rounded-lg border">
      <cw-sidebar #sb="cwSidebar" [state]="'${state}'" collapsible="${collapsible}"
                  [ariaLabel]="cwTheme === 'light' ? 'Navigation principale' : 'Navigation principale, thème sombre'">
        ${HEADER}
        ${NAVIGATION}
        ${FOOTER}
      </cw-sidebar>
      <div class="min-w-0 flex-1 bg-background p-5">
        <div class="mb-4 flex items-center gap-2">
          @if (sb.collapsed()) {
            <button cwButton variant="ghost" size="icon-sm" class="text-muted-foreground" [cwSidebarToggle]="sb"><ng-icon name="phosphorSidebarSimpleBold" /></button>
          }
          <span class="text-xs text-muted-foreground">Produit › Sprint 14</span>
        </div>
        <h2 class="text-2xl font-semibold tracking-tight">Sprint 14</h2>
        <p class="mt-1 text-sm text-muted-foreground">18 tâches ouvertes · fin le 20 nov.</p>
      </div>
    </div>`;
}

/** Expanded: folding spaces, the current item, counts, sprint progress, account. */
export const Expanded: Story = {
  render: () => ({ template: frame('expanded') }),
};

/** Collapsed to the icon rail: icons only, a tooltip on hover and focus, the count as a dot. */
export const Collapsed: Story = {
  render: () => ({ template: frame('collapsed') }),
  play: async ({ canvasElement }) => {
    const scope = light(canvasElement);
    const inbox = within(scope).getByRole('link', { name: 'Boîte de réception, 3 non lus' });
    const home = within(scope).getByRole('link', { name: 'Accueil' });

    home.focus();
    await userEvent.tab();
    await expect(inbox).toHaveFocus();
    await waitFor(() =>
      expect(within(scope).getByRole('tooltip')).toHaveTextContent('Boîte de réception · 3'),
    );
    await userEvent.tab();
    await waitFor(() => expect(within(scope).queryByText('Boîte de réception · 3')).toBeNull());
  },
};

/** `collapsible="offcanvas"`, collapsed: the sidebar leaves the screen, the toggle stays. */
export const Offcanvas: Story = {
  render: () => ({ template: frame('collapsed', 'offcanvas') }),
};

/** → and ← open and close a space; Ctrl B folds the sidebar to its rail and back. */
export const Keyboard: Story = {
  render: () => ({ template: frame('expanded') }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    const marketing = scope.getByRole('button', { name: /Marketing/ });

    marketing.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(marketing).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{ArrowLeft}');
    await expect(marketing).toHaveAttribute('aria-expanded', 'false');

    await userEvent.keyboard('{Control>}b{/Control}');
    await waitFor(() =>
      expect(scope.getByRole('link', { name: 'Boîte de réception, 3 non lus' })).toBeVisible(),
    );
    // The lists of the spaces leave the accessibility tree in the rail (`inert`).
    await expect(scope.queryByRole('link', { name: /Sprint 14/ })).toBeNull();

    await userEvent.keyboard('{Control>}b{/Control}');
    await waitFor(() => expect(scope.getByRole('link', { name: /Sprint 14/ })).toBeVisible());
  },
};
