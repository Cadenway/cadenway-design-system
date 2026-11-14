/* Exported types of @cadenway/ui/data-table (DataTable and DataTableComplete sheets of the Design
   System artifact). Rows are generic (`T`): the table knows nothing of what a row is. */

/**
 * Type CwSortDirection
 *
 * @description
 * Direction of one sort criterion.
 *
 * @type {'asc' | 'desc'}
 */
export type CwSortDirection = 'asc' | 'desc';

/**
 * Interface CwSort
 *
 * @description
 * One sort criterion: the column key and its direction. The `sort` model is an array of them in order of priority; an empty array means no sort.
 */
export interface CwSort {
  // #region Properties
  /**
   * Property key
   *
   * @description
   * Key of the sorted column.
   *
   * @type {string}
   * @readonly
   */
  readonly key: string;

  /**
   * Property dir
   *
   * @description
   * Ascending or descending.
   *
   * @type {CwSortDirection}
   * @readonly
   */
  readonly dir: CwSortDirection;
  // #endregion
}

/**
 * Type CwDataTableDensity
 *
 * @description
 * Row height: 32, 36 or 44 px (group rows 28, 32 or 36 px).
 *
 * @type {'compact' | 'default' | 'comfortable'}
 */
export type CwDataTableDensity = 'compact' | 'default' | 'comfortable';

/**
 * Type CwColumnAlign
 *
 * @description
 * Horizontal alignment of a column: numbers are aligned at the end.
 *
 * @type {'start' | 'end'}
 */
export type CwColumnAlign = 'start' | 'end';

/**
 * Type CwDataTableSelection
 *
 * @description
 * The ids of the selected rows, or `'all'`: every row that matches the consumer's filters.
 *
 * @type {readonly string[] | 'all'}
 */
export type CwDataTableSelection = readonly string[] | 'all';

/**
 * Interface CwColumnDef
 *
 * @description
 * A column given through the `columns` input; a `cw-data-table-column` child with the same `key` adds its cell and editor templates to it.
 */
export interface CwColumnDef<T> {
  // #region Properties
  /**
   * Property key
   *
   * @description
   * Identity of the column, used by `sort`, `columnWidths`, `columnOrder` and `columnVisibility`.
   *
   * @type {string}
   * @readonly
   */
  readonly key: string;

  /**
   * Property header
   *
   * @description
   * Header label (French copy from the consumer).
   *
   * @type {string | undefined}
   * @readonly
   */
  readonly header?: string;

  /**
   * Property headerHidden
   *
   * @description
   * Keeps the label for assistive technologies only (status icon, actions column).
   *
   * @type {boolean | undefined}
   * @readonly
   */
  readonly headerHidden?: boolean;

  /**
   * Property width
   *
   * @description
   * Initial width in px; without it the column shares the remaining width.
   *
   * @type {number | undefined}
   * @readonly
   */
  readonly width?: number;

  /**
   * Property minWidth
   *
   * @description
   * Lower bound of the resize, in px (64 by default).
   *
   * @type {number | undefined}
   * @readonly
   */
  readonly minWidth?: number;

  /**
   * Property maxWidth
   *
   * @description
   * Upper bound of the resize, in px (480 by default).
   *
   * @type {number | undefined}
   * @readonly
   */
  readonly maxWidth?: number;

  /**
   * Property align
   *
   * @description
   * `end` for numbers: right-aligned, `tabular-nums`.
   *
   * @type {CwColumnAlign | undefined}
   * @readonly
   */
  readonly align?: CwColumnAlign;

  /**
   * Property sortable
   *
   * @description
   * Whether a click on the header sorts by this column.
   *
   * @type {boolean | undefined}
   * @readonly
   */
  readonly sortable?: boolean;

  /**
   * Property resizable
   *
   * @description
   * Whether the column has a resize handle (true by default when the table allows resizing).
   *
   * @type {boolean | undefined}
   * @readonly
   */
  readonly resizable?: boolean;

