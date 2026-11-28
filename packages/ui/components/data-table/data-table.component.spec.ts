import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideCwKbdLabels } from '@cadenway/ui/components/kbd';
import { CwMenu, CwMenuItem } from '@cadenway/ui/components/menu';
import { provideCwLocale } from '@cadenway/ui/core';
import { vi } from 'vitest';

import { CwCellDef } from './cell/cell.directive';
import { CwCellEditorDef } from './cell-editor/cell-editor.directive';
import { CwDataTableColumn } from './data-table-column/data-table-column.component';
import { CwDataTableEmpty } from './data-table-empty/data-table-empty.directive';
import { CwFooterCellDef } from './footer-cell/footer-cell.directive';
import { CwDataTable } from './data-table.component';
import { provideCwDataTableTexts } from './data-table.providers';
import type {
  CwBulkAction,
  CwBulkActionEvent,
  CwCellEditEvent,
  CwColumnResizeEvent,
  CwDataTablePhoneLayout,
  CwDataTableSelection,
  CwDataTableTexts,
  CwGroupDef,
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
      [virtual]="virtual()"
      [groupBy]="groupBy()"
      [groupLabel]="groupLabel"
      [(page)]="page"
      [pageSize]="pageSize()"
      [loading]="loading()"
      [bulkActions]="actions"
      [editOn]="editOn()"
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
   * Property virtual
   *
   * @description
   * Enables windowed rendering in the fixture.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  public readonly virtual: WritableSignal<boolean> = signal(false);

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
   * Property editOn
   *
   * @description
   * Pointer gesture that opens a cell editor.
   *
   * @type {WritableSignal<'dblclick' | 'click'>}
   * @readonly
   */
  public readonly editOn: WritableSignal<'dblclick' | 'click'> = signal<'dblclick' | 'click'>(
    'dblclick',
  );

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

  describe('virtual rendering', () => {
    it('windows a long list and preserves its full estimated height while scrolling', async () => {
      component.data.set(
        Array.from({ length: 2000 }, (_, index): Task => ({
          id: String(index),
          name: String(index),
          status: 'a',
          estimate: index,
        })),
      );
      component.virtual.set(true);
      await stable();
      expect(dataRows(host).length).toBeLessThan(50);
      expect(dataRows(host)[0].getAttribute('aria-rowindex')).toBe('2');
      const grid: HTMLElement = one(host, 'grid', 'Tâches de Produit');
      const scroller: HTMLElement = required(grid.parentElement);
      Object.defineProperty(scroller, 'clientHeight', { configurable: true, value: 360 });
      Object.defineProperty(scroller, 'scrollTop', {
        configurable: true,
        writable: true,
        value: 36000,
      });
      scroller.dispatchEvent(new Event('scroll'));
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => {
          resolve();
        }),
      );
      await stable();
      const rows: HTMLElement[] = dataRows(host);
      expect(rows.length).toBeLessThan(50);
      expect(Number(rows[0].getAttribute('aria-rowindex'))).toBeGreaterThan(900);
      expect(Number(rows[0].getAttribute('aria-rowindex'))).toBeLessThan(1010);
      const spacers: HTMLElement[] = Array.from(
        grid.querySelectorAll<HTMLElement>('tbody[aria-hidden="true"] td'),
      );
      expect(spacers).toHaveLength(2);
      expect(
        spacers.reduce((sum: number, cell: HTMLElement) => sum + parseFloat(cell.style.height), 0) +
          rows.length * 36,
      ).toBe(2000 * 36);
    });

    it('keeps a rendered body cell as the tab stop after scrolling an unfocused grid', async () => {
      component.data.set(
        Array.from({ length: 2000 }, (_, index): Task => ({
          id: String(index),
          name: String(index),
          status: 'a',
          estimate: index,
        })),
      );
      component.virtual.set(true);
      await stable();
      const grid: HTMLElement = one(host, 'grid', 'Tâches de Produit');
      const scroller: HTMLElement = required(grid.parentElement);
      Object.defineProperty(scroller, 'clientHeight', { configurable: true, value: 360 });
      Object.defineProperty(scroller, 'scrollTop', {
        configurable: true,
        writable: true,
        value: 36000,
      });
      scroller.dispatchEvent(new Event('scroll'));
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          resolve();
        });
      });
      await stable();
      const stops: HTMLElement[] = Array.from(grid.querySelectorAll<HTMLElement>('[tabindex="0"]'));

      expect(stops).toHaveLength(1);
      expect(stops[0].getAttribute('role')).toBe('gridcell');
      expect(
        Number(stops[0].closest('[role="row"]')?.getAttribute('aria-rowindex')),
      ).toBeGreaterThan(900);
    });

    it('navigates to the last row and retains focus when scrolled away', async () => {
      component.data.set(
        Array.from({ length: 2000 }, (_, index): Task => ({
          id: String(index),
          name: String(index),
          status: 'a',
          estimate: index,
        })),
      );
      component.virtual.set(true);
      await stable();
      const scroller: HTMLElement = required(one(host, 'grid', 'Tâches de Produit').parentElement);
      Object.defineProperty(scroller, 'clientHeight', { configurable: true, value: 360 });
      Object.defineProperty(scroller, 'scrollTop', {
        configurable: true,
        writable: true,
        value: 0,
      });
      scroller.dispatchEvent(new Event('scroll'));
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          resolve();
        });
      });
      await stable();
      const first: HTMLElement = byRole(dataRows(host)[0], 'gridcell')[0];
      first.focus();
      key(first, { key: 'End', ctrlKey: true });
      await stable();
      expect(document.activeElement?.closest('[role="row"]')?.getAttribute('aria-rowindex')).toBe(
        '2001',
      );
      expect(scroller.scrollTop).toBeGreaterThan(0);
      const focused: Element | null = document.activeElement;
      scroller.scrollTop = 0;
      scroller.dispatchEvent(new Event('scroll'));
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          resolve();
        });
      });
      await stable();
      expect(document.activeElement).toBe(focused);
      expect(focused?.isConnected).toBe(true);
      const spacerCells: HTMLElement[] = Array.from(
        host.querySelectorAll<HTMLElement>(
          'tr[aria-hidden="true"] td, tbody[aria-hidden="true"] td',
        ),
      );
      expect(
        spacerCells.reduce(
          (sum: number, cell: HTMLElement) => sum + parseFloat(cell.style.height),
          0,
        ) +
          dataRows(host).length * 36,
      ).toBe(2000 * 36);
    });

    it('moves and extends selection across a window edge', async () => {
      component.data.set(
        Array.from({ length: 2000 }, (_, index): Task => ({
          id: String(index),
          name: String(index),
          status: 'a',
          estimate: index,
        })),
      );
      component.virtual.set(true);
      await stable();
      const scroller: HTMLElement = required(one(host, 'grid', 'Tâches de Produit').parentElement);
      Object.defineProperty(scroller, 'clientHeight', { configurable: true, value: 360 });
      Object.defineProperty(scroller, 'scrollTop', {
        configurable: true,
        writable: true,
        value: 0,
      });
      scroller.dispatchEvent(new Event('scroll'));
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          resolve();
        });
      });
      await stable();
      const rows: HTMLElement[] = dataRows(host);
      const last: HTMLElement = rows[rows.length - 1];
      const index: number = Number(last.getAttribute('aria-rowindex'));
      const cell: HTMLElement = byRole(last, 'gridcell')[0];
      cell.focus();
      key(cell, { key: 'ArrowDown' });
      await stable();
      expect(document.activeElement?.closest('[role="row"]')?.getAttribute('aria-rowindex')).toBe(
        String(index + 1),
      );
      cell.focus();
      key(cell, { key: 'ArrowDown', shiftKey: true });
      await stable();
      expect(document.activeElement?.closest('[role="row"]')?.getAttribute('aria-rowindex')).toBe(
        String(index + 1),
      );
      expect(component.selection()).toEqual([String(index - 2), String(index - 1)]);
    });

    it('navigates through the selection banner as the first body tab stop', async () => {
      component.selection.set('all');
      component.virtual.set(true);
      await stable();
      const banner: HTMLElement = required(
        byRole(host, 'gridcell').find((cell) => cell.textContent.includes('Les 4 tâches')),
      );
      expect(banner.tabIndex).toBe(0);
      const header: HTMLElement = byRole(host, 'columnheader')[0];
      header.focus();
      key(header, { key: 'ArrowDown' });
      await stable();
      expect(document.activeElement).toBe(banner);
      key(banner, { key: 'ArrowDown' });
      await stable();
      expect(document.activeElement?.closest('[role="row"]')).toBe(dataRows(host)[0]);
      key(required(document.activeElement), { key: 'ArrowUp' });
      await stable();
      expect(document.activeElement).toBe(banner);
      key(banner, { key: 'ArrowUp' });
      await stable();
      expect(document.activeElement).toBe(header);
    });

    it('preserves the remembered column across group headers', async () => {
      component.groupBy.set('status');
      component.virtual.set(true);
      await stable();
      const rows: HTMLElement[] = dataRows(host);
      const last: HTMLElement = byRole(rows[1], 'gridcell')[2];
      last.focus();
      key(last, { key: 'ArrowDown' });
      await stable();
      const group: HTMLElement = required(
        button(host, 'Bloqué').closest<HTMLElement>('[role="gridcell"]'),
      );
      expect(document.activeElement).toBe(group);
      key(group, { key: 'ArrowDown' });
      await stable();
      expect(document.activeElement).toBe(byRole(dataRows(host)[2], 'gridcell')[2]);
      key(required(document.activeElement), { key: 'ArrowUp' });
      await stable();
      expect(document.activeElement).toBe(group);
      key(group, { key: 'ArrowDown' });
      await stable();
      expect(document.activeElement).toBe(byRole(dataRows(host)[2], 'gridcell')[2]);
    });

    it('retains the active cell after focus leaves and the window moves', async () => {
      component.data.set(
        Array.from({ length: 1000 }, (_, index): Task => ({
          id: String(index),
          name: String(index),
          status: 'a',
          estimate: index,
        })),
      );
      component.virtual.set(true);
      await stable();
      const scroller: HTMLElement = required(one(host, 'grid', 'Tâches de Produit').parentElement);
      Object.defineProperty(scroller, 'clientHeight', { configurable: true, value: 360 });
      Object.defineProperty(scroller, 'scrollTop', {
        configurable: true,
        writable: true,
        value: 0,
      });
      const cell: HTMLElement = byRole(dataRows(host)[0], 'gridcell')[1];
      cell.focus();
      cell.blur();
      scroller.scrollTop = 18000;
      scroller.dispatchEvent(new Event('scroll'));
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          resolve();
        });
      });
      await stable();
      expect(cell.isConnected).toBe(true);
      expect(cell.tabIndex).toBe(0);
      cell.focus();
      expect(document.activeElement).toBe(cell);
    });

    it('reveals and focuses the next editor after scrolling the edited row away', async () => {
      component.data.set(
        Array.from({ length: 1000 }, (_, index): Task => ({
          id: String(index),
          name: String(index),
          status: 'a',
          estimate: index,
        })),
      );
      component.virtual.set(true);
      await stable();
      const scroller: HTMLElement = required(one(host, 'grid', 'Tâches de Produit').parentElement);
      Object.defineProperty(scroller, 'clientHeight', { configurable: true, value: 360 });
      Object.defineProperty(scroller, 'scrollTop', {
        configurable: true,
        writable: true,
        value: 0,
      });
      const cell: HTMLElement = byRole(dataRows(host)[0], 'gridcell')[1];
      cell.focus();
      key(cell, { key: 'F2' });
      await stable();
      const editor: HTMLInputElement = required(
        host.querySelector<HTMLInputElement>('input[aria-label="Nom de la tâche"]'),
      );
      scroller.scrollTop = 18000;
      scroller.dispatchEvent(new Event('scroll'));
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          resolve();
        });
      });
      await stable();
      expect(editor.isConnected).toBe(true);
      key(editor, { key: 'Tab' });
      await stable();
      expect(document.activeElement?.closest('[role="row"]')?.getAttribute('aria-rowindex')).toBe(
        '3',
      );
      expect(document.activeElement?.getAttribute('aria-label')).toBe('Nom de la tâche');
      expect(scroller.scrollTop).toBeLessThan(100);
    });

    it('keeps separate active and editing rows with every spacer accounting for the gaps', async () => {
      component.data.set(
        Array.from({ length: 1000 }, (_, index): Task => ({
          id: String(index),
          name: String(index),
          status: 'a',
          estimate: index,
        })),
      );
      component.virtual.set(true);
      await stable();
      const scroller: HTMLElement = required(one(host, 'grid', 'Tâches de Produit').parentElement);
      Object.defineProperty(scroller, 'clientHeight', { configurable: true, value: 360 });
      Object.defineProperty(scroller, 'scrollTop', {
        configurable: true,
        writable: true,
        value: 0,
      });
      const edited: HTMLElement = byRole(dataRows(host)[0], 'gridcell')[1];
      edited.focus();
      key(edited, { key: 'F2' });
      await stable();
      const editor: HTMLInputElement = required(
        host.querySelector<HTMLInputElement>('input[aria-label="Nom de la tâche"]'),
      );
      const active: HTMLElement = byRole(dataRows(host)[10], 'gridcell')[1];
      active.focus();
      scroller.scrollTop = 18000;
      scroller.dispatchEvent(new Event('scroll'));
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          resolve();
        });
      });
      await stable();
      expect(editor.isConnected).toBe(true);
      expect(active.isConnected).toBe(true);
      expect(document.activeElement).toBe(active);
      const spacerCells: HTMLElement[] = Array.from(
        host.querySelectorAll<HTMLElement>(
          'tr[aria-hidden="true"] td, tbody[aria-hidden="true"] td',
        ),
      );
      expect(spacerCells.length).toBeGreaterThan(3);
      expect(
        spacerCells.reduce(
          (sum: number, cell: HTMLElement) => sum + parseFloat(cell.style.height),
          0,
        ) +
          dataRows(host).length * 36,
      ).toBe(1000 * 36);
    });

    it('removes scroll listeners when virtual mode is disabled', async () => {
      component.virtual.set(true);
      await stable();
      component.virtual.set(false);
      await stable();
      const scroller: HTMLElement = required(one(host, 'grid', 'Tâches de Produit').parentElement);
      const frame: { mockRestore: () => void } = vi.spyOn(globalThis, 'requestAnimationFrame');
      scroller.dispatchEvent(new Event('scroll'));
      expect(frame).not.toHaveBeenCalled();
      frame.mockRestore();
    });

    it('does not schedule scroll measurements while virtual mode is disabled', () => {
      const scroller: HTMLElement = required(one(host, 'grid', 'Tâches de Produit').parentElement);
      const frame: { mockRestore: () => void } = vi.spyOn(globalThis, 'requestAnimationFrame');
      scroller.dispatchEvent(new Event('scroll'));
      expect(frame).not.toHaveBeenCalled();
      expect(dataRows(host)).toHaveLength(4);
      frame.mockRestore();
    });

    it('resets the virtual window when changing pages', async () => {
      component.data.set(
        Array.from({ length: 300 }, (_, index): Task => ({
          id: String(index),
          name: String(index),
          status: 'a',
          estimate: index,
        })),
      );
      component.page.set(1);
      component.pageSize.set(100);
      component.virtual.set(true);
      await stable();
      const scroller: HTMLElement = required(one(host, 'grid', 'Tâches de Produit').parentElement);
      Object.defineProperty(scroller, 'clientHeight', { configurable: true, value: 360 });
      Object.defineProperty(scroller, 'scrollTop', {
        configurable: true,
        writable: true,
        value: 2000,
      });
      scroller.dispatchEvent(new Event('scroll'));
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          resolve();
        });
      });
      await stable();
      button(host, 'Page suivante').click();
      await stable();
      expect(scroller.scrollTop).toBe(0);
      expect(dataRows(host)[0].getAttribute('aria-rowindex')).toBe('102');
    });

    it('disables row entry motion only in virtual mode', async () => {
      const group: HTMLElement = required(
        dataRows(host)[0].closest<HTMLElement>('[role="rowgroup"]'),
      );
      expect(group.className).toContain('animate-item-in');
      component.virtual.set(true);
      await stable();
      const virtualGroup: HTMLElement = required(
        dataRows(host)[0].closest<HTMLElement>('[role="rowgroup"]'),
      );
      expect(virtualGroup.className).not.toContain('animate-item-in');
      component.virtual.set(false);
      await stable();
      expect(
        required(dataRows(host)[0].closest<HTMLElement>('[role="rowgroup"]')).className,
      ).toContain('animate-item-in');
    });

    it('releases focus outside the grid while retaining the active row tab stop', async () => {
      component.data.set(
        Array.from({ length: 1000 }, (_, index): Task => ({
          id: String(index),
          name: String(index),
          status: 'a',
          estimate: index,
        })),
      );
      component.virtual.set(true);
      await stable();
      const scroller: HTMLElement = required(one(host, 'grid', 'Tâches de Produit').parentElement);
      Object.defineProperty(scroller, 'clientHeight', { configurable: true, value: 360 });
      Object.defineProperty(scroller, 'scrollTop', {
        configurable: true,
        writable: true,
        value: 0,
      });
      const active: HTMLElement = byRole(dataRows(host)[0], 'gridcell')[1];
      active.focus();
      const outside: HTMLButtonElement = document.createElement('button');
      document.body.append(outside);
      outside.focus();
      scroller.scrollTop = 18000;
      scroller.dispatchEvent(new Event('scroll'));
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          resolve();
        });
      });
      await stable();
      expect(document.activeElement).toBe(outside);
      expect(active.isConnected).toBe(true);
      expect(active.tabIndex).toBe(0);
      outside.remove();
    });

    it('measures and observes desktop rows as their projected content changes height', async () => {
      let rowHeight: number = 80;
      const heights: { mockRestore: () => void } = vi
        .spyOn(HTMLElement.prototype, 'offsetHeight', 'get')
        .mockImplementation(function (this: HTMLElement): number {
          if (!this.hasAttribute('aria-selected')) return 0;
          return this.getAttribute('aria-rowindex') === '2' ? rowHeight : 36;
        });
      const observed: Set<Element> = new Set<Element>();
      let callback: ResizeObserverCallback | null = null;
      vi.stubGlobal(
        'ResizeObserver',
        vi.fn().mockImplementation(function (handler: ResizeObserverCallback) {
          callback = handler;
          return {
            observe: (element: Element): void => {
              observed.add(element);
            },
            unobserve: (element: Element): void => {
              observed.delete(element);
            },
            disconnect: (): void => {
              observed.clear();
            },
          };
        }),
      );
      try {
        component.data.set(
          Array.from({ length: 100 }, (_, index): Task => ({
            id: String(index),
            name: String(index),
            status: 'a',
            estimate: index,
          })),
        );
        const grid: HTMLElement = one(host, 'grid', 'Tâches de Produit');
        const scroller: HTMLElement = required(grid.parentElement);
        Object.defineProperty(scroller, 'clientHeight', { configurable: true, value: 360 });
        component.virtual.set(true);
        await stable();
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              resolve();
            });
          });
        });
        await stable();
        const first: HTMLElement = dataRows(host)[0];
        expect(observed.has(first)).toBe(true);
        const total: () => number = (): number => {
          const spacers: HTMLElement[] = Array.from(
            grid.querySelectorAll<HTMLElement>(
              'tr[aria-hidden="true"] td, tbody[aria-hidden="true"] td',
            ),
          );
          return (
            spacers.reduce(
              (sum: number, cell: HTMLElement) => sum + parseFloat(cell.style.height),
              0,
            ) + dataRows(host).reduce((sum: number, row: HTMLElement) => sum + row.offsetHeight, 0)
          );
        };
        expect(total()).toBe(100 * 36 + 44);
        rowHeight = 120;
        required<ResizeObserverCallback>(callback)([], {} as ResizeObserver);
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              resolve();
            });
          });
        });
        await stable();
        expect(total()).toBe(100 * 36 + 84);
        Object.defineProperty(scroller, 'scrollTop', {
          configurable: true,
          writable: true,
          value: 3000,
        });
        scroller.dispatchEvent(new Event('scroll'));
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              resolve();
            });
          });
        });
        await stable();
        expect(observed.has(first)).toBe(false);
        expect(observed.has(dataRows(host)[0])).toBe(true);
        expect(
          [...observed]
            .filter((element: Element) => element.tagName === 'TR')
            .every((element: Element) => element.hasAttribute('aria-selected')),
        ).toBe(true);
        expect(total()).toBe(100 * 36 + 84);

        // New data may change rows that are not rendered: their cached heights are dropped.
        component.data.set(component.data().map((task: Task): Task => ({ ...task })));
        await stable();
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              resolve();
            });
          });
        });
        await stable();
        expect(total()).toBe(100 * 36);
      } finally {
        heights.mockRestore();
        vi.unstubAllGlobals();
      }
    });

    it('does not rebuild the desktop model when rendered rows keep their density heights', async () => {
      const heights: { mockRestore: () => void } = vi
        .spyOn(HTMLElement.prototype, 'offsetHeight', 'get')
        .mockImplementation(function (this: HTMLElement): number {
          return this.hasAttribute('aria-selected') ? 36 : 0;
        });
      let callback: ResizeObserverCallback | null = null;
      vi.stubGlobal(
        'ResizeObserver',
        vi.fn().mockImplementation(function (handler: ResizeObserverCallback) {
          callback = handler;
          return { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() };
        }),
      );
      try {
        component.data.set(
          Array.from({ length: 100 }, (_, index): Task => ({
            id: String(index),
            name: String(index),
            status: 'a',
            estimate: index,
          })),
        );
        component.virtual.set(true);
        await stable();
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              resolve();
            });
          });
        });
        await stable();
        const lookups: { mock: { calls: unknown[][] }; mockRestore: () => void } = vi.spyOn(
          Map.prototype,
          'get',
        );
        required<ResizeObserverCallback>(callback)([], {} as ResizeObserver);
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              resolve();
            });
          });
        });
        await stable();
        const unseen: number = lookups.mock.calls.filter(
          (args: unknown[]) => args[0] === 'r:99',
        ).length;
        lookups.mockRestore();
        expect(unseen).toBe(0);
      } finally {
        heights.mockRestore();
        vi.unstubAllGlobals();
      }
    });

    it('measures mobile rows independently and anchors the viewport as heights change', async () => {
      const media: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(
        window,
        'matchMedia',
      );
      Object.defineProperty(window, 'matchMedia', {
        configurable: true,
        value: (): { matches: boolean } => ({ matches: true }),
      });
      let firstHeight: number = 40;
      let uniformHeight: boolean = false;
      const heights: { mockRestore: () => void } = vi
        .spyOn(HTMLElement.prototype, 'offsetHeight', 'get')
        .mockImplementation(function (this: HTMLElement): number {
          if (this.getAttribute('role') !== 'row') return 0;
          if (uniformHeight) return 80;
          const index: number = Number(this.getAttribute('aria-rowindex'));
          if (index === 2) return firstHeight;
          return index >= 2 ? (index % 2 === 0 ? 40 : 60) : 0;
        });
      try {
        component.data.set(
          Array.from({ length: 1000 }, (_, index): Task => ({
            id: String(index),
            name: String(index),
            status: 'a',
            estimate: index,
          })),
        );
        const grid: HTMLElement = one(host, 'grid', 'Tâches de Produit');
        const scroller: HTMLElement = required(grid.parentElement);
        Object.defineProperty(scroller, 'clientHeight', { configurable: true, value: 360 });
        Object.defineProperty(scroller, 'scrollTop', {
          configurable: true,
          writable: true,
          value: 0,
        });
        component.virtual.set(true);
        await stable();
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              resolve();
            });
          });
        });
        await stable();
        const total: () => number = (): number => {
          const spacers: HTMLElement[] = Array.from(
            grid.querySelectorAll<HTMLElement>(
              'tr[aria-hidden="true"] td, tbody[aria-hidden="true"] td',
            ),
          );
          return (
            spacers.reduce(
              (sum: number, cell: HTMLElement) => sum + parseFloat(cell.style.height),
              0,
            ) + dataRows(host).reduce((sum: number, row: HTMLElement) => sum + row.offsetHeight, 0)
          );
        };
        expect(total()).toBeCloseTo(1000 * ((11 * 40 + 10 * 60) / 21), 5);
        const first: HTMLElement = byRole(dataRows(host)[0], 'gridcell')[1];
        first.focus();
        scroller.scrollTop = 10000;
        scroller.dispatchEvent(new Event('scroll'));
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              resolve();
            });
          });
        });
        await stable();
        const target: HTMLElement = dataRows(host)[15];
        const position: () => number = (): number => {
          let offset: number = 0;
          for (const row of Array.from(grid.querySelectorAll<HTMLElement>('tr'))) {
            if (row === target) return offset - scroller.scrollTop;
            if (
              row.getAttribute('aria-hidden') === 'true' ||
              row.parentElement?.getAttribute('aria-hidden') === 'true'
            )
              offset += parseFloat(required(row.querySelector<HTMLElement>('td')).style.height);
            else if (row.hasAttribute('aria-selected')) offset += row.offsetHeight;
          }
          throw new Error('Anchor row missing');
        };
        const before: number = position();
        firstHeight = 80;
        scroller.dispatchEvent(new Event('scroll'));
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              resolve();
            });
          });
        });
        await stable();
        expect(position()).toBeCloseTo(before, 5);
        const beforeRows: HTMLElement[] = dataRows(host);
        let mutations: number = 0;
        const observer: MutationObserver = new MutationObserver((records) => {
          mutations += records.length;
        });
        observer.observe(grid, { childList: true, subtree: true });
        const lookups: { mock: { calls: unknown[][] }; mockRestore: () => void } = vi.spyOn(
          Map.prototype,
          'get',
        );
        scroller.dispatchEvent(new Event('scroll'));
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              resolve();
            });
          });
        });
        await stable();
        expect(observer.takeRecords()).toHaveLength(0);
        expect(mutations).toBe(0);
        expect(lookups.mock.calls.filter((args: unknown[]) => args[0] === 'r:999')).toHaveLength(0);
        lookups.mockRestore();
        expect(dataRows(host)).toEqual(beforeRows);
        observer.disconnect();
        uniformHeight = true;
        component.visibility.set({ status: false });
        await stable();
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                resolve();
              });
            });
          });
        });
        await stable();
        expect(total()).toBeCloseTo(80000, 5);
      } finally {
        heights.mockRestore();
        if (media) Object.defineProperty(window, 'matchMedia', media);
        else Reflect.deleteProperty(window, 'matchMedia');
      }
    });

    it('omits rows of collapsed groups and renders every row when disabled', async () => {
      component.data.set(
        Array.from({ length: 100 }, (_, index): Task => ({
          id: String(index),
          name: String(index),
          status: index < 50 ? 'a' : 'b',
          estimate: index,
        })),
      );
      component.groupBy.set('status');
      component.collapsed.set(['a']);
      component.virtual.set(true);
      await stable();
      expect(
        dataRows(host).every(
          (row: HTMLElement) => Number(row.textContent.trim().split(/\s+/)[0]) >= 50,
        ),
      ).toBe(true);
      expect(button(host, 'a').getAttribute('aria-expanded')).toBe('false');
      component.virtual.set(false);
      await stable();
      expect(dataRows(host)).toHaveLength(50);
      component.collapsed.set([]);
      component.groupBy.set(null);
      await stable();
      expect(dataRows(host)).toHaveLength(100);
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

    it('opens the editor on a single click with editOn="click" instead of opening the row', async () => {
      component.editOn.set('click');
      await stable();
      nameCell(1).dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await stable();

      expect(host.querySelector('input[aria-label="Nom de la tâche"]')).toBeTruthy();
      expect(component.opened()).toBeNull();
    });

    it('opens the row on a single click of the first cell by default', async () => {
      nameCell(1).dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await stable();

      expect(host.querySelector('input[aria-label="Nom de la tâche"]')).toBeNull();
      expect(component.opened()).toBe(TASKS[1]);
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

describe('provideCwLocale', () => {
  /**
   * Component DateTableHost
   *
   * @description
   * Supplies a date to a table column using its default cell display.
   */
  @Component({
    imports: [CwDataTable, CwDataTableColumn],
    template: `<cw-data-table ariaLabel="Échéances" [data]="rows">
      <cw-data-table-column key="due" header="Échéance" />
    </cw-data-table>`,
  })
  class DateTableHost {
    // #region Properties
    /**
     * Property rows
     *
     * @description
     * Table row containing the date to format.
     *
     * @type {{ id: string; due: Date }[]}
     * @readonly
     */
    public readonly rows: { id: string; due: Date }[] = [{ id: 'a', due: new Date(2026, 10, 18) }];
    // #endregion
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideCwLocale('en-US')] });
  });

  it('formats a default date cell in English', () => {
    const fixture: ComponentFixture<DateTableHost> = TestBed.createComponent(DateTableHost);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement as HTMLElement;

    expect(byRole(host, 'gridcell').some((cell) => cell.textContent.trim() === '11/18/2026')).toBe(
      true,
    );
  });
});

