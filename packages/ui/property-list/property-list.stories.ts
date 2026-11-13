import { CwAvatar } from '@cadenway/ui/avatar';
import { CwCombobox, CwComboboxOption } from '@cadenway/ui/combobox';
import { CwDatePicker } from '@cadenway/ui/date-picker';
import { CwInlineEdit } from '@cadenway/ui/inline-edit';
import { CwPriorityIcon } from '@cadenway/ui/priority-icon';
import { CwSelect, CwSelectOption } from '@cadenway/ui/select';
import { CwStatusIcon } from '@cadenway/ui/status-icon';
import { provideIcons } from '@ng-icons/core';
import {
  phosphorCalendarBlankBold,
  phosphorCellSignalHighBold,
  phosphorCircleHalfBold,
  phosphorHashBold,
  phosphorRepeatBold,
  phosphorTextTBold,
  phosphorTimerBold,
  phosphorUsersBold,
} from '@ng-icons/phosphor-icons/bold';
import {
  type Meta,
  type StoryObj,
  applicationConfig,
  moduleMetadata,
} from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwProperty } from './property/property.component';
import { CwPropertyGroup } from './property-group/property-group.component';
import { CwPropertyList } from './property-list.component';
import { CwPropertyValue } from './property-value/property-value.directive';

/**
 * Property List, every state of its sheet in the Design System artifact, in the light and the dark
 * theme. Copy and values from the mockup (`App.dc.html`, task panel « Propriétés »).
 */
