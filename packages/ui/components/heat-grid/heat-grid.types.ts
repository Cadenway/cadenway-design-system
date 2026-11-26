/**
 * Type CwHeatGridLevel
 *
 * @description
 * Load level of a cell or a row against its capacity: `none` without any value, `available` up to the `high` share of the capacity, `high` above it, `over` past the capacity; `neutral` for a value without capacity (a placeholder row such as « Unassigned »).
 *
 * @type {'none' | 'neutral' | 'available' | 'high' | 'over'}
 */
export type CwHeatGridLevel = 'none' | 'neutral' | 'available' | 'high' | 'over';

/**
 * Interface CwHeatGridColumn
 *
 * @description
 * One column of the grid, a day of a workload: its full `label` names the column for screen readers and in the popover title; `caption` and `short` are the two lines of its header (« Mon. » over « 23 »).
 */
export interface CwHeatGridColumn {
  // #region Properties
  /**
   * Property key
   *
   * @description
   * Identity of the column, the key of its cell in each row's `cells`.
   *
   * @type {string}
   * @readonly
   */
  readonly key: string;

  /**
   * Property label
   *
   * @description
   * Full name of the column (« Monday 23 November »), read by screen readers and written in the popover title.
   *
   * @type {string}
   * @readonly
   */
  readonly label: string;

  /**
   * Property caption
   *
   * @description
   * Small first line of the header (« Mon. »); none by default.
   *
   * @type {string | undefined}
   * @readonly
   */
  readonly caption?: string;

  /**
   * Property short
   *
   * @description
   * Main line of the header (« 23 »); `label` when not given.
   *
   * @type {string | undefined}
   * @readonly
   */
  readonly short?: string;

  /**
   * Property current
   *
   * @description
   * Marks the current column (today): its header number is inverted and its cells are tinted.
   *
   * @type {boolean | undefined}
   * @readonly
   */
  readonly current?: boolean;

  /**
   * Property groupStart
   *
   * @description
   * Starts a new group of columns (a new week): a thicker border on its left.
   *
   * @type {boolean | undefined}
   * @readonly
   */
  readonly groupStart?: boolean;
  // #endregion
}

/**
 * Interface CwHeatGridCell
 *
 * @description
 * The load of one row in one column: its `value` (hours) and the `items` behind it, drawn as chips and listed in the popover.
 */
export interface CwHeatGridCell<T> {
  // #region Properties
  /**
   * Property value
   *
   * @description
   * Load of the cell, in the unit `valueFormat` writes; 0 or less is an empty cell.
   *
   * @type {number}
   * @readonly
   */
  readonly value: number;

  /**
   * Property items
   *
   * @description
   * Items behind the load (the tasks of the day), in display order; none by default.
   *
   * @type {readonly T[] | undefined}
   * @readonly
   */
  readonly items?: readonly T[];

  /**
   * Property capacity
   *
   * @description
   * Capacity of this cell only, over the grid's `capacity` (a day off).
   *
   * @type {number | undefined}
   * @readonly
   */
  readonly capacity?: number;
  // #endregion
}

/**
 * Interface CwHeatGridRow
 *
 * @description
 * One row of the grid, a person: the avatar and name of its row header, its cells by column key, and the capacity of its total.
 */
export interface CwHeatGridRow<T> {
  // #region Properties
  /**
   * Property key
   *
   * @description
   * Identity of the row.
   *
   * @type {string}
   * @readonly
   */
  readonly key: string;

  /**
   * Property label
   *
   * @description
   * Name written in the row header and read with each of its cells.
   *
   * @type {string}
   * @readonly
   */
  readonly label: string;

  /**
   * Property src
   *
   * @description
   * Picture of the row's avatar; initials of `label` otherwise.
   *
   * @type {string | null | undefined}
   * @readonly
   */
  readonly src?: string | null;

  /**
   * Property placeholder
   *
   * @description
   * A row that stands for nobody (« Unassigned »): a dashed avatar with a person icon, cells without load level, and the `placeholderNote` in its total.
   *
   * @type {boolean | undefined}
   * @readonly
   */
  readonly placeholder?: boolean;

