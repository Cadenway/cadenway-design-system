import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { CwButton } from '@cadenway/ui/button';
import { CwCalendar } from '@cadenway/ui/calendar';

import { CwDatePicker } from './date-picker.component';
import type { CwDatePreset } from './date-picker.types';

/**
 * Date Picker, every state of its sheet in the Design System artifact, in the light and the dark
 * theme. The presets are the mockup's (`App.dc.html`, QUICK_DATES), computed by the consumer.
 */
const meta: Meta = {
  title: 'UI/DatePicker',
  decorators: [moduleMetadata({ imports: [CwDatePicker, CwCalendar, CwButton] })],
};

export default meta;

type Story = StoryObj;

function light(canvasElement: HTMLElement): HTMLElement {
  const scope = canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

const presets: CwDatePreset[] = [
  { label: 'Aujourd’hui', date: new Date(2026, 10, 12) },
  { label: 'Demain', date: new Date(2026, 10, 13) },
  { label: 'Vendredi', date: new Date(2026, 10, 13) },
  { label: 'Fin du sprint', date: new Date(2026, 10, 17) },
  { label: 'Sans échéance', date: null },
];

const due = new Date(2026, 10, 18);

/** Closed: empty, filled, range, disabled, error, and the typed variant. */
export const States: Story = {
  render: () => ({
    props: { due, sprint: { start: new Date(2026, 10, 16), end: new Date(2026, 10, 27) } },
    template: `
      <div class="grid w-full max-w-lg grid-cols-2 gap-x-4 gap-y-3">
        <cw-date-picker ariaLabel="Échéance" />
        <cw-date-picker ariaLabel="Échéance" [value]="due" />
        <cw-date-picker ariaLabel="Période du sprint" mode="range" [value]="sprint" />
        <cw-date-picker ariaLabel="Échéance" [value]="due" disabled />
        <div class="flex flex-col gap-1.5">
          <cw-date-picker ariaLabel="Échéance" [value]="due" invalid touched />
          <p class="text-xs font-medium text-destructive">L'échéance précède le début.</p>
        </div>
        <cw-date-picker ariaLabel="Échéance" variant="input" [value]="due" />
      </div>`,
  }),
};

/** The three trigger heights: 28 px (List cell), 32 px, 36 px. */
export const Sizes: Story = {
  render: () => ({
    props: { due, format: { day: 'numeric', month: 'short' } },
    template: `
      <div class="flex items-end gap-3">
        <cw-date-picker ariaLabel="Échéance (sm)" size="sm" [value]="due" [format]="format" />
        <cw-date-picker ariaLabel="Échéance (default)" [value]="due" [format]="format" />
        <cw-date-picker ariaLabel="Échéance (lg)" size="lg" [value]="due" [format]="format" />
      </div>`,
  }),
};

/**
 * The open panel drawn in place (the real one floats in an overlay outside the theme scopes):
 * presets, calendar, footer.
 */
export const OpenPanel: Story = {
  render: () => ({
    props: { due, november: new Date(2026, 10, 1) },
    template: `
      <div class="flex w-fit flex-col overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-md">
        <div class="flex">
          <div class="w-48 shrink-0 border-r p-1">
            <button type="button" class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent">Aujourd’hui<span class="ml-auto pl-2 text-xs text-muted-foreground">jeu. 12 nov.</span></button>
            <button type="button" class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent">Demain<span class="ml-auto pl-2 text-xs text-muted-foreground">ven. 13 nov.</span></button>
            <button type="button" class="flex w-full items-center gap-2 rounded-md bg-selected px-2 py-1.5 text-left text-sm">Fin du sprint<span class="ml-auto pl-2 text-xs text-muted-foreground">mar. 17 nov.</span></button>
            <button type="button" class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent">Sans échéance</button>
          </div>
          <cw-calendar [month]="november" [selected]="due" />
        </div>
        <div class="flex items-center justify-between gap-2 border-t p-2">
          <button cwButton variant="ghost" size="sm">Effacer</button>
          <button cwButton variant="ghost" size="sm">Ajouter une heure</button>
        </div>
      </div>`,
  }),
};

/** Click opens the panel on the picked day; Escape closes it and gives the focus back. */
export const OpenAndClose: Story = {
  render: () => ({
    props: { due, presets },
    template: `<cw-date-picker ariaLabel="Échéance" [value]="due" [presets]="presets" withTime />`,
  }),
  play: async ({ canvasElement }) => {
    const trigger = within(light(canvasElement)).getByRole('button', {
      name: 'Échéance, mer. 18 nov. 2026',
    });
    await userEvent.click(trigger);
    const panel = await within(document.body).findByRole('dialog', { name: 'Choisir une date' });
    await waitFor(() =>
      expect(within(panel).getByRole('button', { name: '18 novembre 2026' })).toHaveFocus(),
    );

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(within(document.body).queryByRole('dialog')).toBeNull());
    await expect(trigger).toHaveFocus();
  },
};

/** Arrows and Enter pick a day: the panel closes and the trigger shows the new date. */
export const KeyboardPick: Story = {
  render: () => ({
    props: { due },
    template: `<cw-date-picker ariaLabel="Échéance" [value]="due" />`,
  }),
  play: async ({ canvasElement }) => {
    const trigger = within(light(canvasElement)).getByRole('button', {
      name: 'Échéance, mer. 18 nov. 2026',
    });
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    const panel = await within(document.body).findByRole('dialog');
    await waitFor(() =>
      expect(within(panel).getByRole('button', { name: '18 novembre 2026' })).toHaveFocus(),
    );
    await userEvent.keyboard('{ArrowRight}{Enter}');
    await waitFor(() => expect(within(document.body).queryByRole('dialog')).toBeNull());
    await expect(trigger).toHaveAccessibleName('Échéance, jeu. 19 nov. 2026');
  },
};
