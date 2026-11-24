import {
  CwMenu,
  CwMenuItem,
  CwMenuLabel,
  CwMenuItemRadio,
  CwMenuRadioGroup,
} from '@cadenway/ui/components/menu';
import { CwStatusIcon, type CwStatusKey } from '@cadenway/ui/components/status-icon';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { CwSplitButton } from './split-button.component';

/**
 * Constant meta
 *
 * @description
 * Split button, as the task status button of the mockup (`App.dc.html`, task sheet and fields
 * panel), in the light and the dark theme.
 *
 * @type {Meta}
 */
const meta: Meta = {
  title: 'UI/SplitButton',
  decorators: [
    moduleMetadata({
      imports: [
        CwSplitButton,
        CwMenu,
        CwMenuItem,
        CwMenuLabel,
        CwMenuItemRadio,
        CwMenuRadioGroup,
        CwStatusIcon,
      ],
    }),
  ],
};

export default meta;

/**
 * Type Story
 *
 * @description
 * Storybook configuration used for split button examples and interactions.
 *
 * @type {StoryObj}
 */
type Story = StoryObj;

/**
 * Interface StatusOption
 *
 * @description
 * A status of the mockup's status menu.
 */
interface StatusOption {
  // #region Properties
  /**
   * Property key
   *
   * @description
   * Status key drawn by `cw-status-icon`.
   *
   * @type {CwStatusKey}
   * @readonly
   */
  readonly key: CwStatusKey;

  /**
   * Property label
   *
   * @description
   * Status name, word for word from the mockup.
   *
   * @type {string}
   * @readonly
   */
  readonly label: string;
  // #endregion
}

/**
 * Constant STATUS_GROUPS
 *
 * @description
 * The mockup's statuses by category (`App.dc.html`, `STATUSES`), as the status menu lists them.
 *
 * @type {readonly { label: string; options: readonly StatusOption[] }[]}
 */
const STATUS_GROUPS: readonly { label: string; options: readonly StatusOption[] }[] = [
  {
    label: 'Non commencé',
    options: [
      { key: 'triage', label: 'À trier' },
      { key: 'backlog', label: 'À planifier' },
      { key: 'todo', label: 'À faire' },
    ],
  },
  {
    label: 'Actif',
    options: [
      { key: 'progress', label: 'En cours' },
      { key: 'review', label: 'En revue' },
      { key: 'testing', label: 'En validation' },
      { key: 'waiting', label: 'En attente' },
      { key: 'blocked', label: 'Bloqué' },
    ],
  },
  {
    label: 'Fermé',
    options: [
      { key: 'done', label: 'Terminé' },
      { key: 'cancelled', label: 'Annulé' },
    ],
  },
];

/**
 * Constant NEXT_STATUS
 *
 * @description
 * The next logical status of the mockup (`App.dc.html`, `NEXT_STATUS`): « À planifier », « En
 * attente », « Bloqué » and « Annulé » are only chosen by hand.
 *
 * @type {Readonly<Partial<Record<CwStatusKey, CwStatusKey>>>}
 */
const NEXT_STATUS: Readonly<Partial<Record<CwStatusKey, CwStatusKey>>> = {
  triage: 'todo',
  backlog: 'todo',
  todo: 'progress',
  progress: 'review',
  review: 'testing',
  testing: 'done',
  waiting: 'progress',
  blocked: 'progress',
};

/**
 * Function labelOf
 *
 * @description
 * Name of a status.
 *
 * @param {CwStatusKey} key - Status key.
 *
 * @returns {string} Its name, or the key when unknown.
 */
function labelOf(key: CwStatusKey): string {
  return (
    STATUS_GROUPS.flatMap((group) => group.options).find((option) => option.key === key)?.label ??
    key
  );
}

/**
 * Function advanceLabel
 *
 * @description
 * Accessible name of the main half, as the mockup writes it (`advanceLabel`).
 *
 * @param {CwStatusKey} key - Current status.
 *
 * @returns {string} « En cours · passer à « En revue » », or the status alone without a next one.
 */
