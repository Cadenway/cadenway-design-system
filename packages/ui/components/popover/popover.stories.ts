import { CwButton } from '@cadenway/ui/components/button';
import { CwInput } from '@cadenway/ui/components/input';
import { CwLabel } from '@cadenway/ui/components/label';
import { CwSwitch } from '@cadenway/ui/components/switch';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorCalendarBlankBold,
  phosphorCopyBold,
  phosphorQuestionBold,
  phosphorUsersBold,
} from '@ng-icons/phosphor-icons/bold';
import {
  type Meta,
  type StoryObj,
  applicationConfig,
  moduleMetadata,
} from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { CwPopoverClose } from './popover-close/popover-close.directive';
import { CwPopoverTrigger } from './popover-trigger/popover-trigger.directive';
import { CwPopover } from './popover.component';

/**
 * Constant meta
 *
 * @description
 * Popover, every state of its sheet in the Design System artifact, in the light and the dark theme.
 * The open states render real panels (their overlay sits next to the trigger, in its theme scope);
 * the keyboard story opens and closes one. Copy from the sheet and its preview.
 *
 * @type {Meta}
 */
const meta: Meta = {
  title: 'UI/Popover',
  decorators: [
    moduleMetadata({
      imports: [
        CwPopover,
        CwPopoverTrigger,
        CwPopoverClose,
        CwButton,
        CwInput,
        CwLabel,
        CwSwitch,
        NgIcon,
      ],
    }),
    applicationConfig({
      providers: [
        provideIcons({
          phosphorCalendarBlankBold,
          phosphorCopyBold,
          phosphorQuestionBold,
          phosphorUsersBold,
        }),
      ],
    }),
  ],
};

export default meta;

/**
 * Type Story
 *
 * @description
 * Storybook story for popover examples.
 *
 * @type {StoryObj}
 */
type Story = StoryObj;

/**
 * Function light
 *
 * @description
 * Returns the light-theme story container.
 *
 * @param {HTMLElement} canvasElement - Story canvas containing theme scopes.
 *
 * @returns {HTMLElement} Container for the light theme.
 */
