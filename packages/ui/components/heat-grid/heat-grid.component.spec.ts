import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwHeatGridChipDef } from './heat-grid-chip/heat-grid-chip.directive';
import { CwHeatGridTotalDef } from './heat-grid-total/heat-grid-total.directive';
import { CwHeatGrid } from './heat-grid.component';
import { provideCwHeatGridLabels } from './heat-grid.providers';
import type { CwHeatGridCellEvent, CwHeatGridColumn, CwHeatGridRow } from './heat-grid.types';

/**
 * Interface Item
 *
 * @description
 * An item of a cell in the fixture.
 */
interface Item {
  // #region Properties
  /**
   * Property key
   *
   * @description
   * Identity of the item.
   *
   * @type {string}
   * @readonly
   */
  readonly key: string;
  // #endregion
}

/**
 * Constant COLUMNS
 *
 * @description
 * Two days of the fixture.
 *
 * @type {readonly CwHeatGridColumn[]}
 */
const COLUMNS: readonly CwHeatGridColumn[] = [
  { key: 'mon', label: 'Monday 23', caption: 'Mon.', short: '23', current: true },
  { key: 'tue', label: 'Tuesday 24', caption: 'Tue.', short: '24' },
];

/**
 * Constant ROWS
 *
 * @description
 * Two people and the unassigned row of the fixture.
 *
 * @type {readonly CwHeatGridRow<Item>[]}
 */
const ROWS: readonly CwHeatGridRow<Item>[] = [
  {
    key: 'ana',
    label: 'Ana Martin',
    capacity: 12,
    cells: {
      mon: { value: 4, items: [{ key: 'CAD-1' }] },
      tue: { value: 7, items: [{ key: 'CAD-2' }, { key: 'CAD-3' }, { key: 'CAD-4' }] },
    },
  },
  {
    key: 'ben',
    label: 'Ben Roux',
    capacity: 12,
    cells: { mon: { value: 4, items: [{ key: 'CAD-5' }] } },
  },
  {
    key: 'none',
    label: 'Unassigned',
    placeholder: true,
    cells: { tue: { value: 2, items: [{ key: 'CAD-6' }] } },
  },
];

/**
 * Component Host
 *
 * @description
 * Hosts a heat grid and records the opened cells.
 */
@Component({
  imports: [CwHeatGrid, CwHeatGridChipDef, CwHeatGridTotalDef],
  template: `
    <cw-heat-grid
      ariaLabel="Workload"
      [rows]="rows()"
      [columns]="columns"
      [capacity]="6"
      [loading]="loading()"
      [valueFormat]="hours"
      (cellOpen)="opened.set($event)"
    >
      <ng-template cwHeatGridChip let-item let-placement="placement">
        <button type="button" [attr.data-placement]="placement">{{ item.key }}</button>
      </ng-template>
      <ng-template cwHeatGridTotal let-row>
        <span data-total-line>Spent on {{ row.label }}</span>
      </ng-template>
    </cw-heat-grid>
  `,
})
class Host {
  // #region Properties
  /**
   * Property rows
   *
   * @description
   * Rows given to the grid.
   *
   * @type {WritableSignal<readonly CwHeatGridRow<Item>[]>}
   * @readonly
   */
  public readonly rows: WritableSignal<readonly CwHeatGridRow<Item>[]> =
    signal<readonly CwHeatGridRow<Item>[]>(ROWS);

  /**
   * Property columns
   *
   * @description
   * Columns given to the grid.
   *
   * @type {readonly CwHeatGridColumn[]}
   * @readonly
   */
  public readonly columns: readonly CwHeatGridColumn[] = COLUMNS;

  /**
   * Property loading
   *
   * @description
   * Whether the grid shows its loading state.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  public readonly loading: WritableSignal<boolean> = signal(false);

  /**
   * Property hours
   *
   * @description
   * Value format of the fixture.
   *
   * @type {(value: number) => string}
   * @readonly
   */
  public readonly hours: (value: number) => string = (value: number): string =>
    `${String(value)} h`;

  /**
   * Property opened
   *
   * @description
   * Last cell whose popover opened.
   *
   * @type {WritableSignal<CwHeatGridCellEvent<Item> | null>}
   * @readonly
   */
  public readonly opened: WritableSignal<CwHeatGridCellEvent<Item> | null> =
    signal<CwHeatGridCellEvent<Item> | null>(null);
  // #endregion
}