const meta: Meta = {
  title: 'UI/PropertyList',
  decorators: [
    moduleMetadata({
      imports: [
        CwPropertyList,
        CwPropertyGroup,
        CwProperty,
        CwPropertyValue,
        CwSelect,
        CwSelectOption,
        CwCombobox,
        CwComboboxOption,
        CwDatePicker,
        CwInlineEdit,
        CwStatusIcon,
        CwPriorityIcon,
        CwAvatar,
      ],
    }),
    applicationConfig({
      providers: [
        provideIcons({
          phosphorCalendarBlankBold,
          phosphorCellSignalHighBold,
          phosphorCircleHalfBold,
          phosphorHashBold,
          phosphorRepeatBold,
          phosphorTextTBold,
          phosphorTimerBold,
          phosphorUsersBold,
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

const PROPERTIES = `
  <cw-property label="Statut" icon="phosphorCircleHalfBold">
    <cw-select cwPropertyValue [(value)]="status" ariaLabel="Statut">
      <cw-select-option value="progress"><cw-status-icon status="progress" />En cours</cw-select-option>
      <cw-select-option value="review"><cw-status-icon status="review" />En revue</cw-select-option>
      <cw-select-option value="done"><cw-status-icon status="done" />Terminé</cw-select-option>
    </cw-select>
  </cw-property>
  <cw-property label="Assignés" icon="phosphorUsersBold">
    <cw-combobox cwPropertyValue multiple [(value)]="people" ariaLabel="Assignés" placeholder="Vide"
      [summary]="peopleSummary">
      <cw-combobox-option value="lm"><span data-cw-combobox-label class="flex items-center gap-2"><cw-avatar name="Léa Martin" size="xs" />Léa Martin</span></cw-combobox-option>
      <cw-combobox-option value="kb"><span data-cw-combobox-label class="flex items-center gap-2"><cw-avatar name="Karim Benali" size="xs" />Karim Benali</span></cw-combobox-option>
    </cw-combobox>
  </cw-property>
  <cw-property label="Priorité" icon="phosphorCellSignalHighBold">
    <cw-select cwPropertyValue [(value)]="priority" ariaLabel="Priorité">
      <cw-select-option value="haute"><cw-priority-icon priority="haute" />Haute</cw-select-option>
      <cw-select-option value="moyenne"><cw-priority-icon priority="moyenne" />Moyenne</cw-select-option>
    </cw-select>
  </cw-property>
  <cw-property label="Échéance" icon="phosphorCalendarBlankBold">
    <cw-date-picker cwPropertyValue [(value)]="due" placeholder="Vide" ariaLabel="Échéance" />
  </cw-property>
  <cw-property label="Estimation" icon="phosphorTimerBold">
    <cw-inline-edit cwPropertyValue [(value)]="estimate" placeholder="Vide" ariaLabel="Estimation" />
  </cw-property>`;

const PROPS = {
  status: 'progress',
  people: ['lm', 'kb'],
  priority: 'haute',
  due: new Date(2026, 10, 14),
  estimate: '3 h',
  version: '',
  sprint: 's14',
  peopleSummary: (count: number) => `${String(count)} personnes`,
};

/** Vertical: the task panel, « Propriétés » then « Champs personnalisés ». */
export const Vertical: Story = {
  render: () => ({
    props: { ...PROPS },
    template: `
      <cw-property-list class="w-96">
        <cw-property-group label="Propriétés">${PROPERTIES}</cw-property-group>
        <cw-property-group label="Champs personnalisés">
          <cw-property label="Client" icon="phosphorTextTBold">
            <cw-inline-edit cwPropertyValue value="Mairie de Lyon" placeholder="Vide" ariaLabel="Client" />
          </cw-property>
          <cw-property label="Points" icon="phosphorHashBold">
            <cw-inline-edit cwPropertyValue value="5" placeholder="Vide" ariaLabel="Points" />
          </cw-property>
        </cw-property-group>
      </cw-property-list>`,
  }),
};

/** Empty values: « Vide », folded behind « Champs vides 2 », and « Ajouter un champ ». */
export const EmptyFolded: Story = {
  render: () => ({
    props: { ...PROPS, showEmpty: false },
    template: `
      <cw-property-list class="w-96" hideEmpty canAddField [(showEmpty)]="showEmpty">
        <cw-property-group label="Champs personnalisés">
          <cw-property label="Client" icon="phosphorTextTBold">
            <cw-inline-edit cwPropertyValue value="Mairie de Lyon" placeholder="Vide" ariaLabel="Client" />
          </cw-property>
          <cw-property label="Version" icon="phosphorHashBold">
            <cw-inline-edit cwPropertyValue [(value)]="version" placeholder="Vide" ariaLabel="Version" />
          </cw-property>
          <cw-property label="Sprint" icon="phosphorRepeatBold">
            <cw-select cwPropertyValue placeholder="Vide" ariaLabel="Sprint">
              <cw-select-option value="s14">Sprint 14</cw-select-option>
            </cw-select>
          </cw-property>
        </cw-property-group>
      </cw-property-list>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    const toggle = scope.getByRole('button', { name: /Champs vides/ });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  },
};

/** Inline: chips under a full-page task title; the label is in each chip's accessible name. */
export const Inline: Story = {
  render: () => ({
    props: { ...PROPS },
    template: `<cw-property-list orientation="inline" canAddField class="max-w-xl">${PROPERTIES}</cw-property-list>`,
  }),
};

/** Read-only: a computed field or a missing right; the value is text with a lock. */
export const ReadOnly: Story = {
  render: () => ({
    props: { ...PROPS },
    template: `<cw-property-list class="w-96" readonly>${PROPERTIES}</cw-property-list>`,
  }),
};

/** Error: the value refused, the field kept open with the message under it. */
export const Invalid: Story = {
  render: () => ({
    template: `
      <cw-property-list class="w-96">
        <cw-property label="Points" icon="phosphorHashBold" error="Saisissez un nombre entier.">
          <cw-inline-edit cwPropertyValue value="douze" [editing]="true" ariaLabel="Points" />
        </cw-property>
      </cw-property-list>`,
  }),
};

/** Keyboard: Tab reaches the value, Enter opens its panel, Escape gives the focus back. */
export const Keyboard: Story = {
  render: () => ({
    props: { ...PROPS },
    template: `<cw-property-list class="w-96">${PROPERTIES}</cw-property-list>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    const status = scope.getByRole('combobox', { name: /^Statut/ });

    await userEvent.tab();
    await expect(status).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(status).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{Escape}');
    await expect(status).toHaveAttribute('aria-expanded', 'false');
    await expect(status).toHaveFocus();
    await Promise.allSettled(document.getAnimations().map((animation) => animation.finished));
  },
};
