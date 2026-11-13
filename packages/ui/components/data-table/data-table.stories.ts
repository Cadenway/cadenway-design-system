import { CwButton } from '@cadenway/ui/components/button';
import {
  CwEmpty,
  CwEmptyContent,
  CwEmptyDescription,
  CwEmptyHeader,
  CwEmptyMedia,
  CwEmptyTitle,
} from '@cadenway/ui/components/empty';
import { CwPriorityIcon } from '@cadenway/ui/components/priority-icon';
import { CwStatusIcon } from '@cadenway/ui/components/status-icon';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorDotsThreeBold, phosphorFunnelSimpleBold } from '@ng-icons/phosphor-icons/bold';
import { phosphorWarningCircleFill } from '@ng-icons/phosphor-icons/fill';
import {
  type Meta,
  type StoryObj,
  applicationConfig,
  moduleMetadata,
} from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwCellDef } from './cell/cell.directive';
import { CwCellEditorDef } from './cell-editor/cell-editor.directive';
import { CwDataTableColumn } from './data-table-column/data-table-column.component';
import { CwDataTableEmpty } from './data-table-empty/data-table-empty.directive';
import { CwDataTableGroup } from './data-table-group/data-table-group.directive';
import { CwDataTable } from './data-table.component';
import type { CwBulkAction, CwSort } from './data-table.types';

/**
 * Data Table, every state of its two sheets in the Design System artifact (DataTable,
 * DataTableComplete), in the light and the dark theme. The rows, statuses, labels and bulk actions
 * are this story's data, as a consumer would pass them: the brick knows none of them. Copy from the
 * sheets and the mockup (`App.dc.html`, list view).
 */