  /**
   * Property hideable
   *
   * @description
   * Whether `columnVisibility` may hide it (true by default; the first column never hides).
   *
   * @type {boolean | undefined}
   * @readonly
   */
  readonly hideable?: boolean;

  /**
   * Property editable
   *
   * @description
   * Whether its editor opens (true by default when the column has a `cwCellEditor` template).
   *
   * @type {boolean | undefined}
   * @readonly
   */
  readonly editable?: boolean;

  /**
   * Property value
   *
   * @description
   * Value of the cell, for the default rendering, the local sort and the editor; `row[key]` otherwise.
   *
   * @type {((row: T) => unknown) | undefined}
   * @readonly
   */
  readonly value?: (row: T) => unknown;
  // #endregion
}

/**
 * Interface CwCellContext
 *
 * @description
 * Context of a `ng-template[cwCell]`: `let-row` (the implicit value), `let-value="value"`, …
 */
export interface CwCellContext<T> {
  // #region Properties
  /**
   * Property $implicit
   *
   * @description
   * The row.
   *
   * @type {T}
   * @readonly
   */
  readonly $implicit: T;

  /**
   * Property row
   *
   * @description
   * The row, named.
   *
   * @type {T}
   * @readonly
   */
  readonly row: T;

  /**
   * Property value
   *
   * @description
   * The value of the cell (`value(row)` or `row[key]`).
   *
   * @type {unknown}
   * @readonly
   */
  readonly value: unknown;

  /**
   * Property open
   *
   * @description
   * Opens the row: emits `rowOpen` (a name link calls it on click).
   *
   * @type {() => void}
   * @readonly
   */
  readonly open: () => void;
  // #endregion
}

/**
 * Interface CwCellEditorContext
 *
 * @description
 * Context of a `ng-template[cwCellEditor]`: the row, its value and the two ways out.
 */
export interface CwCellEditorContext<T> {
  // #region Properties
  /**
   * Property $implicit
   *
   * @description
   * The row.
   *
   * @type {T}
   * @readonly
   */
  readonly $implicit: T;

  /**
   * Property row
   *
   * @description
   * The row, named.
   *
   * @type {T}
   * @readonly
   */
  readonly row: T;

  /**
   * Property value
   *
   * @description
   * The value before the edit.
   *
   * @type {unknown}
   * @readonly
   */
  readonly value: unknown;

  /**
   * Property commit
   *
   * @description
   * Validates: emits `cellEdit` and closes the editor. Bind it to Enter and to `(blur)`.
   *
   * @type {(value: unknown) => void}
   * @readonly
   */
  readonly commit: (value: unknown) => void;

  /**
   * Property cancel
   *
   * @description
   * Cancels: closes the editor and gives back the original value (Escape does it too).
   *
   * @type {() => void}
   * @readonly
   */
  readonly cancel: () => void;
  // #endregion
}

/**
 * Interface CwCellEditEvent
 *
 * @description
 * Payload of `cellEdit`: the row, the column, the new and the previous value.
 */
export interface CwCellEditEvent<T> {
  // #region Properties
  /**
   * Property row
   *
   * @description
   * The edited row.
   *
   * @type {T}
   * @readonly
   */
  readonly row: T;

  /**
   * Property key
   *
   * @description
   * Key of the edited column.
   *
   * @type {string}
   * @readonly
   */
  readonly key: string;

  /**
   * Property value
   *
   * @description
   * Value given to `commit`.
   *
   * @type {unknown}
   * @readonly
   */
  readonly value: unknown;

  /**
   * Property previous
   *
   * @description
   * Value before the edit.
   *
   * @type {unknown}
   * @readonly
   */
  readonly previous: unknown;
  // #endregion
}

/**
 * Interface CwColumnResizeEvent
 *
 * @description
 * Payload of `columnResize`: emitted at the end of a drag, on a double click or a handle key.
 */
export interface CwColumnResizeEvent {
  // #region Properties
  /**
   * Property key
   *
   * @description
   * Key of the resized column.
   *
   * @type {string}
   * @readonly
   */
  readonly key: string;

