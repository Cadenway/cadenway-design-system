import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwCellDef } from './cell/cell.directive';
import { CwCellEditorDef } from './cell-editor/cell-editor.directive';
import { CwDataTableColumn } from './data-table-column/data-table-column.component';
import { CwDataTableEmpty } from './data-table-empty/data-table-empty.directive';
import { CwDataTable } from './data-table.component';
import type {
  CwBulkAction,
  CwBulkActionEvent,
  CwCellEditEvent,
  CwColumnResizeEvent,
  CwDataTableSelection,
  CwSort,
} from './data-table.types';

/**
 * Interface Task
 *
 * @description
 * Row data used by the table fixture.
 */
interface Task {
  // #region Properties
  /**
   * Property id
   *
   * @description
   * Stable task identifier.
   *
   * @type {string}
   * @readonly
   */
  readonly id: string;

  /**
   * Property name
   *
   * @description
   * Displayed task name.
   *
   * @type {string}
   * @readonly
   */
  readonly name: string;

  /**
   * Property status
   *
   * @description
   * Task status used for grouping.
   *
   * @type {string}
   * @readonly
   */
  readonly status: string;

  /**
   * Property estimate
   *
   * @description
   * Task estimate used for numeric sorting.
   *
   * @type {number}
   * @readonly
   */
  readonly estimate: number;
  // #endregion
}

/**
 * Constant TASKS
 *
 * @description
 * Rows supplied to the table fixture.
 *
 * @type {readonly Task[]}
 */
const TASKS: readonly Task[] = [
  { id: 'CAD-482', name: "Corriger l'export CSV", status: 'progress', estimate: 3 },
  { id: 'CAD-479', name: 'Maquetter la vue Calendrier', status: 'progress', estimate: 5 },
  { id: 'CAD-471', name: 'Migrer les pièces jointes', status: 'blocked', estimate: 8 },
  { id: 'CAD-488', name: 'Importer les espaces', status: 'todo', estimate: 2 },
];

/**
 * Constant ACTIONS
 *
 * @description
 * Bulk actions supplied to the table fixture.
 *
 * @type {readonly CwBulkAction[]}
 */
const ACTIONS: readonly CwBulkAction[] = [
  { id: 'status', label: 'Statut', shortcut: 'S' },
  { id: 'delete', label: 'Supprimer', shortcut: 'Delete', variant: 'destructive' },
];

/**
 * Component Host
 *
 * @description
 * Hosts the table and records emitted interactions.
 */
@Component({
  imports: [CwDataTable, CwDataTableColumn, CwCellDef, CwCellEditorDef, CwDataTableEmpty],
  template: `
    <cw-data-table
      ariaLabel="Tâches de Produit"
      [data]="data()"
      [groupBy]="groupBy()"
      [groupLabel]="groupLabel"
      [(page)]="page"
      [pageSize]="pageSize()"
      [loading]="loading()"
      [bulkActions]="actions"
      [(sort)]="sort"
      [(selection)]="selection"
      [(collapsed)]="collapsed"
      [(columnWidths)]="widths"
      [(columnOrder)]="order"
      [(columnVisibility)]="visibility"
      (rowOpen)="opened.set($event)"
      (cellEdit)="edits.push($event)"
      (bulkAction)="bulk.push($event)"
      (columnResize)="resizes.push($event)"
    >
      <cw-data-table-column key="name" header="Nom" sortable>
        <ng-template cwCell let-task>
          <span>{{ task.name }}</span>
        </ng-template>
        <ng-template cwCellEditor let-task let-commit="commit">
          <input
            aria-label="Nom de la tâche"
            [value]="task.name"
            (keydown.enter)="commit($any($event.target).value)"
          />
        </ng-template>
      </cw-data-table-column>
      <cw-data-table-column key="status" header="Statut" sortable />
      <cw-data-table-column
        key="estimate"
        header="Estimation"
        align="end"
        sortable
        [minWidth]="72"
      />
      @if (projectEmpty()) {
        <p cwDataTableEmpty>Aucun résultat pour « export pdf »</p>
      }
    </cw-data-table>
  `,
})
class Host {
  // #region Properties
  /**
   * Property data
   *
   * @description
   * Rows displayed by the table.
   *
   * @type {WritableSignal<readonly Task[]>}
   * @readonly
   */
  public readonly data: WritableSignal<readonly Task[]> = signal<readonly Task[]>(TASKS);