describe('provideCwDataTableTexts', () => {
  it('replaces the empty state', async () => {
    TestBed.configureTestingModule({
      providers: [provideCwDataTableTexts({ emptyText: 'No rows' })],
    });
    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    fixture.componentInstance.data.set([]);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('No rows');
  });
});

describe('keyboard labels in the bulk bar', () => {
  it('uses provided keyboard names', async () => {
    TestBed.configureTestingModule({ providers: [provideCwKbdLabels({ delete: 'Delete' })] });
    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host: HTMLElement = fixture.nativeElement as HTMLElement;
    one(host, 'checkbox', 'Sélectionner CAD-482').click();
    await fixture.whenStable();
    expect(one(host, 'toolbar', 'Actions sur la sélection').textContent).toContain('Delete');
  });
});

/**
 * Component ListHost
 *
 * @description
 * Hosts the list view of the mockup: declared groups, trailing add rows, a row class, a phone
 * layout and a windowed list that asks for its next page.
 */
@Component({
  imports: [CwDataTable, CwDataTableColumn, CwCellEditorDef],
  providers: [provideCwDataTableTexts({ emptyText: 'Aucune tâche' })],
  template: `
    <cw-data-table
      ariaLabel="Liste Produit"
      [page]="null"
      [data]="data()"
      [virtual]="virtual()"
      [groupBy]="groupBy()"
      [groups]="groups()"
      [groupLabel]="groupLabel"
      [addRow]="addRow()"
      [texts]="texts()"
      [rowMotion]="rowMotion"
      [filtered]="filtered()"
      [loading]="loading()"
      [error]="error()"
      [phoneLayout]="phoneLayout()"
      [phoneColumns]="['estimate']"
      [(collapsed)]="collapsed"
      (rowAdd)="added.push($event)"
      (nearEnd)="nearEnds.set(nearEnds() + 1)"
    >
      <cw-data-table-column key="name" header="Nom">
        <ng-template cwCellEditor
          ><input role="textbox" aria-label="Modifier le nom"
        /></ng-template>
      </cw-data-table-column>
      <cw-data-table-column key="status" header="Statut">
        <ng-template cwCellEditor
          ><input role="textbox" aria-label="Modifier le statut"
        /></ng-template>
      </cw-data-table-column>
      <cw-data-table-column key="estimate" header="Estimation" align="end">
        <ng-template cwCellEditor
          ><input role="textbox" aria-label="Modifier l’estimation"
        /></ng-template>
      </cw-data-table-column>
    </cw-data-table>
  `,
})
class ListHost {
  // #region Properties
  /**
   * Property data
   *
   * @description
   * Loaded rows.
   *
   * @type {WritableSignal<readonly Task[]>}
   * @readonly
   */
  public readonly data: WritableSignal<readonly Task[]> = signal<readonly Task[]>(TASKS);

