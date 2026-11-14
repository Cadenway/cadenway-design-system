import { CwButton } from '@cadenway/ui/components/button';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { CwPriorityIcon } from './priority-icon.component';
import { CW_PRIORITY_LABELS } from './priority-icon.constants';
import type { CwPriorityKey } from './priority-icon.types';

/**
 * Constant meta
 *
 * @description
 * Priority icon, every priority of the mockup (`PrioriteTache.dc.html`), in the light and the dark
 * theme. The icon is decorative: each story writes the French word next to it.
 *
 * @type {Meta}
 */
const meta: Meta = {
  title: 'UI/PriorityIcon',
  decorators: [moduleMetadata({ imports: [CwPriorityIcon, CwButton] })],
};

export default meta;

/**
 * Type Story
 *
 * @description
 * Storybook story configuration for priority icons.
 *
 * @type {StoryObj}
 */
type Story = StoryObj;

/**
 * Constant ORDER
 *
 * @description
 * Priority order used by the interactive transition example.
 *
 * @type {CwPriorityKey[]}
 */
const ORDER: CwPriorityKey[] = ['basse', 'moyenne', 'haute', 'urgente'];

/**
 * Function light
 *
 * @description
 * Selects the light theme copy for interaction checks.
 *
 * @param {HTMLElement} canvasElement - Story canvas containing the themed examples.
 *
 * @returns {HTMLElement} Light theme section used for interaction checks.
 */
function light(canvasElement: HTMLElement): HTMLElement {
  const scope: HTMLElement | null =
    canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

/** The four priorities at 16 px, each with its word; « Urgente » in the destructive text color. */
export const Priorities: Story = {
  render: () => ({
    template: `
      <ul class="flex flex-wrap items-center gap-6 text-sm">
        <li class="flex items-center gap-2"><cw-priority-icon priority="basse" />Basse</li>
        <li class="flex items-center gap-2"><cw-priority-icon priority="moyenne" />Moyenne</li>
        <li class="flex items-center gap-2"><cw-priority-icon priority="haute" />Haute</li>
        <li class="flex items-center gap-2 text-destructive"><cw-priority-icon priority="urgente" />Urgente</li>
      </ul>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const low: Element | null = light(canvasElement).querySelector(
      'cw-priority-icon[data-priority="basse"]',
    );
    const urgent: Element | null = light(canvasElement).querySelector(
      'cw-priority-icon[data-priority="urgente"]',
    );
    const bars: NodeListOf<SVGRectElement> | undefined = low?.querySelectorAll('.cw-prio-bar');
    const bang: SVGElement | null | undefined = urgent?.querySelector('.cw-prio-bang');
    if (bars?.length !== 3 || !bang) throw new Error('Priority icon layers missing');
    await waitFor(async () => {
      await expect(bars).toHaveLength(3);
      await expect(getComputedStyle(bars[0]).opacity).toBe('1');
      await expect(getComputedStyle(bars[1]).opacity).toBe('0.22');
      await expect(getComputedStyle(bang).strokeDashoffset).toBe('0px');
    });
  },
};

/** The four sizes, from 12 px to 20 px. */
export const Sizes: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-4 text-sm">
        <span class="flex items-center gap-1.5 text-xs"><cw-priority-icon priority="haute" size="3" />Haute</span>
        <span class="flex items-center gap-1.5 text-xs"><cw-priority-icon priority="haute" size="3.5" />Haute</span>
        <span class="flex items-center gap-2"><cw-priority-icon priority="haute" />Haute</span>
        <span class="flex items-center gap-2 text-base"><cw-priority-icon priority="haute" size="5" />Haute</span>
      </div>`,
  }),
};

/**
 * `from`: the icon mounts on the previous priority, then morphs to the new one two frames later;
 * « Priorité suivante » morphs it again.
 */
export const FromTransition: Story = {
  render: () => ({
    props: { order: ORDER, labels: CW_PRIORITY_LABELS, priority: 'haute' as CwPriorityKey },
    template: `
      <div class="flex items-center gap-4">
        <span class="flex items-center gap-2 text-base">
          <cw-priority-icon from="basse" [priority]="priority" size="5" />{{ labels[priority] }}
        </span>
        <button cwButton variant="outline" size="sm"
                (click)="priority = order[(order.indexOf(priority) + 1) % order.length]">
          Priorité suivante
        </button>
      </div>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: HTMLElement = light(canvasElement);
    const icon: Element | null = scope.querySelector('cw-priority-icon');

    await waitFor(() => expect(icon).toHaveAttribute('data-priority', 'haute'));
    await userEvent.click(within(scope).getByRole('button', { name: 'Priorité suivante' }));
    await expect(icon).toHaveAttribute('data-priority', 'urgente');
    await expect(within(scope).getByText('Urgente')).toBeInTheDocument();
  },
};