  /**
   * Property groupBy
   *
   * @description
   * Column used for grouping.
   *
   * @type {WritableSignal<string | null>}
   * @readonly
   */
  public readonly groupBy: WritableSignal<string | null> = signal<string | null>(null);

  /**
   * Property page
   *
   * @description
   * Current page controlled by the fixture.
   *
   * @type {WritableSignal<number | null>}
   * @readonly
   */
  public readonly page: WritableSignal<number | null> = signal<number | null>(null);

  /**
   * Property pageSize
   *
   * @description
   * Rows per page.
   *
   * @type {WritableSignal<number>}
   * @readonly
   */
  public readonly pageSize: WritableSignal<number> = signal(50);

  /**
   * Property loading
   *
   * @description
   * Whether the loading state is displayed.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  public readonly loading: WritableSignal<boolean> = signal(false);

  /**
   * Property projectEmpty
   *
   * @description
   * Whether custom empty-state content is projected.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  public readonly projectEmpty: WritableSignal<boolean> = signal(false);

  /**
   * Property sort
   *
   * @description
   * Sort criteria controlled by the fixture.
   *
   * @type {WritableSignal<readonly CwSort[]>}
   * @readonly
   */
  public readonly sort: WritableSignal<readonly CwSort[]> = signal<readonly CwSort[]>([]);

  /**
   * Property selection
   *
   * @description
   * Selected row identifiers.
   *
   * @type {WritableSignal<CwDataTableSelection>}
   * @readonly
   */
  public readonly selection: WritableSignal<CwDataTableSelection> = signal<CwDataTableSelection>(
    [],
  );

  /**
   * Property collapsed
   *
   * @description
   * Folded group identifiers.
   *
   * @type {WritableSignal<readonly string[]>}
   * @readonly
   */
  public readonly collapsed: WritableSignal<readonly string[]> = signal<readonly string[]>([]);

  /**
   * Property widths
   *
   * @description
   * Column widths controlled by the fixture.
   *
   * @type {WritableSignal<Readonly<Record<string, number>>>}
   * @readonly
   */
  public readonly widths: WritableSignal<Readonly<Record<string, number>>> = signal<
    Readonly<Record<string, number>>
  >({});

  /**
   * Property order
   *
   * @description
   * Column order controlled by the fixture.
   *
   * @type {WritableSignal<readonly string[]>}
   * @readonly
   */
  public readonly order: WritableSignal<readonly string[]> = signal<readonly string[]>([]);

  /**
   * Property visibility
   *
   * @description
   * Column visibility controlled by the fixture.
   *
   * @type {WritableSignal<Readonly<Record<string, boolean>>>}
   * @readonly
   */
  public readonly visibility: WritableSignal<Readonly<Record<string, boolean>>> = signal<
    Readonly<Record<string, boolean>>
  >({});

  /**
   * Property opened
   *
   * @description
   * Last row opened by the table.
   *
   * @type {WritableSignal<Task | null>}
   * @readonly
   */
  public readonly opened: WritableSignal<Task | null> = signal<Task | null>(null);

  /**
   * Property edits
   *
   * @description
   * Cell edits emitted by the table.
   *
   * @type {CwCellEditEvent<Task>[]}
   * @readonly
   */
  public readonly edits: CwCellEditEvent<Task>[] = [];

  /**
   * Property bulk
   *
   * @description
   * Bulk actions emitted by the table.
   *
   * @type {CwBulkActionEvent[]}
   * @readonly
   */
  public readonly bulk: CwBulkActionEvent[] = [];

  /**
   * Property resizes
   *
   * @description
   * Column resizes emitted by the table.
   *
   * @type {CwColumnResizeEvent[]}
   * @readonly
   */
  public readonly resizes: CwColumnResizeEvent[] = [];

  /**
   * Property actions
   *
   * @description
   * Bulk actions available in the fixture.
   *
   * @type {readonly CwBulkAction[]}
   * @readonly
   */
  public readonly actions: readonly CwBulkAction[] = ACTIONS;

  /**
   * Property groupLabel
   *
   * @description
   * Formats a group label for the fixture.
   *
   * @type {(key: string) => string}
   * @readonly
   */
  public readonly groupLabel: (key: string) => string = (key: string): string =>
    ({ progress: 'En cours', blocked: 'Bloqué', todo: 'À faire' })[key] ?? key;
  // #endregion
}

/**
 * Function byRole
 *
 * @description
 * Finds elements with a role and optional accessible name.
 *
 * @param {HTMLElement} root - Fixture element to search.
 * @param {string} role - ARIA role to find.
 * @param {string} name - Accessible name to find, when provided.
 * @returns {HTMLElement[]} Matching elements.
 */
