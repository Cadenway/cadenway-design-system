/* Exported types of @cadenway/ui/data-table (DataTable and DataTableComplete sheets of the Design
   System artifact). Rows are generic (`T`): the table knows nothing of what a row is. */

/** Direction of one sort criterion. */
export type CwSortDirection = 'asc' | 'desc';

/**
 * One sort criterion: the column key and its direction. The `sort` model is an array of them in
 * order of priority; an empty array means no sort.
 */
export interface CwSort {
  /** Key of the sorted column. */
  readonly key: string;
  /** Ascending or descending. */
  readonly dir: CwSortDirection;
}

/** Row height: 32, 36 or 44 px (group rows 28, 32 or 36 px). */
export type CwDataTableDensity = 'compact' | 'default' | 'comfortable';

/** Horizontal alignment of a column: numbers are aligned at the end. */
export type CwColumnAlign = 'start' | 'end';

/** The ids of the selected rows, or `'all'`: every row that matches the consumer's filters. */
export type CwDataTableSelection = readonly string[] | 'all';

/**
 * A column given through the `columns` input; a `cw-data-table-column` child with the same `key`
 * adds its cell and editor templates to it.
 */
export interface CwColumnDef<T> {
  /** Identity of the column, used by `sort`, `columnWidths`, `columnOrder` and `columnVisibility`. */
  readonly key: string;
  /** Header label (French copy from the consumer). */
  readonly header?: string;
  /** Keeps the label for assistive technologies only (status icon, actions column). */
  readonly headerHidden?: boolean;
  /** Initial width in px; without it the column shares the remaining width. */
  readonly width?: number;
  /** Lower bound of the resize, in px (64 by default). */
  readonly minWidth?: number;
  /** Upper bound of the resize, in px (480 by default). */
  readonly maxWidth?: number;
  /** `end` for numbers: right-aligned, `tabular-nums`. */
  readonly align?: CwColumnAlign;
  /** Whether a click on the header sorts by this column. */
  readonly sortable?: boolean;
  /** Whether the column has a resize handle (true by default when the table allows resizing). */
  readonly resizable?: boolean;
  /** Whether `columnVisibility` may hide it (true by default; the first column never hides). */
  readonly hideable?: boolean;
  /** Whether its editor opens (true by default when the column has a `cwCellEditor` template). */
  readonly editable?: boolean;
  /** Value of the cell, for the default rendering, the local sort and the editor; `row[key]` otherwise. */
  readonly value?: (row: T) => unknown;
}

/** Context of a `ng-template[cwCell]`: `let-row` (the implicit value), `let-value="value"`, … */
export interface CwCellContext<T> {
  /** The row. */
  readonly $implicit: T;
  /** The row, named. */
  readonly row: T;
  /** The value of the cell (`value(row)` or `row[key]`). */
  readonly value: unknown;
  /** Opens the row: emits `rowOpen` (a name link calls it on click). */
  readonly open: () => void;
}

/** Context of a `ng-template[cwCellEditor]`: the row, its value and the two ways out. */
export interface CwCellEditorContext<T> {
  /** The row. */
  readonly $implicit: T;
  /** The row, named. */
  readonly row: T;
  /** The value before the edit. */
  readonly value: unknown;
  /** Validates: emits `cellEdit` and closes the editor. Bind it to Enter and to `(blur)`. */
  readonly commit: (value: unknown) => void;
  /** Cancels: closes the editor and gives back the original value (Escape does it too). */
  readonly cancel: () => void;
}

/** Payload of `cellEdit`: the row, the column, the new and the previous value. */
export interface CwCellEditEvent<T> {
  /** The edited row. */
  readonly row: T;
  /** Key of the edited column. */
  readonly key: string;
  /** Value given to `commit`. */
  readonly value: unknown;
  /** Value before the edit. */
  readonly previous: unknown;
}

/** Payload of `columnResize`: emitted at the end of a drag, on a double click or a handle key. */
export interface CwColumnResizeEvent {
  /** Key of the resized column. */
  readonly key: string;
  /** New width in px. */
  readonly width: number;
}