function light(canvasElement: HTMLElement): HTMLElement {
  const scope: HTMLElement | null =
    canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

/** Rich content: sharing a list, `align="start"`, 320 px, no arrow. */
export const RichContent: Story = {
  render: () => ({
    template: `
      <div class="h-56">
        <button cwButton variant="outline" [cwPopoverTrigger]="share"><ng-icon name="phosphorUsersBold" />Partager</button>
        <cw-popover #share align="start" size="lg" [ariaLabelledby]="'po-share-' + cwTheme" [open]="true">
          <div class="grid gap-1">
            <p [id]="'po-share-' + cwTheme" class="text-sm font-medium">Partager « Sprint 14 »</p>
            <p class="text-sm text-pretty text-muted-foreground">Toute personne de l'instance qui a le lien peut lire la liste.</p>
          </div>
          <div class="flex gap-2">
            <input cwInput readonly value="https://cadenway.exemple.fr/l/sprint-14" aria-label="Lien de partage" />
            <button cwButton variant="outline" size="icon" aria-label="Copier le lien"><ng-icon name="phosphorCopyBold" /></button>
          </div>
          <div class="flex items-center justify-between gap-3">
            <span class="text-sm leading-none font-medium select-none">Accès public en lecture</span>
            <cw-switch ariaLabel="Accès public en lecture" />
          </div>
        </cw-popover>
      </div>`,
  }),
};

/** A form with the arrow, 224 px: an estimate, closed by « Annuler » or « Enregistrer ». */
export const FormWithArrow: Story = {
  render: () => ({
    template: `
      <div class="h-44">
        <button cwButton variant="ghost" size="sm" [cwPopoverTrigger]="estimate">5 points</button>
        <cw-popover #estimate arrow align="start" size="sm" ariaLabel="Estimation" [open]="true">
          <div class="grid gap-2">
            <label cwLabel [for]="'po-estimate-' + cwTheme">Estimation</label>
            <div class="flex items-center gap-2">
              <input cwInput class="tabular-nums" [id]="'po-estimate-' + cwTheme" value="5" />
              <span class="text-sm text-muted-foreground">points</span>
            </div>
          </div>
          <div class="flex justify-end gap-2">
            <button cwButton variant="ghost" size="sm" cwPopoverClose>Annuler</button>
            <button cwButton size="sm" cwPopoverClose>Enregistrer</button>
          </div>
        </cw-popover>
      </div>`,
  }),
};

/** Contextual help: `side="right"`, with the arrow, 288 px. */
export const Help: Story = {
  render: () => ({
    template: `
      <div class="h-28 w-[360px]">
        <button cwButton variant="ghost" size="icon-sm" aria-label="Aide : automatisations" [cwPopoverTrigger]="help">
          <ng-icon name="phosphorQuestionBold" />
        </button>
        <cw-popover #help side="right" align="start" arrow ariaLabel="Aide" [open]="true">
          <p class="text-sm text-pretty">Une automatisation s'exécute à chaque changement de statut, dans l'ordre de la liste.</p>
          <a href="#automatisations" class="w-fit rounded-sm text-sm text-primary underline-offset-4 outline-hidden hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">En savoir plus</a>
        </cw-popover>
      </div>`,
  }),
};

/** The four sides, with the arrow and `align="center"`; each flips when it lacks room. */
export const Sides: Story = {
  render: () => ({
    props: {
      sides: [
        { side: 'top', label: 'au-dessus' },
        { side: 'right', label: 'à droite' },
        { side: 'bottom', label: 'en dessous' },
        { side: 'left', label: 'à gauche' },
      ],
    },
    template: `
      <div class="grid w-full grid-cols-2 gap-x-3 gap-y-40 py-32">
        @for (item of sides; track item.side) {
          <div class="flex justify-center">
            <button cwButton variant="outline" size="sm" [cwPopoverTrigger]="panel">Échéance</button>
            <cw-popover #panel arrow size="sm" [side]="item.side" [ariaLabel]="'Échéance, ' + item.label" [open]="true">
              <p class="text-xs"><code class="font-mono">{{ item.side }}</code> · {{ item.label }}</p>
            </cw-popover>
          </div>
        }
      </div>`,
  }),
};

/** The three alignments under the trigger, without arrow. */
export const Alignments: Story = {
  render: () => ({
    props: {
      aligns: [
        { align: 'start', label: 'bord gauche aligné sur le déclencheur' },
        { align: 'center', label: 'centré sur le déclencheur' },
        { align: 'end', label: 'bord droit aligné sur le déclencheur' },
      ],
    },
    template: `
      <div class="grid w-full grid-cols-3 gap-3 pb-28">
        @for (item of aligns; track item.align) {
          <div class="flex justify-center">
            <button cwButton variant="outline" size="sm" [cwPopoverTrigger]="panel"><ng-icon name="phosphorCalendarBlankBold" />Échéance</button>
            <cw-popover #panel size="sm" [align]="item.align" [ariaLabel]="'Alignement ' + item.align" [open]="true">
              <p class="text-xs"><code class="font-mono">{{ item.align }}</code> · {{ item.label }}</p>
            </cw-popover>
          </div>
        }
      </div>`,
  }),
};

/**
 * Keyboard: Enter opens the panel and moves the focus into it; Escape closes it and gives the focus
 * back to the trigger. A click outside closes it too.
 */
export const Keyboard: Story = {
  render: () => ({
    template: `
      <div class="flex h-44 items-start gap-2">
        <button cwButton variant="outline" [cwPopoverTrigger]="share"><ng-icon name="phosphorUsersBold" />Partager</button>
        <cw-popover #share align="start" ariaLabel="Partager « Sprint 14 »">
          <input cwInput readonly value="https://cadenway.exemple.fr/l/sprint-14" aria-label="Lien de partage" />
          <div class="flex justify-end">
            <button cwButton size="sm" cwPopoverClose>Terminé</button>
          </div>
        </cw-popover>
        <button cwButton variant="ghost">Ailleurs</button>
      </div>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: {
      getByRole: (role: string, options?: { name: string }) => HTMLElement;
      findByRole: (role: string, options?: { name: string }) => Promise<HTMLElement>;
      queryByRole: (role: string) => HTMLElement | null;
    } = within(light(canvasElement));
    const trigger: HTMLElement = scope.getByRole('button', { name: 'Partager' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const panel: HTMLElement = await scope.findByRole('dialog', { name: 'Partager « Sprint 14 »' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(trigger).toHaveAttribute('aria-controls', panel.id);
    await waitFor(() => expect(within(panel).getByRole('textbox')).toHaveFocus());

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(scope.queryByRole('dialog')).toBeNull());
    await expect(trigger).toHaveFocus();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);
    await scope.findByRole('dialog');
    await userEvent.click(scope.getByRole('button', { name: 'Ailleurs' }));
    await waitFor(() => expect(scope.queryByRole('dialog')).toBeNull());
  },
};

/** Modal: the focus is trapped in the panel, the page behind is blocked by a transparent backdrop. */
export const Modal: Story = {
  render: () => ({
    template: `
      <div class="h-44">
        <button cwButton variant="outline" [cwPopoverTrigger]="rename">Renommer la colonne</button>
        <cw-popover #rename modal align="start" size="sm" ariaLabel="Renommer la colonne">
          <input cwInput value="En cours" aria-label="Nom de la colonne" />
          <div class="flex justify-end gap-2">
            <button cwButton variant="ghost" size="sm" cwPopoverClose>Annuler</button>
            <button cwButton size="sm" cwPopoverClose>Enregistrer</button>
          </div>
        </cw-popover>
      </div>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: {
      getByRole: (role: string, options?: { name: string }) => HTMLElement;
      findByRole: (role: string, options?: { name: string }) => Promise<HTMLElement>;
      queryByRole: (role: string) => HTMLElement | null;
    } = within(light(canvasElement));
    await userEvent.click(scope.getByRole('button', { name: 'Renommer la colonne' }));
    const panel: HTMLElement = await scope.findByRole('dialog', { name: 'Renommer la colonne' });
    await expect(panel).toHaveAttribute('aria-modal', 'true');
    await waitFor(() => expect(within(panel).getByRole('textbox')).toHaveFocus());

    await userEvent.click(within(panel).getByRole('button', { name: 'Annuler' }));
    await waitFor(() => expect(scope.queryByRole('dialog')).toBeNull());
  },
};
