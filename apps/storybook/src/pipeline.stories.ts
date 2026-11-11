import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect } from 'storybook/test';

/**
 * Not a brick: the one story that proves the Storybook pipeline end to end while the design system
 * has no brick yet. It renders plain markup through Angular, styled with Tailwind utilities only
 * (no token exists yet), and its `play` function runs as a browser test with the accessibility
 * checks. Delete it once a brick story covers the same ground.
 */
const meta: Meta = {
  title: 'Tooling/Pipeline check',
  render: () => ({
    template: `
      <h1 class="inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium">
        Storybook renders Angular templates with Tailwind utilities
      </h1>
    `,
  }),
};

export default meta;

type Story = StoryObj;

/** The heading is laid out by `inline-flex`, which only holds if Tailwind generated the utility. */
export const TailwindUtilities: Story = {
  play: async ({ canvas }) => {
    const heading = canvas.getByRole('heading', {
      name: 'Storybook renders Angular templates with Tailwind utilities',
    });

    await expect(heading).toHaveStyle({ display: 'inline-flex' });
  },
};