  /**
   * Property cells
   *
   * @description
   * Cells by column key; a missing key is an empty cell.
   *
   * @type {Readonly<Record<string, CwHeatGridCell<T>>>}
   * @readonly
   */
  readonly cells: Readonly<Record<string, CwHeatGridCell<T>>>;

  /**
   * Property capacity
   *
   * @description
   * Capacity of the row's total (« 60 h » over two weeks), drawn as a `cw-meter`; `null` or missing draws no meter and no level.
   *
   * @type {number | null | undefined}
   * @readonly
   */
  readonly capacity?: number | null;
  // #endregion
}

/**
 * Interface CwHeatGridItemContext
 *
 * @description
 * Context of a `ng-template[cwHeatGridChip]`: `let-item` (the implicit value), the row and the column it belongs to, and where it is drawn (`cell` for the chips of a cell, `popover` for the list of the popover).
 */
export interface CwHeatGridItemContext<T> {
  // #region Properties
  /**
   * Property $implicit
   *
   * @description
   * The item.
   *
   * @type {T}
   * @readonly
   */
  readonly $implicit: T;

  /**
   * Property item
   *
   * @description
   * The item, under a name.
   *
   * @type {T}
   * @readonly
   */
  readonly item: T;

  /**
   * Property row
   *
   * @description
   * Row of the cell.
   *
   * @type {CwHeatGridRow<T>}
   * @readonly
   */
  readonly row: CwHeatGridRow<T>;

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
   * Property placement
   *
   * @description
   * Where the item is drawn: in the cell or in the popover list.
   *
   * @type {'cell' | 'popover'}
   * @readonly
   */
  readonly placement: 'cell' | 'popover';
  // #endregion
}

/**
 * Interface CwHeatGridTotalContext
 *
 * @description
 * Context of a `ng-template[cwHeatGridTotal]`, an extra line of the total cell (« Spent: 12 h »): `let-row` (the implicit value), its `total`, its `capacity` and its `level`.
 */
export interface CwHeatGridTotalContext<T> {
  // #region Properties
  /**
   * Property $implicit
   *
   * @description
   * The row.
   *
   * @type {CwHeatGridRow<T>}
   * @readonly
   */
  readonly $implicit: CwHeatGridRow<T>;

  /**
   * Property row
   *
   * @description
   * The row, under a name.
   *
   * @type {CwHeatGridRow<T>}
   * @readonly
   */
  readonly row: CwHeatGridRow<T>;

  /**
   * Property total
   *
   * @description
   * Sum of the values of the row's cells over the given columns.
   *
   * @type {number}
   * @readonly
   */
  readonly total: number;

  /**
   * Property capacity
   *
   * @description
   * Capacity of the row, `null` without one.
   *
   * @type {number | null}
   * @readonly
   */
  readonly capacity: number | null;

  /**
   * Property level
   *
   * @description
   * Load level of the total against the capacity.
   *
   * @type {CwHeatGridLevel}
   * @readonly
   */
  readonly level: CwHeatGridLevel;
  // #endregion
}

/**
 * Interface CwHeatGridCellEvent
 *
 * @description
 * Emitted by `cellOpen` when the popover of a cell opens: the row, the column and the cell.
 */
export interface CwHeatGridCellEvent<T> {
  // #region Properties
  /**
   * Property row
   *
   * @description
   * Row of the opened cell.
   *
   * @type {CwHeatGridRow<T>}
   * @readonly
   */
  readonly row: CwHeatGridRow<T>;

  /**
   * Property column
   *
   * @description
   * Column of the opened cell.
   *
   * @type {CwHeatGridColumn}
   * @readonly
   */
  readonly column: CwHeatGridColumn;

  /**
   * Property cell
   *
   * @description
   * The opened cell; an empty cell has a value of 0 and no items.
   *
   * @type {CwHeatGridCell<T>}
   * @readonly
   */
  readonly cell: CwHeatGridCell<T>;
  // #endregion
}

/**
 * Interface CwHeatGridCellLabelContext
 *
 * @description
 * What the `cell` label writes the accessible name of a cell from; values come formatted by `valueFormat`.
 */
export interface CwHeatGridCellLabelContext {
  // #region Properties
  /**
   * Property row
   *
   * @description
   * Row label.
   *
   * @type {string}
   * @readonly
   */
  readonly row: string;

