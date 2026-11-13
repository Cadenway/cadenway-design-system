import { CwBadge } from '@cadenway/ui/badge';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorFileBold,
  phosphorLightningBold,
  phosphorLinkBold,
  phosphorPaperclipBold,
  phosphorProhibitBold,
} from '@ng-icons/phosphor-icons/bold';
import {
  type Meta,
  type StoryObj,
  applicationConfig,
  moduleMetadata,
} from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwAccordionContent } from './accordion-content/accordion-content.component';
import { CwAccordionItem } from './accordion-item/accordion-item.component';
import { CwAccordionTrigger } from './accordion-trigger/accordion-trigger.component';
import { CwAccordion } from './accordion.component';

/**
 * Accordion, every variant and state of its sheet in the Design System artifact, in the light and
 * the dark theme. Copy from the sheet's preview (task detail, help FAQ).
 */
const meta: Meta = {
  title: 'UI/Accordion',
  decorators: [
    moduleMetadata({
      imports: [
        CwAccordion,
        CwAccordionItem,
        CwAccordionTrigger,
        CwAccordionContent,
        CwBadge,
        NgIcon,
      ],
    }),
    applicationConfig({
      providers: [
        provideIcons({
          phosphorFileBold,
          phosphorLightningBold,
          phosphorLinkBold,
          phosphorPaperclipBold,
          phosphorProhibitBold,
        }),
      ],
    }),
  ],
  parameters: {
    // Each open section is a `region` named by its trigger (Accordion sheet, "Accessibilité"). The
    // stories render every accordion twice, once per theme, so each name exists twice on the page:
    // only that copy makes the regions' names repeat, never one accordion.
    a11y: {
      config: { rules: [{ id: 'landmark-unique', selector: '[role="region"]', enabled: false }] },
    },
  },
};

export default meta;

type Story = StoryObj;

function light(canvasElement: HTMLElement): HTMLElement {
  const scope = canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

const DETAIL_SECTIONS = `
  <cw-accordion-item value="champs">
    <button cwAccordionTrigger>Champs personnalisés</button>
    <cw-accordion-content>
      <dl class="grid grid-cols-[7rem_1fr] gap-y-1.5">
        <dt class="text-muted-foreground">Client</dt><dd>Mairie de Lyon</dd>
        <dt class="text-muted-foreground">Estimation</dt><dd>5 points</dd>
        <dt class="text-muted-foreground">Version</dt><dd>1.4.0</dd>
      </dl>
    </cw-accordion-content>
  </cw-accordion-item>
  <cw-accordion-item value="dependances">
    <button cwAccordionTrigger>Dépendances</button>
    <cw-accordion-content>
      <p class="flex items-center gap-2">
        <ng-icon name="phosphorProhibitBold" class="text-grenat" aria-hidden="true" />Bloquée par
        <span class="font-mono text-xs text-muted-foreground">CAD-471</span>
      </p>
    </cw-accordion-content>
  </cw-accordion-item>
  <cw-accordion-item value="historique">
    <button cwAccordionTrigger>Historique</button>
    <cw-accordion-content>
      <p class="text-muted-foreground">Créée par Léa Martin le 2 nov. · 14 modifications.</p>
    </cw-accordion-content>
  </cw-accordion-item>`;

/** `type="single"`: one section open at a time. */
export const Single: Story = {
  render: () => ({
    template: `<cw-accordion class="w-96" value="champs">${DETAIL_SECTIONS}</cw-accordion>`,
  }),
};

/** `type="multiple"`: icons, counts, and a disabled section (« Automatisations » without rights). */
export const Multiple: Story = {
  render: () => ({
    template: `
      <cw-accordion class="w-96" type="multiple" [value]="['dependances', 'pieces']">
        <cw-accordion-item value="dependances">
          <button cwAccordionTrigger>
            <ng-icon name="phosphorLinkBold" aria-hidden="true" />Dépendances<span cwBadge variant="secondary">1</span>
          </button>
          <cw-accordion-content>
            <p class="flex items-center gap-2">
              <ng-icon name="phosphorProhibitBold" class="text-grenat" aria-hidden="true" />Bloquée par
              <span class="font-mono text-xs text-muted-foreground">CAD-471</span>
            </p>
          </cw-accordion-content>
        </cw-accordion-item>
        <cw-accordion-item value="pieces">
          <button cwAccordionTrigger>
            <ng-icon name="phosphorPaperclipBold" aria-hidden="true" />Pièces jointes<span cwBadge variant="secondary">2</span>
          </button>
          <cw-accordion-content>
            <ul class="grid gap-1">
              <li class="flex items-center gap-2 text-muted-foreground"><ng-icon name="phosphorFileBold" aria-hidden="true" />export-v2.csv · 18 Ko</li>
              <li class="flex items-center gap-2 text-muted-foreground"><ng-icon name="phosphorFileBold" aria-hidden="true" />capture-excel.png · 240 Ko</li>
            </ul>
          </cw-accordion-content>
        </cw-accordion-item>
        <cw-accordion-item value="automatisations" disabled>
          <button cwAccordionTrigger><ng-icon name="phosphorLightningBold" aria-hidden="true" />Automatisations</button>
          <cw-accordion-content />
        </cw-accordion-item>
      </cw-accordion>`,
  }),
};

/** `card` variant: a framed FAQ, full-width triggers. */
export const Card: Story = {
  render: () => ({
    template: `
      <cw-accordion class="w-96" variant="card" value="sauvegarde">
        <cw-accordion-item value="sauvegarde">
          <button cwAccordionTrigger>Comment sauvegarder mon instance ?</button>
          <cw-accordion-content>
            <p class="text-pretty text-muted-foreground">Une sauvegarde chiffrée est faite chaque nuit ; lancez-en une à la main dans Réglages › Instance.</p>
          </cw-accordion-content>
        </cw-accordion-item>
        <cw-accordion-item value="import">
          <button cwAccordionTrigger>Puis-je importer depuis un autre outil ?</button>
          <cw-accordion-content />
        </cw-accordion-item>
      </cw-accordion>`,
  }),
};

/** Click opens a section and closes the other one; ↓ ↑ Home End move between the triggers. */
export const Keyboard: Story = {
  render: () => ({
    template: `<cw-accordion class="w-96" value="champs">${DETAIL_SECTIONS}</cw-accordion>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    const fields = scope.getByRole('button', { name: 'Champs personnalisés' });
    const dependencies = scope.getByRole('button', { name: 'Dépendances' });
    const history = scope.getByRole('button', { name: 'Historique' });

    fields.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(dependencies).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(dependencies).toHaveAttribute('aria-expanded', 'true');
    await expect(fields).toHaveAttribute('aria-expanded', 'false');
    await userEvent.keyboard('{End}');
    await expect(history).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(fields).toHaveFocus();
    // The region is reachable again once open (it fades in over 300 ms).
    await expect(scope.getByRole('region', { name: 'Dépendances' }).closest('[inert]')).toBeNull();
  },
};
