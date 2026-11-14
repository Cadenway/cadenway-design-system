import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';

import { CwLogo } from './logo.component';

/**
 * Constant meta
 *
 * @description
 * Logo, the mark of its sheet in the Design System artifact, in the light and the dark theme. The
 * horizontal and stacked lockups come once their logotype is redrawn.
 *
 * @type {Meta}
 */
const meta: Meta = {
  title: 'UI/Logo',
  decorators: [moduleMetadata({ imports: [CwLogo] })],
};

export default meta;

/**
 * Type Story
 *
 * @description
 * Storybook configuration used for logo examples and interactions.
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

/** Sizes: the small drawing up to 24 px (12, 16, 20, 24), the large one from 32 px (32, 48, 96). */
export const Sizes: Story = {
  render: () => ({
    template: `
      <div class="flex items-end gap-4">
        <cw-logo [size]="12" /><cw-logo [size]="16" /><cw-logo [size]="20" /><cw-logo [size]="24" />
        <cw-logo [size]="32" /><cw-logo [size]="48" /><cw-logo [size]="96" />
      </div>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    await expect(
      within(light(canvasElement)).getAllByRole('img', { name: 'Cadenway' }),
    ).toHaveLength(7);
  },
};

/** Tones: `auto` in the brand violet, `mono` in the ink color. */
export const Tones: Story = {
  render: () => ({
    template: `
      <div class="flex items-center gap-4">
        <cw-logo [size]="48" />
        <cw-logo [size]="48" tone="mono" />
      </div>`,
  }),
};

/** In the sidebar header: the small mark at 20 px, decorative next to the instance name. */
export const InSidebar: Story = {
  render: () => ({
    template: `
      <a href="#accueil" class="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold hover:bg-accent">
        <cw-logo [size]="20" decorative />
        Atelier Nord
      </a>`,
  }),
};
