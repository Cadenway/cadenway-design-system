import { CwButton } from '@cadenway/ui/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorBellBold,
  phosphorLinkBold,
  phosphorMagnifyingGlassBold,
  phosphorPlusBold,
  phosphorStarBold,
  phosphorTrashBold,
} from '@ng-icons/phosphor-icons/bold';
import {
  type Meta,
  type StoryObj,
  applicationConfig,
  moduleMetadata,
} from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { CwTooltipPanel } from './tooltip-panel/tooltip-panel.component';
import { CwTooltip } from './tooltip.directive';

/**
 * Tooltip, every state of its sheet in the Design System artifact, in the light and the dark theme.
 * The visual states render the bubble statically next to its trigger (the preview's layout); the
 * behavior stories open real bubbles by hover and keyboard. Copy from the sheet and the mockup
 * (`App.dc.html`).
 */
const meta: Meta = {
  title: 'UI/Tooltip',
  decorators: [
    moduleMetadata({ imports: [CwTooltip, CwTooltipPanel, CwButton, NgIcon] }),
    applicationConfig({
      providers: [
        provideIcons({
          phosphorBellBold,
          phosphorLinkBold,
          phosphorMagnifyingGlassBold,
          phosphorPlusBold,
          phosphorStarBold,
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

/* The static bubble sits above, beside or below its trigger, as in the preview; these are layout
   classes on the host, the bubble's look stays the brick's. */
const ABOVE = 'absolute bottom-full left-1/2 mb-2 -translate-x-1/2';

/** The four sides, with the arrow: flipped automatically when the side lacks room. */
export const Sides: Story = {
  render: () => ({
    props: {
      sides: [
        { side: 'top', box: 'items-end pb-4', at: ABOVE },
        {
          side: 'right',
          box: 'items-center justify-start pl-6',
          at: 'absolute left-full top-1/2 ml-2 -translate-y-1/2',
        },
        {
          side: 'bottom',
          box: 'items-start pt-4',
          at: 'absolute top-full left-1/2 mt-2 -translate-x-1/2',
        },
        {
          side: 'left',
          box: 'items-center justify-end pr-6',
          at: 'absolute right-full top-1/2 mr-2 -translate-y-1/2',
        },
      ],
    },
    template: `
      <div class="grid w-full grid-cols-2 gap-3 md:grid-cols-4">
        @for (item of sides; track item.side) {
          <div class="relative flex h-[100px] justify-center rounded-lg border border-dashed" [class]="item.box">
            <div class="relative">
              <button cwButton variant="outline" size="icon" aria-label="Copier le lien"
                      [attr.aria-describedby]="'tt-side-' + item.side + '-' + cwTheme">
                <ng-icon name="phosphorLinkBold" />
              </button>
              <cw-tooltip-panel [id]="'tt-side-' + item.side + '-' + cwTheme" [content]="'Copier le lien · ' + item.side"
                                [side]="item.side" [class]="item.at" />
            </div>
          </div>
        }
      </div>`,
  }),
};

/** Text only without arrow, with a shortcut, with a combined shortcut, and on two lines. */
export const Content: Story = {
  render: () => ({
    props: { above: ABOVE },
    template: `
      <div class="grid w-full grid-cols-2 gap-3 md:grid-cols-4">
        <div class="relative flex h-[100px] items-end justify-center rounded-lg border border-dashed pb-5">
          <div class="relative">
            <button cwButton variant="ghost" size="icon" aria-label="Ajouter aux favoris" [attr.aria-describedby]="'tt-c1-' + cwTheme">
              <ng-icon name="phosphorStarBold" />
            </button>
            <cw-tooltip-panel [id]="'tt-c1-' + cwTheme" content="Ajouter aux favoris" [arrow]="false" [class]="above" />
          </div>
        </div>
        <div class="relative flex h-[100px] items-end justify-center rounded-lg border border-dashed pb-5">
          <div class="relative">
            <button cwButton variant="ghost" size="icon" aria-label="Créer une tâche" [attr.aria-describedby]="'tt-c2-' + cwTheme">
              <ng-icon name="phosphorPlusBold" />
            </button>
            <cw-tooltip-panel [id]="'tt-c2-' + cwTheme" content="Créer une tâche" [shortcut]="['C']" [class]="above" />
          </div>
        </div>
        <div class="relative flex h-[100px] items-end justify-center rounded-lg border border-dashed pb-5">
          <div class="relative">
            <button cwButton variant="ghost" size="icon" aria-label="Rechercher" [attr.aria-describedby]="'tt-c3-' + cwTheme">
              <ng-icon name="phosphorMagnifyingGlassBold" />
            </button>
            <cw-tooltip-panel [id]="'tt-c3-' + cwTheme" content="Rechercher" [shortcut]="['Ctrl', 'K']" [class]="above" />
          </div>
        </div>
        <div class="relative flex h-[100px] items-end justify-center rounded-lg border border-dashed pb-6">
          <div class="relative">
            <span tabindex="0" class="rounded-sm text-xs font-medium text-primary" [attr.aria-describedby]="'tt-c4-' + cwTheme">Aujourd'hui</span>
            <cw-tooltip-panel [id]="'tt-c4-' + cwTheme" content="Jeudi 12 novembre 2026, 18:00 — dans 6 heures" [class]="above" />
          </div>
        </div>
      </div>`,
  }),
};

/** A truncated name in full, and a disabled button wrapped in a focusable `span` explaining why. */
export const TruncatedAndDisabled: Story = {
  render: () => ({
    props: { above: ABOVE },
    template: `
      <div class="grid w-full grid-cols-2 gap-3">
        <div class="relative flex h-[110px] items-end justify-center rounded-lg border border-dashed pb-4">
          <div class="relative w-44 rounded-lg border bg-card p-2.5 text-sm">
            <div tabindex="0" class="truncate font-medium" [attr.aria-describedby]="'tt-d2-' + cwTheme">Migrer les pièces jointes vers un stockage compatible S3</div>
            <cw-tooltip-panel [id]="'tt-d2-' + cwTheme" content="Migrer les pièces jointes vers un stockage compatible S3" [class]="above" />
          </div>
        </div>
        <div class="relative flex h-[110px] items-end justify-center rounded-lg border border-dashed pb-5">
          <span tabindex="0" class="relative inline-flex rounded-lg outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                [attr.aria-describedby]="'tt-d3-' + cwTheme">
            <button cwButton variant="outline" size="sm" disabled><ng-icon name="phosphorTrashBold" />Supprimer</button>
            <cw-tooltip-panel [id]="'tt-d3-' + cwTheme" content="Réservé aux administrateurs" [class]="above" />
          </span>
        </div>
      </div>`,
  }),
};

/** Hover: the bubble opens after 700 ms and describes its trigger; it closes when the pointer leaves. */
export const Hover: Story = {
  render: () => ({
    template: `
      <div class="flex h-20 items-end gap-1">
        <button cwButton variant="ghost" size="icon" aria-label="Créer une tâche" cwTooltip="Créer une tâche" [cwTooltipShortcut]="['C']">
          <ng-icon name="phosphorPlusBold" />
        </button>
        <button cwButton variant="ghost" size="icon" aria-label="Notifications" cwTooltip="Notifications">
          <ng-icon name="phosphorBellBold" />
        </button>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    const create = scope.getByRole('button', { name: 'Créer une tâche' });

    await userEvent.hover(create);
    const bubble = await scope.findByRole('tooltip', {}, { timeout: 2000 });
    await expect(bubble).toHaveTextContent('Créer une tâche');
    await expect(create).toHaveAttribute('aria-describedby', bubble.id);

    // Within the skip delay, the neighbour opens at once.
    await userEvent.hover(scope.getByRole('button', { name: 'Notifications' }));
    await waitFor(() => expect(scope.getByRole('tooltip')).toHaveTextContent('Notifications'), {
      timeout: 300,
    });

    await userEvent.unhover(scope.getByRole('button', { name: 'Notifications' }));
    await waitFor(() => expect(scope.queryByRole('tooltip')).toBeNull());
  },
};

/** Keyboard: Tab opens the bubble at once; Escape closes it and the focus stays on the trigger. */
export const Keyboard: Story = {
  render: () => ({
    template: `
      <div class="flex h-20 items-end">
        <button cwButton variant="outline" size="icon" aria-label="Copier le lien" cwTooltip="Copier le lien">
          <ng-icon name="phosphorLinkBold" />
        </button>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    const copy = scope.getByRole('button', { name: 'Copier le lien' });

    await userEvent.tab();
    await expect(copy).toHaveFocus();
    const bubble = await scope.findByRole('tooltip');
    await expect(bubble).toHaveAttribute('data-state', 'instant-open');

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(scope.queryByRole('tooltip')).toBeNull());
    await expect(copy).toHaveFocus();
  },
};

/** At rest: nothing is shown, and a disabled tooltip never opens. */
export const Closed: Story = {
  render: () => ({
    template: `
      <div class="flex items-center gap-2">
        <button cwButton variant="ghost" size="icon" aria-label="Notifications" cwTooltip="Notifications">
          <ng-icon name="phosphorBellBold" />
        </button>
        <button cwButton variant="outline" cwTooltip="Copier le lien" cwTooltipDisabled>Copier le lien</button>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    await userEvent.tab();
    await userEvent.tab();
    await expect(scope.getByRole('button', { name: 'Copier le lien' })).toHaveFocus();
    await waitFor(() => expect(scope.queryByRole('tooltip')).toBeNull());
  },
};
