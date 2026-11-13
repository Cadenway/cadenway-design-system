import { CwField, CwFieldError, CwFieldLabel } from '@cadenway/ui/field';
import { CwSpinner } from '@cadenway/ui/spinner';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowBendUpLeftBold,
  phosphorAtBold,
  phosphorCopyBold,
  phosphorEyeBold,
  phosphorMagnifyingGlassBold,
  phosphorPaperPlaneRightBold,
  phosphorPaperclipBold,
  phosphorXBold,
} from '@ng-icons/phosphor-icons/bold';
import {
  type Meta,
  type StoryObj,
  applicationConfig,
  moduleMetadata,
} from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwInputGroupAddon } from './input-group-addon.component';
import { CwInputGroupButton } from './input-group-button.component';
import { CwInputGroupInput } from './input-group-input.directive';
import { CwInputGroupText } from './input-group-text.component';
import { CwInputGroupTextarea } from './input-group-textarea.directive';
import { CwInputGroup } from './input-group.component';

/**
 * Input Group, every state of its sheet in the Design System artifact, in the light and the dark
 * theme. Copy from the sheet and the mockup (view search, integrations, comment composer of the
 * task panel in `App.dc.html`).
 */
const meta: Meta = {
  title: 'UI/InputGroup',
  decorators: [
    moduleMetadata({
      imports: [
        CwInputGroup,
        CwInputGroupAddon,
        CwInputGroupButton,
        CwInputGroupInput,
        CwInputGroupText,
        CwInputGroupTextarea,
        CwField,
        CwFieldError,
        CwFieldLabel,
        CwSpinner,
        NgIcon,
      ],
    }),
    applicationConfig({
      providers: [
        provideIcons({
          phosphorArrowBendUpLeftBold,
          phosphorAtBold,
          phosphorCopyBold,
          phosphorEyeBold,
          phosphorMagnifyingGlassBold,
          phosphorPaperPlaneRightBold,
          phosphorPaperclipBold,
          phosphorXBold,
        }),
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

/* The key cap of the Kbd brick, inlined here so this story does not depend on its entry point. */
const KEY =
  'pointer-events-none inline-flex h-[18px] w-fit min-w-[18px] items-center justify-center gap-0.5 rounded-[5px] border border-line-strong border-b-2 border-b-line-control bg-background px-1 font-sans text-[10px] leading-none font-medium text-muted-foreground select-none dark:bg-surface-overlay';

/** Inline addons: icon and shortcut, URL prefix and copy, counter and clear, password, loading, unit. */
export const InlineAddons: Story = {
  render: () => ({
    template: `
      <div class="grid w-80 gap-3">
        <cw-input-group>
          <cw-input-group-addon><ng-icon name="phosphorMagnifyingGlassBold" aria-hidden="true" /></cw-input-group-addon>
          <input cwInputGroupInput placeholder="Rechercher des tâches" aria-label="Rechercher des tâches" />
          <cw-input-group-addon align="inline-end"><kbd class="${KEY}">Ctrl K</kbd></cw-input-group-addon>
        </cw-input-group>
        <cw-input-group>
          <cw-input-group-addon><cw-input-group-text>https://</cw-input-group-text></cw-input-group-addon>
          <input cwInputGroupInput value="hooks.exemple.fr/cadenway" aria-label="URL du webhook" />
          <cw-input-group-addon align="inline-end">
            <button cwInputGroupButton size="icon-xs" aria-label="Copier l'URL"><ng-icon name="phosphorCopyBold" /></button>
          </cw-input-group-addon>
        </cw-input-group>
        <cw-input-group>
          <cw-input-group-addon><ng-icon name="phosphorMagnifyingGlassBold" aria-hidden="true" /></cw-input-group-addon>
          <input cwInputGroupInput value="export" aria-label="Rechercher des tâches (résultats)" />
          <cw-input-group-addon align="inline-end">
            <span class="text-xs" aria-live="polite">12 résultats</span>
            <button cwInputGroupButton size="icon-xs" aria-label="Effacer la recherche"><ng-icon name="phosphorXBold" /></button>
          </cw-input-group-addon>
        </cw-input-group>
        <cw-input-group>
          <input cwInputGroupInput type="password" value="cn_test_8f2k1q" aria-label="Clé d'API" />
          <cw-input-group-addon align="inline-end">
            <button cwInputGroupButton size="icon-xs" aria-label="Afficher la clé" aria-pressed="false"><ng-icon name="phosphorEyeBold" /></button>
          </cw-input-group-addon>
        </cw-input-group>
        <cw-input-group>
          <cw-input-group-addon><ng-icon name="phosphorMagnifyingGlassBold" aria-hidden="true" /></cw-input-group-addon>
          <input cwInputGroupInput value="sprint" aria-label="Rechercher des tâches (chargement)" />
          <cw-input-group-addon align="inline-end">
            <svg cwSpinner size="sm"></svg><span class="text-xs" aria-live="polite">Recherche…</span>
          </cw-input-group-addon>
        </cw-input-group>
        <cw-input-group>
          <input cwInputGroupInput type="number" value="4" aria-label="Durée estimée" />
          <cw-input-group-addon align="inline-end"><cw-input-group-text>heures</cw-input-group-text></cw-input-group-addon>
        </cw-input-group>
      </div>`,
  }),
};

/** Block addons around a text area: the comment composer of the task panel. */
export const BlockAddons: Story = {
  render: () => ({
    template: `
      <cw-input-group class="w-[28rem]">
        <cw-input-group-addon align="block-start">
          <span class="flex items-center gap-1.5"><ng-icon name="phosphorArrowBendUpLeftBold" size="0.875rem" aria-hidden="true" />En réponse à Karim Benali</span>
          <button cwInputGroupButton size="icon-xs" aria-label="Annuler la réponse"><ng-icon name="phosphorXBold" /></button>
        </cw-input-group-addon>
        <textarea cwInputGroupTextarea aria-label="Commentaire">Je reprends l'export après la revue. Karim, tu peux relire le correctif ?</textarea>
        <cw-input-group-addon align="block-end">
          <button cwInputGroupButton size="icon-xs" aria-label="Joindre un fichier"><ng-icon name="phosphorPaperclipBold" /></button>
          <button cwInputGroupButton size="icon-xs" aria-label="Mentionner"><ng-icon name="phosphorAtBold" /></button>
          <span class="ml-auto pr-1.5 text-xs tabular-nums">72 / 2 000</span>
          <button cwInputGroupButton variant="default"><ng-icon name="phosphorPaperPlaneRightBold" />Envoyer</button>
        </cw-input-group-addon>
      </cw-input-group>`,
  }),
};

/** Disabled field: the group at 50 %; invalid field: the destructive border and the message. */
export const States: Story = {
  render: () => ({
    template: `
      <div class="grid w-80 gap-5">
        <cw-input-group>
          <cw-input-group-addon><cw-input-group-text>https://</cw-input-group-text></cw-input-group-addon>
          <input cwInputGroupInput value="hooks.exemple.fr/cadenway" aria-label="URL du webhook (désactivée)" disabled />
          <cw-input-group-addon align="inline-end">
            <button cwInputGroupButton size="icon-xs" aria-label="Copier l'URL" disabled><ng-icon name="phosphorCopyBold" /></button>
          </cw-input-group-addon>
        </cw-input-group>
        <cw-field invalid>
          <label cwFieldLabel>URL du webhook</label>
          <cw-input-group>
            <cw-input-group-addon><cw-input-group-text>https://</cw-input-group-text></cw-input-group-addon>
            <input cwInputGroupInput value="hooks exemple" />
          </cw-input-group>
          <cw-field-error>L'URL ne doit pas contenir d'espace.</cw-field-error>
        </cw-field>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const url = within(light(canvasElement)).getByLabelText('URL du webhook');

    await expect(url).toHaveAttribute('aria-invalid', 'true');
    await expect(url).toHaveAccessibleDescription("L'URL ne doit pas contenir d'espace.");
  },
};

/** `sm` 28 px, `default` 32 px and `lg` 36 px. */
export const Sizes: Story = {
  render: () => ({
    template: `
      <div class="grid w-80 gap-3">
        <cw-input-group size="sm">
          <cw-input-group-addon><ng-icon name="phosphorMagnifyingGlassBold" aria-hidden="true" /></cw-input-group-addon>
          <input cwInputGroupInput placeholder="Rechercher" aria-label="Rechercher (petit)" />
          <cw-input-group-addon align="inline-end"><kbd class="${KEY}">/</kbd></cw-input-group-addon>
        </cw-input-group>
        <cw-input-group>
          <cw-input-group-addon><ng-icon name="phosphorMagnifyingGlassBold" aria-hidden="true" /></cw-input-group-addon>
          <input cwInputGroupInput placeholder="Rechercher" aria-label="Rechercher" />
          <cw-input-group-addon align="inline-end"><kbd class="${KEY}">/</kbd></cw-input-group-addon>
        </cw-input-group>
        <cw-input-group size="lg">
          <cw-input-group-addon><ng-icon name="phosphorMagnifyingGlassBold" aria-hidden="true" /></cw-input-group-addon>
          <input cwInputGroupInput placeholder="Rechercher" aria-label="Rechercher (grand)" />
          <cw-input-group-addon align="inline-end"><kbd class="${KEY}">/</kbd></cw-input-group-addon>
        </cw-input-group>
      </div>`,
  }),
};

/** A click on an addon focuses the field; Tab goes from the field to the buttons, in visual order. */
export const Keyboard: Story = {
  render: () => ({
    template: `
      <cw-input-group class="w-80">
        <cw-input-group-addon><ng-icon name="phosphorMagnifyingGlassBold" aria-hidden="true" /></cw-input-group-addon>
        <input cwInputGroupInput value="export" aria-label="Rechercher des tâches" />
        <cw-input-group-addon align="inline-end">
          <button cwInputGroupButton size="icon-xs" aria-label="Effacer la recherche"><ng-icon name="phosphorXBold" /></button>
        </cw-input-group-addon>
      </cw-input-group>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    const search = scope.getByRole('textbox', { name: 'Rechercher des tâches' });
    const addon = search.previousElementSibling;
    if (!(addon instanceof HTMLElement)) throw new Error('Start addon missing');

    await userEvent.click(addon);
    await expect(search).toHaveFocus();
    await userEvent.tab();
    await expect(scope.getByRole('button', { name: 'Effacer la recherche' })).toHaveFocus();
  },
};
