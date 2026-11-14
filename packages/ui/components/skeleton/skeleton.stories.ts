import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';

import { CwSkeleton } from './skeleton.directive';

/**
 * Constant meta
 *
 * @description
 * Skeleton, every state of its sheet in the Design System artifact, in the light and the dark
 * theme. Geometries from the mockup loading states (`App.dc.html`: list, Kanban card, comments).
 *
 * @type {Meta}
 */
const meta: Meta = {
  title: 'UI/Skeleton',
  decorators: [moduleMetadata({ imports: [CwSkeleton] })],
};

export default meta;

/**
 * Type Story
 *
 * @description
 * Storybook configuration used for the skeleton examples and interactions.
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

/** The shapes: line, circle, checkbox, badge, block. */
export const Shapes: Story = {
  render: () => ({
    template: `
      <div class="flex items-end gap-6">
        <div cwSkeleton class="h-3.5 w-24"></div>
        <div cwSkeleton class="size-8 rounded-full"></div>
        <div cwSkeleton class="size-4 rounded-[4px]"></div>
        <div cwSkeleton class="h-5 w-14"></div>
        <div cwSkeleton class="h-12 w-20 rounded-lg"></div>
      </div>`,
  }),
};

/** Text lines take the visual height of the letters: `text-xs`, `sm`, `base`, `2xl`. */
export const TextHeights: Story = {
  render: () => ({
    template: `
      <div class="flex items-end gap-6">
        <div cwSkeleton class="h-3 w-20"></div>
        <div cwSkeleton class="h-3.5 w-20"></div>
        <div cwSkeleton class="h-4 w-20"></div>
        <div cwSkeleton class="h-6 w-20"></div>
      </div>`,
  }),
};

/** The three animations: `pulse` (default), `shimmer`, `none`; still under reduced motion. */
export const Animations: Story = {
  render: () => ({
    template: `
      <div class="grid w-96 grid-cols-3 gap-4">
        <div cwSkeleton class="h-14 rounded-lg"></div>
        <div cwSkeleton animation="shimmer" class="h-14 rounded-lg"></div>
        <div cwSkeleton animation="none" class="h-14 rounded-lg"></div>
      </div>`,
  }),
};

/** List view: rows of 36 px at the geometry of the columns, varied widths, `pulse`. */
export const ListRows: Story = {
  render: () => ({
    props: { widths: ['w-[62%]', 'w-[44%]', 'w-[56%]', 'w-[38%]'] },
    template: `
      <div role="status" aria-busy="true" aria-label="Chargement des tâches" class="w-[28rem] overflow-hidden rounded-lg border">
        @for (width of widths; track width) {
          <div class="flex h-9 items-center gap-3 border-b px-3 last:border-0">
            <div cwSkeleton class="size-4 rounded-[4px]"></div>
            <div cwSkeleton class="size-4 rounded-full"></div>
            <div cwSkeleton class="h-3.5" [class]="width"></div>
            <span class="flex-1"></span>
            <div cwSkeleton class="size-6 rounded-full"></div>
            <div cwSkeleton class="h-3 w-12"></div>
          </div>
        }
      </div>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const status: HTMLElement = within(light(canvasElement)).getByRole('status', {
      name: 'Chargement des tâches',
    });
    await expect(status).toHaveAttribute('aria-busy', 'true');
  },
};

/** A card of the board: identifier, name on two lines, label, assignee. */
export const Card: Story = {
  render: () => ({
    template: `
      <div role="status" aria-busy="true" aria-label="Chargement de la carte" class="flex w-64 flex-col gap-2.5 rounded-xl border bg-card p-3">
        <div cwSkeleton class="h-3 w-16"></div>
        <div cwSkeleton class="h-3.5 w-[84%]"></div>
        <div cwSkeleton class="h-3.5 w-[48%]"></div>
        <div class="flex items-center gap-2">
          <div cwSkeleton class="h-5 w-12"></div>
          <span class="flex-1"></span>
          <div cwSkeleton class="size-6 rounded-full"></div>
        </div>
      </div>`,
  }),
};

/** A comment: avatar, name, two lines. */
export const Comment: Story = {
  render: () => ({
    template: `
      <div role="status" aria-busy="true" aria-label="Chargement des commentaires" class="flex w-80 items-start gap-2.5">
        <div cwSkeleton class="size-8 shrink-0 rounded-full"></div>
        <div class="grid flex-1 gap-2 pt-1">
          <div cwSkeleton class="h-3.5 w-28"></div>
          <div cwSkeleton class="h-3.5 w-full"></div>
          <div cwSkeleton class="h-3.5 w-[70%]"></div>
        </div>
      </div>`,
  }),
};

/** A dashboard widget: one `shimmer` block at the size of the chart. */
export const DashboardWidget: Story = {
  render: () => ({
    template: `
      <div role="status" aria-busy="true" aria-label="Chargement du graphique" class="flex w-80 flex-col gap-3 rounded-xl border bg-card p-4">
        <div class="grid gap-1.5">
          <div cwSkeleton animation="shimmer" class="h-3.5 w-32"></div>
          <div cwSkeleton animation="shimmer" class="h-3 w-44"></div>
        </div>
        <div cwSkeleton animation="shimmer" class="h-[120px] w-full rounded-lg"></div>
      </div>`,
  }),
};