function byRole(root: HTMLElement, role: string, name?: string): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(`[role="${role}"]`)).filter(
    (element) =>
      name === undefined ||
      element.getAttribute('aria-label') === name ||
      element.textContent.replace(/\s+/g, ' ').trim() === name,
  );
}

/**
 * Function one
 *
 * @description
 * Finds one element by role and accessible name.
 *
 * @param {HTMLElement} root - Fixture element to search.
 * @param {string} role - ARIA role to find.
 * @param {string} name - Accessible name to find, when provided.
 * @returns {HTMLElement} Matching element.
 */
function one(root: HTMLElement, role: string, name: string): HTMLElement {
  const found: HTMLElement | undefined = byRole(root, role, name).at(0);
  if (!found) throw new Error(`No ${role} named ${name}`);
  return found;
}

/**
 * Function button
 *
 * @description
 * Finds a button by accessible name.
 *
 * @param {HTMLElement} root - Fixture element to search.
 * @param {string} name - Accessible name to find, when provided.
 * @returns {HTMLButtonElement} Matching button.
 */
function button(root: HTMLElement, name: string): HTMLButtonElement {
  const found: HTMLButtonElement | undefined = Array.from(root.querySelectorAll('button')).find(
    (element) => {
      const label: string =
        element.getAttribute('aria-label') ?? element.textContent.replace(/\s+/g, ' ');
      return label.trim().startsWith(name);
    },
  );
  if (!found) throw new Error(`No button named ${name}`);
  return found;
}

/**
 * Function dataRows
 *
 * @description
 * Finds rendered data rows.
 *
 * @param {HTMLElement} root - Fixture element to search.
 * @returns {HTMLElement[]} Rendered data row elements.
 */
function dataRows(root: HTMLElement): HTMLElement[] {
  return byRole(root, 'row').filter((row) => row.hasAttribute('aria-selected'));
}

/**
 * Function names
 *
 * @description
 * Reads displayed task names from the table.
 *
 * @param {HTMLElement} root - Fixture element to search.
 * @returns {string[]} Displayed task names.
 */
function names(root: HTMLElement): string[] {
  return dataRows(root).map((row) => byRole(row, 'gridcell')[1]?.textContent.trim() ?? '');
}

/**
 * Function required
 *
 * @description
 * Returns a value or fails the test when it is missing.
 *
 * @param {V | null | undefined} value - Value that must be present.
 * @returns {V} Non-null value.
 */
function required<V>(value: V | null | undefined): V {
  if (value === null || value === undefined) throw new Error('Missing element');
  return value;
}

/**
 * Function key
 *
 * @description
 * Dispatches a keyboard event to an element.
 *
 * @param {Element} target - Element receiving the keyboard event.
 * @param {KeyboardEventInit} init - Keyboard event options.
 * @returns {KeyboardEvent} Dispatched keyboard event.
 */
function key(target: Element, init: KeyboardEventInit): KeyboardEvent {
  const event: KeyboardEvent = new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    ...init,
  });
  target.dispatchEvent(event);
  return event;
}

