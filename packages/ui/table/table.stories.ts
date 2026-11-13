import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwTableBody } from './table-body/table-body.directive';
import { CwTableCaption } from './table-caption/table-caption.directive';
import { CwTableCell } from './table-cell/table-cell.directive';
import { CwTableContainer } from './table-container/table-container.component';
import { CwTableEmpty } from './table-empty/table-empty.directive';
import { CwTableFooter } from './table-footer/table-footer.directive';
import { CwTableHead } from './table-head/table-head.directive';
import { CwTableHeader } from './table-header/table-header.directive';
import { CwTableRow } from './table-row/table-row.directive';
import { CwTable } from './table/table.directive';

/**
 * Table, every state of its sheet in the Design System artifact, in the light and the dark theme.
 * Copy from the sheet's preview (time spent on a task, storage by space).
 */
const meta: Meta = {
  title: 'UI/Table',
  decorators: [
    moduleMetadata({
      imports: [
        CwTable,
        CwTableBody,
        CwTableCaption,
        CwTableCell,
        CwTableContainer,
        CwTableEmpty,
        CwTableFooter,
        CwTableHead,
        CwTableHeader,
        CwTableRow,
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

const entries = [
  { person: 'Léa Martin', date: 'lun. 9 nov.', note: 'Analyse du bug', time: '1 h 30' },
  { person: 'Karim Benali', date: 'mar. 10 nov.', note: "Correctif d'encodage", time: '2 h 15' },
  { person: 'Léa Martin', date: 'jeu. 12 nov.', note: 'Revue', time: '0 h 45' },
];

const spaces = [
  { name: 'Produit', tasks: '248', files: '1,2 Go', share: '48 %' },
  { name: 'Infra', tasks: '96', files: '840 Mo', share: '33 %' },
  { name: 'Support', tasks: '412', files: '310 Mo', share: '12 %' },
  { name: 'Archives', tasks: '1 027', files: '180 Mo', share: '7 %' },
];

/** Default size (40 px rows) with a footer for the total and a caption. */
export const Default: Story = {
  render: () => ({
    props: { entries },
    template: `
      <cw-table-container class="max-w-xl">
        <table cwTable>
          <caption cwTableCaption>Temps passé sur CAD-482, semaine 46.</caption>
          <thead cwTableHeader>
            <tr cwTableRow>
              <th cwTableHead>Personne</th>
              <th cwTableHead>Date</th>
              <th cwTableHead>Note</th>
              <th cwTableHead align="end">Durée</th>
            </tr>
          </thead>
          <tbody cwTableBody>
            @for (entry of entries; track $index) {
              <tr cwTableRow>
                <td cwTableCell>{{ entry.person }}</td>
                <td cwTableCell class="whitespace-nowrap">{{ entry.date }}</td>
                <td cwTableCell>{{ entry.note }}</td>
                <td cwTableCell align="end">{{ entry.time }}</td>
              </tr>
            }
          </tbody>
          <tfoot cwTableFooter>
            <tr cwTableRow>
              <td cwTableCell colspan="3">Total</td>
              <td cwTableCell align="end">4 h 30</td>
            </tr>
          </tfoot>
        </table>
      </cw-table-container>`,
  }),
  play: async ({ canvasElement }) => {
    const table = within(light(canvasElement)).getByRole('table', {
      name: 'Temps passé sur CAD-482, semaine 46.',
    });
    await expect(within(table).getAllByRole('columnheader')).toHaveLength(4);
  },
};

/** Compact (`sm`, 32 px rows): dense figures, right-aligned in tabular digits. */
export const Compact: Story = {
  render: () => ({
    props: { spaces },
    template: `
      <cw-table-container class="max-w-md">
        <table cwTable size="sm" aria-label="Stockage par espace">
          <thead cwTableHeader>
            <tr cwTableRow>
              <th cwTableHead>Espace</th>
              <th cwTableHead align="end">Tâches</th>
              <th cwTableHead align="end">Pièces jointes</th>
              <th cwTableHead align="end">Part</th>
            </tr>
          </thead>
          <tbody cwTableBody>
            @for (space of spaces; track space.name) {
              <tr cwTableRow>
                <td cwTableCell>{{ space.name }}</td>
                <td cwTableCell align="end">{{ space.tasks }}</td>
                <td cwTableCell align="end">{{ space.files }}</td>
                <td cwTableCell align="end">{{ space.share }}</td>
              </tr>
            }
          </tbody>
        </table>
      </cw-table-container>`,
  }),
};

/** Empty: one row spanning the columns. */
export const Empty: Story = {
  render: () => ({
    template: `
      <cw-table-container class="max-w-md">
        <table cwTable aria-label="Temps passé, semaine 47">
          <thead cwTableHeader>
            <tr cwTableRow>
              <th cwTableHead>Personne</th>
              <th cwTableHead>Date</th>
              <th cwTableHead align="end">Durée</th>
            </tr>
          </thead>
          <tbody cwTableBody>
            <tr cwTableRow><td cwTableEmpty colspan="3">Aucune saisie de temps cette semaine.</td></tr>
          </tbody>
        </table>
      </cw-table-container>`,
  }),
};

/** Loading: three skeleton rows at the geometry of the cells, `aria-busy` on the table. */
export const Loading: Story = {
  render: () => ({
    props: { rows: [0, 1, 2] },
    template: `
      <cw-table-container class="max-w-xl">
        <table cwTable aria-label="Temps passé" aria-busy="true">
          <thead cwTableHeader>
            <tr cwTableRow>
              <th cwTableHead>Personne</th>
              <th cwTableHead>Date</th>
              <th cwTableHead>Note</th>
              <th cwTableHead align="end">Durée</th>
            </tr>
          </thead>
          <tbody cwTableBody>
            @for (row of rows; track row) {
              <tr cwTableRow>
                <td cwTableCell><span class="block h-3.5 w-[60%] animate-pulse rounded-md bg-secondary motion-reduce:animate-none" aria-hidden="true"></span></td>
                <td cwTableCell><span class="block h-3.5 w-[70%] animate-pulse rounded-md bg-secondary motion-reduce:animate-none" aria-hidden="true"></span></td>
                <td cwTableCell><span class="block h-3.5 w-[50%] animate-pulse rounded-md bg-secondary motion-reduce:animate-none" aria-hidden="true"></span></td>
                <td cwTableCell align="end"><span class="ml-auto block h-3.5 w-10 animate-pulse rounded-md bg-secondary motion-reduce:animate-none" aria-hidden="true"></span></td>
              </tr>
            }
          </tbody>
        </table>
      </cw-table-container>`,
  }),
};

/** A table wider than its frame: the frame scrolls and takes the focus for ← and →. */
export const Overflow: Story = {
  render: () => ({
    props: { spaces },
    template: `
      <cw-table-container class="max-w-60">
        <table cwTable size="sm" aria-label="Stockage par espace, détail">
          <thead cwTableHeader>
            <tr cwTableRow>
              <th cwTableHead>Espace</th>
              <th cwTableHead align="end">Tâches</th>
              <th cwTableHead align="end">Pièces jointes</th>
              <th cwTableHead align="end">Part</th>
            </tr>
          </thead>
          <tbody cwTableBody>
            @for (space of spaces; track space.name) {
              <tr cwTableRow>
                <td cwTableCell class="whitespace-nowrap">{{ space.name }}</td>
                <td cwTableCell align="end" class="whitespace-nowrap">{{ space.tasks }}</td>
                <td cwTableCell align="end" class="whitespace-nowrap">{{ space.files }}</td>
                <td cwTableCell align="end" class="whitespace-nowrap">{{ space.share }}</td>
              </tr>
            }
          </tbody>
        </table>
      </cw-table-container>`,
  }),
  play: async ({ canvasElement }) => {
    const frame = light(canvasElement).querySelector('cw-table-container');
    await userEvent.tab();
    await expect(frame).toHaveFocus();
  },
};
