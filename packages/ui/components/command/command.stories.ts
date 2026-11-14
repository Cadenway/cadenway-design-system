import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowsLeftRightBold,
  phosphorDownloadSimpleBold,
  phosphorHouseBold,
  phosphorPlusBold,
  phosphorSquaresFourBold,
  phosphorUserBold,
} from '@ng-icons/phosphor-icons/bold';
import {
  type Meta,
  type StoryObj,
  applicationConfig,
  moduleMetadata,
} from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { CwButton } from '@cadenway/ui/components/button';
import { CwKbd } from '@cadenway/ui/components/kbd';
import { CwStatusIcon } from '@cadenway/ui/components/status-icon';

import { CwCommand } from './command.component';
import { CwCommandDialog } from './command-dialog/command-dialog.component';
import { CwCommandEmpty } from './command-empty/command-empty.component';
import { CwCommandFooter } from './command-footer/command-footer.component';
import { CwCommandGroup } from './command-group/command-group.component';
import { CwCommandHighlight } from './command-highlight/command-highlight.component';
import { CwCommandInput } from './command-input/command-input.directive';
import { CwCommandItem } from './command-item/command-item.component';
import { CwCommandList } from './command-list/command-list.component';
import { CwCommandLoading } from './command-loading/command-loading.component';
import { CwCommandSeparator } from './command-separator/command-separator.component';

/**
 * Constant meta
 *
 * @description
 * Command states from the design system sheet in light and dark themes.
 * The palette renders in a CDK dialog on the page body, outside the theme scopes: the visual states
 * use the inline command; the palette story opens the real one with Ctrl K in its play function.
 * Copy from the mockup (`App.dc.html`, the palette) and the sheet.
 *
 * @type {Meta}
 */
