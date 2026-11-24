import { CwButton } from '@cadenway/ui/components/button';
import { CwInput } from '@cadenway/ui/components/input';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorPaperPlaneTiltBold, phosphorXBold } from '@ng-icons/phosphor-icons/bold';
import {
  type Meta,
  type StoryObj,
  applicationConfig,
  moduleMetadata,
} from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { CwSheetBody } from './sheet-body/sheet-body.component';
import { CwSheetClose } from './sheet-close/sheet-close.directive';
import { CwSheetDescription } from './sheet-description/sheet-description.directive';
import { CwSheetFooter } from './sheet-footer/sheet-footer.component';
import { CwSheetHeader } from './sheet-header/sheet-header.component';
import { CwSheetTitle } from './sheet-title/sheet-title.directive';
import { CwSheetTrigger } from './sheet-trigger/sheet-trigger.directive';
import { CwSheet } from './sheet.component';

/**
 * Constant meta
 *
 * @description
 * Sheet, from its sheet in the Design System artifact, in the light and the dark theme: the task
 * detail on the right, the other edges, and the keyboard path of an open sheet.
 *
 * @type {Meta}
 */
const meta: Meta = {
  title: 'UI/Sheet',
  decorators: [
    moduleMetadata({
      imports: [
        CwButton,
        CwInput,
        CwSheet,
        CwSheetBody,
        CwSheetClose,
        CwSheetDescription,
        CwSheetFooter,
        CwSheetHeader,
        CwSheetTitle,
        CwSheetTrigger,
        NgIcon,
      ],
    }),
    applicationConfig({ providers: [provideIcons({ phosphorPaperPlaneTiltBold, phosphorXBold })] }),
  ],
};

export default meta;

/**
 * Type Story
 *
 * @description
 * Storybook configuration for the sheet examples.
 *
 * @type {StoryObj}
 */
type Story = StoryObj;

/**
 * Function light
 *
 * @description
 * Finds the light theme section of the story canvas.
 *
 * @param {HTMLElement} canvasElement - Canvas containing the themed examples.
 *
 * @returns {HTMLElement} Light theme section.
 *
 * @throws {Error} When the light theme section is missing.
 */
