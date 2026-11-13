import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwCalendar } from './calendar.component';
import type { CwDateDisabledFn } from './calendar.types';

/**
 * Calendar, every state of its sheet in the Design System artifact, in the light and the dark theme.
 * November 2026 as in the preview; 1 and 11 November are the instance's public holidays.
 */
const meta: Meta = {
  title: 'UI/Calendar',
  decorators: [moduleMetadata({ imports: [CwCalendar] })],
};

export default meta;

type Story = StoryObj;

function light(canvasElement: HTMLElement): HTMLElement {
  const scope = canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

const holidays: CwDateDisabledFn = (date) =>
  date.getMonth() === 10 && [1, 11].includes(date.getDate());

const november = new Date(2026, 10, 1);

/** One day, the public holidays disabled. */
export const Single: Story = {
  render: () => ({
    props: { holidays, november, due: new Date(2026, 10, 18) },
    template: `
      <div class="w-fit rounded-lg border">
        <cw-calendar [month]="november" [selected]="due" [disabledDates]="holidays" />
      </div>`,
  }),
};

/** A range: sprint 15, 16 → 27 November, the band rounded at the ends and at the end of each week. */
export const Range: Story = {
  render: () => ({
    props: {
      november,
      sprint: { start: new Date(2026, 10, 16), end: new Date(2026, 10, 27) },
    },
    template: `
      <div class="w-fit rounded-lg border">
        <cw-calendar mode="range" [month]="november" [selected]="sprint" />
      </div>`,
  }),
};

/** Month and year lists, ISO week numbers: sprint planning and distant dates. */
export const DropdownAndWeekNumbers: Story = {
  render: () => ({
    props: { november },
    template: `
      <div class="w-fit rounded-lg border">
        <cw-calendar [month]="november" captionLayout="dropdown" showWeekNumbers />
      </div>`,
  }),
};

/** Without the days of the neighbouring months, and bounded by `min` and `max`. */
export const BoundedWithoutOutsideDays: Story = {
  render: () => ({
    props: { november, min: new Date(2026, 10, 9), max: new Date(2026, 10, 25) },
    template: `
      <div class="w-fit rounded-lg border">
        <cw-calendar [month]="november" [min]="min" [max]="max" [showOutsideDays]="false" />
      </div>`,
  }),
};

/** The whole calendar disabled. */
export const Disabled: Story = {
  render: () => ({
    props: { november, due: new Date(2026, 10, 18) },
    template: `
      <div class="w-fit rounded-lg border">
        <cw-calendar [month]="november" [selected]="due" disabled />
      </div>`,
  }),
};

/** Arrows move the focus, Page Down changes month, Enter picks; the holiday is skipped. */
export const Keyboard: Story = {
  render: () => ({
    props: { holidays, november, due: new Date(2026, 10, 10) },
    template: `<cw-calendar [month]="november" [selected]="due" [disabledDates]="holidays" />`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    const tenth = scope.getByRole('button', { name: '10 novembre 2026' });
    tenth.focus();
    await expect(tenth).toHaveFocus();

    await userEvent.keyboard('{ArrowRight}');
    await expect(scope.getByRole('button', { name: '12 novembre 2026' })).toHaveFocus();

    await userEvent.keyboard('{PageDown}');
    await expect(scope.getByRole('grid', { name: 'décembre 2026' })).toBeInTheDocument();
    const twelfth = scope.getByRole('button', { name: '12 décembre 2026' });
    await expect(twelfth).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await expect(twelfth.closest('td')).toHaveAttribute('aria-selected', 'true');
  },
};