/**
 * Function key
 *
 * @description
 * Dispatches a keydown event.
 *
 * @param {Element} target - Element receiving the event.
 * @param {KeyboardEventInit} init - Key and modifiers.
 * @returns {KeyboardEvent} The dispatched event.
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

/**
 * Function focused
 *
 * @description
 * Returns the focused element.
 *
 * @returns {Element} The document's active element.
 */
function focused(): Element {
  const active: Element | null = document.activeElement;
  if (!active) throw new Error('Nothing focused');
  return active;
}

describe('CwHeatGrid', () => {
  let fixture: ComponentFixture<Host>;
  let host: HTMLElement;
  let component: Host;

  /**
   * Function cell
   *
   * @description
   * Finds a day cell by the start of its text, its visually hidden description.
   *
   * @param {string} name - Start of the cell's accessible name.
   * @returns {HTMLElement} The cell.
   */
  function cell(name: string): HTMLElement {
    const found: HTMLElement | undefined = Array.from(
      host.querySelectorAll<HTMLElement>('[role="gridcell"][aria-haspopup]'),
    ).find((element) => element.textContent.trim().startsWith(name));
    if (!found) throw new Error(`No cell named ${name}`);
    return found;
  }

  /**
   * Function popover
   *
   * @description
   * Finds the open popover panel.
   * @returns {HTMLElement | null} The panel, or null when closed.
   */
  function popover(): HTMLElement | null {
    return document.querySelector<HTMLElement>('[role="dialog"]');
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('is a named grid with column headers, row headers and grid cells', () => {
    const grid: HTMLElement | null = host.querySelector('table[role="grid"]');
    expect(grid?.getAttribute('aria-label')).toBe('Workload');
    const headers: string[] = Array.from(host.querySelectorAll('[role="columnheader"]')).map((th) =>
      th.textContent.replace(/\s+/g, ' ').trim(),
    );
    expect(headers).toEqual(['Personne', 'Monday 23Mon.23', 'Tuesday 24Tue.24', 'Total']);
    const rowHeaders: HTMLElement[] = Array.from(
      host.querySelectorAll<HTMLElement>('[role="rowheader"]'),
    );
    // The avatar is hidden from assistive technologies; the name is the row header's text.
    expect(rowHeaders.map((th) => th.textContent)).toEqual([
      expect.stringContaining('Ana Martin'),
      expect.stringContaining('Ben Roux'),
      expect.stringContaining('Unassigned'),
    ]);
  });

  it('names each cell from its load, level and items, and sets its level', () => {
    expect(
      cell('Ana Martin, Monday 23')
        .textContent.trim()
        .startsWith('Ana Martin, Monday 23 : 4 h sur 6 h, 1 tâche'),
    ).toBe(true);
    expect(
      cell('Ana Martin, Tuesday 24')
        .textContent.trim()
        .startsWith('Ana Martin, Tuesday 24 : 7 h sur 6 h, surcharge, 3 tâches'),
    ).toBe(true);
    expect(cell('Ben Roux, Monday 23').dataset['level']).toBe('available');
    expect(
      cell('Ben Roux, Tuesday 24')
        .textContent.trim()
        .startsWith('Ben Roux, Tuesday 24 : aucune tâche'),
    ).toBe(true);
    // A placeholder row has no capacity, hence no level.
    expect(cell('Unassigned, Tuesday 24').dataset['level']).toBe('neutral');
  });

  it('draws the first chips of a cell, then a button for the others', () => {
    const tuesday: HTMLElement = cell('Ana Martin, Tuesday 24');
    const chips: string[] = Array.from(tuesday.querySelectorAll('[data-placement="cell"]')).map(
      (chip) => chip.textContent.trim(),
    );
    expect(chips).toEqual(['CAD-2', 'CAD-3']);
    const more: HTMLButtonElement | undefined = Array.from(tuesday.querySelectorAll('button')).at(
      -1,
    );
    expect(more?.textContent.replace(/\s+/g, ' ').trim()).toBe('+1, Voir les 3 tâches');
  });

  it('sums each row in the total, with its note, its extra line and its meter', () => {
    const totals: string[] = Array.from(host.querySelectorAll('[data-cw-col="__total"]')).map(
      (total) => total.textContent.replace(/\s+/g, ' ').replace(/ ,/g, ',').trim(),
    );
    expect(totals[0]).toBe('11 h / 12 h, Charge élevée Spent on Ana Martin');
    expect(totals[2]).toBe('2 h, À répartir Spent on Unassigned');
    const meters: HTMLElement[] = Array.from(host.querySelectorAll<HTMLElement>('[role="meter"]'));
    expect(meters.map((meter) => meter.getAttribute('aria-label'))).toEqual([
      'Charge de Ana Martin : 11 h sur 12 h',
      'Charge de Ben Roux : 4 h sur 12 h',
    ]);
  });

  it('opens the popover of a cell on a click, with its title, sum and items', async () => {
    const tuesday: HTMLElement = cell('Ana Martin, Tuesday 24');
    tuesday.click();
    await fixture.whenStable();

    expect(tuesday.getAttribute('aria-expanded')).toBe('true');
    const panel: HTMLElement | null = popover();
    expect(panel?.getAttribute('aria-label')).toBe('Ana Martin · Tuesday 24');
    expect(panel?.textContent).toContain('7 h sur 6 h');
    const items: string[] = Array.from(
      panel?.querySelectorAll('[data-placement="popover"]') ?? [],
    ).map((item) => item.textContent.trim());
    expect(items).toEqual(['CAD-2', 'CAD-3', 'CAD-4']);
    expect(component.opened()?.column.key).toBe('tue');
    expect(component.opened()?.row.key).toBe('ana');
  });

  it('says so in the popover of a cell without items', async () => {
    cell('Ben Roux, Tuesday 24').click();
    await fixture.whenStable();
    expect(popover()?.textContent).toContain('Aucune tâche ce jour-là.');
  });

  it('keeps one tab stop and moves it with the arrows, Home and End', async () => {
    const stops: HTMLElement[] = Array.from(host.querySelectorAll<HTMLElement>('[tabindex="0"]'));
    expect(stops).toHaveLength(1);
    expect(stops[0]).toBe(cell('Ana Martin, Monday 23'));

    const first: HTMLElement = cell('Ana Martin, Monday 23');
    first.focus();
    key(first, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(cell('Ana Martin, Tuesday 24'));
    key(focused(), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(cell('Ben Roux, Tuesday 24'));
    key(focused(), { key: 'Home' });
    expect(document.activeElement?.getAttribute('role')).toBe('rowheader');
    key(focused(), { key: 'End', ctrlKey: true });
    expect((document.activeElement as HTMLElement).dataset['cwCol']).toBe('__total');
    expect(document.activeElement?.closest('tr')?.dataset['cwRow']).toBe('none');
    await fixture.whenStable();
    expect(host.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
  });

  it('keeps the chips of inactive cells out of the tab order', async () => {
    await fixture.whenStable();
    const chip: HTMLElement | null = cell('Ana Martin, Tuesday 24').querySelector('button');
    expect(chip?.tabIndex).toBe(-1);
    const active: HTMLElement | null = cell('Ana Martin, Monday 23').querySelector('button');
    expect(active?.tabIndex).toBe(0);
  });

  it('opens the popover with Enter on a cell and closes it with Escape, back on the cell', async () => {
    const monday: HTMLElement = cell('Ben Roux, Monday 23');
    monday.focus();
    key(monday, { key: 'Enter' });
    await fixture.whenStable();
    expect(popover()).not.toBeNull();

    key(document.activeElement ?? document.body, { key: 'Escape' });
    await fixture.whenStable();
    expect(monday.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(monday);
  });

  it('is busy while loading and says so without rows', async () => {
    component.loading.set(true);
    await fixture.whenStable();
    expect(host.querySelector('cw-heat-grid')?.getAttribute('aria-busy')).toBe('true');
    expect(host.querySelector('[role="rowheader"]')).toBeNull();
    expect(host.querySelector('[role="status"]')?.textContent.trim()).toBe(
      'Chargement de la charge de travail',
    );

    component.loading.set(false);
    component.rows.set([]);
    await fixture.whenStable();
    expect(host.querySelector('[role="status"]')?.textContent.trim()).toBe(
      'Aucune tâche ne correspond à la recherche ou aux filtres.',
    );
  });
});

describe('provideCwHeatGridLabels', () => {
  it('replaces the texts of the grid', () => {
    TestBed.configureTestingModule({
      providers: [provideCwHeatGridLabels({ rowHeader: 'Person', high: 'High load' })],
    });
    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    fixture.detectChanges();
    const text: string = (fixture.nativeElement as HTMLElement).textContent;
    expect(text).toContain('Person');
    expect(text).toContain('High load');
  });
});