const meta: Meta = {
  title: 'UI/DataTable',
  decorators: [
    moduleMetadata({
      imports: [
        CwButton,
        CwCellDef,
        CwCellEditorDef,
        CwDataTable,
        CwDataTableColumn,
        CwDataTableEmpty,
        CwDataTableGroup,
        CwEmpty,
        CwEmptyContent,
        CwEmptyDescription,
        CwEmptyHeader,
        CwEmptyMedia,
        CwEmptyTitle,
        CwPriorityIcon,
        CwStatusIcon,
        NgIcon,
      ],
    }),
    applicationConfig({
      providers: [
        provideIcons({
          phosphorDotsThreeBold,
          phosphorFunnelSimpleBold,
          phosphorWarningCircleFill,
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

const TASKS = [
  {
    id: 'CAD-482',
    name: "Corriger l'export CSV des tâches",
    status: 'progress',
    priority: 'haute',
    due: '2026-11-13',
    dueLabel: "Aujourd'hui",
    late: false,
    estimate: 3,
  },
  {
    id: 'CAD-479',
    name: 'Maquetter la vue Calendrier',
    status: 'progress',
    priority: 'moyenne',
    due: '2026-11-18',
    dueLabel: '18 nov.',
    late: false,
    estimate: 5,
  },
  {
    id: 'CAD-471',
    name: 'Migrer les pièces jointes vers un stockage compatible S3',
    status: 'blocked',
    priority: 'urgente',
    due: '2026-11-09',
    dueLabel: '9 nov.',
    late: true,
    estimate: 8,
  },
  {
    id: 'CAD-488',
    name: 'Importer les espaces depuis un export JSON',
    status: 'todo',
    priority: 'moyenne',
    due: '2026-11-26',
    dueLabel: '26 nov.',
    late: false,
    estimate: 2,
  },
  {
    id: 'CAD-491',
    name: "Partage public d'une vue en lecture seule",
    status: 'todo',
    priority: 'basse',
    due: '2026-11-20',
    dueLabel: '20 nov.',
    late: false,
    estimate: 3,
  },
];

const STATUS_LABELS: Record<string, string> = {
  progress: 'En cours',
  blocked: 'Bloqué',
  todo: 'À faire',
};

const PRIORITY_LABELS: Record<string, string> = {
  urgente: 'Priorité urgente',
  haute: 'Priorité haute',
  moyenne: 'Priorité moyenne',
  basse: 'Priorité basse',
};

/* The sheet's default actions become the story's data: the brick has none. */
const BULK_ACTIONS: readonly CwBulkAction[] = [
  { id: 'status', label: 'Statut', shortcut: 'S' },
  { id: 'assign', label: 'Assigner', shortcut: 'A' },
  { id: 'due', label: 'Échéance', shortcut: 'D' },
  { id: 'move', label: 'Déplacer', shortcut: 'M' },
  { id: 'delete', label: 'Supprimer', shortcut: 'Delete', variant: 'destructive' },
];

const PROPS = {
  tasks: TASKS,
  statusLabel: (key: string): string => STATUS_LABELS[key] ?? key,
  priorityLabels: PRIORITY_LABELS,
  statusLabels: STATUS_LABELS,
  rowLabel: (task: { id: string }): string => task.id,
};

/* The columns of the list view (mockup `App.dc.html`): Nom, Statut, Priorité, Échéance,
   Estimation, then the row actions. */
const COLUMNS = `
  <cw-data-table-column key="name" header="Nom" sortable [minWidth]="200" [maxWidth]="640">
    <ng-template cwCell let-t>
      <span class="flex min-w-0 items-center gap-2">
        <span class="truncate font-medium" [attr.title]="t.name">{{ t.name }}</span>
        <span class="shrink-0 font-mono text-xs text-muted-foreground">{{ t.id }}</span>
      </span>
    </ng-template>
  </cw-data-table-column>
  <cw-data-table-column key="status" header="Statut" headerHidden [width]="48" [resizable]="false">
    <ng-template cwCell let-t>
      <span class="flex"><cw-status-icon [status]="t.status" /><span class="sr-only">{{ statusLabels[t.status] }}</span></span>
    </ng-template>
  </cw-data-table-column>
  <cw-data-table-column key="priority" header="Priorité" sortable [width]="96">
    <ng-template cwCell let-t>
      <span class="flex"><cw-priority-icon [priority]="t.priority" /><span class="sr-only">{{ priorityLabels[t.priority] }}</span></span>
    </ng-template>
  </cw-data-table-column>
  <cw-data-table-column key="due" header="Échéance" sortable [width]="112">
    <ng-template cwCell let-t>
      @if (t.late) {
        <span class="flex items-center gap-1 text-xs font-medium text-grenat-text">
          <ng-icon name="phosphorWarningCircleFill" aria-hidden="true" />{{ t.dueLabel }}<span class="sr-only"> (en retard)</span>
        </span>
      } @else {
        <span class="text-xs font-medium text-muted-foreground">{{ t.dueLabel }}</span>
      }
    </ng-template>
  </cw-data-table-column>
  <cw-data-table-column key="estimate" header="Estimation" align="end" sortable [width]="104">
    <ng-template cwCell let-t>
      <span class="tabular-nums">{{ t.estimate }}</span> <span class="text-muted-foreground">pts</span>
    </ng-template>
  </cw-data-table-column>
  <cw-data-table-column key="actions" header="Actions" headerHidden [width]="48" [resizable]="false">
    <ng-template cwCell let-t>
      <button cwButton variant="ghost" size="icon-xs" class="opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100"
              [attr.aria-label]="'Actions de ' + t.id">
        <ng-icon name="phosphorDotsThreeBold" aria-hidden="true" />
      </button>
    </ng-template>
  </cw-data-table-column>`;

const GROUP = `
  <ng-template cwDataTableGroup let-key let-label="label">
    <cw-status-icon [status]="key" /><span class="font-medium">{{ label }}</span>
  </ng-template>`;

/** The list view: grouped by status, sorted by due date then priority, one row ticked, « À faire » folded. */
export const Grouped: Story = {
  render: () => ({
    props: {
      ...PROPS,
      sort: [
        { key: 'due', dir: 'asc' },
        { key: 'priority', dir: 'desc' },
      ] satisfies CwSort[],
      selection: ['CAD-482'],
      collapsed: ['todo'],
    },
    template: `
      <cw-data-table class="w-full" ariaLabel="Tâches de Produit" [data]="tasks" groupBy="status"
                     [groupLabel]="statusLabel" [groupOrder]="['progress', 'blocked', 'todo']" [page]="null"
                     [rowLabel]="rowLabel" [(sort)]="sort" [(selection)]="selection" [(collapsed)]="collapsed">
        ${GROUP}
        ${COLUMNS}
      </cw-data-table>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    const todo = scope.getByRole('button', { name: /À faire/ });
    await expect(todo).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(todo);
    await expect(todo).toHaveAttribute('aria-expanded', 'true');
    await expect(scope.getByRole('checkbox', { name: 'Sélectionner CAD-488' })).toBeInTheDocument();
  },
};

/** Flat, sorted by name descending, compact density (32 px rows). */
export const FlatCompact: Story = {
  render: () => ({
    props: { ...PROPS, sort: [{ key: 'name', dir: 'desc' }] satisfies CwSort[] },
    template: `
      <cw-data-table class="w-full" ariaLabel="Tâches du sprint" [data]="tasks" density="compact"
                     [page]="null" [rowLabel]="rowLabel" [(sort)]="sort">
        ${COLUMNS}
      </cw-data-table>`,
  }),
};

/** Comfortable density (44 px rows), for touch screens. */
export const Comfortable: Story = {
  render: () => ({
    props: PROPS,
    template: `
      <cw-data-table class="w-full" ariaLabel="Tâches du sprint" [data]="tasks" density="comfortable"
                     [page]="null" [rowLabel]="rowLabel">
        ${COLUMNS}
      </cw-data-table>`,
  }),
};

/** Loading: eight shimmer rows at the geometry of the columns, `aria-busy` on the grid. */
export const Loading: Story = {
  render: () => ({
    props: PROPS,
    template: `
      <cw-data-table class="w-full" ariaLabel="Tâches de Produit" [data]="[]" loading [page]="null">
        ${COLUMNS}
      </cw-data-table>`,
  }),
  play: async ({ canvasElement }) => {
    const grid = within(light(canvasElement)).getByRole('grid', { name: 'Tâches de Produit' });
    await expect(grid).toHaveAttribute('aria-busy', 'true');
  },
};

/** No row matches the filters: the projected Empty, with its way out. */
export const Empty: Story = {
  render: () => ({
    props: PROPS,
    template: `
      <cw-data-table class="w-full" ariaLabel="Tâches de Produit" [data]="[]" [page]="null">
        ${COLUMNS}
        <cw-empty cwDataTableEmpty size="sm" role="status">
          <cw-empty-header>
            <cw-empty-media><ng-icon name="phosphorFunnelSimpleBold" aria-hidden="true" /></cw-empty-media>
            <cw-empty-title>Aucune tâche ne correspond aux filtres</cw-empty-title>
            <cw-empty-description>3 filtres actifs · 128 tâches dans la liste</cw-empty-description>
          </cw-empty-header>
          <cw-empty-content>
            <button cwButton variant="outline" size="sm">Tout effacer</button>
          </cw-empty-content>
        </cw-empty>
      </cw-data-table>`,
  }),
};

/** Loading failed: a destructive Alert in the body with « Réessayer ». */
export const LoadError: Story = {
  render: () => ({
    props: PROPS,
    template: `
      <cw-data-table class="w-full" ariaLabel="Tâches de Produit" [data]="[]" [page]="null"
                     error="Impossible de charger les tâches">
        ${COLUMNS}
      </cw-data-table>`,
  }),
};

/** Paged (advanced search, administration): « 1–2 sur 5 tâches », page size and page controls. */
export const Paginated: Story = {
  render: () => ({
    props: { ...PROPS, page: 1, pageSize: 2 },
    template: `
      <cw-data-table class="w-full" ariaLabel="Résultats de la recherche" [data]="tasks" [pageSizes]="[2, 5]"
                     [rowLabel]="rowLabel" [(page)]="page" [(pageSize)]="pageSize"
                     [texts]="{ pagination: 'Pagination ' + cwTheme }">
        ${COLUMNS}
      </cw-data-table>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    await expect(scope.getByText('1–2 sur 5 tâches')).toBeVisible();
    const nav = scope.getByRole('navigation', { name: 'Pagination light' });
    await userEvent.click(within(nav).getByRole('button', { name: 'Page suivante' }));
    await expect(scope.getByText('3–4 sur 5 tâches')).toBeVisible();
  },
};

/** A selection: the floating bar with the consumer's actions and their shortcuts. */
export const BulkActions: Story = {
  render: () => ({
    props: { ...PROPS, actions: BULK_ACTIONS, selection: ['CAD-482', 'CAD-479', 'CAD-471'] },
    template: `
      <cw-data-table class="w-full" ariaLabel="Tâches de Sprint 14" [data]="tasks" [page]="null"
                     [rowLabel]="rowLabel" [bulkActions]="actions" [(selection)]="selection">
        ${COLUMNS}
      </cw-data-table>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    const bar = scope.getByRole('toolbar', { name: 'Actions sur la sélection' });
    await expect(bar).toHaveTextContent('3 tâches sélectionnées');
    await expect(
      scope.getByRole('checkbox', { name: 'Tout sélectionner sur la page' }),
    ).toHaveAttribute('aria-checked', 'mixed');
    await expect(within(bar).getByRole('button', { name: /Statut/ })).toHaveAttribute(
      'aria-keyshortcuts',
      'S',
    );
  },
};

/** Inline edit: F2 opens the editor of the name, Enter validates, Escape cancels. */
export const InlineEdit: Story = {
  render: () => ({
    props: { ...PROPS, edited: '' },
    template: `
      <cw-data-table class="w-full" ariaLabel="Tâches de Produit" [data]="tasks" [page]="null"
                     [rowLabel]="rowLabel" (cellEdit)="edited = $event.value">
        <cw-data-table-column key="name" header="Nom" sortable>
          <ng-template cwCell let-t><span class="truncate font-medium">{{ t.name }}</span></ng-template>
          <ng-template cwCellEditor let-t let-commit="commit">
            <input [attr.aria-label]="'Nom de ' + t.id" [value]="t.name"
                   class="-mx-1.5 h-7 w-[calc(100%+12px)] rounded-md border border-input bg-background px-[5px] text-sm font-medium outline-hidden focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
                   (keydown.enter)="commit($any($event.target).value)" (blur)="commit($any($event.target).value)" />
          </ng-template>
        </cw-data-table-column>
        <cw-data-table-column key="estimate" header="Estimation" align="end" [width]="104" />
      </cw-data-table>
      <p class="text-sm text-muted-foreground">Dernière valeur : {{ edited || '—' }}</p>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    const cell = scope.getByRole('gridcell', { name: "Corriger l'export CSV des tâches" });
    cell.focus();
    await userEvent.keyboard('{F2}');
    const field = scope.getByRole('textbox', { name: 'Nom de CAD-482' });
    await expect(field).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await expect(scope.queryByRole('textbox', { name: 'Nom de CAD-482' })).toBeNull();
    await expect(cell).toHaveFocus();
  },
};

/** Keyboard: one tab stop, arrows between cells, Space ticks the row, Escape empties the selection. */
export const Keyboard: Story = {
  render: () => ({
    props: { ...PROPS, selection: [] },
    template: `
      <cw-data-table class="w-full" ariaLabel="Tâches de Produit" [data]="tasks" [page]="null"
                     [rowLabel]="rowLabel" [(selection)]="selection">
        ${COLUMNS}
      </cw-data-table>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    const tick = scope.getByRole('checkbox', { name: 'Sélectionner CAD-482' });
    const first = tick.closest<HTMLElement>('[role="gridcell"]');
    first?.focus();
    await expect(first).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(scope.getByRole('gridcell', { name: /Corriger l'export CSV/ })).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(tick).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard('{Escape}');
    await expect(tick).toHaveAttribute('aria-checked', 'false');
  },
};

/** Sorting: a click sorts ascending, then descending; Shift + click adds a secondary criterion. */
export const Sorting: Story = {
  render: () => ({
    props: { ...PROPS, sort: [] },
    template: `
      <cw-data-table class="w-full" ariaLabel="Tâches de Produit" [data]="tasks" [page]="null"
                     [rowLabel]="rowLabel" [(sort)]="sort">
        ${COLUMNS}
      </cw-data-table>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    await userEvent.click(scope.getByRole('button', { name: /^Priorité/ }));
    await expect(scope.getByRole('columnheader', { name: /Priorité/ })).toHaveAttribute(
      'aria-sort',
      'ascending',
    );
    // One user session, so the held Shift key reaches the click.
    const user = userEvent.setup();
    await user.keyboard('{Shift>}');
    await user.click(scope.getByRole('button', { name: /^Estimation/ }));
    await user.keyboard('{/Shift}');
    await expect(scope.getByRole('button', { name: /^Estimation/ })).toHaveAccessibleName(
      /Estimation.*tri secondaire croissant/,
    );
  },
};

/** Columns: resize handles (← → by 8 px, Shift by 32 px), drag a header to reorder. */
export const ResizableColumns: Story = {
  render: () => ({
    props: { ...PROPS, widths: { due: 112 } },
    template: `
      <cw-data-table class="w-full" ariaLabel="Tâches de Produit" [data]="tasks" [page]="null"
                     [rowLabel]="rowLabel" [(columnWidths)]="widths">
        ${COLUMNS}
      </cw-data-table>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    const handle = scope.getByRole('separator', { name: 'Largeur de la colonne Échéance' });
    handle.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(handle).toHaveAttribute('aria-valuenow', '120');
    await userEvent.keyboard('{Shift>}{ArrowLeft}{/Shift}');
    await expect(handle).toHaveAttribute('aria-valuenow', '88');
  },
};

/** Read only (guests, closed sprint): no checkbox column, no editor. */
export const ReadOnly: Story = {
  render: () => ({
    props: PROPS,
    template: `
      <cw-data-table class="w-full" ariaLabel="Tâches du sprint 13" [data]="tasks" [page]="null"
                     [selectable]="false" [editable]="false" [resizableColumns]="false" [reorderableColumns]="false">
        ${COLUMNS}
      </cw-data-table>`,
  }),
};