  /**
   * Property virtual
   *
   * @description
   * Enables windowed rendering.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  public readonly virtual: WritableSignal<boolean> = signal(false);

  /**
   * Property groupBy
   *
   * @description
   * Column used to group the list, or null for a flat list.
   *
   * @type {WritableSignal<string | null>}
   * @readonly
   */
  public readonly groupBy: WritableSignal<string | null> = signal<string | null>('status');

  /**
   * Property filtered
   *
   * @description
   * Whether the consumer applies a search or filter.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  public readonly filtered: WritableSignal<boolean> = signal(false);

  /**
   * Property loading
   *
   * @description
   * Whether rows are loading.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  public readonly loading: WritableSignal<boolean> = signal(false);

  /**
   * Property error
   *
   * @description
   * Error shown in place of the rows.
   *
   * @type {WritableSignal<string | null>}
   * @readonly
   */
  public readonly error: WritableSignal<string | null> = signal<string | null>(null);

  /**
   * Property groups
   *
   * @description
   * Declared groups with the counts the server knows.
   *
   * @type {WritableSignal<readonly CwGroupDef[]>}
   * @readonly
   */
  public readonly groups: WritableSignal<readonly CwGroupDef[]> = signal<readonly CwGroupDef[]>([
    { value: 'todo', label: 'À faire', count: 12 },
    { value: 'progress', count: 30 },
    { value: 'review', label: 'En revue' },
  ]);

