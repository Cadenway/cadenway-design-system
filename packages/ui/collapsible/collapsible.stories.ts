import { CwButton } from '@cadenway/ui/button';
import { CwStatusIcon } from '@cadenway/ui/status-icon';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwCollapsibleChevron } from './collapsible-chevron/collapsible-chevron.component';
import { CwCollapsibleContent } from './collapsible-content/collapsible-content.component';
import { CwCollapsibleTrigger } from './collapsible-trigger/collapsible-trigger.directive';
import { CwCollapsible } from './collapsible.component';

/**
 * Collapsible, every variant and state of its sheet in the Design System artifact, in the light and
 * the dark theme. Copy from the sheet's preview and the mockup (`App.dc.html`, task detail).
 */
const meta: Meta = {
  title: 'UI/Collapsible',
  decorators: [
    moduleMetadata({
      imports: [
        CwCollapsible,
        CwCollapsibleTrigger,
        CwCollapsibleContent,
        CwCollapsibleChevron,
        CwButton,
        CwStatusIcon,
      ],
    }),
  ],
};

export default meta;

type Story = StoryObj;

function light(canvasElement: HTMLElement): HTMLElement {
  const scope = canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

const SUBTASKS = `
  <ul class="flex flex-col pt-1">
    <li class="flex h-8 items-center gap-2 px-2 text-sm">
      <cw-status-icon status="done" />
      <span class="truncate text-muted-foreground line-through decoration-line-control">Reproduire avec Excel 365</span>
    </li>
    <li class="flex h-8 items-center gap-2 px-2 text-sm">
      <cw-status-icon status="done" />
      <span class="truncate text-muted-foreground line-through decoration-line-control">Identifier l'encodage</span>
    </li>
    <li class="flex h-8 items-center gap-2 px-2 text-sm">
      <cw-status-icon status="progress" /><span class="truncate">Ajouter le BOM UTF-8</span>
    </li>
    <li class="flex h-8 items-center gap-2 px-2 text-sm">
      <cw-status-icon status="todo" /><span class="truncate">Tester LibreOffice</span>
    </li>
    <li class="flex h-8 items-center gap-2 px-2 text-sm">
      <cw-status-icon status="todo" /><span class="truncate">Mettre à jour la doc</span>
    </li>
  </ul>`;

/** Block header with an icon button: the subtasks of a task, open. */
export const HeaderWithIconButton: Story = {
  render: () => ({
    template: `
      <cw-collapsible #block="cwCollapsible" class="w-80" [expanded]="true">
        <div class="flex items-center justify-between gap-4 pl-2">
          <h4 class="text-sm font-semibold">Sous-tâches <span class="font-normal text-muted-foreground tabular-nums">2 / 5</span></h4>
          <button cwButton variant="ghost" size="icon-sm" cwCollapsibleTrigger
                  [attr.aria-label]="block.expanded() ? 'Replier les sous-tâches' : 'Déplier les sous-tâches'">
            <cw-collapsible-chevron />
          </button>
        </div>
        <cw-collapsible-content>${SUBTASKS}</cw-collapsible-content>
      </cw-collapsible>`,
  }),
};

/** Group rows of the List view: open, closed, disabled (an empty group). */
export const GroupRows: Story = {
  render: () => ({
    template: `
      <div class="flex w-96 flex-col">
        <cw-collapsible class="border-b" [expanded]="true">
          <button cwCollapsibleTrigger variant="row">
            <cw-collapsible-chevron direction="right" /><cw-status-icon status="progress" />En cours
            <span class="text-xs font-normal tabular-nums text-muted-foreground">2</span>
          </button>
          <cw-collapsible-content>
            <ul class="pb-1 pl-6">
              <li class="flex h-8 items-center gap-2 text-sm"><span class="shrink-0 font-mono text-xs text-muted-foreground">CAD-482</span><span class="truncate">Corriger l'export CSV des tâches</span></li>
              <li class="flex h-8 items-center gap-2 text-sm"><span class="shrink-0 font-mono text-xs text-muted-foreground">CAD-479</span><span class="truncate">Maquetter la vue Calendrier</span></li>
            </ul>
          </cw-collapsible-content>
        </cw-collapsible>
        <cw-collapsible class="border-b">
          <button cwCollapsibleTrigger variant="row">
            <cw-collapsible-chevron direction="right" /><cw-status-icon status="done" />Terminé
            <span class="text-xs font-normal tabular-nums text-muted-foreground">4</span>
          </button>
          <cw-collapsible-content>
            <ul class="pb-1 pl-6">
              <li class="flex h-8 items-center gap-2 text-sm"><span class="shrink-0 font-mono text-xs text-muted-foreground">CAD-466</span><span class="truncate">Rédiger la doc d'installation Docker</span></li>
            </ul>
          </cw-collapsible-content>
        </cw-collapsible>
        <cw-collapsible disabled>
          <button cwCollapsibleTrigger variant="row">
            <cw-collapsible-chevron direction="right" /><cw-status-icon status="blocked" />Bloqué
            <span class="text-xs font-normal tabular-nums text-muted-foreground">0</span>
          </button>
          <cw-collapsible-content />
        </cw-collapsible>
      </div>`,
  }),
};

/** « Afficher plus »: the first elements stay visible, the button's label follows the state. */
export const ShowMore: Story = {
  render: () => ({
    template: `
      <cw-collapsible #more="cwCollapsible" class="w-80">
        <ul class="flex flex-col">
          <li class="flex h-8 items-center gap-2 px-2 text-sm"><cw-status-icon status="done" /><span class="truncate text-muted-foreground line-through decoration-line-control">Reproduire avec Excel 365</span></li>
          <li class="flex h-8 items-center gap-2 px-2 text-sm"><cw-status-icon status="done" /><span class="truncate text-muted-foreground line-through decoration-line-control">Identifier l'encodage</span></li>
          <li class="flex h-8 items-center gap-2 px-2 text-sm"><cw-status-icon status="progress" /><span class="truncate">Ajouter le BOM UTF-8</span></li>
        </ul>
        <cw-collapsible-content>
          <ul class="flex flex-col">
            <li class="flex h-8 items-center gap-2 px-2 text-sm"><cw-status-icon status="todo" /><span class="truncate">Tester LibreOffice</span></li>
            <li class="flex h-8 items-center gap-2 px-2 text-sm"><cw-status-icon status="todo" /><span class="truncate">Mettre à jour la doc</span></li>
          </ul>
        </cw-collapsible-content>
        <div class="pt-1">
          <button cwButton variant="ghost" size="sm" cwCollapsibleTrigger>
            {{ more.expanded() ? 'Afficher moins' : 'Afficher 2 de plus' }}<cw-collapsible-chevron />
          </button>
        </div>
      </cw-collapsible>`,
  }),
};

/** Trigger states: closed, open (chevron at 180°) and disabled. */
export const TriggerStates: Story = {
  render: () => ({
    template: `
      <div class="flex items-start gap-8">
        <cw-collapsible>
          <button cwButton variant="ghost" size="icon-sm" cwCollapsibleTrigger aria-label="Déplier les sous-tâches"><cw-collapsible-chevron /></button>
          <cw-collapsible-content />
        </cw-collapsible>
        <cw-collapsible [expanded]="true">
          <button cwButton variant="ghost" size="icon-sm" cwCollapsibleTrigger aria-label="Replier les sous-tâches"><cw-collapsible-chevron /></button>
          <cw-collapsible-content />
        </cw-collapsible>
        <cw-collapsible disabled>
          <button cwButton variant="ghost" size="icon-sm" cwCollapsibleTrigger aria-label="Déplier les sous-tâches"><cw-collapsible-chevron /></button>
          <cw-collapsible-content />
        </cw-collapsible>
      </div>`,
  }),
};

/** Enter and Space open and close the block from its trigger. */
export const Keyboard: Story = {
  render: () => ({
    template: `
      <cw-collapsible #block="cwCollapsible" class="w-80">
        <div class="flex items-center justify-between gap-4 pl-2">
          <h4 class="text-sm font-semibold">Sous-tâches <span class="font-normal text-muted-foreground tabular-nums">2 / 5</span></h4>
          <button cwButton variant="ghost" size="icon-sm" cwCollapsibleTrigger
                  [attr.aria-label]="block.expanded() ? 'Replier les sous-tâches' : 'Déplier les sous-tâches'">
            <cw-collapsible-chevron />
          </button>
        </div>
        <cw-collapsible-content>${SUBTASKS}</cw-collapsible-content>
      </cw-collapsible>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    const trigger = scope.getByRole('button', { name: 'Déplier les sous-tâches' });

    trigger.focus();
    await userEvent.keyboard('{Enter}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(trigger).toHaveAccessibleName('Replier les sous-tâches');
    await userEvent.keyboard(' ');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};