describe('CwDataTable', () => {
  let fixture: ComponentFixture<Host>;
  let host: HTMLElement;
  let component: Host;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    component = fixture.componentInstance;
    host = fixture.nativeElement as HTMLElement;
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  /**
   * Function stable
   *
   * @description
   * Waits for the fixture to settle.
   * @returns {Promise<void>} Promise resolved when the fixture settles.
   */
  async function stable(): Promise<void> {
    await fixture.whenStable();
  }

  describe('rows and columns', () => {
    it('renders a named grid with a header and one row per item', () => {
      const grid: HTMLElement = one(host, 'grid', 'Tâches de Produit');
      expect(grid.getAttribute('aria-multiselectable')).toBe('true');
      expect(grid.getAttribute('aria-rowcount')).toBe('5');
      expect(grid.getAttribute('aria-colcount')).toBe('4');
      expect(byRole(host, 'columnheader').map((th) => th.textContent.trim())).toEqual([
        '',
        'Nom',
        'Statut',
        'Estimation',
      ]);
      expect(names(host)).toEqual(TASKS.map((task) => task.name));
    });

    it('renders the default cell from the row value', () => {
      const [first]: HTMLElement[] = dataRows(host);
      expect(byRole(first, 'gridcell')[3].textContent.trim()).toBe('3');
    });

    it('hides a column through columnVisibility, never the first one', async () => {
      component.visibility.set({ status: false, name: false });
      await stable();
      expect(byRole(host, 'columnheader').map((th) => th.textContent.trim())).toEqual([
        '',
        'Nom',
        'Estimation',
      ]);
    });

    it('follows columnOrder', async () => {
      component.order.set(['estimate', 'status']);
      await stable();
      expect(byRole(host, 'columnheader').map((th) => th.textContent.trim())).toEqual([
        '',
        'Nom',
        'Estimation',
        'Statut',
      ]);
    });
  });

  describe('sorting', () => {
    it('cycles ascending, descending, then no sort on click', async () => {
      const sortButton: () => HTMLButtonElement = (): HTMLButtonElement => button(host, 'Nom');
      sortButton().click();
      await stable();
      expect(component.sort()).toEqual([{ key: 'name', dir: 'asc' }]);
      expect(
        one(host, 'columnheader', 'Nom, tri principal croissant').getAttribute('aria-sort'),
      ).toBe('ascending');
      expect(names(host)[0]).toBe("Corriger l'export CSV");

      sortButton().click();
      await stable();
      expect(component.sort()).toEqual([{ key: 'name', dir: 'desc' }]);
      expect(names(host)[0]).toBe('Migrer les pièces jointes');

      sortButton().click();
      await stable();
      expect(component.sort()).toEqual([]);
      expect(names(host)).toEqual(TASKS.map((task) => task.name));
    });

    it('adds a secondary criterion with Shift + click', async () => {
      button(host, 'Statut').click();
      await stable();
      button(host, 'Estimation').dispatchEvent(
        new MouseEvent('click', { bubbles: true, shiftKey: true }),
      );
      await stable();
      expect(component.sort()).toEqual([
        { key: 'status', dir: 'asc' },
        { key: 'estimate', dir: 'asc' },
      ]);
      // blocked, progress (3 then 5), todo
      expect(names(host)).toEqual([
        'Migrer les pièces jointes',
        "Corriger l'export CSV",
        'Maquetter la vue Calendrier',
        'Importer les espaces',
      ]);
      const estimate: HTMLElement | undefined = byRole(host, 'columnheader').find(
        (th) => th.dataset['cwCol'] === 'estimate',
      );
      expect(estimate?.hasAttribute('aria-sort')).toBe(false);
      expect(estimate?.textContent).toContain('tri secondaire croissant');
    });
  });

  describe('selection', () => {
    it('ticks a row and reflects it in the header checkbox', async () => {
      one(host, 'checkbox', 'Sélectionner CAD-479').click();
      await stable();
      expect(component.selection()).toEqual(['CAD-479']);
      expect(dataRows(host)[1].getAttribute('aria-selected')).toBe('true');
      const all: HTMLElement = one(host, 'checkbox', 'Tout sélectionner sur la page');
      expect(all.getAttribute('aria-checked')).toBe('mixed');

      all.click();
      await stable();
      expect([...(component.selection() as string[])].sort()).toEqual(
        TASKS.map((task) => task.id).sort(),
      );
      expect(all.getAttribute('aria-checked')).toBe('true');

      all.click();
      await stable();
      expect(component.selection()).toEqual([]);
    });

    it('selects a range with Shift + click from the anchor', async () => {
      one(host, 'checkbox', 'Sélectionner CAD-482').click();
      await stable();
      one(host, 'checkbox', 'Sélectionner CAD-471').dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true, shiftKey: true }),
      );
      await stable();
      expect(component.selection()).toEqual(['CAD-482', 'CAD-479', 'CAD-471']);
      expect(one(host, 'checkbox', 'Sélectionner CAD-471').getAttribute('aria-checked')).toBe(
        'true',
      );
    });
  });

  describe('grouping', () => {
    beforeEach(async () => {
      component.groupBy.set('status');
      await stable();
    });

    it('renders one group row per value with its count', () => {
      expect(button(host, 'En cours').getAttribute('aria-expanded')).toBe('true');
      expect(button(host, 'En cours').textContent).toContain('2');
      expect(button(host, 'Bloqué').textContent).toContain('1');
      expect(one(host, 'grid', 'Tâches de Produit').getAttribute('aria-rowcount')).toBe('8');
    });

    it('folds a group on click and with ArrowLeft', async () => {
      button(host, 'En cours').click();
      await stable();
      expect(component.collapsed()).toEqual(['progress']);
      expect(button(host, 'En cours').getAttribute('aria-expanded')).toBe('false');
      expect(names(host)).toEqual(['Migrer les pièces jointes', 'Importer les espaces']);

      const blockedCell: HTMLElement = required(
        button(host, 'Bloqué').closest<HTMLElement>('[role="gridcell"]'),
      );
      key(blockedCell, { key: 'ArrowLeft' });
      await stable();
      expect(component.collapsed()).toEqual(['progress', 'blocked']);
    });
  });

  describe('states', () => {
    it('shows skeleton rows and aria-busy while loading', async () => {
      component.loading.set(true);
      await stable();
      expect(one(host, 'grid', 'Tâches de Produit').getAttribute('aria-busy')).toBe('true');
      expect(dataRows(host)).toHaveLength(0);
    });

    it('shows the empty text, or the projected empty content', async () => {
      component.data.set([]);
      await stable();
      expect(one(host, 'status', 'Aucune tâche ne correspond')).toBeTruthy();

      component.projectEmpty.set(true);
      await stable();
      expect(host.textContent).toContain('Aucun résultat pour « export pdf »');
      expect(byRole(host, 'status', 'Aucune tâche ne correspond')).toHaveLength(0);
    });
  });

  describe('keyboard', () => {
    /**
     * Function cell
     *
     * @description
     * Finds a cell by row and column index.
     *
     * @param {number} row - Row index.
     * @param {number} column - Column index.
     * @returns {HTMLElement} Matching grid cell.
     */
    function cell(row: number, column: number): HTMLElement {
      return byRole(dataRows(host)[row], 'gridcell')[column];
    }

    it('keeps a single tab stop and moves it with the arrows', async () => {
      const tabStops: HTMLElement[] = Array.from(
        host.querySelectorAll<HTMLElement>('[tabindex="0"]'),
      );
      expect(tabStops).toHaveLength(1);
      expect(tabStops[0]).toBe(cell(0, 0));

      cell(0, 0).focus();
      key(cell(0, 0), { key: 'ArrowRight' });
      expect(document.activeElement).toBe(cell(0, 1));
      key(cell(0, 1), { key: 'ArrowDown' });
      expect(document.activeElement).toBe(cell(1, 1));
      key(cell(1, 1), { key: 'End' });
      expect(document.activeElement).toBe(cell(1, 3));
      key(cell(1, 3), { key: 'ArrowUp' });
      key(cell(0, 3), { key: 'ArrowUp' });
      expect(document.activeElement?.getAttribute('role')).toBe('columnheader');
      await stable();
      // One cell keeps the tab stop; the controls of that header cell (its resize handle) follow it with Tab.
      const cells: NodeListOf<Element> = host.querySelectorAll(
        '[role="gridcell"][tabindex="0"], [role="columnheader"][tabindex="0"]',
      );
      expect(cells).toHaveLength(1);
      expect(one(host, 'separator', 'Largeur de la colonne Estimation').tabIndex).toBe(0);
    });

    it('ticks the active row with Space and empties the selection with Escape', async () => {
      cell(2, 2).focus();
      key(cell(2, 2), { key: ' ' });
      await stable();
      expect(component.selection()).toEqual(['CAD-471']);
      key(cell(2, 2), { key: 'Escape' });
      await stable();
      expect(component.selection()).toEqual([]);
    });

    it('selects the page with Ctrl + A', async () => {
      key(cell(0, 2), { key: 'a', ctrlKey: true });
      await stable();
      expect(component.selection()).toHaveLength(4);
    });

    it('opens the row with Enter on a cell', () => {
      key(cell(1, 2), { key: 'Enter' });
      expect(component.opened()).toBe(TASKS[1]);
    });
  });

  describe('editing', () => {
    /**
     * Function nameCell
     *
     * @description
     * Finds the name cell in a row.
     *
     * @param {number} row - Row index.
     * @returns {HTMLElement} Name cell in the row.
     */
    function nameCell(row: number): HTMLElement {
      return byRole(dataRows(host)[row], 'gridcell')[1];
    }

    it('opens the editor with F2 and emits cellEdit on commit', async () => {
      key(nameCell(0), { key: 'F2' });
      await stable();
      const field: HTMLInputElement | null = host.querySelector<HTMLInputElement>(
        'input[aria-label="Nom de la tâche"]',
      );
      expect(field).toBeTruthy();
      expect(nameCell(0).hasAttribute('data-editing')).toBe(true);
      expect(document.activeElement).toBe(field);

      required(field).value = 'Exporter en CSV';
      key(required(field), { key: 'Enter' });
      await stable();
      expect(component.edits).toEqual([
        { row: TASKS[0], key: 'name', value: 'Exporter en CSV', previous: TASKS[0].name },
      ]);
      expect(host.querySelector('input[aria-label="Nom de la tâche"]')).toBeNull();
    });

    it('cancels with Escape', async () => {
      nameCell(1).dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
      await stable();
      const field: HTMLInputElement | null = host.querySelector<HTMLInputElement>(
        'input[aria-label="Nom de la tâche"]',
      );
      key(required(field), { key: 'Escape' });
      await stable();
      expect(host.querySelector('input[aria-label="Nom de la tâche"]')).toBeNull();
      expect(component.edits).toEqual([]);
    });
  });

  describe('bulk bar', () => {
    it('appears with a selection and emits the actions', async () => {
      expect(byRole(host, 'toolbar', 'Actions sur la sélection')).toHaveLength(0);
      one(host, 'checkbox', 'Sélectionner CAD-482').click();
      one(host, 'checkbox', 'Sélectionner CAD-488').click();
      await stable();
      const bar: HTMLElement = one(host, 'toolbar', 'Actions sur la sélection');
      expect(bar.textContent).toContain('2 tâches sélectionnées');

      const status: HTMLButtonElement = button(bar, 'Statut');
      expect(status.getAttribute('aria-keyshortcuts')).toBe('S');
      status.click();
      expect(component.bulk).toEqual([
        { action: 'status', ids: ['CAD-482', 'CAD-488'], trigger: status },
      ]);

      const cell: HTMLElement = byRole(dataRows(host)[0], 'gridcell')[2];
      key(cell, { key: 'Delete' });
      expect(component.bulk[1]?.action).toBe('delete');

      button(bar, 'Désélectionner').click();
      await stable();
      expect(component.selection()).toEqual([]);
      expect(byRole(host, 'toolbar', 'Actions sur la sélection')).toHaveLength(0);
    });
  });

  describe('columns', () => {
    it('resizes a column from its handle with the arrows', async () => {
      const handle: HTMLElement = one(host, 'separator', 'Largeur de la colonne Estimation');
      expect(handle.getAttribute('aria-valuemin')).toBe('72');
      component.widths.set({ estimate: 100 });
      await stable();
      key(handle, { key: 'ArrowRight' });
      await stable();
      expect(component.widths()).toEqual({ estimate: 108 });
      key(handle, { key: 'ArrowLeft', shiftKey: true });
      await stable();
      expect(component.widths()).toEqual({ estimate: 76 });
      key(handle, { key: 'Home' });
      await stable();
      expect(component.resizes.at(-1)).toEqual({ key: 'estimate', width: 72 });
      expect(handle.getAttribute('aria-valuenow')).toBe('72');
    });

    it('moves a column with Ctrl + Shift + arrows on its header', async () => {
      const status: HTMLElement | undefined = byRole(host, 'columnheader').find(
        (th) => th.dataset['cwCol'] === 'status',
      );
      key(required(status), { key: 'ArrowRight', ctrlKey: true, shiftKey: true });
      await stable();
      expect(component.order()).toEqual(['name', 'estimate', 'status']);
    });
  });

  describe('pagination', () => {
    beforeEach(async () => {
      component.page.set(1);
      component.pageSize.set(3);
      await stable();
    });

    it('shows the page of rows, its range, and moves between pages', async () => {
      expect(dataRows(host)).toHaveLength(3);
      const nav: HTMLElement = required(
        host.querySelector<HTMLElement>('nav[aria-label="Pagination"]'),
      );
      expect(host.textContent).toContain('1–3 sur 4 tâches');
      expect(host.textContent).toContain('Page 1 sur 2');
      expect(button(nav, 'Page précédente').disabled).toBe(true);

      button(nav, 'Page suivante').click();
      await stable();
      expect(component.page()).toBe(2);
      expect(names(host)).toEqual(['Importer les espaces']);
      expect(host.textContent).toContain('4–4 sur 4 tâches');
      expect(button(nav, 'Page suivante').disabled).toBe(true);
      expect(dataRows(host)[0].getAttribute('aria-rowindex')).toBe('5');
    });

    it('offers to select every matching row once the page is ticked', async () => {
      one(host, 'checkbox', 'Tout sélectionner sur la page').click();
      await stable();
      button(host, 'Sélectionner les 4 tâches').click();
      await stable();
      expect(component.selection()).toBe('all');
      expect(host.textContent).toContain('Les 4 tâches sont sélectionnées');
    });
  });
});