  /**
   * Property addRow
   *
   * @description
   * Shows the trailing add rows.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  public readonly addRow: WritableSignal<boolean> = signal(true);

  /**
   * Property texts
   *
   * @description
   * Text overrides of the table.
   *
   * @type {WritableSignal<Partial<CwDataTableTexts>>}
   * @readonly
   */
  public readonly texts: WritableSignal<Partial<CwDataTableTexts>> = signal<
    Partial<CwDataTableTexts>
  >({});

  /**
   * Property phoneLayout
   *
   * @description
   * Layout below 768 px.
   *
   * @type {WritableSignal<CwDataTablePhoneLayout>}
   * @readonly
   */
  public readonly phoneLayout: WritableSignal<CwDataTablePhoneLayout> =
    signal<CwDataTablePhoneLayout>('cards');

  /**
   * Property collapsed
   *
   * @description
   * Folded groups.
   *
   * @type {WritableSignal<readonly string[]>}
   * @readonly
   */
  public readonly collapsed: WritableSignal<readonly string[]> = signal<readonly string[]>([]);

  /**
   * Property added
   *
   * @description
   * Group values emitted by the add rows.
   *
   * @type {(string | null)[]}
   * @readonly
   */
  public readonly added: (string | null)[] = [];

  /**
   * Property nearEnds
   *
   * @description
   * Number of `nearEnd` emissions.
   *
   * @type {WritableSignal<number>}
   * @readonly
   */
  public readonly nearEnds: WritableSignal<number> = signal(0);