  /**
   * Property width
   *
   * @description
   * New width in px.
   *
   * @type {number}
   * @readonly
   */
  readonly width: number;
  // #endregion
}

/**
 * Interface CwBulkAction
 *
 * @description
 * An action of the selection bar, given by the consumer (no default: the table knows no task action). `shortcut` is a `KeyboardEvent.key` (`'S'`, `'Delete'`): pressed in the grid while rows are selected, it runs the action; the bar shows it in a `kbd`.
 */
export interface CwBulkAction {
  // #region Properties
  /**
   * Property id
   *
   * @description
   * Identity of the action, sent back in `bulkAction`.
   *
   * @type {string}
   * @readonly
   */
  readonly id: string;

  /**
   * Property label
   *
   * @description
   * Button label (French copy from the consumer).
   *
   * @type {string}
   * @readonly
   */
  readonly label: string;

  /**
   * Property icon
   *
   * @description
   * Name of a registered `ng-icon` (the consumer provides it with `provideIcons`).
   *
   * @type {string | undefined}
   * @readonly
   */
  readonly icon?: string;

  /**
   * Property shortcut
   *
   * @description
   * Keyboard shortcut, as `KeyboardEvent.key`.
   *
   * @type {string | undefined}
   * @readonly
   */
  readonly shortcut?: string;

  /**
   * Property variant
   *
   * @description
   * `destructive` writes the label in `text-destructive` (Supprimer).
   *
   * @type {'default' | 'destructive' | undefined}
   * @readonly
   */
  readonly variant?: 'default' | 'destructive';
  // #endregion
}

/**
 * Interface CwBulkActionEvent
 *
 * @description
 * Payload of `bulkAction`: the action, the selected ids (`'all'` for every matching row), and the button that ran it, so the consumer anchors its picker (status, people, date) on it.
 */
export interface CwBulkActionEvent {
  // #region Properties
  /**
   * Property action
   *
   * @description
   * `id` of the action.
   *
   * @type {string}
   * @readonly
   */
  readonly action: string;

  /**
   * Property ids
   *
   * @description
   * Selected ids, or `'all'`.
   *
   * @type {CwDataTableSelection}
   * @readonly
   */
  readonly ids: CwDataTableSelection;

  /**
   * Property trigger
   *
   * @description
   * The bar button of the action, when it is rendered.
   *
   * @type {HTMLElement | undefined}
   * @readonly
   */
  readonly trigger?: HTMLElement;
  // #endregion
}

/**
 * Interface CwGroupContext
 *
 * @description
 * Context of a `ng-template[cwDataTableGroup]`: what a group row shows before its count.
 */
export interface CwGroupContext {
  // #region Properties
  /**
   * Property $implicit
   *
   * @description
   * The group value (`String(row[groupBy])`).
   *
   * @type {string}
   * @readonly
   */
  readonly $implicit: string;

  /**
   * Property key
   *
   * @description
   * The group value, named.
   *
   * @type {string}
   * @readonly
   */
  readonly key: string;

  /**
   * Property label
   *
   * @description
   * Its label (`groupLabel(key)`).
   *
   * @type {string}
   * @readonly
   */
  readonly label: string;

  /**
   * Property count
   *
   * @description
   * Number of rows in the group.
   *
   * @type {number}
   * @readonly
   */
  readonly count: number;
  // #endregion
}

/**
 * Interface CwDataTableTexts
 *
 * @description
 * The French texts of the table, overridable one by one through the `texts` input. Defaults name tasks, as the mockup does (`App.dc.html`); another list passes its own nouns.
 */
export interface CwDataTableTexts {
  // #region Properties
  /**
   * Property selectAll
   *
   * @description
   * Name of the header checkbox.
   *
   * @type {string}
   * @readonly
   */
  readonly selectAll: string;

  /**
   * Property selectRow
   *
   * @description
   * Name of a row checkbox, from the row label (« Sélectionner CAD-482 »).
   *
   * @type {(label: string) => string}
   * @readonly
   */
  readonly selectRow: (label: string) => string;