/**
 * An action of the selection bar, given by the consumer (no default: the table knows no task
 * action). `shortcut` is a `KeyboardEvent.key` (`'S'`, `'Delete'`): pressed in the grid while rows
 * are selected, it runs the action; the bar shows it in a `kbd`.
 */
export interface CwBulkAction {
  /** Identity of the action, sent back in `bulkAction`. */
  readonly id: string;
  /** Button label (French copy from the consumer). */
  readonly label: string;
  /** Name of a registered `ng-icon` (the consumer provides it with `provideIcons`). */
  readonly icon?: string;
  /** Keyboard shortcut, as `KeyboardEvent.key`. */
  readonly shortcut?: string;
  /** `destructive` writes the label in `text-destructive` (Supprimer). */
  readonly variant?: 'default' | 'destructive';
}

/**
 * Payload of `bulkAction`: the action, the selected ids (`'all'` for every matching row), and the
 * button that ran it, so the consumer anchors its picker (status, people, date) on it.
 */
export interface CwBulkActionEvent {
  /** `id` of the action. */
  readonly action: string;
  /** Selected ids, or `'all'`. */
  readonly ids: CwDataTableSelection;
  /** The bar button of the action, when it is rendered. */
  readonly trigger?: HTMLElement;
}

/** Context of a `ng-template[cwDataTableGroup]`: what a group row shows before its count. */
export interface CwGroupContext {
  /** The group value (`String(row[groupBy])`). */
  readonly $implicit: string;
  /** The group value, named. */
  readonly key: string;
  /** Its label (`groupLabel(key)`). */
  readonly label: string;
  /** Number of rows in the group. */
  readonly count: number;
}

/**
 * The French texts of the table, overridable one by one through the `texts` input. Defaults name
 * tasks, as the mockup does (`App.dc.html`); another list passes its own nouns.
 */
export interface CwDataTableTexts {
  /** Name of the header checkbox. */
  readonly selectAll: string;
  /** Name of a row checkbox, from the row label (« Sélectionner CAD-482 »). */
  readonly selectRow: (label: string) => string;
  /** Selection count, in the bar and the announcement (« 3 tâches sélectionnées »). */
  readonly selected: (count: number) => string;
  /** Offer to select beyond the page (« Sélectionner les 128 tâches »). */
  readonly selectAllMatching: (total: number) => string;
  /** Banner once everything is selected (« Les 128 tâches sont sélectionnées »). */
  readonly allSelected: (total: number) => string;
  /** Link that empties the selection from the banner. */
  readonly clearSelection: string;
  /** Hidden suffix of a sorted header (« , tri principal croissant »). */
  readonly sortState: (dir: CwSortDirection, rank: number) => string;
  /** Announcement after a sort change (« Trié par Échéance, croissant, puis par Priorité, décroissant »). */
  readonly sorted: (criteria: readonly { header: string; dir: CwSortDirection }[]) => string;
  /** Announcement after a group folds or unfolds (« Groupe À faire replié »). */
  readonly groupToggled: (label: string, collapsed: boolean) => string;
  /** Name of the « + » button of a group row. */
  readonly groupAdd: (label: string) => string;
  /** Name of a resize handle (« Largeur de la colonne Nom »). */
  readonly columnWidth: (header: string) => string;
  /** Announcement after a resize (« Colonne Nom : 320 pixels »). */
  readonly columnResized: (header: string, width: number) => string;
  /** Announcement after a column moves with the keyboard. */
  readonly columnMoved: (header: string, position: number) => string;
  /** Name of the loading grid (`aria-busy`). */
  readonly loading: string;
  /** Retry button of the error state. */
  readonly retry: string;
  /** Name of the selection toolbar. */
  readonly bulkBar: string;
  /** Button that empties the selection in the bar. */
  readonly deselect: string;
  /** Name of the pagination landmark (the other pagination texts belong to `cw-pagination`). */
  readonly pagination: string;
  /** Range of the page (« 1–5 sur 23 tâches »). */
  readonly range: (first: number, last: number, total: number) => string;
}
