import { CwButton } from '@cadenway/ui/button';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { CwStatusIcon } from './status-icon.component';
import { CW_STATUS_LABELS } from './status-icon.constants';
import type { CwStatusKey } from './status-icon.types';

/**
 * Status icon, every status of the mockup (`StatutTache.dc.html`), in the light and the dark theme.
 * The icon is decorative: each story writes the French word next to it.
 */
const meta: Meta = {
  title: 'UI/StatusIcon',
  decorators: [moduleMetadata({ imports: [CwStatusIcon, CwButton] })],
};

export default meta;

type Story = StoryObj;

const ORDER = Object.keys(CW_STATUS_LABELS) as CwStatusKey[];

function light(canvasElement: HTMLElement): HTMLElement {
  const scope = canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

/** The ten statuses at 16 px, each with its word. */
export const Statuses: Story = {
  render: () => ({
    props: { order: ORDER, labels: CW_STATUS_LABELS },
    template: `
      <ul class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-5">
        @for (key of order; track key) {
          <li class="flex items-center gap-2"><cw-status-icon [status]="key" />{{ labels[key] }}</li>
        }
      </ul>`,
  }),
};

/** The four sizes, from 12 px to 20 px. */
export const Sizes: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-4 text-sm">
        <span class="flex items-center gap-1.5 text-xs"><cw-status-icon status="progress" size="3" />En cours</span>
        <span class="flex items-center gap-1.5 text-xs"><cw-status-icon status="progress" size="3.5" />En cours</span>
        <span class="flex items-center gap-2"><cw-status-icon status="progress" />En cours</span>
        <span class="flex items-center gap-2 text-base"><cw-status-icon status="progress" size="5" />En cours</span>
      </div>`,
  }),
};

/** The milestone diamond: the same layers and morphs, drawn as a lozenge. */
export const Milestone: Story = {
  render: () => ({
    props: { order: ORDER, labels: CW_STATUS_LABELS },
    template: `
      <ul class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-5">
        @for (key of order; track key) {
          <li class="flex items-center gap-2"><cw-status-icon [status]="key" milestone />{{ labels[key] }}</li>
        }
      </ul>`,
  }),
};

/**
 * `from`: the icon mounts on the previous status, then morphs to the new one two frames later;
 * « Statut suivant » morphs it again.
 */
export const FromTransition: Story = {
  render: () => ({
    props: { order: ORDER, labels: CW_STATUS_LABELS, status: 'progress' as CwStatusKey },
    template: `
      <div class="flex items-center gap-4">
        <span class="flex items-center gap-2 text-base">
          <cw-status-icon from="todo" [status]="status" size="5" />{{ labels[status] }}
        </span>
        <button cwButton variant="outline" size="sm"
                (click)="status = order[(order.indexOf(status) + 1) % order.length]">
          Statut suivant
        </button>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = light(canvasElement);
    const icon = scope.querySelector('cw-status-icon');

    await waitFor(() => expect(icon).toHaveAttribute('data-status', 'progress'));
    await userEvent.click(within(scope).getByRole('button', { name: 'Statut suivant' }));
    await expect(icon).toHaveAttribute('data-status', 'review');
    await expect(within(scope).getByText('En revue')).toBeInTheDocument();
  },
};