  /**
   * Property groupLabel
   *
   * @description
   * Labels of the undeclared status values.
   *
   * @type {(key: string) => string}
   * @readonly
   */
  public readonly groupLabel: (key: string) => string = (key: string): string =>
    ({ progress: 'En cours', blocked: 'Bloqué' })[key] ?? key;

  /**
   * Property rowMotion
   *
   * @description
   * Marks the row that has just moved.
   *
   * @type {(task: Task) => 'in' | null}
   * @readonly
   */
  public readonly rowMotion: (task: Task) => 'in' | null = (task: Task): 'in' | null =>
    task.id === 'CAD-471' ? 'in' : null;
  // #endregion
}

/**
 * Function groupNames
 *
 * @description
 * Reads the group header buttons in order, label and count.
 *
 * @param {HTMLElement} root - Rendered table.
 * @returns {string[]} Group header texts.
 */
function groupNames(root: HTMLElement): string[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>('[role="gridcell"] button[aria-expanded]'),
  ).map((element) =>
    Array.from(element.querySelectorAll('span'))
      .map((part) => part.textContent.trim())
      .join(' '),
  );
}

/**
 * Function addButtons
 *
 * @description
 * Finds the buttons of the trailing add rows.
 *
 * @param {HTMLElement} root - Rendered table.
 * @param {string} name - Accessible name of the buttons.
 * @returns {HTMLButtonElement[]} Add buttons in document order.
 */
