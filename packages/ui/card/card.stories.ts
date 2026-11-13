import { CwButton } from '@cadenway/ui/button';
import { CwCheckbox } from '@cadenway/ui/checkbox';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwCardAction } from './card-action/card-action.component';
import { CwCardContent } from './card-content/card-content.component';
import { CwCardDescription } from './card-description/card-description.component';
import { CwCardFooter } from './card-footer/card-footer.component';
import { CwCardHeader } from './card-header/card-header.component';
import { CwCardTitle } from './card-title/card-title.component';
import { CwCard } from './card.component';

/**
 * Card, every composition and state of its sheet in the Design System artifact, in the light and
 * the dark theme. Copy from the mockup (`App.dc.html`, settings). The task card of the board is
 * built by the web application, not here.
 */
const meta: Meta = {
  title: 'UI/Card',
  decorators: [
    moduleMetadata({
      imports: [
        CwCard,
        CwCardHeader,
        CwCardTitle,
        CwCardDescription,
        CwCardAction,
        CwCardContent,
        CwCardFooter,
        CwButton,
        CwCheckbox,
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

/** Simple: content only, a block of information. */
export const Simple: Story = {
  render: () => ({
    template: `
      <cw-card class="w-80">
        <cw-card-content class="grid gap-1">
          <div class="text-sm font-medium">Espace Produit</div>
          <p class="text-sm text-muted-foreground">23 tâches ouvertes · 4 membres · sprint 14 en cours jusqu'au 20 nov.</p>
        </cw-card-content>
      </cw-card>`,
  }),
};

/** Header with an action, content and a footer link: Réglages › Membres de l'espace. */
export const HeaderActionFooter: Story = {
  render: () => ({
    template: `
      <cw-card class="w-96">
        <cw-card-header>
          <cw-card-title>Membres de l'espace</cw-card-title>
          <cw-card-description>4 personnes ont accès à Produit.</cw-card-description>
          <cw-card-action><button cwButton variant="outline" size="sm">Inviter</button></cw-card-action>
        </cw-card-header>
        <cw-card-content class="grid gap-2.5 text-sm">
          <div class="flex items-center gap-2.5"><span class="font-medium">Léa Martin</span><span class="ml-auto text-xs text-muted-foreground">Admin</span></div>
          <div class="flex items-center gap-2.5"><span class="font-medium">Karim Benali</span><span class="ml-auto text-xs text-muted-foreground">Membre</span></div>
        </cw-card-content>
        <cw-card-footer><a cwButton variant="link" href="#acces">Gérer les accès</a></cw-card-footer>
      </cw-card>`,
  }),
};

/** Footer of actions: a block of settings saved as a whole, Annuler and Enregistrer on the right. */
export const ActionsFooter: Story = {
  render: () => ({
    template: `
      <cw-card class="w-96">
        <cw-card-header>
          <cw-card-title>Notifications par e-mail</cw-card-title>
          <cw-card-description>Envoyées à lea.martin&#64;exemple.fr.</cw-card-description>
        </cw-card-header>
        <cw-card-content class="grid gap-2.5 text-sm">
          <label class="flex items-center gap-2.5"><cw-checkbox [checked]="true" /> Une tâche m'est assignée</label>
          <label class="flex items-center gap-2.5"><cw-checkbox [checked]="true" /> On me mentionne</label>
          <label class="flex items-center gap-2.5"><cw-checkbox /> Une échéance approche</label>
        </cw-card-content>
        <cw-card-footer class="justify-end">
          <button cwButton variant="outline" size="sm">Annuler</button>
          <button cwButton size="sm">Enregistrer</button>
        </cw-card-footer>
      </cw-card>`,
  }),
};

/** `sm` and interactive: a tab stop with the hover veil and the focus ring. */
export const Interactive: Story = {
  render: () => ({
    props: { opened: 0 },
    template: `
      <div class="grid gap-2 rounded-xl bg-canvas p-2">
        <cw-card size="sm" interactive class="w-64" (click)="opened = opened + 1" (keydown.enter)="opened = opened + 1">
          <span class="font-mono text-xs text-muted-foreground">CAD-479</span>
          <p class="line-clamp-2 text-sm font-medium">Maquetter la vue Calendrier</p>
        </cw-card>
        <span class="text-xs text-muted-foreground" role="status">{{ opened }} ouverture(s)</span>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    await userEvent.tab();
    const card = scope.getByText('Maquetter la vue Calendrier').closest('cw-card');
    await expect(card).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(scope.getByRole('status')).toHaveTextContent('1 ouverture(s)');
  },
};

/** Selected: the selected veil and a `foreground/40` border; `aria-selected` on an option. */
export const Selected: Story = {
  render: () => ({
    template: `
      <div role="listbox" aria-label="Espaces" class="grid w-64 gap-2 rounded-xl bg-canvas p-2">
        <cw-card role="option" size="sm" interactive>Espace Design</cw-card>
        <cw-card role="option" size="sm" interactive selected>Espace Produit</cw-card>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const option = within(light(canvasElement)).getByRole('option', { name: 'Espace Produit' });
    await expect(option).toHaveAttribute('aria-selected', 'true');
  },
};
