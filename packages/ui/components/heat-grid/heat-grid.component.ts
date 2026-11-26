import {
  afterNextRender,
  afterRenderEffect,
  Component,
  computed,
  contentChild,
  ElementRef,
  inject,
  Injector,
  input,
  numberAttribute,
  output,
  signal,
  viewChild,
  booleanAttribute,
  type InputSignal,
  type InputSignalWithTransform,
  type OutputEmitterRef,
  type Signal,
  type TemplateRef,
  type WritableSignal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { CwAvatar } from '@cadenway/ui/components/avatar';
import { CwMeter, type CwMeterZone } from '@cadenway/ui/components/meter';
import { CwPopover } from '@cadenway/ui/components/popover';
import { CwSkeleton } from '@cadenway/ui/components/skeleton';
import { ɵFOCUS, ɵFOCUS_INSET, ɵLOCALE, ɵperLocale } from '@cadenway/ui/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorUserBold } from '@ng-icons/phosphor-icons/bold';
import { phosphorWarningCircleFill } from '@ng-icons/phosphor-icons/fill';

import { CwHeatGridChipDef } from './heat-grid-chip/heat-grid-chip.directive';
import { HEAT_GRID_LABELS } from './heat-grid-labels.token';
import { CwHeatGridTotalDef } from './heat-grid-total/heat-grid-total.directive';
import { CW_HEAT_GRID_HIGH } from './heat-grid.constants';
import type {
  CwHeatGridCell,
  CwHeatGridCellEvent,
  CwHeatGridColumn,
  CwHeatGridItemContext,
  CwHeatGridLabels,
  CwHeatGridLevel,
  CwHeatGridRow,
  CwHeatGridTotalContext,
} from './heat-grid.types';

/**
 * Interface CellView
 *
 * @description
 * A day cell ready to render: its load, level, bar width, chips and accessible name.
 */
interface CellView<T> {
  // #region Properties
  /**
   * Property column
   *
   * @description
   * Column of the cell.
   *
   * @type {CwHeatGridColumn}
   * @readonly
   */
  readonly column: CwHeatGridColumn;

  /**
   * Property cell
   *
   * @description
   * The given cell, or an empty one.
   *
   * @type {CwHeatGridCell<T>}
   * @readonly
   */
  readonly cell: CwHeatGridCell<T>;

  /**
   * Property text
   *
   * @description
   * Formatted value, an em dash for an empty cell.
   *
   * @type {string}
   * @readonly
   */
  readonly text: string;

  /**
   * Property level
   *
   * @description
   * Load level of the cell.
   *
   * @type {CwHeatGridLevel}
   * @readonly
   */
  readonly level: CwHeatGridLevel;

  /**
   * Property width
   *
   * @description
   * Width of the load bar, in percent of its track.
   *
   * @type {number}
   * @readonly
   */
  readonly width: number;

  /**
   * Property chips
   *
   * @description
   * Items drawn in the cell, at most `maxChips`.
   *
   * @type {readonly T[]}
   * @readonly
   */
  readonly chips: readonly T[];

  /**
   * Property hidden
   *
   * @description
   * Number of items past the chips, reached through the popover.
   *
   * @type {number}
   * @readonly
   */
  readonly hidden: number;

  /**
   * Property label
   *
   * @description
   * Visually hidden description of the cell, the start of its accessible name.
   *
   * @type {string}
   * @readonly
   */
  readonly label: string;
  // #endregion
}

/**
 * Interface RowView
 *
 * @description
 * A row ready to render: its cells and its total.
 */
interface RowView<T> {
  // #region Properties
  /**
   * Property row
   *
   * @description
   * The given row.
   *
   * @type {CwHeatGridRow<T>}
   * @readonly
   */
  readonly row: CwHeatGridRow<T>;

  /**
   * Property cells
   *
   * @description
   * One cell per column, in column order.
   *
   * @type {readonly CellView<T>[]}
   * @readonly
   */
  readonly cells: readonly CellView<T>[];

  /**
   * Property total
   *
   * @description
   * Sum of the cell values.
   *
   * @type {number}
   * @readonly
   */
  readonly total: number;

  /**
   * Property totalText
   *
   * @description
   * Formatted total.
   *
   * @type {string}
   * @readonly
   */
  readonly totalText: string;

  /**
   * Property capacity
   *
   * @description
   * Capacity of the total, `null` without one.
   *
   * @type {number | null}
   * @readonly
   */
  readonly capacity: number | null;

  /**
   * Property capacityText
   *
   * @description
   * Formatted capacity, empty without one.
   *
   * @type {string}
   * @readonly
   */
  readonly capacityText: string;

  /**
   * Property level
   *
   * @description
   * Load level of the total.
   *
   * @type {CwHeatGridLevel}
   * @readonly
   */
  readonly level: CwHeatGridLevel;

  /**
   * Property note
   *
   * @description
   * Note written beside the total (« Available », « Overloaded »), empty for none.
   *
   * @type {string}
   * @readonly
   */
  readonly note: string;

  /**
   * Property meterLabel
   *
   * @description
   * Accessible name of the total meter.
   *
   * @type {string}
   * @readonly
   */
  readonly meterLabel: string;

  /**
   * Property meterZone
   *
   * @description
   * Zone forced on the meter so that its color follows the grid's levels.
   *
   * @type {CwMeterZone}
   * @readonly
   */
  readonly meterZone: CwMeterZone;

  /**
   * Property totalContext
   *
   * @description
   * Context of the `cwHeatGridTotal` template.
   *
   * @type {CwHeatGridTotalContext<T>}
   * @readonly
   */
  readonly totalContext: CwHeatGridTotalContext<T>;
  // #endregion
}

/**
 * Interface ActiveCell
 *
 * @description
 * The cell holding the grid's tab stop, by row key and column key.
 */
interface ActiveCell {
  // #region Properties
  /**
   * Property row
   *
   * @description
   * Row key.
   *
   * @type {string}
   * @readonly
   */
  readonly row: string;

  /**
   * Property col
   *
   * @description
   * Column key, `HEADER_COL` or `TOTAL_COL` for the row header and the total.
   *
   * @type {string}
   * @readonly
   */
  readonly col: string;
  // #endregion
}

/**
 * Constant HEADER_COL
 *
 * @description
 * Column key of the row header cells, in `data-cw-col`.
 *
 * @type {string}
 */
const HEADER_COL: string = '__row';

/**
 * Constant TOTAL_COL
 *
 * @description
 * Column key of the total cells, in `data-cw-col`.
 *
 * @type {string}
 */
const TOTAL_COL: string = '__total';

/**
 * Constant EMPTY_CELL
 *
 * @description
 * The cell of a row without a value in a column.
 *
 * @type {CwHeatGridCell<never>}
 */
const EMPTY_CELL: CwHeatGridCell<never> = { value: 0, items: [] };

/**
 * Constant EDITABLE
 *
 * @description
 * Editable elements inside a cell: they keep their own keys and clicks.
 *
 * @type {string}
 */
const EDITABLE: string =
  'input, textarea, select, [contenteditable]:not([contenteditable="false"])';

/**
 * Constant FOCUSABLE
 *
 * @description
 * Controls inside a cell, editable elements included: they keep their own clicks and leave the tab order outside the active cell.
 *
 * @type {string}
 */
const FOCUSABLE: string = `a[href], button, [tabindex], ${EDITABLE}`;

/* Mockup App.dc.html, workload: jade below 85 %, balise above, grenat past the capacity. */
/**
 * Constant FILLS
 *
 * @description
 * Fill classes of a load bar by level.
 *
 * @type {Record<CwHeatGridLevel, string>}
 */
const FILLS: Record<CwHeatGridLevel, string> = {
  none: 'bg-transparent',
  neutral: 'bg-line-control',
  available: 'bg-jade',
  high: 'bg-balise',
  over: 'bg-grenat',
};

/**
 * Constant ZONES
 *
 * @description
 * Meter zone matching each level, so the total meter takes the same color as the cells.
 *
 * @type {Record<CwHeatGridLevel, CwMeterZone>}
 */
const ZONES: Record<CwHeatGridLevel, CwMeterZone> = {
  none: 'optimum',
  neutral: 'normal',
  available: 'optimum',
  high: 'high',
  over: 'critical',
};

/**
 * Constant SKELETON_ROWS
 *
 * @description
 * Rows drawn by the loading state (mockup `App.dc.html`, workload skeleton).
 *
 * @type {readonly number[]}
 */
const SKELETON_ROWS: readonly number[] = [0, 1, 2, 3];

/**
 * Constant NUMBER_FORMAT
 *
 * @description
 * Default value format of a locale, at most one decimal place, built once per locale.
 *
 * @type {(locale: string) => (value: number) => string}
 */
const NUMBER_FORMAT: (locale: string) => (value: number) => string = ɵperLocale(
  (locale: string) => {
    const number: Intl.NumberFormat = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
    return (value: number): string => number.format(value);
  },
);

/**
 * Constant CELL
 *
 * @description
 * Classes shared by the body cells.
 *
 * @type {string}
 */
const CELL: string = `border-b border-border ${ɵFOCUS_INSET}`;

/**
 * Component CwHeatGrid
 *
 * @description
 * A load grid, rows × columns, coloured by how full each cell is: the workload of a list, person × day (mockup `App.dc.html`, workload view). Each row has a row header (avatar and name, or a dashed placeholder avatar for « Unassigned »), one cell per column and a total. A cell shows its formatted value (`valueFormat`), a load bar against `capacity` (jade, balise above the `high` share, grenat with a warning past the capacity), then up to `maxChips` items through `ng-template[cwHeatGridChip]` and a « +n » button. A click on a cell, or Enter / Space on it, opens a `cw-popover` titled « row · column » with its sum and every item (or `emptyCell`), and emits `cellOpen`. The total column sums the row and draws a `cw-meter` against the row's `capacity` with its level note; `ng-template[cwHeatGridTotal]` adds a line under the total. Accessibility: a native table with `role="grid"`, column headers, row headers and grid cells, named by `ariaLabel`; one tab stop roving over the body cells with the arrows, Home / End (row), Ctrl + Home / End (grid); the controls of the active cell are reached with Tab; each day cell starts with the `cell` label (visually hidden, so that its accessible name also holds its visible chips) and carries `aria-haspopup="dialog"` and `aria-expanded`. Texts come from `provideCwHeatGridLabels` and the `labels` input (French defaults from the mockup). `loading` draws skeleton rows with `aria-busy`; without rows the grid shows `emptyText`. Below 768 px the row header narrows and the grid scrolls horizontally, its header row and row headers sticky. Style hooks: `data-level` on day cells, `data-state="open"` on the cell whose popover is open.
 */
@Component({
  selector: 'cw-heat-grid',
  imports: [CwAvatar, CwMeter, CwPopover, CwSkeleton, NgIcon, NgTemplateOutlet],
  providers: [provideIcons({ phosphorUserBold, phosphorWarningCircleFill })],
  host: {
    class: 'flex min-h-0 max-w-full min-w-0 flex-col',
    '[attr.aria-busy]': 'loading() ? "true" : null',
  },
  templateUrl: './heat-grid.component.html',
})
export class CwHeatGrid<T> {
  // #region Properties
  /**
   * Property rows
   *
   * @description
   * Rows of the grid, in display order (a placeholder row last).
   *
   * @type {InputSignal<readonly CwHeatGridRow<T>[]>}
   * @readonly
   */
  public readonly rows: InputSignal<readonly CwHeatGridRow<T>[]> =
    input.required<readonly CwHeatGridRow<T>[]>();

  /**
   * Property columns
   *
   * @description
   * Columns of the grid, in display order.
   *
   * @type {InputSignal<readonly CwHeatGridColumn[]>}
   * @readonly
   */
  public readonly columns: InputSignal<readonly CwHeatGridColumn[]> =
    input.required<readonly CwHeatGridColumn[]>();

  /**
   * Property ariaLabel
   *
   * @description
   * Accessible name of the grid (« Workload from … to …, capacity 6 h a day »).
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly ariaLabel: InputSignal<string> = input.required<string>();

  /**
   * Property capacity
   *
   * @description
   * Capacity of a cell (6 h a day in the mockup); a cell's own `capacity` wins. `null` (the default) draws bars relative to the largest value, without load levels.
   *
   * @type {InputSignalWithTransform<number | null, unknown>}
   * @readonly
   */
  public readonly capacity: InputSignalWithTransform<number | null, unknown> = input<
    number | null,
    unknown
  >(null, {
    transform: (value: unknown) =>
      value === null || value === undefined || value === '' ? null : numberAttribute(value),
  });

  /**
   * Property high
   *
   * @description
   * Share of the capacity above which a load is high, 0.85 by default.
   *
   * @type {InputSignalWithTransform<number, unknown>}
   * @readonly
   */
  public readonly high: InputSignalWithTransform<number, unknown> = input(CW_HEAT_GRID_HIGH, {
    transform: numberAttribute,
  });

  /**
   * Property maxChips
   *
   * @description
   * Items drawn in a cell before the « +n » button, 2 by default.
   *
   * @type {InputSignalWithTransform<number, unknown>}
   * @readonly
   */
  public readonly maxChips: InputSignalWithTransform<number, unknown> = input(2, {
    transform: numberAttribute,
  });

  /**
   * Property valueFormat
   *
   * @description
   * Writes a value, a capacity and a total; by default a number of the locale given by `provideCwLocale`, one decimal at most. Give the unit here (`(h) => h + ' h'`).
   *
   * @type {InputSignal<(value: number) => string>}
   * @readonly
   */
  public readonly valueFormat: InputSignal<(value: number) => string> = input<
    (value: number) => string
  >(NUMBER_FORMAT(inject(ɵLOCALE)));

  /**
   * Property loading
   *
   * @description
   * Draws skeleton rows in place of the body, with `aria-busy`.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly loading: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property labels
   *
   * @description
   * Texts of this grid, over the provided ones.
   *
   * @type {InputSignal<Partial<CwHeatGridLabels>>}
   * @readonly
   */
  public readonly labels: InputSignal<Partial<CwHeatGridLabels>> = input<Partial<CwHeatGridLabels>>(
    {},
  );

  /**
   * Property cellOpen
   *
   * @description
   * The popover of a cell opened.
   *
   * @type {OutputEmitterRef<CwHeatGridCellEvent<T>>}
   * @readonly
   */
  public readonly cellOpen: OutputEmitterRef<CwHeatGridCellEvent<T>> =
    output<CwHeatGridCellEvent<T>>();

  /**
   * Property chipDef
   *
   * @description
   * The projected item template, when given.
   *
   * @type {Signal<CwHeatGridChipDef<T> | undefined>}
   * @readonly
   */
  private readonly chipDef: Signal<CwHeatGridChipDef<T> | undefined> =
    contentChild<CwHeatGridChipDef<T>>(CwHeatGridChipDef);

  /**
   * Property totalDef
   *
   * @description
   * The projected total line template, when given.
   *
   * @type {Signal<CwHeatGridTotalDef<T> | undefined>}
   * @readonly
   */
  private readonly totalDef: Signal<CwHeatGridTotalDef<T> | undefined> =
    contentChild<CwHeatGridTotalDef<T>>(CwHeatGridTotalDef);

  /**
   * Property popover
   *
   * @description
   * The cell popover.
   *
   * @type {Signal<CwPopover>}
   * @readonly
   */
  private readonly popover: Signal<CwPopover> = viewChild.required(CwPopover);

  /**
   * Property tableRef
   *
   * @description
   * The grid table.
   *
   * @type {Signal<ElementRef<HTMLTableElement> | undefined>}
   * @readonly
   */
  private readonly tableRef: Signal<ElementRef<HTMLTableElement> | undefined> =
    viewChild<ElementRef<HTMLTableElement>>('table');

  /**
   * Property providedLabels
   *
   * @description
   * Texts provided for this injector.
   *
   * @type {CwHeatGridLabels}
   * @readonly
   */
  private readonly providedLabels: CwHeatGridLabels = inject(HEAT_GRID_LABELS);

  /**
   * Property active
   *
   * @description
   * The cell holding the tab stop; the first day cell when none was focused.
   *
   * @type {WritableSignal<ActiveCell | null>}
   * @readonly
   */
  private readonly active: WritableSignal<ActiveCell | null> = signal<ActiveCell | null>(null);

  /**
   * Property openCell
   *
   * @description
   * The cell the popover was last opened on; kept while the popover fades out, so its title stays.
   *
   * @type {WritableSignal<ActiveCell | null>}
   * @readonly
   */
  protected readonly openCell: WritableSignal<ActiveCell | null> = signal<ActiveCell | null>(null);

  /**
   * Property popoverOpen
   *
   * @description
   * Whether the cell popover is open.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  private readonly popoverOpen: WritableSignal<boolean> = signal(false);

  /**
   * Property openElement
   *
   * @description
   * The cell element the popover was opened on, given the focus back when the popover closes.
   *
   * @type {HTMLElement | null}
   */
  private openElement: HTMLElement | null = null;

  /**
   * Property injector
   *
   * @description
   * Injector of the render hooks.
   *
   * @type {Injector}
   * @readonly
   */
  private readonly injector: Injector = inject(Injector);

  /**
   * Property headerCol
   *
   * @description
   * Column key of the row headers.
   *
   * @type {string}
   * @readonly
   */
  protected readonly headerCol: string = HEADER_COL;

  /**
   * Property totalCol
   *
   * @description
   * Column key of the totals.
   *
   * @type {string}
   * @readonly
   */
  protected readonly totalCol: string = TOTAL_COL;

  /**
   * Property skeletonRows
   *
   * @description
   * Rows of the loading state.
   *
   * @type {readonly number[]}
   * @readonly
   */
  protected readonly skeletonRows: readonly number[] = SKELETON_ROWS;

  /**
   * Property fills
   *
   * @description
   * Fill classes of the load bars.
   *
   * @type {Record<CwHeatGridLevel, string>}
   * @readonly
   */
  protected readonly fills: Record<CwHeatGridLevel, string> = FILLS;

  /**
   * Property moreClasses
   *
   * @description
   * Classes of the « +n » button of a cell.
   *
   * @type {string}
   * @readonly
   */
  protected readonly moreClasses: string = `self-start rounded-md px-1.5 text-[11px] whitespace-nowrap text-muted-foreground tabular-nums transition-colors hover:bg-accent hover:text-foreground motion-reduce:transition-none ${ɵFOCUS}`;

  /**
   * Property copy
   *
   * @description
   * The merged texts.
   *
   * @type {Signal<CwHeatGridLabels>}
   * @readonly
   */
  protected readonly copy: Signal<CwHeatGridLabels> = computed<CwHeatGridLabels>(() => ({
    ...this.providedLabels,
    ...this.labels(),
  }));

  /**
   * Property scale
   *
   * @description
   * Value of a full bar without capacity: the largest cell value.
   *
   * @type {Signal<number>}
   * @readonly
   */
  private readonly scale: Signal<number> = computed(() => {
    let max: number = 0;
    for (const row of this.rows()) {
      for (const cell of Object.values(row.cells)) max = Math.max(max, cell.value);
    }
    return max || 1;
  });

  /**
   * Property view
   *
   * @description
   * Rows ready to render: cells with their levels, chips and names, and totals.
   *
   * @type {Signal<readonly RowView<T>[]>}
   * @readonly
   */
  protected readonly view: Signal<readonly RowView<T>[]> = computed(() => {
    const copy: CwHeatGridLabels = this.copy();
    const format: (value: number) => string = this.valueFormat();
    const columns: readonly CwHeatGridColumn[] = this.columns();
    const gridCapacity: number | null = this.capacity();
    const maxChips: number = Math.max(0, this.maxChips());
    const scale: number = this.scale();
    return this.rows().map((row): RowView<T> => {
      let total: number = 0;
      const cells: CellView<T>[] = columns.map((column): CellView<T> => {
        const cell: CwHeatGridCell<T> = row.cells[column.key] ?? EMPTY_CELL;
        const value: number = Math.max(0, cell.value);
        const items: readonly T[] = cell.items ?? [];
        total += value;
        // A placeholder row stands for nobody: its cells have no capacity, hence no level.
        const capacity: number | null = row.placeholder
          ? null
          : (cell.capacity ?? gridCapacity ?? null);
        const level: CwHeatGridLevel = this.levelOf(value, capacity);
        const reference: number = capacity ?? gridCapacity ?? scale;
        const chips: readonly T[] = items.slice(0, maxChips);
        return {
          column,
          cell,
          text: value > 0 ? format(value) : '—',
          level,
          width: reference > 0 ? Math.min(100, Math.round((value / reference) * 100)) : 0,
          chips,
          hidden: items.length - chips.length,
          label: copy.cell({
            row: row.label,
            column: column.label,
            value: format(value),
            capacity: capacity === null ? null : format(capacity),
            level,
            count: items.length,
          }),
        };
      });
      const capacity: number | null = row.capacity ?? null;
      const level: CwHeatGridLevel =
        capacity === null ? (total > 0 ? 'neutral' : 'none') : this.levelOf(total, capacity);
      const note: string =
        capacity === null
          ? row.placeholder && total > 0
            ? copy.placeholderNote
            : ''
          : level === 'over'
            ? copy.over
            : level === 'high'
              ? copy.high
              : copy.available;
      const totalText: string = format(total);
      const capacityText: string = capacity === null ? '' : format(capacity);
      return {
        row,
        cells,
        total,
        totalText,
        capacity,
        capacityText,
        level,
        note,
        meterLabel: copy.meter(row.label, totalText, capacityText),
        meterZone: ZONES[level],
        totalContext: { $implicit: row, row, total, capacity, level },
      };
    });
  });

  /**
   * Property openView
   *
   * @description
   * The row and cell of the open popover, for its title, sum and items.
   *
   * @type {Signal<{ row: RowView<T>; cell: CellView<T>; title: string; sum: string } | null>}
   * @readonly
   */
  protected readonly openView: Signal<{
    row: RowView<T>;
    cell: CellView<T>;
    title: string;
    sum: string;
  } | null> = computed(() => {
    const open: ActiveCell | null = this.openCell();
    if (!open) return null;
    const row: RowView<T> | undefined = this.view().find((entry) => entry.row.key === open.row);
    const cell: CellView<T> | undefined = row?.cells.find((entry) => entry.column.key === open.col);
    if (!row || !cell) return null;
    const copy: CwHeatGridLabels = this.copy();
    const format: (value: number) => string = this.valueFormat();
    const capacity: number | null = row.row.placeholder
      ? null
      : (cell.cell.capacity ?? this.capacity());
    return {
      row,
      cell,
      title: copy.popoverTitle(row.row.label, cell.column.label),
      sum: copy.popoverSum(
        format(Math.max(0, cell.cell.value)),
        capacity === null ? null : format(capacity),
      ),
    };
  });

  /**
   * Property chipTemplate
   *
   * @description
   * The item template, `null` without one.
   *
   * @type {Signal<TemplateRef<CwHeatGridItemContext<T>> | null>}
   * @readonly
   */
  protected readonly chipTemplate: Signal<TemplateRef<CwHeatGridItemContext<T>> | null> = computed(
    () => this.chipDef()?.template ?? null,
  );

  /**
   * Property totalTemplate
   *
   * @description
   * The total line template, `null` without one.
   *
   * @type {Signal<TemplateRef<CwHeatGridTotalContext<T>> | null>}
   * @readonly
   */
  protected readonly totalTemplate: Signal<TemplateRef<CwHeatGridTotalContext<T>> | null> =
    computed(() => this.totalDef()?.template ?? null);

  /**
   * Property tabStop
   *
   * @description
   * The cell holding the tab stop: the active one while its row and column exist, else the first day cell (the first row header without columns).
   *
   * @type {Signal<ActiveCell | null>}
   * @readonly
   */
  protected readonly tabStop: Signal<ActiveCell | null> = computed(() => {
    const rows: readonly CwHeatGridRow<T>[] = this.rows();
    const keys: string[] = this.columnKeys();
    const active: ActiveCell | null = this.active();
    if (active && rows.some((row) => row.key === active.row) && keys.includes(active.col)) {
      return active;
    }
    const first: CwHeatGridRow<T> | undefined = rows.at(0);
    return first ? { row: first.key, col: this.columns().at(0)?.key ?? HEADER_COL } : null;
  });

  /**
   * Property columnKeys
   *
   * @description
   * Keys of the navigable columns: the row header, the columns, the total.
   *
   * @type {Signal<string[]>}
   * @readonly
   */
  private readonly columnKeys: Signal<string[]> = computed(() => [
    HEADER_COL,
    ...this.columns().map((column) => column.key),
    TOTAL_COL,
  ]);
  // #endregion

  // #region Constructor
  /**
   * Constructor
   *
   * @description
   * Keeps the controls of inactive cells out of the tab order: the grid has a single tab stop.
   *
   * @constructor
   */
  public constructor() {
    afterRenderEffect({
      write: () => {
        this.view();
        const stop: ActiveCell | null = this.tabStop();
        const table: HTMLTableElement | undefined = this.tableRef()?.nativeElement;
        if (!table) return;
        for (const cell of Array.from(table.querySelectorAll<HTMLElement>('[data-cw-cell]'))) {
          const active: boolean =
            !!stop &&
            cell.dataset['cwCol'] === stop.col &&
            cell.closest<HTMLElement>('[data-cw-row]')?.dataset['cwRow'] === stop.row;
          for (const control of Array.from(cell.querySelectorAll<HTMLElement>(FOCUSABLE))) {
            if (!control.hasAttribute('data-cw-tabindex')) {
              control.setAttribute('data-cw-tabindex', control.getAttribute('tabindex') ?? '');
            }
            const original: string = control.getAttribute('data-cw-tabindex') ?? '';
            if (!active) control.setAttribute('tabindex', '-1');
            else if (original === '') control.removeAttribute('tabindex');
            else control.setAttribute('tabindex', original);
          }
        }
      },
    });
  }
  // #endregion

  // #region Methods
  /**
   * Method isTabStop
   *
   * @description
   * Whether a cell holds the grid's tab stop.
   *
   * @param {string} row - Row key.
   * @param {string} col - Column key.
   * @returns {boolean} Whether the cell is the tab stop.
   */
  protected isTabStop(row: string, col: string): boolean {
    const stop: ActiveCell | null = this.tabStop();
    return stop?.row === row && stop.col === col;
  }

  /**
   * Method isOpen
   *
   * @description
   * Whether the popover of a cell is open.
   *
   * @param {string} row - Row key.
   * @param {string} col - Column key.
   * @returns {boolean} Whether the cell's popover is open.
   */
  protected isOpen(row: string, col: string): boolean {
    const open: ActiveCell | null = this.openCell();
    return this.popoverOpen() && open?.row === row && open.col === col;
  }

  /**
   * Method cellClasses
   *
   * @description
   * Builds classes for a day cell: its border (thicker at a group start), the tint of the current column and the open state.
   *
   * @param {CwHeatGridColumn} column - Column of the cell.
   * @returns {string} Classes for the cell.
   */
  protected cellClasses(column: CwHeatGridColumn): string {
    return `${CELL} w-28 min-w-28 cursor-pointer p-1.5 align-top transition-colors hover:bg-accent data-[state=open]:bg-selected motion-reduce:transition-none ${
      column.groupStart ? 'border-l-2' : 'border-l'
    }${column.current ? ' bg-muted/60' : ''}`;
  }

  /**
   * Method headClasses
   *
   * @description
   * Builds classes for a column header.
   *
   * @param {CwHeatGridColumn} column - Column of the header.
   * @returns {string} Classes for the header.
   */
  protected headClasses(column: CwHeatGridColumn): string {
    return `sticky top-0 z-20 w-28 min-w-28 border-b bg-background py-1.5 font-normal ${
      column.groupStart ? 'border-l-2' : 'border-l'
    }`;
  }

  /**
   * Method itemContext
   *
   * @description
   * Builds the context of the item template.
   *
   * @param {T} item - Item to draw.
   * @param {CwHeatGridRow<T>} row - Row of the cell.
   * @param {CwHeatGridColumn} column - Column of the cell.
   * @param {'cell' | 'popover'} placement - Where the item is drawn.
   * @returns {CwHeatGridItemContext<T>} Template context.
   */
  protected itemContext(
    item: T,
    row: CwHeatGridRow<T>,
    column: CwHeatGridColumn,
    placement: 'cell' | 'popover',
  ): CwHeatGridItemContext<T> {
    return { $implicit: item, item, row, column, placement };
  }

  /**
   * Method onCellClick
   *
   * @description
   * Opens or closes the popover of a day cell on a click outside its own controls (the « +n » button counts as the cell).
   *
   * @param {MouseEvent} event - Click inside the cell.
   * @param {RowView<T>} row - Row of the cell.
   * @param {CellView<T>} cell - The cell.
   */
  protected onCellClick(event: MouseEvent, row: RowView<T>, cell: CellView<T>): void {
    const target: Element | null = event.target instanceof Element ? event.target : null;
    const control: Element | null | undefined = target?.closest(FOCUSABLE);
    const element: HTMLElement = event.currentTarget as HTMLElement;
    // A chip handles its own click (open the item); the cell itself has a tabindex.
    if (control && control !== element && !control.hasAttribute('data-cw-heat-more')) return;
    this.toggle(element, row, cell);
  }

  /**
   * Method onFocusin
   *
   * @description
   * Moves the tab stop to the cell receiving focus.
   *
   * @param {FocusEvent} event - Focus event inside the grid.
   */
  protected onFocusin(event: FocusEvent): void {
    const cell: HTMLElement | null =
      event.target instanceof Element ? event.target.closest<HTMLElement>('[data-cw-cell]') : null;
    const row: string | undefined = cell?.closest<HTMLElement>('[data-cw-row]')?.dataset['cwRow'];
    const col: string | undefined = cell?.dataset['cwCol'];
    if (row === undefined || col === undefined) return;
    const active: ActiveCell | null = this.active();
    if (active?.row !== row || active.col !== col) this.active.set({ row, col });
  }

  /**
   * Method onKeydown
   *
   * @description
   * Moves between the cells with the arrows, Home and End; opens a day cell's popover with Enter or Space.
   *
   * @param {KeyboardEvent} event - Keyboard event inside the grid.
   */
  protected onKeydown(event: KeyboardEvent): void {
    const target: HTMLElement | null = event.target instanceof HTMLElement ? event.target : null;
    const cell: HTMLElement | null | undefined = target?.closest<HTMLElement>('[data-cw-cell]');
    if (!target || !cell) return;
    if (target.closest(EDITABLE)) return;
    const rowKey: string = cell.closest<HTMLElement>('[data-cw-row]')?.dataset['cwRow'] ?? '';
    const colKey: string = cell.dataset['cwCol'] ?? '';
    if ((event.key === 'Enter' || event.key === ' ') && target === cell) {
      const row: RowView<T> | undefined = this.view().find((entry) => entry.row.key === rowKey);
      const day: CellView<T> | undefined = row?.cells.find((entry) => entry.column.key === colKey);
      if (!row || !day) return;
      event.preventDefault();
      this.toggle(cell, row, day);
      return;
    }
    const next: ActiveCell | null = this.nextCell(event, rowKey, colKey);
    if (!next) return;
    event.preventDefault();
    this.active.set(next);
    const table: HTMLTableElement | undefined = this.tableRef()?.nativeElement;
    const element: HTMLElement | null | undefined = table?.querySelector<HTMLElement>(
      `[data-cw-row="${CSS.escape(next.row)}"] [data-cw-col="${CSS.escape(next.col)}"]`,
    );
    element?.focus();
    if (element && 'scrollIntoView' in element) {
      element.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }

  /**
   * Method onPopoverOpenChange
   *
   * @description
   * Follows the open state of the popover; once it closes (Escape, outside click, Tab out), gives the focus back to its cell when the focus was left nowhere, since the popover is anchored inside the cell.
   *
   * @param {boolean} open - New open state of the popover.
   */
  protected onPopoverOpenChange(open: boolean): void {
    this.popoverOpen.set(open);
    if (open) return;
    const cell: HTMLElement | null = this.openElement;
    afterNextRender(
      () => {
        const active: Element | null = cell?.ownerDocument.activeElement ?? null;
        if (cell?.isConnected && (active === null || active === cell.ownerDocument.body)) {
          cell.focus();
        }
      },
      { injector: this.injector },
    );
  }

  /**
   * Method nextCell
   *
   * @description
   * Resolves the cell a navigation key moves to, `null` for another key.
   *
   * @param {KeyboardEvent} event - Keyboard event.
   * @param {string} rowKey - Current row key.
   * @param {string} colKey - Current column key.
   * @returns {ActiveCell | null} Target cell, or null when the key does not navigate.
   */
  private nextCell(event: KeyboardEvent, rowKey: string, colKey: string): ActiveCell | null {
    const rows: string[] = this.rows().map((row) => row.key);
    const cols: string[] = this.columnKeys();
    const rowIndex: number = rows.indexOf(rowKey);
    const colIndex: number = cols.indexOf(colKey);
    if (rowIndex < 0 || colIndex < 0 || event.altKey) return null;
    const ctrl: boolean = event.ctrlKey || event.metaKey;
    const rtl: boolean = getComputedStyle(event.target as Element).direction === 'rtl';
    let row: number = rowIndex;
    let col: number = colIndex;
    switch (event.key) {
      case 'ArrowDown':
        row += 1;
        break;
      case 'ArrowUp':
        row -= 1;
        break;
      case 'ArrowRight':
        col += rtl ? -1 : 1;
        break;
      case 'ArrowLeft':
        col += rtl ? 1 : -1;
        break;
      case 'Home':
        col = 0;
        if (ctrl) row = 0;
        break;
      case 'End':
        col = cols.length - 1;
        if (ctrl) row = rows.length - 1;
        break;
      default:
        return null;
    }
    row = Math.max(0, Math.min(rows.length - 1, row));
    col = Math.max(0, Math.min(cols.length - 1, col));
    return { row: rows[row], col: cols[col] };
  }

  /**
   * Method toggle
   *
   * @description
   * Opens the popover against a day cell, or closes it when that cell's popover is open.
   *
   * @param {HTMLElement} element - The cell element anchoring the popover.
   * @param {RowView<T>} row - Row of the cell.
   * @param {CellView<T>} cell - The cell.
   */
  private toggle(element: HTMLElement, row: RowView<T>, cell: CellView<T>): void {
    const popover: CwPopover = this.popover();
    // The panel is inserted next to its anchor: anchored inside the cell, it stays out of the row,
    // which may only hold cells.
    const anchor: HTMLElement =
      element.querySelector<HTMLElement>('[data-cw-heat-anchor]') ?? element;
    const opening: boolean = !popover.isOpenFrom(anchor);
    this.active.set({ row: row.row.key, col: cell.column.key });
    if (opening) {
      this.openCell.set({ row: row.row.key, col: cell.column.key });
      this.openElement = element;
    }
    popover.toggle(anchor);
    if (opening) this.cellOpen.emit({ row: row.row, column: cell.column, cell: cell.cell });
  }

  /**
   * Method levelOf
   *
   * @description
   * Load level of a value against a capacity.
   *
   * @param {number} value - Load.
   * @param {number | null} capacity - Capacity, `null` without one.
   * @returns {CwHeatGridLevel} The level.
   */
  private levelOf(value: number, capacity: number | null): CwHeatGridLevel {
    if (value <= 0) return 'none';
    if (capacity === null || capacity <= 0) return capacity === null ? 'neutral' : 'over';
    const ratio: number = value / capacity;
    if (ratio > 1) return 'over';
    return ratio > this.high() ? 'high' : 'available';
  }
  // #endregion
}