function addButtons(root: HTMLElement, name: string = 'Ajouter une tâche'): HTMLButtonElement[] {
  return Array.from(root.querySelectorAll('button')).filter(
    (element) => element.textContent.trim() === name,
  );
}

describe('CwDataTable list view', () => {
  let fixture: ComponentFixture<ListHost>;
  let host: HTMLElement;
  let component: ListHost;

  beforeEach(async () => {
    fixture = TestBed.createComponent(ListHost);
    component = fixture.componentInstance;
    host = fixture.nativeElement as HTMLElement;
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  describe('declared groups', () => {
    it('uses the same converted keys for declared values, rows and add events', async () => {
      const date: Date = new Date(2026, 10, 18);
      for (const [value, expected] of [
        [null, ''],
        [undefined, ''],
        [date, date.toLocaleDateString('fr-FR')],
      ] as const) {
        component.groups.set([{ value, label: 'Groupe' }]);
        component.data.set([
          { id: '1', name: 'Valeur', status: value, estimate: 1 } as unknown as Task,
        ]);
        await fixture.whenStable();
        expect(groupNames(host)).toEqual(['Groupe 1']);
        addButtons(host)[0].click();
        expect(component.added.at(-1)).toBe(expected);
      }
    });

    it('shows the empty state for an empty filtered grouped or flat result', async () => {
      component.data.set([]);
      component.filtered.set(true);
      await fixture.whenStable();
      expect(host.textContent).toContain('Aucune tâche');
      expect(groupNames(host)).toHaveLength(0);
      expect(addButtons(host)).toHaveLength(0);
      component.groupBy.set(null);
      await fixture.whenStable();
      expect(host.textContent).toContain('Aucune tâche');
      expect(addButtons(host)).toHaveLength(0);
    });

    it('renders the declared groups in order with their counts, empty ones included', () => {
      expect(groupNames(host)).toEqual(['À faire 12', 'En cours 30', 'En revue 0', 'Bloqué 1']);
    });

    it('renders the declared groups instead of the empty state', async () => {
      component.data.set([]);
      await fixture.whenStable();
      expect(groupNames(host)).toEqual(['À faire 12', 'En cours 30', 'En revue 0']);
      expect(host.textContent).not.toContain('Aucune tâche');
    });

    it('keeps the empty state without declared groups', async () => {
      component.groups.set([]);
      component.data.set([]);
      await fixture.whenStable();
      expect(host.textContent).toContain('Aucune tâche');
    });
  });

  describe('trailing add rows', () => {
    it('creates the first row of an empty flat list', async () => {
      component.groupBy.set(null);
      component.groups.set([]);
      component.data.set([]);
      await fixture.whenStable();
      expect(addButtons(host)).toHaveLength(1);
      addButtons(host)[0].click();
      expect(component.added).toEqual([null]);
    });

    it('ends each open group with an add row, counted in the grid', async () => {
      expect(addButtons(host)).toHaveLength(4);
      // 4 rows, the header, 4 groups and 4 add rows.
      expect(one(host, 'grid', 'Liste Produit').getAttribute('aria-rowcount')).toBe('13');
      component.collapsed.set(['review']);
      await fixture.whenStable();
      expect(addButtons(host)).toHaveLength(3);
    });

    it('emits the group value on click and on Enter or Space on its cell', () => {
      addButtons(host)[2].click();
      const cell: HTMLElement = required(
        addButtons(host)[0].closest<HTMLElement>('[role="gridcell"]'),
      );
      key(cell, { key: 'Enter' });
      key(cell, { key: ' ' });
      expect(component.added).toEqual(['review', 'todo', 'todo']);
    });

    it('takes its label from the texts', async () => {
      component.texts.set({ addRow: 'Ajouter un membre' });
      await fixture.whenStable();
      expect(addButtons(host, 'Ajouter un membre')).toHaveLength(4);
    });

    it('shows no add row unless asked', async () => {
      component.addRow.set(false);
      await fixture.whenStable();
      expect(addButtons(host)).toHaveLength(0);
    });

    it('is reached with the arrows like a single-cell row', async () => {
      const review: HTMLElement = required(
        button(host, 'En revue').closest<HTMLElement>('[role="gridcell"]'),
      );
      review.focus();
      key(review, { key: 'ArrowDown' });
      await fixture.whenStable();
      const active: Element | null = document.activeElement;
      expect(active?.getAttribute('data-cw-col')).toBe('add');
      expect(active?.closest('[role="row"]')?.getAttribute('aria-rowindex')).toBe('10');
    });
  });

  it('applies the requested row entrance motion', () => {
    const moved: HTMLElement | undefined = dataRows(host).find((row) =>
      row.textContent.includes('Migrer les pièces jointes'),
    );
    expect(moved?.classList).toContain('animate-row-in');
    expect(dataRows(host).filter((row) => row.classList.contains('animate-row-in'))).toHaveLength(
      1,
    );
  });

  describe('phone layout', () => {
    it('turns rows into cards by default', () => {
      expect(host.querySelector('thead')?.classList).toContain('max-md:hidden');
      expect(dataRows(host)[0].classList).toContain('max-md:flex');
      expect(dataRows(host)[0].parentElement?.classList).toContain('max-md:block');
    });

    for (const virtual of [false, true]) {
      it(`keeps keyboard navigation on phone-visible columns (virtual: ${String(virtual)})`, async () => {
        const original: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(
          window,
          'matchMedia',
        );
        let mobile: boolean = false;
        Object.defineProperty(window, 'matchMedia', {
          configurable: true,
          value: () => ({ matches: mobile }),
        });
        try {
          component.virtual.set(virtual);
          component.phoneLayout.set('grid');
          window.dispatchEvent(new Event('resize'));
          await fixture.whenStable();
          const cells: HTMLElement[] = byRole(dataRows(host)[0], 'gridcell');
          cells[1].focus();
          key(cells[1], { key: 'ArrowRight' });
          await fixture.whenStable();
          expect(document.activeElement).toBe(cells[2]);
          mobile = true;
          window.dispatchEvent(new Event('resize'));
          await fixture.whenStable();
          expect(cells[2].tabIndex).toBe(-1);
          expect(document.activeElement).toBe(cells[1]);
          cells[3].focus();
          key(cells[3], { key: 'Home' });
          await fixture.whenStable();
          expect(document.activeElement).toBe(cells[0]);
          key(cells[0], { key: 'End' });
          await fixture.whenStable();
          expect(document.activeElement).toBe(cells[3]);
          key(cells[3], { key: 'ArrowLeft' });
          await fixture.whenStable();
          expect(document.activeElement).toBe(cells[1]);
          key(cells[1], { key: 'ArrowRight' });
          await fixture.whenStable();
          expect(document.activeElement).toBe(cells[3]);
          await fixture.whenStable();
          expect(cells[2].tabIndex).toBe(-1);
          expect(cells[3].tabIndex).toBe(0);
          component.phoneLayout.set('cards');
          await fixture.whenStable();
          key(cells[3], { key: 'ArrowLeft' });
          await fixture.whenStable();
          expect(document.activeElement).toBe(cells[2]);
          component.phoneLayout.set('grid');
          await fixture.whenStable();
          expect(cells[2].tabIndex).toBe(-1);
          expect(document.activeElement).toBe(cells[1]);
        } finally {
          if (original) Object.defineProperty(window, 'matchMedia', original);
          else Reflect.deleteProperty(window, 'matchMedia');
        }
      });
    }

    for (const virtual of [false, true]) {
      it(`tabs between phone-visible editors in both directions (virtual: ${String(virtual)})`, async () => {
        const original: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(
          window,
          'matchMedia',
        );
        Object.defineProperty(window, 'matchMedia', {
          configurable: true,
          value: () => ({ matches: true }),
        });
        try {
          component.virtual.set(virtual);
          component.phoneLayout.set('grid');
          window.dispatchEvent(new Event('resize'));
          await fixture.whenStable();
          const cells: HTMLElement[] = byRole(dataRows(host)[0], 'gridcell');
          cells[1].focus();
          key(cells[1], { key: 'F2' });
          await fixture.whenStable();
          const name: HTMLElement = one(host, 'textbox', 'Modifier le nom');
          expect(document.activeElement).toBe(name);
          key(name, { key: 'Tab' });
          await fixture.whenStable();
          const estimate: HTMLElement = one(host, 'textbox', 'Modifier l’estimation');
          expect(document.activeElement).toBe(estimate);
          expect(byRole(host, 'textbox', 'Modifier le statut')).toHaveLength(0);
          key(estimate, { key: 'Tab', shiftKey: true });
          await fixture.whenStable();
          expect(document.activeElement).toBe(one(host, 'textbox', 'Modifier le nom'));
          expect(byRole(host, 'textbox', 'Modifier le statut')).toHaveLength(0);
        } finally {
          if (original) Object.defineProperty(window, 'matchMedia', original);
          else Reflect.deleteProperty(window, 'matchMedia');
        }
      });
    }

    it('keeps a grid of the first column and the phone columns in grid mode', async () => {
      component.phoneLayout.set('grid');
      await fixture.whenStable();
      expect(host.querySelector('thead')?.classList).not.toContain('max-md:hidden');
      const [name, status, estimate]: HTMLElement[] = byRole(host, 'columnheader').slice(1);
      expect(name.classList).not.toContain('max-md:hidden');
      expect(status.classList).toContain('max-md:hidden');
      expect(estimate.classList).not.toContain('max-md:hidden');
      const row: HTMLElement = dataRows(host)[0];
      expect(row.classList).not.toContain('max-md:flex');
      expect(
        byRole(row, 'gridcell').map((cell) => cell.classList.contains('max-md:hidden')),
      ).toEqual([false, false, true, false]);
      expect(host.querySelector('table')?.classList).not.toContain('max-md:block');
    });
  });

  describe('nearEnd', () => {
    /**
     * Function scrollTo
     *
     * @description
     * Scrolls the virtual scroller and waits for its measurement frame.
     *
     * @param {number} top - Scroll offset in pixels.
     * @returns {Promise<void>} Promise resolved once the table settles.
     */
    async function scrollTo(top: number): Promise<void> {
      const scroller: HTMLElement = required(one(host, 'grid', 'Liste Produit').parentElement);
      Object.defineProperty(scroller, 'clientHeight', { configurable: true, value: 360 });
      Object.defineProperty(scroller, 'scrollTop', {
        configurable: true,
        writable: true,
        value: top,
      });
      scroller.dispatchEvent(new Event('scroll'));
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => {
          resolve();
        }),
      );
      await fixture.whenStable();
    }

    /**
     * Function page
     *
     * @description
     * Builds loaded rows of one status.
     *
     * @param {number} length - Number of rows.
     * @returns {Task[]} Rows of the page.
     */
    function page(length: number): Task[] {
      return Array.from({ length }, (_, index): Task => ({
        id: String(index),
        name: `Tâche ${String(index)}`,
        status: 'todo',
        estimate: index,
      }));
    }

    beforeEach(async () => {
      component.groups.set([{ value: 'todo', label: 'À faire', count: 400 }]);
      component.addRow.set(false);
      component.data.set(page(200));
      component.virtual.set(true);
      await fixture.whenStable();
    });

    it('fires once when the window nears the last loaded row, again after the next page', async () => {
      expect(component.nearEnds()).toBe(0);
      await scrollTo(200 * 36 - 600);
      expect(component.nearEnds()).toBe(1);
      await scrollTo(200 * 36 - 560);
      expect(component.nearEnds()).toBe(1);

      component.data.set(page(400));
      await fixture.whenStable();
      expect(component.nearEnds()).toBe(1);
      await scrollTo(400 * 36 - 600);
      expect(component.nearEnds()).toBe(2);
    });

    for (const state of ['loading', 'error'] as const) {
      it(`suppresses nearEnd while ${state} is active`, async () => {
        if (state === 'loading') component.loading.set(true);
        else component.error.set('Erreur');
        await fixture.whenStable();
        await scrollTo(200 * 36 - 600);
        expect(component.nearEnds()).toBe(0);
      });
    }

    it('stays silent outside virtual mode', async () => {
      component.virtual.set(false);
      component.data.set(page(5));
      await fixture.whenStable();
      expect(component.nearEnds()).toBe(0);
    });
  });
});