function light(canvasElement: HTMLElement): HTMLElement {
  const scope: HTMLElement | null =
    canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

/**
 * Constant PAGE
 *
 * @description
 * Framed page under the backdrop, behind the static sheets.
 *
 * @type {string}
 */
const PAGE: string = `
  <div class="flex h-full flex-col gap-2.5 p-4" aria-hidden="true">
    <div class="h-3 w-40 rounded-full bg-secondary"></div>
    <div class="h-2 w-56 rounded-full bg-secondary"></div>
    <div class="h-2 w-48 rounded-full bg-secondary"></div>
  </div>
  <div class="absolute inset-0 bg-black/30 dark:bg-black/60" aria-hidden="true"></div>`;

/**
 * Constant DETAIL
 *
 * @description
 * The task detail of the sheet's example: identifier and title in the header, a body, the comment
 * composer in the footer.
 *
 * @type {string}
 */
const DETAIL: string = `
  <cw-sheet-header>
    <span class="font-mono text-xs text-muted-foreground">CAD-482</span>
    <h2 cwSheetTitle>Corriger l'export CSV des tâches</h2>
  </cw-sheet-header>
  <cw-sheet-body>
    <p class="text-sm text-muted-foreground">Les dates sont exportées au format américain et les accents sont perdus.</p>
  </cw-sheet-body>
  <cw-sheet-footer>
    <input cwInput aria-label="Commentaire" placeholder="Écrire un commentaire…" />
    <button cwButton size="icon" aria-label="Envoyer"><ng-icon name="phosphorPaperPlaneTiltBold" aria-hidden="true" /></button>
  </cw-sheet-footer>`;

/** Task detail (`right`, `default`, 400 px): header, scrolling body, footer, close button. */
export const TaskDetail: Story = {
  render: () => ({
    template: `
      <div class="relative isolate h-[360px] w-full max-w-2xl overflow-hidden rounded-lg border bg-background">
        ${PAGE}
        <section class="absolute inset-y-0 right-0 flex w-[400px] max-w-[calc(100%-3rem)] flex-col border-l bg-popover text-popover-foreground">
          ${DETAIL}
          <span class="absolute top-2.5 right-3 flex">
            <button cwButton variant="ghost" size="icon-sm" class="text-muted-foreground" aria-label="Fermer">
              <ng-icon name="phosphorXBold" aria-hidden="true" />
            </button>
          </span>
        </section>
      </div>`,
  }),
};

/** The other edges: `left` (`sm`, the phone navigation), `top` (a search band), `bottom` (bulk actions). */
export const Sides: Story = {
  render: () => ({
    template: `
      <div class="grid w-full max-w-2xl gap-4">
        <div class="relative isolate h-[220px] overflow-hidden rounded-lg border bg-background">
          ${PAGE}
          <section class="absolute inset-y-0 left-0 flex w-80 max-w-[calc(100%-3rem)] flex-col border-r bg-popover text-popover-foreground">
            <cw-sheet-header><h2 cwSheetTitle>Navigation</h2></cw-sheet-header>
            <cw-sheet-body><p class="text-sm">Accueil, Mes tâches, Espaces</p></cw-sheet-body>
          </section>
        </div>
        <div class="relative isolate h-[160px] overflow-hidden rounded-lg border bg-background">
          ${PAGE}
          <section class="absolute inset-x-0 top-0 flex flex-col border-b bg-popover text-popover-foreground">
            <cw-sheet-header><h2 cwSheetTitle>Rechercher</h2></cw-sheet-header>
          </section>
        </div>
        <div class="relative isolate h-[160px] overflow-hidden rounded-lg border bg-background">
          ${PAGE}
          <section class="absolute inset-x-0 bottom-0 flex flex-col border-t bg-popover text-popover-foreground">
            <cw-sheet-footer>
              <span class="text-sm">3 tâches sélectionnées</span>
              <button cwButton variant="outline" size="sm" class="ml-auto">Déplacer</button>
            </cw-sheet-footer>
          </section>
        </div>
      </div>`,
  }),
};

/** Opens from its trigger on the right, takes the focus, closes on Escape and gives it back. */
export const Keyboard: Story = {
  render: () => ({
    template: `
      <button cwButton variant="outline" [cwSheetTrigger]="detail">Ouvrir CAD-482</button>
      <cw-sheet #detail>${DETAIL}</cw-sheet>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const trigger: HTMLElement = within(light(canvasElement)).getByRole('button', {
      name: 'Ouvrir CAD-482',
    });
    await userEvent.click(trigger);
    const sheet: HTMLElement = await within(document.body).findByRole('dialog', {
      name: "Corriger l'export CSV des tâches",
    });
    await waitFor(() =>
      expect(within(sheet).getByRole('button', { name: 'Fermer' })).toHaveFocus(),
    );

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(document.body.querySelector('[role="dialog"]')).toBeNull());
    await expect(trigger).toHaveFocus();
  },
};

/** The bottom edge, opened: it rises with `animate-drawer-in`; « Fermer » closes it. */
export const Bottom: Story = {
  render: () => ({
    template: `
      <button cwButton variant="outline" [cwSheetTrigger]="bulk">Actions groupées</button>
      <cw-sheet #bulk side="bottom" [showClose]="false">
        <cw-sheet-header>
          <h2 cwSheetTitle>3 tâches sélectionnées</h2>
          <p cwSheetDescription>Dans Produit › Sprint 14</p>
        </cw-sheet-header>
        <cw-sheet-footer>
          <button cwButton variant="outline" cwSheetClose>Fermer</button>
          <button cwButton class="ml-auto" (click)="bulk.close()">Déplacer</button>
        </cw-sheet-footer>
      </cw-sheet>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    await userEvent.click(
      within(light(canvasElement)).getByRole('button', { name: 'Actions groupées' }),
    );
    const sheet: HTMLElement = await within(document.body).findByRole('dialog', {
      name: '3 tâches sélectionnées',
    });
    await userEvent.click(within(sheet).getByRole('button', { name: 'Fermer' }));
    await waitFor(() => expect(document.body.querySelector('[role="dialog"]')).toBeNull());
  },
};