function advanceLabel(key: CwStatusKey): string {
  const next: CwStatusKey | undefined = NEXT_STATUS[key];
  return labelOf(key) + (next ? ` · passer à « ${labelOf(next)} »` : '');
}

/**
 * Constant STATUS_TEMPLATE
 *
 * @description
 * The task status button: the main half moves to the next status, the caret lists them all.
 *
 * @type {string}
 */
const STATUS_TEMPLATE: string = `
  <cw-split-button
    menuLabel="Choisir un statut"
    [label]="advanceLabel(status)"
    [advanceable]="!!next[status]"
    [disabled]="disabled"
    (advance)="status = next[status] ?? status"
  >
    <cw-status-icon [status]="status" size="3.5" />
    <span class="truncate">{{ labelOf(status) }}</span>
    <cw-menu align="end">
      <cw-menu-radio-group [(value)]="status">
        @for (group of groups; track group.label) {
          <cw-menu-label>{{ group.label }}</cw-menu-label>
          @for (option of group.options; track option.key) {
            <button cwMenuItemRadio [value]="option.key">
              <cw-status-icon [status]="option.key" size="4" />{{ option.label }}
            </button>
          }
        }
      </cw-menu-radio-group>
    </cw-menu>
  </cw-split-button>`;

/**
 * Function light
 *
 * @description
 * Locates the light-theme copy rendered by the shared Storybook preview decorator.
 *
 * @param {HTMLElement} canvasElement - Story canvas containing the theme examples.
 *
 * @returns {HTMLElement} Element containing the light-theme example.
 *
 * @throws {Error} When the expected light-theme scope is missing.
 */
function light(canvasElement: HTMLElement): HTMLElement {
  const scope: HTMLElement | null =
    canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

/** The task status: a click moves « En cours » to « En revue »; the caret lists every status. */
export const TaskStatus: Story = {
  render: () => ({
    props: {
      status: 'progress',
      disabled: false,
      groups: STATUS_GROUPS,
      next: NEXT_STATUS,
      labelOf,
      advanceLabel,
    },
    template: STATUS_TEMPLATE,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: { getByRole(role: string, options?: { name?: string }): HTMLElement } = within(
      light(canvasElement),
    );
    const main: HTMLElement = scope.getByRole('button', {
      name: 'En cours · passer à « En revue »',
    });

    await userEvent.click(main);
    await expect(
      scope.getByRole('button', { name: 'En revue · passer à « En validation »' }),
    ).toBeInTheDocument();
  },
};

/** Keyboard: Tab reaches the caret, ↓ opens the menu on its first status, Escape closes it. */
export const Keyboard: Story = {
  render: TaskStatus.render,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: { getByRole(role: string, options?: { name?: string }): HTMLElement } = within(
      light(canvasElement),
    );
    const caret: HTMLElement = scope.getByRole('button', { name: 'Choisir un statut' });

    caret.focus();
    await userEvent.keyboard('{ArrowDown}');
    const menu: HTMLElement = await within(document.body).findByRole('menu', {
      name: 'Choisir un statut',
    });
    await expect(caret).toHaveAttribute('aria-expanded', 'true');
    await expect(within(menu).getByRole('menuitemradio', { name: 'En cours' })).toBeChecked();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(caret).toHaveFocus());
    await expect(caret).toHaveAttribute('aria-expanded', 'false');
  },
};

/** A closed status has no next one: no → hint, the caret still changes it. */
export const WithoutNext: Story = {
  render: () => ({
    props: {
      status: 'done',
      disabled: false,
      groups: STATUS_GROUPS,
      next: NEXT_STATUS,
      labelOf,
      advanceLabel,
    },
    template: STATUS_TEMPLATE,
  }),
};

/** Disabled: both halves, for a reader without edit rights. */
export const Disabled: Story = {
  render: () => ({
    props: {
      status: 'review',
      disabled: true,
      groups: STATUS_GROUPS,
      next: NEXT_STATUS,
      labelOf,
      advanceLabel,
    },
    template: STATUS_TEMPLATE,
  }),
};