  /**
   * Property column
   *
   * @description
   * Full column label.
   *
   * @type {string}
   * @readonly
   */
  readonly column: string;

  /**
   * Property value
   *
   * @description
   * Formatted value of the cell.
   *
   * @type {string}
   * @readonly
   */
  readonly value: string;

  /**
   * Property capacity
   *
   * @description
   * Formatted capacity of the cell, `null` without one.
   *
   * @type {string | null}
   * @readonly
   */
  readonly capacity: string | null;

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
   * Property count
   *
   * @description
   * Number of items in the cell.
   *
   * @type {number}
   * @readonly
   */
  readonly count: number;
  // #endregion
}

/**
 * Interface CwHeatGridLabels
 *
 * @description
 * Texts of `cw-heat-grid`, replaced with `provideCwHeatGridLabels` or the `labels` input.
 */
export interface CwHeatGridLabels {
  // #region Properties
  /**
   * Property rowHeader
   *
   * @description
   * Header of the row header column.
   *
   * @type {string}
   * @readonly
   */
  readonly rowHeader: string;

  /**
   * Property totalHeader
   *
   * @description
   * Header of the total column (« Total · 60 h »).
   *
   * @type {string}
   * @readonly
   */
  readonly totalHeader: string;

  /**
   * Property available
   *
   * @description
   * Note of a total within its capacity.
   *
   * @type {string}
   * @readonly
   */
  readonly available: string;

  /**
   * Property high
   *
   * @description
   * Note of a total above the high share of its capacity.
   *
   * @type {string}
   * @readonly
   */
  readonly high: string;

  /**
   * Property over
   *
   * @description
   * Note of a total past its capacity.
   *
   * @type {string}
   * @readonly
   */
  readonly over: string;

  /**
   * Property placeholderNote
   *
   * @description
   * Note of a placeholder row's total that holds a load (« To assign »).
   *
   * @type {string}
   * @readonly
   */
  readonly placeholderNote: string;

  /**
   * Property emptyCell
   *
   * @description
   * Text of the popover of a cell without items.
   *
   * @type {string}
   * @readonly
   */
  readonly emptyCell: string;

  /**
   * Property emptyText
   *
   * @description
   * Text shown without any row.
   *
   * @type {string}
   * @readonly
   */
  readonly emptyText: string;

  /**
   * Property loading
   *
   * @description
   * Accessible name of the loading state.
   *
   * @type {string}
   * @readonly
   */
  readonly loading: string;

  /**
   * Property more
   *
   * @description
   * Visible text of the button past the chips of a cell (« +2 »), from the number of hidden items.
   *
   * @type {(hidden: number) => string}
   * @readonly
   */
  readonly more: (hidden: number) => string;

  /**
   * Property moreLabel
   *
   * @description
   * Accessible name of the button past the chips of a cell, from the number of items of the cell.
   *
   * @type {(count: number) => string}
   * @readonly
   */
  readonly moreLabel: (count: number) => string;

  /**
   * Property cell
   *
   * @description
   * Visually hidden description that starts each day cell, hence its accessible name.
   *
   * @type {(context: CwHeatGridCellLabelContext) => string}
   * @readonly
   */
  readonly cell: (context: CwHeatGridCellLabelContext) => string;

  /**
   * Property popoverTitle
   *
   * @description
   * Title and accessible name of the popover of a cell, from the row and the full column labels.
   *
   * @type {(row: string, column: string) => string}
   * @readonly
   */
  readonly popoverTitle: (row: string, column: string) => string;

  /**
   * Property popoverSum
   *
   * @description
   * Sum written in the popover title bar, from the formatted value and capacity (`null` without one).
   *
   * @type {(value: string, capacity: string | null) => string}
   * @readonly
   */
  readonly popoverSum: (value: string, capacity: string | null) => string;

  /**
   * Property meter
   *
   * @description
   * Accessible name of a row's total meter, from its label, its formatted total and capacity.
   *
   * @type {(row: string, total: string, capacity: string) => string}
   * @readonly
   */
  readonly meter: (row: string, total: string, capacity: string) => string;
  // #endregion
}