const meta: Meta = {
  title: 'UI/Command',
  decorators: [
    moduleMetadata({
      imports: [
        CwCommand,
        CwCommandDialog,
        CwCommandEmpty,
        CwCommandFooter,
        CwCommandGroup,
        CwCommandHighlight,
        CwCommandInput,
        CwCommandItem,
        CwCommandList,
        CwCommandLoading,
        CwCommandSeparator,
        CwButton,
        CwKbd,
        CwStatusIcon,
        NgIcon,
      ],
    }),
    applicationConfig({
      providers: [
        provideIcons({
          phosphorArrowsLeftRightBold,
          phosphorDownloadSimpleBold,
          phosphorHouseBold,
          phosphorPlusBold,
          phosphorSquaresFourBold,
          phosphorUserBold,
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
 * Storybook configuration for command examples.
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
 * @returns {HTMLElement} Light theme section.
 */
function light(canvasElement: HTMLElement): HTMLElement {
  const scope: HTMLElement | null =
    canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

/**
 * Constant PLACEHOLDER
 *
 * @description
 * Search prompt used by command examples.
 *
 * @type {string}
 */
const PLACEHOLDER: string = 'Rechercher une tâche, un espace ou une action…';

/**
 * Constant SUGGESTIONS
 *
 * @description
 * Shared command groups and items used by the example templates.
 *
 * @type {string}
 */
const SUGGESTIONS: string = `
  <cw-command-group heading="Suggestions">
    <cw-command-item><ng-icon name="phosphorPlusBold" class="text-muted-foreground" aria-hidden="true" />Créer une tâche<kbd cwKbd>C</kbd></cw-command-item>
    <cw-command-item><ng-icon name="phosphorSquaresFourBold" class="text-muted-foreground" aria-hidden="true" />Afficher le tableau<kbd cwKbd>V</kbd></cw-command-item>
    <cw-command-item disabled><ng-icon name="phosphorUserBold" class="text-muted-foreground" aria-hidden="true" />Assigner à moi<span class="ml-auto text-xs text-muted-foreground">aucune tâche ouverte</span></cw-command-item>
  </cw-command-group>
  <cw-command-separator />
  <cw-command-group heading="Tâches récentes">
    <cw-command-item value="CAD-482"><cw-status-icon status="progress" /><span class="shrink-0 font-mono text-xs text-muted-foreground">CAD-482</span><cw-command-highlight text="Parcours SSO pour les organisations" /></cw-command-item>
    <cw-command-item value="CAD-488"><cw-status-icon status="todo" /><span class="shrink-0 font-mono text-xs text-muted-foreground">CAD-488</span><cw-command-highlight text="Importer les espaces depuis un export JSON" /></cw-command-item>
  </cw-command-group>
  <cw-command-separator />
  <cw-command-group heading="Actions">
    <cw-command-item [keywords]="['csv', 'télécharger']"><ng-icon name="phosphorDownloadSimpleBold" class="text-muted-foreground" aria-hidden="true" /><cw-command-highlight text="Exporter la liste en CSV" /></cw-command-item>
    <cw-command-item><ng-icon name="phosphorArrowsLeftRightBold" class="text-muted-foreground" aria-hidden="true" /><cw-command-highlight text="Changer d’organisation" /></cw-command-item>
  </cw-command-group>`;

/** The suggestions of an empty search: groups, separators, shortcuts, a disabled item, the help. */
export const Suggestions: Story = {
  render: () => ({
    template: `
      <cw-command class="w-full max-w-xl">
        <input cwCommandInput aria-label="Commande" placeholder="${PLACEHOLDER}" />
        <cw-command-list>${SUGGESTIONS}</cw-command-list>
        <cw-command-footer />
      </cw-command>`,
  }),
};

/** Filtered: groups reduced to their matches, the matched letters in bold, the first highlighted. */
export const Filtered: Story = {
  render: () => ({
    template: `
      <cw-command class="w-full max-w-sm" search="export">
        <input cwCommandInput aria-label="Commande" placeholder="${PLACEHOLDER}" />
        <cw-command-list>${SUGGESTIONS}</cw-command-list>
      </cw-command>`,
  }),
};

/** A server search: spinner in the field and in the list, `aria-busy`. */
export const Loading: Story = {
  render: () => ({
    props: { filter: null },
    template: `
      <cw-command class="w-full max-w-sm" search="sauvegarde" [filter]="filter" loading>
        <input cwCommandInput aria-label="Commande" placeholder="${PLACEHOLDER}" />
        <cw-command-list>
          <cw-command-loading>Recherche dans 1 284 tâches…</cw-command-loading>
        </cw-command-list>
      </cw-command>`,
  }),
};

/** Nothing matches: the sentence and the fallback action. */
export const Empty: Story = {
  render: () => ({
    template: `
      <cw-command class="w-full max-w-sm" search="facturation">
        <input cwCommandInput aria-label="Commande" placeholder="${PLACEHOLDER}" />
        <cw-command-list>
          ${SUGGESTIONS}
          <cw-command-empty>
            <button cwButton variant="outline" size="sm"><ng-icon name="phosphorPlusBold" aria-hidden="true" />Créer la tâche « facturation »</button>
          </cw-command-empty>
        </cw-command-list>
      </cw-command>`,
  }),
};

/** The inline variant, without footer: « Déplacer vers… » in a panel. */
export const Inline: Story = {
  render: () => ({
    template: `
      <cw-command class="w-72">
        <input cwCommandInput aria-label="Déplacer vers" placeholder="Déplacer vers…" />
        <cw-command-list>
          <cw-command-group heading="Listes">
            <cw-command-item><ng-icon name="phosphorHouseBold" class="text-muted-foreground" aria-hidden="true" />Produit<span class="ml-auto text-xs text-muted-foreground">Atelier Nord</span></cw-command-item>
            <cw-command-item><ng-icon name="phosphorHouseBold" class="text-muted-foreground" aria-hidden="true" />Design<span class="ml-auto text-xs text-muted-foreground">Atelier Nord</span></cw-command-item>
          </cw-command-group>
        </cw-command-list>
      </cw-command>`,
  }),
};

/** Typing filters, ↓ skips the disabled item, Escape clears the search. */
export const Keyboard: Story = {
  render: () => ({
    template: `
      <cw-command class="w-full max-w-sm">
        <input cwCommandInput aria-label="Commande" placeholder="${PLACEHOLDER}" />
        <cw-command-list>${SUGGESTIONS}</cw-command-list>
      </cw-command>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: { getByRole: (role: string, options: { name: string | RegExp }) => HTMLElement } =
      within(light(canvasElement));
    const field: HTMLElement = scope.getByRole('combobox', { name: 'Commande' });
    await userEvent.click(field);
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    const active: string = field.getAttribute('aria-activedescendant') ?? '';
    await expect(light(canvasElement).querySelector(`#${active}`)).toHaveTextContent('CAD-482');

    await userEvent.type(field, 'csv');
    await expect(scope.getByRole('option', { name: /Exporter la liste en CSV/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await userEvent.keyboard('{Escape}');
    await expect(field).toHaveValue('');
  },
};

/** The `Ctrl K` palette: opens on the shortcut, Escape clears the search, then closes. */
export const Palette: Story = {
  render: () => ({
    template: `
      <cw-command-dialog [shortcut]="cwTheme === 'light'">
        <input cwCommandInput aria-label="Rechercher une commande, une tâche, un espace" placeholder="Rechercher une commande, une tâche, un espace…" />
        <cw-command-list>${SUGGESTIONS}</cw-command-list>
        <cw-command-footer />
      </cw-command-dialog>
      <p class="text-sm text-muted-foreground">Appuyez sur <kbd cwKbd>Ctrl</kbd> <kbd cwKbd>K</kbd>.</p>`,
  }),
  play: async () => {
    const body: {
      findByRole: (role: string, options: { name: string }) => Promise<HTMLElement>;
      queryByRole: (role: string) => HTMLElement | null;
    } = within(document.body);
    await userEvent.keyboard('{Control>}k{/Control}');
    const palette: HTMLElement = await body.findByRole('dialog', { name: 'Palette de commandes' });
    const field: HTMLElement = within(palette).getByRole('combobox');
    await waitFor(() => expect(field).toHaveFocus());

    await userEvent.type(field, 'tableau');
    await expect(
      within(palette)
        .getAllByRole('option')
        .filter((o) => !o.hidden),
    ).toHaveLength(1);
    await userEvent.keyboard('{Escape}');
    await expect(field).toHaveValue('');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull());
  },
};