/**
 * Function sumEstimates
 *
 * @description
 * Footer aggregate of the estimate column used by the fixture.
 *
 * @param {readonly Task[]} rows - Every row of the table.
 * @returns {string} The summed estimate, as the mockup's sheet footer writes it.
 */
function sumEstimates(rows: readonly Task[]): string {
  return `Σ ${String(rows.reduce((total, row) => total + row.estimate, 0))} h`;
}

/**
 * Component FooterHost
 *
 * @description
 * Hosts a table with footer aggregates and a row context menu.
 */
@Component({
  imports: [CwDataTable, CwDataTableColumn, CwCellDef, CwFooterCellDef, CwMenu, CwMenuItem],
  template: `
    <cw-data-table
      ariaLabel="Sheet"
      [data]="data()"
      [virtual]="virtual()"
      [loading]="loading()"
      [page]="null"
      [rowContextMenu]="withMenu() ? rowMenu : null"
      (rowOpen)="opened.set($event)"
    >
      <cw-data-table-column key="name" header="Name">
        <ng-template cwCell let-task>
          <span>{{ task.name }}</span>
          <input aria-label="Rename" />
        </ng-template>
        <ng-template cwFooterCell let-rows>{{ rows.length }} tasks</ng-template>
      </cw-data-table-column>
      <cw-data-table-column key="status" header="Status" />
      <cw-data-table-column key="estimate" header="Estimate" align="end" [footer]="sum" />
    </cw-data-table>

    <cw-menu #rowMenu ariaLabel="Row actions">
      <button cwMenuItem (triggered)="picked.set(rowMenu.data())">Open</button>
    </cw-menu>
  `,
})
class FooterHost {
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
   * Property virtual
   *
   * @description
   * Whether the table windows its rows.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  public readonly virtual: WritableSignal<boolean> = signal(false);

