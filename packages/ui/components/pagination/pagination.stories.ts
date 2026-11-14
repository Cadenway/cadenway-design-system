import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCaretLeftBold, phosphorCaretRightBold } from '@ng-icons/phosphor-icons/bold';
import {
  type Meta,
  type StoryObj,
  applicationConfig,
  moduleMetadata,
} from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { CwPaginationEllipsis } from './pagination-ellipsis/pagination-ellipsis.component';
import { CwPaginationLink } from './pagination-link/pagination-link.component';
import { CwPagination } from './pagination.component';

/**
 * Constant meta
 *
 * @description
 * Pagination, every state of its sheet in the Design System artifact, in the light and the dark
 * theme. Each navigation is named after its theme: two navigations of a page never share a name.
 * Copy from the sheet and the mockup (`Organisation.dc.html`, members).
 *
 * @type {Meta}
 */
const meta: Meta = {
  title: 'UI/Pagination',
  decorators: [
    moduleMetadata({ imports: [CwPagination, CwPaginationLink, CwPaginationEllipsis, NgIcon] }),
    applicationConfig({
      providers: [provideIcons({ phosphorCaretLeftBold, phosphorCaretRightBold })],
    }),
  ],
};

export default meta;

/**
 * Type Story
 *
 * @description
 * Storybook story configuration for pagination examples.
 *
 * @type {StoryObj}
 */
type Story = StoryObj;

/**
 * Function light
 *
 * @description
 * Selects the light theme copy for interaction checks.
 *
 * @param {HTMLElement} canvasElement - Story canvas containing both theme copies.
 * @returns {HTMLElement} Light theme section.
 */
function light(canvasElement: HTMLElement): HTMLElement {
  const scope: HTMLElement | null =
    canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

/** First and last, previous and next, numbers with ellipses: page 6 of 12 (audit log). */
export const Full: Story = {
  render: () => ({
    props: { page: 6 },
    template: `
      <cw-pagination ariaLabel="Pagination {{ cwTheme }}" [total]="300" [pageSizes]="[]"
                     [(page)]="page" />`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const nav: HTMLElement = within(light(canvasElement)).getByRole('navigation', {
      name: 'Pagination light',
    });
    await expect(within(nav).getByRole('button', { name: 'Page 6' })).toHaveAttribute(
      'aria-current',
      'page',
    );

    await userEvent.click(within(nav).getByRole('button', { name: 'Page 7' }));
    await expect(within(nav).getByRole('button', { name: 'Page 7' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await userEvent.click(within(nav).getByRole('button', { name: 'Dernière page' }));
    await expect(within(nav).getByRole('button', { name: 'Suivant' })).toBeDisabled();
    await expect(within(nav).getByRole('button', { name: 'Page 12' })).toHaveFocus();
  },
};

/** The range on the left and the page size select, next to the numbered pages. */
export const WithRangeAndPageSize: Story = {
  render: () => ({
    props: { page: 3, pageSize: 25 },
    template: `
      <div class="w-full max-w-[720px] border-t pt-3"><cw-pagination ariaLabel="Pagination {{ cwTheme }}"
                     [total]="286" showRange [(page)]="page" [(pageSize)]="pageSize" /></div>`,
  }),
};

/** The table bar of the sheet: range, page size, « Page 3 sur 12 » and icon buttons. */
export const TableBar: Story = {
  render: () => ({
    props: { page: 3, pageSize: 25 },
    template: `
      <div class="w-full max-w-[720px] border-t pt-3"><cw-pagination ariaLabel="Pagination {{ cwTheme }}"
                     variant="simple" [total]="286" showRange [(page)]="page" [(pageSize)]="pageSize" /></div>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: {
      getByText(text: string): HTMLElement;
      getByRole(role: string, options?: { name?: string }): HTMLElement;
    } = within(light(canvasElement));
    await expect(scope.getByText('51–75 sur 286')).toBeVisible();
    await expect(scope.getByText('Page 3 sur 12')).toBeVisible();

    await userEvent.click(scope.getByRole('combobox', { name: 'Lignes par page' }));
    const listbox: HTMLElement = await within(document.body).findByRole('listbox');
    await userEvent.click(within(listbox).getByRole('option', { name: '50' }));
    await expect(scope.getByText('1–50 sur 286')).toBeVisible();
    await expect(scope.getByText('Page 1 sur 6')).toBeVisible();

    const triggers: HTMLElement[] = Array.from(
      canvasElement.querySelectorAll<HTMLElement>('cw-select button[role="combobox"]'),
    );
    await waitFor(async () => {
      await expect(triggers).toHaveLength(2);
      for (const trigger of triggers) await expect(trigger).toHaveTextContent('50');
    });
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resolve();
        });
      });
    });
    await Promise.allSettled(
      triggers.flatMap((trigger) =>
        trigger.getAnimations({ subtree: true }).map((animation) => animation.finished),
      ),
    );
    await waitFor(async () => {
      for (const trigger of triggers) {
        const label: HTMLSpanElement | null =
          trigger.querySelector<HTMLSpanElement>(':scope > span');
        await expect(label).not.toBeNull();
        if (!label) throw new Error('Select label missing');
        await expect(getComputedStyle(label).opacity).toBe('1');
      }
    });
  },
};

/** « Précédent », « Page 3 sur 12 », « Suivant », for the search and on mobile. */
export const Simple: Story = {
  render: () => ({
    props: { page: 3 },
    template: `
      <cw-pagination ariaLabel="Pagination {{ cwTheme }}" variant="simple" [total]="300"
                     [pageSizes]="[]" [(page)]="page" />`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const nav: HTMLElement = within(light(canvasElement)).getByRole('navigation', {
      name: 'Pagination light',
    });
    await userEvent.tab();
    await expect(within(nav).getByRole('button', { name: 'Précédent' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(nav).toHaveTextContent('Page 2 sur 12');
  },
};

/** `sm`, 28 px, for panels, cards and sheets. */
export const Small: Story = {
  render: () => ({
    props: { page: 2 },
    template: `
      <cw-pagination ariaLabel="Pagination {{ cwTheme }}" size="sm" [total]="225" [pageSizes]="[]"
                     [(page)]="page" />`,
  }),
};

/** The first page (previous disabled) and the last page (next and last disabled). */
export const Bounds: Story = {
  render: () => ({
    template: `
      <cw-pagination ariaLabel="Première page {{ cwTheme }}" [total]="50" [pageSizes]="[]" [page]="1" />
      <cw-pagination ariaLabel="Dernière page {{ cwTheme }}" [total]="300" [pageSizes]="[]" [page]="12" />`,
  }),
};

/** Routed pagination built by hand from the parts: links with the page in the query. */
export const Links: Story = {
  render: () => ({
    template: `
      <nav aria-label="Pages {{ cwTheme }}">
        <ul class="flex items-center gap-1">
          <li><a cwPaginationLink href="#" aria-label="Page précédente" disabled><ng-icon name="phosphorCaretLeftBold" aria-hidden="true" /></a></li>
          <li><a cwPaginationLink href="#" aria-label="Page 1" current>1</a></li>
          <li><a cwPaginationLink href="#" aria-label="Page 2">2</a></li>
          <li><cw-pagination-ellipsis /></li>
          <li><a cwPaginationLink href="#" aria-label="Page 9">9</a></li>
          <li><a cwPaginationLink href="#" aria-label="Page suivante"><ng-icon name="phosphorCaretRightBold" aria-hidden="true" /></a></li>
        </ul>
      </nav>`,
  }),
};
