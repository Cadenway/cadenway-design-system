import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';

import { CwStatGroup } from './stat-group/stat-group.component';
import { CwStatSparkline } from './stat-sparkline/stat-sparkline.component';
import { CwStat } from './stat.component';

/**
 * Stat, every state of its sheet in the Design System artifact; each story renders in the light and
 * the dark theme (`.storybook/preview.ts`). Copy from the sheet preview and the mockup dashboard
 * (`App.dc.html`).
 */
const meta: Meta = {
  title: 'UI/Stat',
  decorators: [moduleMetadata({ imports: [CwStat, CwStatGroup, CwStatSparkline] })],
};

export default meta;

type Story = StoryObj;

function light(canvasElement: HTMLElement): HTMLElement {
  const scope = canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

/** A dashboard row: the color follows the meaning for the team, not the sign. */
export const Group: Story = {
  render: () => ({
    template: `
      <cw-stat-group ariaLabel="Semaine 46" class="w-full">
        <cw-stat label="Terminées cette semaine" value="21" delta="+7" trend="up" sentiment="positive" comparison="par rapport à S45" />
        <cw-stat label="En retard" value="3" delta="+1" trend="up" sentiment="negative" comparison="depuis hier" />
        <cw-stat label="Temps de cycle" value="3,2 j" delta="−0,8 j" trend="down" sentiment="positive" comparison="par rapport à S45" />
        <cw-stat label="Tâches ouvertes" value="18" delta="Stable" comparison="depuis lundi" />
      </cw-stat-group>`,
  }),
  play: async ({ canvasElement }) => {
    const group = within(light(canvasElement)).getByRole('group', { name: 'Semaine 46' });
    await expect(group).toHaveTextContent('en hausse : +7');
    await expect(group).toHaveTextContent('en baisse : −0,8 j');
  },
};

/** A single card with a line sparkline (7-day trend). */
export const WithLine: Story = {
  render: () => ({
    template: `
      <cw-stat class="w-64" label="Tâches créées" value="42" delta="+12 %" trend="up" comparison="sur 7 jours">
        <cw-stat-sparkline [data]="[8, 11, 9, 16, 14, 20, 22]" />
      </cw-stat>`,
  }),
};

/** A single card with bars (volume per day), the last one stressed. */
export const WithBars: Story = {
  render: () => ({
    template: `
      <cw-stat class="w-64" label="Terminées par jour" value="9" delta="+3" trend="up" sentiment="positive" comparison="aujourd'hui">
        <cw-stat-sparkline type="bar" [data]="[4, 6, 3, 7, 5, 6, 9]" />
      </cw-stat>`,
  }),
};

/** With a goal: a `track` and `jade` progress bar, « 34 sur 50 engagés · 68 % ». */
export const WithGoal: Story = {
  render: () => ({
    template: `<cw-stat class="w-64" label="Points livrés" value="34" [goal]="{ value: 34, max: 50, unit: 'engagés' }" />`,
  }),
  play: async ({ canvasElement }) => {
    const bar = within(light(canvasElement)).getByRole('progressbar', { name: 'Points livrés' });
    await expect(bar).toHaveAttribute('aria-valuenow', '34');
  },
};

/** Period comparison: the change as a tinted pill. */
export const PeriodComparison: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap gap-4">
        <cw-stat class="w-64" label="Terminées — Sprint 14" value="21" delta="+50 %" trend="up" sentiment="positive" deltaVariant="pill" comparison="contre 14 au Sprint 13" />
        <cw-stat class="w-64" label="En retard — Sprint 14" value="5" delta="+25 %" trend="up" sentiment="negative" deltaVariant="pill" comparison="contre 4 au Sprint 13" />
      </div>`,
  }),
};

/** First load: shimmer blocks, the real label, `aria-busy`. */
export const Loading: Story = {
  render: () => ({
    template: `<cw-stat class="w-64" label="En retard" value="3" loading />`,
  }),
  play: async ({ canvasElement }) => {
    const scope = light(canvasElement);
    await expect(scope.querySelector('cw-stat')).toHaveAttribute('aria-busy', 'true');
  },
};

/** Refresh: the old value stays, a spinner follows the label. */
export const Refreshing: Story = {
  render: () => ({
    template: `<cw-stat class="w-64" label="Tâches ouvertes" value="18" delta="Stable" comparison="depuis lundi" refreshing />`,
  }),
  play: async ({ canvasElement }) => {
    await expect(
      within(light(canvasElement)).getByRole('status', { name: 'Actualisation' }),
    ).toBeVisible();
  },
};

/** Size `sm` in a group, with and without a change (members have no history). */
export const Small: Story = {
  render: () => ({
    template: `
      <cw-stat-group ariaLabel="Sprint 14" class="w-full">
        <cw-stat size="sm" label="Ouvertes" value="18" delta="Stable" />
        <cw-stat size="sm" label="Terminées" value="12" delta="+3" trend="up" sentiment="positive" />
        <cw-stat size="sm" label="En retard" value="2" delta="−1" trend="down" sentiment="positive" />
        <cw-stat size="sm" label="Membres" value="4" />
      </cw-stat-group>`,
  }),
};