  /**
   * Property loading
   *
   * @description
   * Whether the table shows its loading state.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  public readonly loading: WritableSignal<boolean> = signal(false);

  /**
   * Property withMenu
   *
   * @description
   * Whether the table receives the row context menu.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  public readonly withMenu: WritableSignal<boolean> = signal(true);

  /**
   * Property sum
   *
   * @description
   * Footer aggregate of the estimate column.
   *
   * @type {(rows: readonly Task[]) => string}
   * @readonly
   */
  public readonly sum: (rows: readonly Task[]) => string = sumEstimates;

  /**
   * Property picked
   *
   * @description
   * Row read by the menu item through the menu's data.
   *
   * @type {WritableSignal<unknown>}
   * @readonly
   */
  public readonly picked: WritableSignal<unknown> = signal<unknown>(null);

  /**
   * Property opened
   *
   * @description
   * Last row the table asked to open.
   *
   * @type {WritableSignal<Task | null>}
   * @readonly
   */
  public readonly opened: WritableSignal<Task | null> = signal<Task | null>(null);
  // #endregion
}

describe('CwDataTable footer and row context menu', () => {
  let fixture: ComponentFixture<FooterHost>;
  let host: HTMLElement;
  let component: FooterHost;

  /**
   * Function footerRow
   *
   * @description
   * Finds the footer row of the grid.
   * @returns {HTMLElement | null} The footer row, or null when it is not rendered.
   */
  function footerRow(): HTMLElement | null {
    return host.querySelector<HTMLElement>('tfoot [role="row"]');
  }

  /**
   * Function menuItem
   *
   * @description
   * Finds the row menu's item in the overlay.
   * @returns {HTMLElement | null} The menu item, or null when the menu is closed.
   */
  function menuItem(): HTMLElement | null {
    return document.querySelector<HTMLElement>('[role="menuitem"]');
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterHost);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('adds a footer row with the aggregates of every row, as the last grid row', () => {
    const row: HTMLElement = required(footerRow());
    const cells: string[] = byRole(row, 'gridcell').map((cell) => cell.textContent.trim());
    // The selection column, then name, status and estimate.
    expect(cells).toEqual(['', '4 tasks', '', 'Σ 18 h']);
    const grid: HTMLElement = one(host, 'grid', 'Sheet');
    expect(row.getAttribute('aria-rowindex')).toBe(grid.getAttribute('aria-rowcount'));
    expect(grid.getAttribute('aria-rowcount')).toBe('6');
  });

  it('follows the data and hides the footer while loading or empty', async () => {
    component.data.set(TASKS.slice(0, 2));
    await fixture.whenStable();
    expect(byRole(required(footerRow()), 'gridcell')[3]?.textContent.trim()).toBe('Σ 8 h');

    component.loading.set(true);
    await fixture.whenStable();
    expect(footerRow()).toBeNull();

    component.loading.set(false);
    component.data.set([]);
    await fixture.whenStable();
    expect(footerRow()).toBeNull();
  });

  it('reaches the footer cells with the arrows', async () => {
    const last: HTMLElement = required(dataRows(host).at(-1));
    const cell: HTMLElement = required(byRole(last, 'gridcell')[3]);
    cell.focus();
    key(cell, { key: 'ArrowDown' });
    await fixture.whenStable();
    expect(document.activeElement?.textContent.trim()).toBe('Σ 18 h');
  });

  it('reaches the footer with Ctrl + End in virtual mode', async () => {
    component.virtual.set(true);
    await fixture.whenStable();
    const first: HTMLElement = required(byRole(required(dataRows(host)[0]), 'gridcell')[1]);
    first.focus();
    key(first, { key: 'End', ctrlKey: true });
    await fixture.whenStable();
    expect(document.activeElement?.closest('tfoot')).not.toBeNull();
    expect(document.activeElement?.textContent.trim()).toBe('Σ 18 h');
  });

  it('opens the row menu on a right click, with the row as its data', async () => {
    const row: HTMLElement = required(dataRows(host)[1]);
    const cell: HTMLElement = required(byRole(row, 'gridcell')[2]);
    const event: MouseEvent = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      clientX: 20,
      clientY: 20,
    });
    cell.dispatchEvent(event);
    await fixture.whenStable();

    expect(event.defaultPrevented).toBe(true);
    expect(row.dataset['contextMenu']).toBe('open');
    required(menuItem()).click();
    await fixture.whenStable();

    expect(component.picked()).toBe(TASKS[1]);
    expect(row.hasAttribute('data-context-menu')).toBe(false);
  });

  it('opens the row menu on Shift + F10 and the Menu key, on its first item', async () => {
    const cell: HTMLElement = required(byRole(required(dataRows(host)[2]), 'gridcell')[2]);
    cell.focus();
    const event: KeyboardEvent = key(cell, { key: 'F10', shiftKey: true });
    await fixture.whenStable();
    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(menuItem());

    key(required(menuItem()), { key: 'Escape' });
    await fixture.whenStable();
    expect(menuItem()).toBeNull();
    expect(document.activeElement).toBe(cell);

    key(cell, { key: 'ContextMenu' });
    await fixture.whenStable();
    expect(menuItem()).not.toBeNull();
  });

  it('opens the row menu on a long press and swallows the click that ends it', async () => {
    const cell: HTMLElement = required(byRole(required(dataRows(host)[0]), 'gridcell')[1]);
    /**
     * Function touch
     *
     * @description
     * Dispatches a touch pointer event on the first data cell.
     *
     * @param {string} type - Pointer event type.
     */
    const touch: (type: string) => void = (type: string): void => {
      cell.dispatchEvent(
        new PointerEvent(type, { bubbles: true, cancelable: true, pointerType: 'touch' }),
      );
    };

    touch('pointerdown');
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 550);
    });
    await fixture.whenStable();
    expect(menuItem()).not.toBeNull();
    touch('pointerup');
    const ending: MouseEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    cell.dispatchEvent(ending);
    expect(ending.defaultPrevented).toBe(true);
    expect(component.opened()).toBeNull();

    // A short tap afterwards still opens the row.
    touch('pointerdown');
    touch('pointerup');
    cell.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(component.opened()).toBe(TASKS[0]);
  });

  it('keeps the browser menu outside data rows, in an editable field and without a menu', async () => {
    const header: MouseEvent = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    required(byRole(host, 'columnheader')[1]).dispatchEvent(header);
    const footer: MouseEvent = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    required(footerRow()).dispatchEvent(footer);
    const field: MouseEvent = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    required(host.querySelector('input')).dispatchEvent(field);
    await fixture.whenStable();
    expect([header, footer, field].map((event) => event.defaultPrevented)).toEqual([
      false,
      false,
      false,
    ]);

    component.withMenu.set(false);
    await fixture.whenStable();
    const row: MouseEvent = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    required(byRole(required(dataRows(host)[0]), 'gridcell')[2]).dispatchEvent(row);
    expect(row.defaultPrevented).toBe(false);
    expect(menuItem()).toBeNull();
  });
});