  /**
   * Property selected
   *
   * @description
   * Selection count, in the bar and the announcement (« 3 tâches sélectionnées »).
   *
   * @type {(count: number) => string}
   * @readonly
   */
  readonly selected: (count: number) => string;

  /**
   * Property selectAllMatching
   *
   * @description
   * Offer to select beyond the page (« Sélectionner les 128 tâches »).
   *
   * @type {(total: number) => string}
   * @readonly
   */
  readonly selectAllMatching: (total: number) => string;

  /**
   * Property allSelected
   *
   * @description
   * Banner once everything is selected (« Les 128 tâches sont sélectionnées »).
   *
   * @type {(total: number) => string}
   * @readonly
   */
  readonly allSelected: (total: number) => string;

  /**
   * Property clearSelection
   *
   * @description
   * Link that empties the selection from the banner.
   *
   * @type {string}
   * @readonly
   */
  readonly clearSelection: string;

  /**
   * Property sortState
   *
   * @description
   * Hidden suffix of a sorted header (« , tri principal croissant »).
   *
   * @type {(dir: CwSortDirection, rank: number) => string}
   * @readonly
   */
  readonly sortState: (dir: CwSortDirection, rank: number) => string;

  /**
   * Property sorted
   *
   * @description
   * Announcement after a sort change (« Trié par Échéance, croissant, puis par Priorité, décroissant »).
   *
   * @type {(criteria: readonly { header: string; dir: CwSortDirection }[]) => string}
   * @readonly
   */
  readonly sorted: (criteria: readonly { header: string; dir: CwSortDirection }[]) => string;

  /**
   * Property groupToggled
   *
   * @description
   * Announcement after a group folds or unfolds (« Groupe À faire replié »).
   *
   * @type {(label: string, collapsed: boolean) => string}
   * @readonly
   */
  readonly groupToggled: (label: string, collapsed: boolean) => string;

  /**
   * Property groupAdd
   *
   * @description
   * Name of the « + » button of a group row.
   *
   * @type {(label: string) => string}
   * @readonly
   */
  readonly groupAdd: (label: string) => string;

  /**
   * Property columnWidth
   *
   * @description
   * Name of a resize handle (« Largeur de la colonne Nom »).
   *
   * @type {(header: string) => string}
   * @readonly
   */
  readonly columnWidth: (header: string) => string;

  /**
   * Property columnResized
   *
   * @description
   * Announcement after a resize (« Colonne Nom : 320 pixels »).
   *
   * @type {(header: string, width: number) => string}
   * @readonly
   */
  readonly columnResized: (header: string, width: number) => string;

  /**
   * Property columnMoved
   *
   * @description
   * Announcement after a column moves with the keyboard.
   *
   * @type {(header: string, position: number) => string}
   * @readonly
   */
  readonly columnMoved: (header: string, position: number) => string;

  /**
   * Property loading
   *
   * @description
   * Name of the loading grid (`aria-busy`).
   *
   * @type {string}
   * @readonly
   */
  readonly loading: string;

  /**
   * Property retry
   *
   * @description
   * Retry button of the error state.
   *
   * @type {string}
   * @readonly
   */
  readonly retry: string;

  /**
   * Property bulkBar
   *
   * @description
   * Name of the selection toolbar.
   *
   * @type {string}
   * @readonly
   */
  readonly bulkBar: string;

  /**
   * Property deselect
   *
   * @description
   * Button that empties the selection in the bar.
   *
   * @type {string}
   * @readonly
   */
  readonly deselect: string;

  /**
   * Property pagination
   *
   * @description
   * Name of the pagination landmark (the other pagination texts belong to `cw-pagination`).
   *
   * @type {string}
   * @readonly
   */
  readonly pagination: string;

  /**
   * Property range
   *
   * @description
   * Range of the page (« 1–5 sur 23 tâches »).
   *
   * @type {(first: number, last: number, total: number) => string}
   * @readonly
   */
  readonly range: (first: number, last: number, total: number) => string;
  // #endregion
}
