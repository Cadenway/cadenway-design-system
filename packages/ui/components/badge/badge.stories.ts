import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwBadge } from './badge.component';
import { CwPriorityBadge } from './priority-badge/priority-badge.component';
import { CwStatusBadge } from './status-badge/status-badge.component';

/**
 * Badge, every state of its sheet in the Design System artifact, in the light and the dark theme.
 * Copy from the sheet and the mockup (`App.dc.html`).
 */
const meta: Meta = {
  title: 'UI/Badge',
  decorators: [moduleMetadata({ imports: [CwBadge, CwStatusBadge, CwPriorityBadge] })],
};

export default meta;

type Story = StoryObj;

function light(canvasElement: HTMLElement): HTMLElement {
  const scope = canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

/** The six variants at the default size. */
export const Variants: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-2">
        <span cwBadge>Nouveau</span>
        <span cwBadge variant="secondary">Brouillon</span>
        <span cwBadge variant="destructive">Échec</span>
        <span cwBadge variant="outline">Front</span>
        <span cwBadge variant="ghost">Filtre</span>
        <a cwBadge variant="link" href="#liste">Voir la liste</a>
      </div>`,
  }),
};

/** `default` (22 px) and `sm` (18 px); the counter is `secondary` `sm`, its number doubled for screen readers. */
export const Sizes: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-2">
        <span cwBadge variant="outline">API</span>
        <span cwBadge variant="outline" size="sm">API</span>
      </div>
      <div class="mt-3 flex flex-wrap items-center gap-5 text-sm">
        <span class="flex items-center gap-1.5 font-medium">Commentaires
          <span cwBadge variant="secondary" size="sm" class="min-w-[18px] rounded-full tabular-nums">
            <span aria-hidden="true">12</span><span class="sr-only">commentaires</span>
          </span>
        </span>
        <span class="flex items-center gap-1.5">Tâches
          <span cwBadge variant="secondary" size="sm" class="min-w-[18px] rounded-full tabular-nums">
            <span aria-hidden="true">99+</span><span class="sr-only">plus de 99 tâches</span>
          </span>
        </span>
      </div>`,
  }),
};

/** `cw-status-badge`: the ten statuses, icon and word always together. */
export const Statuses: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-2">
        <cw-status-badge status="triage" />
        <cw-status-badge status="backlog" />
        <cw-status-badge status="todo" />
        <cw-status-badge status="progress" />
        <cw-status-badge status="review" />
        <cw-status-badge status="testing" />
        <cw-status-badge status="waiting" />
        <cw-status-badge status="blocked" />
        <cw-status-badge status="done" />
        <cw-status-badge status="cancelled" />
      </div>
      <div class="mt-3 flex flex-wrap items-center gap-2">
        <cw-status-badge status="progress" size="sm" />
        <cw-status-badge status="done" size="sm" />
      </div>`,
  }),
};

/** `cw-priority-badge`: the four priorities with their word, then the bars alone, named as an image. */
export const Priorities: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-1">
        <cw-priority-badge priority="urgente" />
        <cw-priority-badge priority="haute" />
        <cw-priority-badge priority="moyenne" />
        <cw-priority-badge priority="basse" />
      </div>
      <div class="mt-3 flex items-center gap-3">
        <span class="text-xs text-muted-foreground">Sans libellé</span>
        <cw-priority-badge priority="urgente" [showLabel]="false" />
        <cw-priority-badge priority="haute" [showLabel]="false" />
        <cw-priority-badge priority="moyenne" [showLabel]="false" />
        <cw-priority-badge priority="basse" [showLabel]="false" />
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    await expect(scope.getByRole('img', { name: 'Priorité haute' })).toBeInTheDocument();
    await expect(scope.getByText('Urgente')).toBeInTheDocument();
  },
};

/** Clickable badges: a link and a button take the hover veil and the focus ring; a disabled link leaves the tab order. */
export const Clickable: Story = {
  render: () => ({
    props: { count: 0 },
    template: `
      <div class="flex flex-wrap items-center gap-3">
        <a cwBadge variant="outline" href="#design">Design</a>
        <button cwBadge variant="ghost" (click)="count = count + 1">Filtre</button>
        <a cwBadge variant="secondary" href="#brouillon">Brouillon</a>
        <a cwBadge variant="outline" href="#archive" disabled>Archivée</a>
        <span class="text-sm text-muted-foreground" role="status">{{ count }} filtre(s)</span>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    await userEvent.tab();
    await expect(scope.getByRole('link', { name: 'Design' })).toHaveFocus();
    await userEvent.tab();
    await expect(scope.getByRole('button', { name: 'Filtre' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(scope.getByRole('status')).toHaveTextContent('1 filtre(s)');
    await expect(scope.getByRole('link', { name: 'Archivée' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  },
};
