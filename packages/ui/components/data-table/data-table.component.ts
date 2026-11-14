import {
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  Component,
  computed,
  contentChild,
  contentChildren,
  ElementRef,
  inject,
  Injector,
  input,
  model,
  output,
  signal,
  type TemplateRef,
  viewChild,
  type InputSignalWithTransform,
  type InputSignal,
  type ModelSignal,
  type OutputEmitterRef,
  type WritableSignal,
  type Signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { CdkDrag, type CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { CwAlert, CwAlertActions, CwAlertTitle } from '@cadenway/ui/components/alert';
import { CwButton } from '@cadenway/ui/components/button';
import { CwCheckbox } from '@cadenway/ui/components/checkbox';
import { CwRipple, ɵFOCUS, ɵFOCUS_INSET } from '@cadenway/ui/core';
import { CwEmpty, CwEmptyHeader, CwEmptyTitle } from '@cadenway/ui/components/empty';
import { CwSkeleton } from '@cadenway/ui/components/skeleton';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowDownBold,
  phosphorArrowUpBold,
  phosphorArrowsDownUpBold,
  phosphorCaretDownBold,
  phosphorPlusBold,
} from '@ng-icons/phosphor-icons/bold';

import { CwDataTableBulkBar } from './data-table-bulk-bar/data-table-bulk-bar.component';
import { CwDataTableColumn } from './data-table-column/data-table-column.component';
import { CwDataTableEmpty } from './data-table-empty/data-table-empty.directive';
import { CwDataTableGroup } from './data-table-group/data-table-group.directive';
import { CwDataTablePagination } from './data-table-pagination/data-table-pagination.component';
import { CW_DATA_TABLE_PAGE_SIZES, CW_DATA_TABLE_TEXTS } from './data-table.constants';
import { ɵCW_DATA_TABLE, type ɵCwDataTableContext } from './data-table.token';
import type {
  CwBulkAction,
  CwBulkActionEvent,
  CwCellContext,
  CwCellEditEvent,
  CwCellEditorContext,
  CwColumnAlign,
  CwColumnDef,
  CwColumnResizeEvent,
  CwDataTableDensity,
  CwDataTableSelection,
  CwDataTableTexts,
  CwGroupContext,
  CwSort,
  CwSortDirection,
} from './data-table.types';

/**
 * Interface ResolvedColumn
 *
 * @description
 * A column with every field settled and its templates.
 */
interface ResolvedColumn<T> {
  // #region Properties
  /**
   * Property key
   *
   * @description
   * Stable key identifying the column or group.
   *
   * @type {string}
   * @readonly
   */
  readonly key: string;

  /**
   * Property header
   *
   * @description
   * Displayed column header.
   *
   * @type {string}
   * @readonly
   */
  readonly header: string;

  /**
   * Property headerHidden
   *
   * @description
   * Whether the header is visually hidden.
   *
   * @type {boolean}
   * @readonly
   */
  readonly headerHidden: boolean;

  /**
   * Property width
   *
   * @description
   * Column width in pixels.
   *
   * @type {number | undefined}
   * @readonly
   */
  readonly width: number | undefined;

  /**
   * Property minWidth
   *
   * @description
   * Minimum column width in pixels.
   *
   * @type {number}
   * @readonly
   */
  readonly minWidth: number;

  /**
   * Property maxWidth
   *
   * @description
   * Maximum column width in pixels.
   *
   * @type {number}
   * @readonly
   */
  readonly maxWidth: number;

  /**
   * Property align
   *
   * @description
   * Horizontal alignment of the column.
   *
   * @type {CwColumnAlign}
   * @readonly
   */
  readonly align: CwColumnAlign;

  /**
   * Property sortable
   *
   * @description
   * Whether the column can be sorted.
   *
   * @type {boolean}
   * @readonly
   */
  readonly sortable: boolean;

  /**
   * Property resizable
   *
   * @description
   * Whether the column can be resized.
   *
   * @type {boolean}
   * @readonly
   */
  readonly resizable: boolean;

  /**
   * Property hideable
   *
   * @description
   * Whether the column can be hidden.
   *
   * @type {boolean}
   * @readonly
   */
  readonly hideable: boolean;

  /**
   * Property editable
   *
   * @description
   * Whether the column has an editor.
   *
   * @type {boolean}
   * @readonly
   */
  readonly editable: boolean;

  /**
   * Property value
   *
   * @description
   * Function reading a cell value.
   *
   * @type {(row: T) => unknown}
   * @readonly
   */
  readonly value: (row: T) => unknown;

  /**
   * Property cell
   *
   * @description
   * Projected cell template, when present.
   *
   * @type {TemplateRef<CwCellContext<T>> | undefined}
   * @readonly
   */
  readonly cell: TemplateRef<CwCellContext<T>> | undefined;

  /**
   * Property editor
   *
   * @description
   * Projected editor template, when present.
   *
   * @type {TemplateRef<CwCellEditorContext<T>> | undefined}
   * @readonly
   */
  readonly editor: TemplateRef<CwCellEditorContext<T>> | undefined;
  // #endregion
}

/**
 * Interface RowEntry
 *
 * @description
 * A rendered row: the data, its id and its position in the grid (`aria-rowindex`).
 */
interface RowEntry<T> {
  // #region Properties
  /**
   * Property row
   *
   * @description
   * Source row or row key.
   *
   * @type {T}
   * @readonly
   */
  readonly row: T;

  /**
   * Property id
   *
   * @description
   * Stable row identifier.
   *
   * @type {string}
   * @readonly
   */
  readonly id: string;

  /**
   * Property key
   *
   * @description
   * Stable key identifying the column or group.
   *
   * @type {string}
   * @readonly
   */
  readonly key: string;

  /**
   * Property rowIndex
   *
   * @description
   * One-based ARIA row index.
   *
   * @type {number}
   * @readonly
   */
  readonly rowIndex: number;
  // #endregion
}

/**
 * Interface GroupEntry
 *
 * @description
 * A rendered group: its row, then its rows unless folded. Without `groupBy`, one headless group.
 */
interface GroupEntry<T> {
  // #region Properties
  /**
   * Property key
   *
   * @description
   * Stable key identifying the column or group.
   *
   * @type {string | null}
   * @readonly
   */
  readonly key: string | null;

  /**
   * Property rowKey
   *
   * @description
   * Grid key for the group row.
   *
   * @type {string}
   * @readonly
   */
  readonly rowKey: string;

  /**
   * Property label
   *
   * @description
   * Displayed group label.
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

  /**
   * Property collapsed
   *
   * @description
   * Whether the group is folded.
   *
   * @type {boolean}
   * @readonly
   */
  readonly collapsed: boolean;

  /**
   * Property rowIndex
   *
   * @description
   * One-based ARIA row index.
   *
   * @type {number}
   * @readonly
   */
  readonly rowIndex: number;

  /**
   * Property rows
   *
   * @description
   * Rows belonging to the group.
   *
   * @type {readonly RowEntry<T>[]}
   * @readonly
   */
  readonly rows: readonly RowEntry<T>[];
  // #endregion
}

/**
 * Interface EditState
 *
 * @description
 * The open editor; `session` invalidates a late `commit` from an editor already closed.
 */
interface EditState {
  // #region Properties
  /**
   * Property rowId
   *
   * @description
   * Identifier of the edited row.
   *
   * @type {string}
   * @readonly
   */
  readonly rowId: string;

  /**
   * Property key
   *
   * @description
   * Stable key identifying the column or group.
   *
   * @type {string}
   * @readonly
   */
  readonly key: string;

  /**
   * Property session
   *
   * @description
   * Editor session identifier.
   *
   * @type {number}
   * @readonly
   */
  readonly session: number;
  // #endregion
}

/**
 * Interface ResizeState
 *
 * @description
 * The handle being dragged; `guide` is the x position of the full-height line.
 */
interface ResizeState {
  // #region Properties
  /**
   * Property key
   *
   * @description
   * Stable key identifying the column or group.
   *
   * @type {string}
   * @readonly
   */
  readonly key: string;

  /**
   * Property width
   *
   * @description
   * Column width in pixels.
   *
   * @type {number}
   * @readonly
   */
  readonly width: number;

  /**
   * Property startX
   *
   * @description
   * Pointer position at the start of resizing.
   *
   * @type {number}
   * @readonly
   */
  readonly startX: number;

  /**
   * Property startWidth
   *
   * @description
   * Column width at the start of resizing.
   *
   * @type {number}
   * @readonly
   */
  readonly startWidth: number;

  /**
   * Property guide
   *
   * @description
   * Horizontal position of the resize guide.
   *
   * @type {number}
   * @readonly
   */
  readonly guide: number;
  // #endregion
}

/**
 * Interface ActiveCell
 *
 * @description
 * Where the roving tab stop is: a row key (`h`, `g:…`, `r:…`, `banner`, `state`) and a column key.
 */
interface ActiveCell {
  // #region Properties
  /**
   * Property row
   *
   * @description
   * Source row or row key.
   *
   * @type {string}
   * @readonly
   */
  readonly row: string;

  /**
   * Property col
   *
   * @description
   * Key of the active column.
   *
   * @type {string}
   * @readonly
   */
  readonly col: string;
  // #endregion
}

/**
 * Constant SELECT
 *
 * @description
 * Key of the selection column, in `data-cw-col`.
 *
 * @type {string}
 */
const SELECT: string = '__select';
/**
 * Constant HEADER
 *
 * @description
 * Key of the header row.
 *
 * @type {string}
 */
const HEADER: string = 'h';
/**
 * Constant DEFAULT_MIN_WIDTH
 *
 * @description
 * Default minimum column width in pixels.
 *
 * @type {64}
 */
const DEFAULT_MIN_WIDTH: 64 = 64;
/**
 * Constant DEFAULT_MAX_WIDTH
 *
 * @description
 * Default maximum column width in pixels.
 *
 * @type {480}
 */
const DEFAULT_MAX_WIDTH: 480 = 480;
/* Sheet DataTableComplete, "Colonnes": ← → by 8 px, Shift + arrow by 32 px. */
/**
 * Constant RESIZE_STEP
 *
 * @description
 * Column resize step in pixels.
 *
 * @type {8}
 */
const RESIZE_STEP: 8 = 8;
/**
 * Constant RESIZE_STEP_LARGE
 *
 * @description
 * Large column resize step in pixels.
 *
 * @type {32}
 */
const RESIZE_STEP_LARGE: 32 = 32;
/* Pg préc. / Pg suiv. move "one view height"; ten rows of 36 px are about one. */
/**
 * Constant PAGE_STEP
 *
 * @description
 * Number of rows moved by a page navigation key.
 *
 * @type {10}
 */
const PAGE_STEP: 10 = 10;
/* Sheet DataTableComplete, "Chargement": eight rows. */
/**
 * Constant SKELETON_ROWS
 *
 * @description
 * Indices of loading skeleton rows.
 *
 * @type {number[]}
 */
const SKELETON_ROWS: number[] = [0, 1, 2, 3, 4, 5, 6, 7];

/**
 * Constant FOCUSABLE
 *
 * @description
 * Selector for focusable controls in a cell.
 *
 * @type {"a[href], button, input, select, textarea, [tabindex], [contenteditable=\"true\"]"}
 */
const FOCUSABLE: 'a[href], button, input, select, textarea, [tabindex], [contenteditable="true"]' =
  'a[href], button, input, select, textarea, [tabindex], [contenteditable="true"]';
/* Targets that own their arrow keys: the grid leaves them alone. */
/**
 * Constant OWNS_KEYS
 *
 * @description
 * Selector for controls that handle their own navigation keys.
 *
 * @type {"input, textarea, select, [contenteditable=\"true\"], [role=\"combobox\"], [role=\"listbox\"], [role=\"menu\"], [role=\"slider\"], [role=\"spinbutton\"], [role=\"separator\"]"}
 */
const OWNS_KEYS: 'input, textarea, select, [contenteditable="true"], [role="combobox"], [role="listbox"], [role="menu"], [role="slider"], [role="spinbutton"], [role="separator"]' =
  'input, textarea, select, [contenteditable="true"], [role="combobox"], [role="listbox"], [role="menu"], [role="slider"], [role="spinbutton"], [role="separator"]';
/**
 * Constant INTERACTIVE
 *
 * @description
 * Selector for interactive row content.
 *
 * @type {"a, button, input, select, textarea, label, [role=\"checkbox\"], [tabindex]"}
 */
const INTERACTIVE: 'a, button, input, select, textarea, label, [role="checkbox"], [tabindex]' =
  'a, button, input, select, textarea, label, [role="checkbox"], [tabindex]';

/**
 * Constant COLLATOR
 *
 * @description
 * French collator used for local sorting.
 *
 * @type {Intl.Collator}
 */
const COLLATOR: Intl.Collator = new Intl.Collator('fr', { numeric: true, sensitivity: 'base' });

/* Literal class strings (DataTable and DataTableComplete sheets and previews of the Design System
   artifact), so Tailwind finds them in the compiled package. */
/**
 * Constant ROW_HEIGHTS
 *
 * @description
 * Row height classes by density.
 *
 * @type {Record<CwDataTableDensity, string>}
 */
const ROW_HEIGHTS: Record<CwDataTableDensity, string> = {
  compact: 'h-8',
  default: 'h-9',
  comfortable: 'h-11',
};

/**
 * Constant GROUP_HEIGHTS
 *
 * @description
 * Group row height classes by density.
 *
 * @type {Record<CwDataTableDensity, string>}
 */
const GROUP_HEIGHTS: Record<CwDataTableDensity, string> = {
  compact: 'h-7',
  default: 'h-8',
  comfortable: 'h-9',
};

/* Under 768 px the table becomes cards (mockup `styles/app.css`, `.cw-cards`): the header row
   hides, each row wraps its cells, the first data cell takes the whole line, the last one goes to
   the right. */
/**
 * Constant ROW
 *
 * @description
 * Classes for data rows.
 *
 * @type {string}
 */
const ROW: string =
  'group/row border-b transition-colors hover:bg-accent aria-selected:bg-selected motion-reduce:transition-none ' +
  'max-md:flex max-md:h-auto max-md:flex-wrap max-md:items-center max-md:gap-x-3 max-md:gap-y-1.5 max-md:p-3';

/**
 * Constant CELL
 *
 * @description
 * Classes for data cells.
 *
 * @type {string}
 */
const CELL: string = `align-middle overflow-hidden whitespace-nowrap ${ɵFOCUS_INSET} max-md:p-0 max-md:overflow-visible`;

/**
 * Constant CELL_ALIGN
 *
 * @description
 * Cell alignment classes.
 *
 * @type {Record<CwColumnAlign, string>}
 */
const CELL_ALIGN: Record<CwColumnAlign, string> = {
  start: 'px-3 text-left',
  end: 'px-3 text-right tabular-nums',
};

/**
 * Constant HEAD
 *
 * @description
 * Classes for column headers.
 *
 * @type {string}
 */
const HEAD: string = `relative px-3 align-middle text-xs font-medium whitespace-nowrap text-muted-foreground ${ɵFOCUS_INSET}`;

/**
 * Constant HEAD_ALIGN
 *
 * @description
 * Header alignment classes.
 *
 * @type {Record<CwColumnAlign, string>}
 */
const HEAD_ALIGN: Record<CwColumnAlign, string> = {
  start: 'text-left',
  end: 'text-right',
};

/**
 * Constant SORT_BUTTON
 *
 * @description
 * Classes for sort buttons.
 *
 * @type {string}
 */
const SORT_BUTTON: string =
  'relative isolate inline-flex h-6 items-center gap-1 overflow-hidden rounded-md px-1.5 text-xs font-medium transition-colors hover:bg-accent hover:text-foreground motion-reduce:transition-none ' +
  `${ɵFOCUS} [&_ng-icon]:[--ng-icon__size:0.875rem]`;

/**
 * Constant SORT_BUTTON_ALIGN
 *
 * @description
 * Sort button classes by alignment.
 *
 * @type {Record<CwColumnAlign, string>}
 */
const SORT_BUTTON_ALIGN: Record<CwColumnAlign, string> = {
  start: '-ml-1.5',
  end: '-mr-1.5 flex-row-reverse',
};

/* Rows enter one by one, 60 ms then +30 ms, twelve at most (cw-motion-tokens); sorting reorders
   without animation because the rows are tracked by id. */
/**
 * Constant BODY_MOTION
 *
 * @description
 * Entry animation classes for body rows.
 *
 * @type {string}
 */
const BODY_MOTION: string =
  '*:animate-item-in *:motion-reduce:animate-none [&>*:nth-child(1)]:[animation-delay:60ms] [&>*:nth-child(2)]:[animation-delay:90ms] [&>*:nth-child(3)]:[animation-delay:120ms] [&>*:nth-child(4)]:[animation-delay:150ms] [&>*:nth-child(5)]:[animation-delay:180ms] [&>*:nth-child(6)]:[animation-delay:210ms] [&>*:nth-child(7)]:[animation-delay:240ms] [&>*:nth-child(8)]:[animation-delay:270ms] [&>*:nth-child(9)]:[animation-delay:300ms] [&>*:nth-child(10)]:[animation-delay:330ms] [&>*:nth-child(11)]:[animation-delay:360ms] [&>*:nth-child(12)]:[animation-delay:390ms]';

/**
 * Constant SKELETON_WIDTHS
 *
 * @description
 * Widths used by loading skeletons.
 *
 * @type {string[]}
 */
const SKELETON_WIDTHS: string[] = [
  'w-[62%]',
  'w-[44%]',
  'w-[54%]',
  'w-[70%]',
  'w-[38%]',
  'w-[58%]',
  'w-[48%]',
  'w-[66%]',
];

/**
 * Function isEmpty
 *
 * @description
 * Checks whether a value is empty for sorting.
 *
 * @param {unknown} value - Value to inspect or convert.
 * @returns {boolean} Whether the value is empty.
 */
function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || value === '';
}

/**
 * Function compareValues
 *
 * @description
 * Compares values for local sorting.
 *
 * @param {unknown} a - First value to compare.
 * @param {unknown} b - Second value to compare.
 * @returns {number} Comparison result for the values.
 */
function compareValues(a: unknown, b: unknown): number {
  const left: unknown = a instanceof Date ? a.getTime() : a;
  const right: unknown = b instanceof Date ? b.getTime() : b;
  if (typeof left === 'number' && typeof right === 'number') return left - right;
  if (typeof left === 'boolean' && typeof right === 'boolean') return Number(left) - Number(right);
  return COLLATOR.compare(String(left), String(right));
}

/**
 * Function toText
 *
 * @description
 * Formats a cell value for default display.
 *
 * @param {unknown} value - Value to inspect or convert.
 * @returns {string} Formatted cell text.
 */
function toText(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value);
  }
  if (value instanceof Date) return value.toLocaleDateString('fr-FR');
  return JSON.stringify(value);
}

/**
 * Function defaultTrackBy
 *
 * @description
 * Reads the default row identifier.
 *
 * @param {unknown} row - Source row.
 * @returns {string} Default row identifier.
 */
function defaultTrackBy(row: unknown): string {
  return String((row as { id?: unknown } | null)?.id);
}

/**
 * Component CwDataTable
 *
 * @description
 * The list of a view: a grid that sorts, groups, selects, edits and pages generic rows of 32, 36 or 44 px (DataTable and DataTableComplete sheets of the Design System artifact; mockup `App.dc.html` list view, `Organisation.dc.html` members). Columns come from `columns` (`CwColumnDef<T>[]`) or from `cw-data-table-column` children, which also bring the `ng-template[cwCell]` and `ng-template[cwCellEditor]` templates. Rows are identified by `trackBy` (`row.id` by default); `sort`, `selection`, `collapsed`, `density`, `page`, `pageSize`, `columnWidths`, `columnOrder` and `columnVisibility` are models. Without `manual` the table sorts (`value(row)` or `row[key]`, French collation, empty values last) and pages `data` itself; with `manual` the consumer sorts and pages on the server, passes the page in `data` and the count in `total`. `groupBy` folds rows by `String(row[groupBy])`, groups in `groupOrder` then in order of appearance; `ng-template[cwDataTableGroup]` draws the group label. Bulk actions, statuses and labels belong to the consumer: the selection bar appears with `bulkActions` (or a projected `cw-data-table-bulk-bar`) and emits `bulkAction`. Keyboard (one tab stop, roving over the cells): arrows, Home / End, Ctrl + Home / End, Page Up / Down; Space ticks the row, Shift + Space or Shift + click selects a range from the anchor, Shift + ↑ ↓ extends, Ctrl + A ticks the page, Escape empties the selection; Enter opens the row or the editor of an editable cell, F2 the editor; in an editor Escape cancels and Tab moves to the next editable cell; ← → fold a group row; Enter / Space on a header sorts, Shift adds a criterion; Ctrl + Shift + ← → moves a column. The controls of the active cell are reached with Tab. A resize handle takes ← → (8 px, Shift 32 px), Home / End and Enter (fit to content). Announcements go through the CDK `LiveAnnouncer`. Under 768 px the rows become cards.
 */
@Component({
  selector: 'cw-data-table',
  imports: [
    CdkDrag,
    CdkDropList,
    CwAlert,
    CwAlertActions,
    CwAlertTitle,
    CwButton,
    CwCheckbox,
    CwDataTableBulkBar,
    CwDataTablePagination,
    CwEmpty,
    CwEmptyHeader,
    CwEmptyTitle,
    CwRipple,
    CwSkeleton,
    NgIcon,
    NgTemplateOutlet,
  ],
  providers: [
    { provide: ɵCW_DATA_TABLE, useExisting: CwDataTable },
    provideIcons({
      phosphorArrowDownBold,
      phosphorArrowUpBold,
      phosphorArrowsDownUpBold,
      phosphorCaretDownBold,
      phosphorPlusBold,
    }),
  ],
  host: {
    class: 'flex min-h-0 min-w-0 flex-col gap-3',
    '[attr.data-density]': 'density()',
  },
  templateUrl: './data-table.component.html',
})
export class CwDataTable<T> implements ɵCwDataTableContext {
  // #region Properties
  /**
   * Property data
   *
   * @description
   * The loaded rows: the page with `manual`, every row otherwise.
   *
   * @type {InputSignal<readonly T[]>}
   * @readonly
   */
  public readonly data: InputSignal<readonly T[]> = input.required<readonly T[]>();

  /**
   * Property columns
   *
   * @description
   * Column definitions; `cw-data-table-column` children add their templates by `key`.
   *
   * @type {InputSignal<readonly CwColumnDef<T>[] | null>}
   * @readonly
   */
  public readonly columns: InputSignal<readonly CwColumnDef<T>[] | null> = input<
    readonly CwColumnDef<T>[] | null
  >(null);

  /**
   * Property trackBy
   *
   * @description
   * Identity of a row (`row.id` by default), the value kept in `selection`.
   *
   * @type {InputSignal<(row: T) => string>}
   * @readonly
   */
  public readonly trackBy: InputSignal<(row: T) => string> =
    input<(row: T) => string>(defaultTrackBy);

  /**
   * Property rowLabel
   *
   * @description
   * Short name of a row for the checkbox label (« Sélectionner CAD-482 »); the id by default.
   *
   * @type {InputSignal<((row: T) => string) | null>}
   * @readonly
   */
  public readonly rowLabel: InputSignal<((row: T) => string) | null> = input<
    ((row: T) => string) | null
  >(null);

  /**
   * Property groupBy
   *
   * @description
   * Key of the row field that groups the rows; `null` for a flat list.
   *
   * @type {InputSignal<string | null>}
   * @readonly
   */
  public readonly groupBy: InputSignal<string | null> = input<string | null>(null);

  /**
   * Property groupLabel
   *
   * @description
   * Label of a group value (« En cours » for `progress`); the value itself by default.
   *
   * @type {InputSignal<(key: string) => string>}
   * @readonly
   */
  public readonly groupLabel: InputSignal<(key: string) => string> = input<(key: string) => string>(
    (key) => key,
  );

  /**
   * Property groupOrder
   *
   * @description
   * Order of the groups (the order of the statuses flow); other values follow.
   *
   * @type {InputSignal<readonly string[]>}
   * @readonly
   */
  public readonly groupOrder: InputSignal<readonly string[]> = input<readonly string[]>([]);

  /**
   * Property groupAddable
   *
   * @description
   * Shows the « + » of each group row (`groupAdd`), when the table is editable.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly groupAddable: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property sort
   *
   * @description
   * Sort criteria by priority, `[(sort)]`; empty for none.
   *
   * @type {ModelSignal<readonly CwSort[]>}
   * @readonly
   */
  public readonly sort: ModelSignal<readonly CwSort[]> = model<readonly CwSort[]>([]);

  /**
   * Property selection
   *
   * @description
   * Selected row ids or `'all'`, `[(selection)]`.
   *
   * @type {ModelSignal<CwDataTableSelection>}
   * @readonly
   */
  public readonly selection: ModelSignal<CwDataTableSelection> = model<CwDataTableSelection>([]);

  /**
   * Property collapsed
   *
   * @description
   * Folded group values, `[(collapsed)]`.
   *
   * @type {ModelSignal<readonly string[]>}
   * @readonly
   */
  public readonly collapsed: ModelSignal<readonly string[]> = model<readonly string[]>([]);

  /**
   * Property density
   *
   * @description
   * Row height.
   *
   * @type {ModelSignal<CwDataTableDensity>}
   * @readonly
   */
  public readonly density: ModelSignal<CwDataTableDensity> = model<CwDataTableDensity>('default');

  /**
   * Property loading
   *
   * @description
   * Shows eight skeleton rows and sets `aria-busy`.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly loading: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property error
   *
   * @description
   * Message of the error state (« Impossible de charger les tâches »); `null` when none.
   *
   * @type {InputSignal<string | null>}
   * @readonly
   */
  public readonly error: InputSignal<string | null> = input<string | null>(null);

  /**
   * Property page
   *
   * @description
   * Current page (1-based), `[(page)]`; `null` without pagination (the list view scrolls).
   *
   * @type {ModelSignal<number | null>}
   * @readonly
   */
  public readonly page: ModelSignal<number | null> = model<number | null>(1);

  /**
   * Property pageSize
   *
   * @description
   * Rows per page, `[(pageSize)]`.
   *
   * @type {ModelSignal<number>}
   * @readonly
   */
  public readonly pageSize: ModelSignal<number> = model(50);

  /**
   * Property pageSizes
   *
   * @description
   * Choices of « Lignes par page ».
   *
   * @type {InputSignal<readonly number[]>}
   * @readonly
   */
  public readonly pageSizes: InputSignal<readonly number[]> =
    input<readonly number[]>(CW_DATA_TABLE_PAGE_SIZES);

  /**
   * Property total
   *
   * @description
   * Rows after the consumer's filters, for the range and `aria-rowcount`; `data.length` by default.
   *
   * @type {InputSignal<number | undefined>}
   * @readonly
   */
  public readonly total: InputSignal<number | undefined> = input<number | undefined>(undefined);

  /**
   * Property manual
   *
   * @description
   * The consumer sorts and pages: `data` is the current page, already sorted.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly manual: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property selectable
   *
   * @description
   * Shows the checkbox column and enables the selection keys.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly selectable: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  /**
   * Property editable
   *
   * @description
   * Allows the inline editors and the « + » of the groups (`false`: read only).
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly editable: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  /**
   * Property resizableColumns
   *
   * @description
   * Shows the resize handles.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly resizableColumns: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  /**
   * Property reorderableColumns
   *
   * @description
   * Allows dragging the headers to reorder the columns (the first column stays first).
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly reorderableColumns: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  /**
   * Property columnWidths
   *
   * @description
   * Widths in px by column key, `[(columnWidths)]`.
   *
   * @type {ModelSignal<Readonly<Record<string, number>>>}
   * @readonly
   */
  public readonly columnWidths: ModelSignal<Readonly<Record<string, number>>> = model<
    Readonly<Record<string, number>>
  >({});

  /**
   * Property columnOrder
   *
   * @description
   * Order of the column keys, `[(columnOrder)]`; empty for the order of the definitions.
   *
   * @type {ModelSignal<readonly string[]>}
   * @readonly
   */
  public readonly columnOrder: ModelSignal<readonly string[]> = model<readonly string[]>([]);

  /**
   * Property columnVisibility
   *
   * @description
   * `false` hides a column, `[(columnVisibility)]`; the first column never hides.
   *
   * @type {ModelSignal<Readonly<Record<string, boolean>>>}
   * @readonly
   */
  public readonly columnVisibility: ModelSignal<Readonly<Record<string, boolean>>> = model<
    Readonly<Record<string, boolean>>
  >({});

  /**
   * Property bulkActions
   *
   * @description
   * Actions of the selection bar; none by default (they belong to the consumer).
   *
   * @type {InputSignal<readonly CwBulkAction[]>}
   * @readonly
   */
  public readonly bulkActions: InputSignal<readonly CwBulkAction[]> = input<
    readonly CwBulkAction[]
  >([]);

  /**
   * Property emptyText
   *
   * @description
   * Text of the empty state when no `[cwDataTableEmpty]` content is projected.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly emptyText: InputSignal<string> = input('Aucune tâche ne correspond');

  /**
   * Property texts
   *
   * @description
   * Overrides of the French texts (`CW_DATA_TABLE_TEXTS`).
   *
   * @type {InputSignal<Partial<CwDataTableTexts>>}
   * @readonly
   */
  public readonly texts: InputSignal<Partial<CwDataTableTexts>> = input<Partial<CwDataTableTexts>>(
    {},
  );

  /**
   * Property ariaLabel
   *
   * @description
   * Accessible name of the grid (« Tâches de Produit »).
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly ariaLabel: InputSignal<string> = input.required<string>();

  /**
   * Property rowOpen
   *
   * @description
   * A row asks to open: click on the first column, Enter on a cell, or `open()` from a template.
   *
   * @type {OutputEmitterRef<T>}
   * @readonly
   */
  public readonly rowOpen: OutputEmitterRef<T> = output<T>();

  /**
   * Property cellEdit
   *
   * @description
   * An editor validated a value.
   *
   * @type {OutputEmitterRef<CwCellEditEvent<T>>}
   * @readonly
   */
  public readonly cellEdit: OutputEmitterRef<CwCellEditEvent<T>> = output<CwCellEditEvent<T>>();

  /**
   * Property columnResize
   *
   * @description
   * A column width was set: end of a drag, double click, or a handle key.
   *
   * @type {OutputEmitterRef<CwColumnResizeEvent>}
   * @readonly
   */
  public readonly columnResize: OutputEmitterRef<CwColumnResizeEvent> =
    output<CwColumnResizeEvent>();

  /**
   * Property bulkAction
   *
   * @description
   * A bulk action ran, from the bar or its shortcut.
   *
   * @type {OutputEmitterRef<CwBulkActionEvent>}
   * @readonly
   */
  public readonly bulkAction: OutputEmitterRef<CwBulkActionEvent> = output<CwBulkActionEvent>();

  /**
   * Property groupAdd
   *
   * @description
   * The « + » of a group row was pressed; the payload is the group value.
   *
   * @type {OutputEmitterRef<string>}
   * @readonly
   */
  public readonly groupAdd: OutputEmitterRef<string> = output<string>();

  /**
   * Property retry
   *
   * @description
   * « Réessayer » of the error state was pressed.
   *
   * @type {OutputEmitterRef<void>}
   * @readonly
   */
  public readonly retry: OutputEmitterRef<void> = output();

  /**
   * Property columnChildren
   *
   * @description
   * Projected column definitions and templates.
   *
   * @type {Signal<readonly CwDataTableColumn[]>}
   * @readonly
   */
  private readonly columnChildren: Signal<readonly CwDataTableColumn[]> =
    contentChildren(CwDataTableColumn);

  /**
   * Property groupTemplate
   *
   * @description
   * Projected group header template.
   *
   * @type {Signal<CwDataTableGroup | undefined>}
   * @readonly
   */
  private readonly groupTemplate: Signal<CwDataTableGroup | undefined> =
    contentChild(CwDataTableGroup);

  /**
   * Property projectedEmpty
   *
   * @description
   * Projected empty-state content.
   *
   * @type {Signal<CwDataTableEmpty | undefined>}
   * @readonly
   */
  private readonly projectedEmpty: Signal<CwDataTableEmpty | undefined> =
    contentChild(CwDataTableEmpty);

  /**
   * Property projectedBulkBar
   *
   * @description
   * Projected selection toolbar.
   *
   * @type {Signal<CwDataTableBulkBar | undefined>}
   * @readonly
   */
  protected readonly projectedBulkBar: Signal<CwDataTableBulkBar | undefined> =
    contentChild(CwDataTableBulkBar);

  /**
   * Property tableRef
   *
   * @description
   * Native table element.
   *
   * @type {Signal<ElementRef<HTMLTableElement>>}
   * @readonly
   */
  private readonly tableRef: Signal<ElementRef<HTMLTableElement>> =
    viewChild.required<ElementRef<HTMLTableElement>>('table');

  /**
   * Property scroller
   *
   * @description
   * Scrollable grid container.
   *
   * @type {Signal<ElementRef<HTMLElement>>}
   * @readonly
   */
  private readonly scroller: Signal<ElementRef<HTMLElement>> =
    viewChild.required<ElementRef<HTMLElement>>('scroller');

  /**
   * Property announcer
   *
   * @description
   * Announces table changes to assistive technology.
   *
   * @type {LiveAnnouncer}
   * @readonly
   */
  private readonly announcer: LiveAnnouncer = inject(LiveAnnouncer);

  /**
   * Property injector
   *
   * @description
   * Injector used for work scheduled after rendering.
   *
   * @type {Injector}
   * @readonly
   */
  private readonly injector: Injector = inject(Injector);

  /**
   * Property host
   *
   * @description
   * Native host element.
   *
   * @type {HTMLElement}
   * @readonly
   */
  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /**
   * Property active
   *
   * @description
   * Current grid tab stop.
   *
   * @type {WritableSignal<ActiveCell | null>}
   * @readonly
   */
  private readonly active: WritableSignal<ActiveCell | null> = signal<ActiveCell | null>(null);

  /**
   * Property anchor
   *
   * @description
   * Anchor row for range selection.
   *
   * @type {WritableSignal<string | null>}
   * @readonly
   */
  private readonly anchor: WritableSignal<string | null> = signal<string | null>(null);

  /**
   * Property editing
   *
   * @description
   * Current inline cell editor.
   *
   * @type {WritableSignal<EditState | null>}
   * @readonly
   */
  protected readonly editing: WritableSignal<EditState | null> = signal<EditState | null>(null);

  /**
   * Property resizing
   *
   * @description
   * Current column resize operation.
   *
   * @type {WritableSignal<ResizeState | null>}
   * @readonly
   */
  protected readonly resizing: WritableSignal<ResizeState | null> = signal<ResizeState | null>(
    null,
  );

  /**
   * Property session
   *
   * @description
   * Counter invalidating stale editor commits.
   *
   * @type {number}
   */
  private session: number = 0;

  /**
   * Property rowHeight
   *
   * @description
   * Row height classes for the current density.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly rowHeight: Signal<string> = computed(() => ROW_HEIGHTS[this.density()]);

  /**
   * Property groupHeight
   *
   * @description
   * Group height classes for the current density.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly groupHeight: Signal<string> = computed(() => GROUP_HEIGHTS[this.density()]);

  /**
   * Property rowClasses
   *
   * @description
   * Classes for rows at the current density.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly rowClasses: Signal<string> = computed(
    () => `${ROW} ${ROW_HEIGHTS[this.density()]}`,
  );

  /**
   * Property bodyMotion
   *
   * @description
   * Row entry animation classes.
   *
   * @type {string}
   * @readonly
   */
  protected readonly bodyMotion: string = BODY_MOTION;

  /**
   * Property skeletonRows
   *
   * @description
   * Indices of loading skeleton rows.
   *
   * @type {number[]}
   * @readonly
   */
  protected readonly skeletonRows: number[] = SKELETON_ROWS;

  /**
   * Property skeletonWidths
   *
   * @description
   * Widths used by loading skeleton cells.
   *
   * @type {string[]}
   * @readonly
   */
  protected readonly skeletonWidths: string[] = SKELETON_WIDTHS;

  /**
   * Property selectKey
   *
   * @description
   * Key of the selection column.
   *
   * @type {string}
   * @readonly
   */
  protected readonly selectKey: string = SELECT;

  /**
   * Property headerKey
   *
   * @description
   * Key of the header row.
   *
   * @type {string}
   * @readonly
   */
  protected readonly headerKey: string = HEADER;

  /**
   * Property selectCellClasses
   *
   * @description
   * Classes for a row selection cell.
   *
   * @type {string}
   * @readonly
   */
  protected readonly selectCellClasses: string = `${CELL} w-9 pr-1 pl-3 max-md:order-first`;

  /**
   * Property selectHeadClasses
   *
   * @description
   * Classes for the header selection cell.
   *
   * @type {string}
   * @readonly
   */
  protected readonly selectHeadClasses: string = `w-9 pr-1 pl-3 align-middle ${ɵFOCUS_INSET}`;

  /**
   * Property groupCellClasses
   *
   * @description
   * Classes for a group row cell.
   *
   * @type {string}
   * @readonly
   */
  protected readonly groupCellClasses: string = `px-2 align-middle ${ɵFOCUS_INSET} max-md:block max-md:py-1`;

  /**
   * Property groupButtonClasses
   *
   * @description
   * Classes for a group toggle button.
   *
   * @type {string}
   * @readonly
   */
  protected readonly groupButtonClasses: string = `relative isolate flex h-6 min-w-0 items-center gap-2 overflow-hidden rounded-md px-1.5 text-sm transition-colors hover:bg-accent motion-reduce:transition-none ${ɵFOCUS} [&_ng-icon]:[--ng-icon__size:0.875rem]`;

  /**
   * Property bannerCellClasses
   *
   * @description
   * Classes for the selection banner cell.
   *
   * @type {string}
   * @readonly
   */
  protected readonly bannerCellClasses: string = `px-3 text-center align-middle text-sm ${ɵFOCUS_INSET} max-md:block max-md:py-2`;

  /**
   * Property stateCellClasses
   *
   * @description
   * Classes for the loading or error cell.
   *
   * @type {string}
   * @readonly
   */
  protected readonly stateCellClasses: string = `p-3 ${ɵFOCUS_INSET} max-md:block`;

  /**
   * Property linkClasses
   *
   * @description
   * Classes for links in the grid.
   *
   * @type {string}
   * @readonly
   */
  protected readonly linkClasses: string = `rounded-sm font-medium text-primary underline-offset-4 hover:underline ${ɵFOCUS}`;

  /**
   * Property copy
   *
   * @description
   * The French texts, defaults merged with `texts`.
   *
   * @type {Signal<CwDataTableTexts>}
   * @readonly
   */
  public readonly copy: Signal<CwDataTableTexts> = computed<CwDataTableTexts>(() => ({
    ...CW_DATA_TABLE_TEXTS,
    ...this.texts(),
  }));

  /**
   * Property resolvedColumns
   *
   * @description
   * Column settings merged with projected templates.
   *
   * @type {Signal<readonly ResolvedColumn<T>[]>}
   * @readonly
   */
  private readonly resolvedColumns: Signal<readonly ResolvedColumn<T>[]> = computed<
    readonly ResolvedColumn<T>[]
  >(() => {
    const children: readonly CwDataTableColumn[] = this.columnChildren();
    const byKey: Map<string, CwDataTableColumn> = new Map<string, CwDataTableColumn>(
      children.map((child) => [child.key(), child]),
    );
    const base: readonly Partial<CwColumnDef<T>>[] =
      this.columns() ?? children.map((child) => child.definition() as Partial<CwColumnDef<T>>);
    const editable: boolean = this.editable();
    return base.map((given) => {
      const child: CwDataTableColumn | undefined =
        given.key === undefined ? undefined : byKey.get(given.key);
      const def: CwColumnDef<T> = { ...given, ...(child?.definition() ?? {}) } as CwColumnDef<T>;
      const editor: TemplateRef<CwCellEditorContext<T>> | undefined = child?.editor()?.template as
        TemplateRef<CwCellEditorContext<T>> | undefined;
      const key: string = def.key;
      return {
        key,
        header: def.header ?? key,
        headerHidden: def.headerHidden ?? false,
        width: def.width,
        minWidth: def.minWidth ?? DEFAULT_MIN_WIDTH,
        maxWidth: def.maxWidth ?? DEFAULT_MAX_WIDTH,
        align: def.align ?? 'start',
        sortable: def.sortable ?? false,
        resizable: def.resizable ?? true,
        hideable: def.hideable ?? true,
        editable: editable && !!editor && def.editable !== false,
        value: def.value ?? ((row: T) => (row as Record<string, unknown> | null)?.[key]),
        cell: child?.cell()?.template as TemplateRef<CwCellContext<T>> | undefined,
        editor,
      };
    });
  });

  /**
   * Property columnByKey
   *
   * @description
   * Resolved columns indexed by key.
   *
   * @type {Signal<Map<string, ResolvedColumn<T>>>}
   * @readonly
   */
  private readonly columnByKey: Signal<Map<string, ResolvedColumn<T>>> = computed(
    () => new Map(this.resolvedColumns().map((column) => [column.key, column])),
  );

  /**
   * Property visibleColumns
   *
   * @description
   * Columns in `columnOrder`, the first definition pinned first, then the visible ones.
   *
   * @type {Signal<ResolvedColumn<T>[]>}
   * @readonly
   */
  protected readonly visibleColumns: Signal<ResolvedColumn<T>[]> = computed(() => {
    const columns: readonly ResolvedColumn<T>[] = this.resolvedColumns();
    if (columns.length === 0) return [];
    const [first, ...rest]: readonly ResolvedColumn<T>[] = columns;
    const byKey: Map<string, ResolvedColumn<T>> = this.columnByKey();
    const order: string[] = this.columnOrder().filter((key) => byKey.has(key) && key !== first.key);
    const ordered: ResolvedColumn<T>[] = [
      ...order.flatMap((key) => {
        const column: ResolvedColumn<T> | undefined = byKey.get(key);
        return column ? [column] : [];
      }),
      ...rest.filter((column) => !order.includes(column.key)),
    ];
    const visibility: Readonly<Record<string, boolean>> = this.columnVisibility();
    // A column is visible unless its key is explicitly `false`.
    return [
      first,
      ...ordered.filter(
        (c) => !c.hideable || !Object.hasOwn(visibility, c.key) || visibility[c.key],
      ),
    ];
  });

  /**
   * Property allOrderedKeys
   *
   * @description
   * Every column key in display order, hidden ones included.
   *
   * @type {Signal<string[]>}
   * @readonly
   */
  private readonly allOrderedKeys: Signal<string[]> = computed(() => {
    const columns: readonly ResolvedColumn<T>[] = this.resolvedColumns();
    if (columns.length === 0) return [];
    const [first, ...rest]: readonly ResolvedColumn<T>[] = columns;
    const known: Set<string> = new Set<string>(rest.map((column) => column.key));
    const order: string[] = this.columnOrder().filter((key) => known.has(key));
    return [first.key, ...order, ...rest.map((c) => c.key).filter((k) => !order.includes(k))];
  });

  /**
   * Property colCount
   *
   * @description
   * Number of rendered columns.
   *
   * @type {Signal<number>}
   * @readonly
   */
  protected readonly colCount: Signal<number> = computed(
    () => this.visibleColumns().length + (this.selectable() ? 1 : 0),
  );

  /**
   * Property totalCount
   *
   * @description
   * Number of rows matching the current filters.
   *
   * @type {Signal<number>}
   * @readonly
   */
  public readonly totalCount: Signal<number> = computed(() => this.total() ?? this.data().length);

  /**
   * Property pageCount
   *
   * @description
   * Number of pages, at least one.
   *
   * @type {Signal<number>}
   * @readonly
   */
  public readonly pageCount: Signal<number> = computed(() =>
    Math.max(1, Math.ceil(this.totalCount() / Math.max(1, this.pageSize()))),
  );

  /**
   * Property pageOffset
   *
   * @description
   * Offset of the current page.
   *
   * @type {Signal<number>}
   * @readonly
   */
  private readonly pageOffset: Signal<number> = computed(() => {
    const page: number | null = this.page();
    return page === null
      ? 0
      : (Math.min(Math.max(1, page), this.pageCount()) - 1) * this.pageSize();
  });

  /**
   * Property sortedRows
   *
   * @description
   * Locally sorted rows, or source rows in manual mode.
   *
   * @type {Signal<readonly T[]>}
   * @readonly
   */
  private readonly sortedRows: Signal<readonly T[]> = computed<readonly T[]>(() => {
    const data: readonly T[] = this.data();
    const byKey: Map<string, ResolvedColumn<T>> = this.columnByKey();
    const criteria: { column: ResolvedColumn<T>; sign: number }[] = this.sort().flatMap(
      (criterion) => {
        const column: ResolvedColumn<T> | undefined = byKey.get(criterion.key);
        return column ? [{ column, sign: criterion.dir === 'asc' ? 1 : -1 }] : [];
      },
    );
    if (this.manual() || criteria.length === 0) return data;
    return [...data].sort((x, y) => {
      for (const { column, sign } of criteria) {
        const a: unknown = column.value(x);
        const b: unknown = column.value(y);
        // Empty values stay last whatever the direction.
        if (isEmpty(a) || isEmpty(b)) {
          if (isEmpty(a) && isEmpty(b)) continue;
          return isEmpty(a) ? 1 : -1;
        }
        const result: number = compareValues(a, b) * sign;
        if (result !== 0) return result;
      }
      return 0;
    });
  });
  // #endregion

  // #region Methods
  /**
   * Method groupKeyOf
   *
   * @description
   * Reads the group key of a row.
   *
   * @param {T} row - Source row.
   * @returns {string} Group key of the row.
   */
  private groupKeyOf(row: T): string {
    const by: string | null = this.groupBy();
    const value: unknown = by === null ? undefined : (row as Record<string, unknown> | null)?.[by];
    return toText(value);
  }
  // #endregion

  // #region Properties
  /**
   * Property groupIndex
   *
   * @description
   * Group values in display order with their counts over every loaded row.
   *
   * @type {Signal<Map<string, number>>}
   * @readonly
   */
  private readonly groupIndex: Signal<Map<string, number>> = computed(() => {
    const counts: Map<string, number> = new Map<string, number>();
    if (this.groupBy() === null) return counts;
    for (const key of this.groupOrder()) counts.set(key, 0);
    for (const row of this.sortedRows()) {
      const key: string = this.groupKeyOf(row);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  });

  /**
   * Property pageRows
   *
   * @description
   * The rows of the page, in group order when grouped.
   *
   * @type {Signal<readonly T[]>}
   * @readonly
   */
  private readonly pageRows: Signal<readonly T[]> = computed<readonly T[]>(() => {
    let rows: readonly T[] = this.sortedRows();
    if (this.groupBy() !== null) {
      const order: string[] = [...this.groupIndex().keys()];
      const rank: Map<string, number> = new Map<string, number>(
        order.map((key, index) => [key, index]),
      );
      rows = [...rows].sort(
        (a, b) => (rank.get(this.groupKeyOf(a)) ?? 0) - (rank.get(this.groupKeyOf(b)) ?? 0),
      );
    }
    if (this.page() === null || this.manual()) return rows;
    const offset: number = this.pageOffset();
    return rows.slice(offset, offset + this.pageSize());
  });

  /**
   * Property groups
   *
   * @description
   * Rendered groups and their rows.
   *
   * @type {Signal<readonly GroupEntry<T>[]>}
   * @readonly
   */
  protected readonly groups: Signal<readonly GroupEntry<T>[]> = computed<readonly GroupEntry<T>[]>(
    () => {
      const rows: readonly T[] = this.pageRows();
      const trackBy: (row: T) => string = this.trackBy();
      // aria-rowindex: the header is row 1; rows of earlier pages count before this page.
      let index: number = 1 + this.pageOffset();
      const entry: (row: T) => RowEntry<T> = (row: T): RowEntry<T> => {
        const id: string = trackBy(row);
        index += 1;
        return { row, id, key: `r:${id}`, rowIndex: index };
      };
      if (this.groupBy() === null) {
        return [
          {
            key: null,
            rowKey: '',
            label: '',
            count: rows.length,
            collapsed: false,
            rowIndex: 0,
            rows: rows.map(entry),
          },
        ];
      }
      const buckets: Map<string, T[]> = new Map<string, T[]>();
      for (const row of rows) {
        const key: string = this.groupKeyOf(row);
        const bucket: T[] | undefined = buckets.get(key);
        if (bucket) bucket.push(row);
        else buckets.set(key, [row]);
      }
      const collapsed: Set<string> = new Set<string>(this.collapsed());
      const label: (key: string) => string = this.groupLabel();
      const counts: Map<string, number> = this.groupIndex();
      return [...buckets.entries()].map(([key, members]: [string, T[]]) => {
        index += 1;
        const rowIndex: number = index;
        const folded: boolean = collapsed.has(key);
        return {
          key,
          rowKey: `g:${key}`,
          label: label(key),
          count: this.manual() ? members.length : (counts.get(key) ?? members.length),
          collapsed: folded,
          rowIndex,
          rows: folded ? [] : members.map(entry),
        };
      });
    },
  );

  /**
   * Property renderedRows
   *
   * @description
   * Rendered data rows in order: ranges and arrow selection follow it.
   *
   * @type {Signal<RowEntry<T>[]>}
   * @readonly
   */
  private readonly renderedRows: Signal<RowEntry<T>[]> = computed(() =>
    this.groups().flatMap((group) => group.rows),
  );

  /**
   * Property rowByKey
   *
   * @description
   * Rendered rows indexed by grid key.
   *
   * @type {Signal<Map<string, RowEntry<T>>>}
   * @readonly
   */
  private readonly rowByKey: Signal<Map<string, RowEntry<T>>> = computed(
    () => new Map(this.renderedRows().map((entry) => [entry.key, entry])),
  );

  /**
   * Property pageIds
   *
   * @description
   * Ids of the rows of the page, folded groups included: the header checkbox covers them.
   *
   * @type {Signal<string[]>}
   * @readonly
   */
  protected readonly pageIds: Signal<string[]> = computed(() => {
    const trackBy: (row: T) => string = this.trackBy();
    return this.pageRows().map((row) => trackBy(row));
  });

  /**
   * Property selectedSet
   *
   * @description
   * Explicitly selected row identifiers.
   *
   * @type {Signal<Set<string>>}
   * @readonly
   */
  private readonly selectedSet: Signal<Set<string>> = computed(() => {
    const selection: CwDataTableSelection = this.selection();
    return new Set(selection === 'all' ? this.pageIds() : selection);
  });

  /**
   * Property selectedCount
   *
   * @description
   * Number of selected rows.
   *
   * @type {Signal<number>}
   * @readonly
   */
  public readonly selectedCount: Signal<number> = computed(() => {
    const selection: CwDataTableSelection = this.selection();
    return selection === 'all' ? this.totalCount() : selection.length;
  });

  /**
   * Property headerState
   *
   * @description
   * Selection checkbox state for the page.
   *
   * @type {Signal<"checked" | "unchecked" | "indeterminate">}
   * @readonly
   */
  protected readonly headerState: Signal<'checked' | 'unchecked' | 'indeterminate'> = computed(
    () => {
      const ids: string[] = this.pageIds();
      if (this.selection() === 'all') return ids.length ? 'checked' : 'unchecked';
      const selected: Set<string> = this.selectedSet();
      const count: number = ids.filter((id) => selected.has(id)).length;
      if (count === 0) return 'unchecked';
      return count === ids.length ? 'checked' : 'indeterminate';
    },
  );

  /**
   * Property bannerState
   *
   * @description
   * « Sélectionner les 128 tâches » once the page is ticked and more rows match.
   *
   * @type {Signal<"all" | "offer" | null>}
   * @readonly
   */
  protected readonly bannerState: Signal<'all' | 'offer' | null> = computed<'offer' | 'all' | null>(
    () => {
      if (!this.selectable() || this.loading()) return null;
      if (this.selection() === 'all') return 'all';
      const more: boolean = this.totalCount() > this.pageIds().length;
      return more && this.headerState() === 'checked' ? 'offer' : null;
    },
  );

  /**
   * Property rangeFirst
   *
   * @description
   * One-based position of the first page row.
   *
   * @type {Signal<number>}
   * @readonly
   */
  public readonly rangeFirst: Signal<number> = computed(() =>
    this.totalCount() === 0 ? 0 : this.pageOffset() + 1,
  );

  /**
   * Property rangeLast
   *
   * @description
   * One-based position of the last page row.
   *
   * @type {Signal<number>}
   * @readonly
   */
  public readonly rangeLast: Signal<number> = computed(() =>
    Math.min(this.totalCount(), this.pageOffset() + this.pageRows().length),
  );

  /**
   * Property isEmpty
   *
   * @description
   * Checks whether a value is empty for sorting.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly isEmpty: Signal<boolean> = computed(() => this.pageRows().length === 0);

  /**
   * Property hasProjectedEmpty
   *
   * @description
   * Whether custom empty-state content is projected.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly hasProjectedEmpty: Signal<boolean> = computed(() => !!this.projectedEmpty());

  /**
   * Property groupHeader
   *
   * @description
   * Projected group header template, if present.
   *
   * @type {Signal<TemplateRef<CwGroupContext> | null>}
   * @readonly
   */
  protected readonly groupHeader: Signal<TemplateRef<CwGroupContext> | null> = computed(
    () => this.groupTemplate()?.template ?? null,
  );

  /**
   * Property bulkBarVisible
   *
   * @description
   * Whether the selection toolbar is shown.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly bulkBarVisible: Signal<boolean> = computed(
    () => this.selectedCount() > 0 && (this.bulkActions().length > 0 || !!this.projectedBulkBar()),
  );

  /**
   * Property ariaRowCount
   *
   * @description
   * Total row count reported by the grid.
   *
   * @type {Signal<number>}
   * @readonly
   */
  protected readonly ariaRowCount: Signal<number> = computed(() => {
    const groups: number = this.groupBy() === null ? 0 : this.groups().length;
    return this.totalCount() + 1 + groups;
  });
  // #endregion

  // #region Constructor
  /**
   * Constructor
   *
   * @description
   * Maintains grid focus and handles range selection.
   *
   * @constructor
   */
  public constructor() {
    // Shift + click on a row checkbox selects a range: caught in the capture phase, before the
    // checkbox toggles itself, so the box never shows a state the selection does not have.
    this.host.addEventListener(
      'click',
      (event) => {
        const target: Element | null = event.target as Element | null;
        if (!event.shiftKey || !target?.closest('[data-cw-select]')) return;
        const rowKey: string | undefined =
          target.closest<HTMLElement>('[data-cw-row]')?.dataset['cwRow'];
        const entry: RowEntry<T> | undefined = rowKey ? this.rowByKey().get(rowKey) : undefined;
        if (!entry) return;
        event.preventDefault();
        event.stopPropagation();
        this.selectRange(entry.id);
      },
      { capture: true },
    );

    // One tab stop for the whole grid: the active cell has tabindex 0, every other cell and every
    // control inside a cell -1, except the controls of the active cell (reached with Tab) and of
    // an open editor.
    afterRenderEffect({
      write: () => {
        this.groups();
        this.visibleColumns();
        this.loading();
        this.error();
        this.bannerState();
        this.editing();
        const active: ActiveCell | null = this.active();
        const table: HTMLTableElement = this.tableRef().nativeElement;
        const target: HTMLElement | null = this.cellElement(active) ?? this.defaultCell();
        // A handle without an explicit width reports the rendered one (aria-valuenow is required).
        for (const handle of Array.from(table.querySelectorAll<HTMLElement>('[data-cw-resize]'))) {
          if (!handle.hasAttribute('aria-valuenow')) {
            const width: number = handle.parentElement?.getBoundingClientRect().width ?? 0;
            handle.setAttribute('aria-valuenow', String(Math.round(width)));
          }
        }
        for (const cell of Array.from(table.querySelectorAll<HTMLElement>('[data-cw-cell]'))) {
          const isActive: boolean = cell === target;
          cell.tabIndex = isActive ? 0 : -1;
          const free: boolean = isActive || cell.hasAttribute('data-editing');
          for (const control of Array.from(cell.querySelectorAll<HTMLElement>(FOCUSABLE))) {
            if (!control.hasAttribute('data-cw-tabindex')) {
              control.setAttribute('data-cw-tabindex', control.getAttribute('tabindex') ?? '');
            }
            const original: string = control.getAttribute('data-cw-tabindex') ?? '';
            if (!free) control.setAttribute('tabindex', '-1');
            else if (original === '') control.removeAttribute('tabindex');
            else control.setAttribute('tabindex', original);
          }
        }
      },
    });
  }
  // #endregion

  // Template helpers -------------------------------------------------------------------------

  // #region Methods
  /**
   * Method cellClasses
   *
   * @description
   * Builds classes for a data cell.
   *
   * @param {ResolvedColumn<T>} column - Column involved in the operation.
   * @param {boolean} first - Whether the column is the first data column.
   * @returns {string} Classes for the cell.
   */
  protected cellClasses(column: ResolvedColumn<T>, first: boolean): string {
    const card:
      'max-md:min-w-0 max-md:flex-1 max-md:basis-[calc(100%-2.5rem)]' | 'max-md:last:ml-auto' =
      first
        ? 'max-md:min-w-0 max-md:flex-1 max-md:basis-[calc(100%-2.5rem)]'
        : 'max-md:last:ml-auto';
    return `${CELL} ${CELL_ALIGN[column.align]} ${card}`;
  }

  /**
   * Method headClasses
   *
   * @description
   * Builds classes for a column header.
   *
   * @param {ResolvedColumn<T>} column - Column involved in the operation.
   * @returns {string} Classes for the header.
   */
  protected headClasses(column: ResolvedColumn<T>): string {
    return `${HEAD} ${HEAD_ALIGN[column.align]}`;
  }

  /**
   * Method sortButtonClasses
   *
   * @description
   * Builds classes for a sort button.
   *
   * @param {ResolvedColumn<T>} column - Column involved in the operation.
   * @returns {string} Classes for the sort button.
   */
  protected sortButtonClasses(column: ResolvedColumn<T>): string {
    const tone: 'text-foreground' | 'text-muted-foreground' =
      this.sortRank(column.key) > 0 ? 'text-foreground' : 'text-muted-foreground';
    return `${SORT_BUTTON} ${SORT_BUTTON_ALIGN[column.align]} ${tone}`;
  }

  /**
   * Method widthOf
   *
   * @description
   * Finds the configured width of a column.
   *
   * @param {ResolvedColumn<T>} column - Column involved in the operation.
   * @returns {number | null} Column width, or null when flexible.
   */
  protected widthOf(column: ResolvedColumn<T>): number | null {
    const resizing: ResizeState | null = this.resizing();
    if (resizing?.key === column.key) return resizing.width;
    const widths: Readonly<Record<string, number>> = this.columnWidths();
    if (Object.hasOwn(widths, column.key)) return widths[column.key];
    return column.width ?? null;
  }

  /**
   * Method sortRank
   *
   * @description
   * Finds the priority of a sort criterion.
   *
   * @param {string} key - Column or row key.
   * @returns {number} Sort criterion position.
   */
  protected sortRank(key: string): number {
    return this.sort().findIndex((criterion) => criterion.key === key) + 1;
  }

  /**
   * Method sortDir
   *
   * @description
   * Finds the sort direction of a column.
   *
   * @param {string} key - Column or row key.
   * @returns {CwSortDirection | null} Sort direction, or null.
   */
  protected sortDir(key: string): CwSortDirection | null {
    return this.sort().find((criterion) => criterion.key === key)?.dir ?? null;
  }

  /**
   * Method ariaSort
   *
   * @description
   * Returns the ARIA sort state of a column.
   *
   * @param {ResolvedColumn<T>} column - Column involved in the operation.
   * @returns {string | null} ARIA sort state, or null.
   */
  protected ariaSort(column: ResolvedColumn<T>): string | null {
    if (!column.sortable) return null;
    const primary: CwSort | undefined = this.sort().at(0);
    if (primary?.key !== column.key) return this.sortRank(column.key) > 0 ? null : 'none';
    return primary.dir === 'asc' ? 'ascending' : 'descending';
  }

  /**
   * Method isSelected
   *
   * @description
   * Checks whether a row is selected.
   *
   * @param {string} id - Row identifier.
   * @returns {boolean} Whether the row is selected.
   */
  protected isSelected(id: string): boolean {
    return this.selectedSet().has(id);
  }

  /**
   * Method labelOf
   *
   * @description
   * Builds the accessible label of a row.
   *
   * @param {RowEntry<T>} entry - Rendered row entry.
   * @returns {string} Accessible row label.
   */
  protected labelOf(entry: RowEntry<T>): string {
    return this.rowLabel()?.(entry.row) ?? entry.id;
  }

  /**
   * Method display
   *
   * @description
   * Formats a cell value for default rendering.
   *
   * @param {RowEntry<T>} entry - Rendered row entry.
   * @param {ResolvedColumn<T>} column - Column involved in the operation.
   * @returns {string} Formatted cell text.
   */
  protected display(entry: RowEntry<T>, column: ResolvedColumn<T>): string {
    return toText(column.value(entry.row));
  }

  /**
   * Method isEditing
   *
   * @description
   * Checks whether a cell is being edited.
   *
   * @param {RowEntry<T>} entry - Rendered row entry.
   * @param {ResolvedColumn<T>} column - Column involved in the operation.
   * @returns {boolean} Whether the cell is being edited.
   */
  protected isEditing(entry: RowEntry<T>, column: ResolvedColumn<T>): boolean {
    const editing: EditState | null = this.editing();
    return editing?.rowId === entry.id && editing.key === column.key;
  }

  /**
   * Method cellContext
   *
   * @description
   * Builds the context for a cell template.
   *
   * @param {RowEntry<T>} entry - Rendered row entry.
   * @param {ResolvedColumn<T>} column - Column involved in the operation.
   * @returns {CwCellContext<T>} Context supplied to the cell template.
   */
  protected cellContext(entry: RowEntry<T>, column: ResolvedColumn<T>): CwCellContext<T> {
    return {
      $implicit: entry.row,
      row: entry.row,
      value: column.value(entry.row),
      open: () => {
        this.rowOpen.emit(entry.row);
      },
    };
  }

  /**
   * Method editorContext
   *
   * @description
   * Builds the context for an inline editor template.
   *
   * @param {RowEntry<T>} entry - Rendered row entry.
   * @param {ResolvedColumn<T>} column - Column involved in the operation.
   * @returns {CwCellEditorContext<T>} Context supplied to the editor template.
   */
  protected editorContext(entry: RowEntry<T>, column: ResolvedColumn<T>): CwCellEditorContext<T> {
    const session: number = this.editing()?.session ?? -1;
    const previous: unknown = column.value(entry.row);
    return {
      $implicit: entry.row,
      row: entry.row,
      value: previous,
      commit: (value: unknown) => {
        if (this.editing()?.session !== session) return;
        this.closeEditor(entry, column);
        this.cellEdit.emit({ row: entry.row, key: column.key, value, previous });
      },
      cancel: () => {
        if (this.editing()?.session !== session) return;
        this.closeEditor(entry, column);
      },
    };
  }

  /**
   * Method groupContext
   *
   * @description
   * Builds the context for a group template.
   *
   * @param {GroupEntry<T>} group - Rendered row group.
   * @returns {CwGroupContext} Context supplied to the group template.
   */
  protected groupContext(group: GroupEntry<T>): CwGroupContext {
    const key: string = group.key ?? '';
    return { $implicit: key, key, label: group.label, count: group.count };
  }

  /**
   * Method toggleSort
   *
   * @description
   * Changes the sort criterion of a column.
   *
   * @param {ResolvedColumn<T>} column - Column involved in the operation.
   * @param {boolean} additive - Whether to retain existing sort criteria.
   */
  protected toggleSort(column: ResolvedColumn<T>, additive: boolean): void {
    if (!column.sortable) return;
    const current: CwSortDirection | null = this.sortDir(column.key);
    // Click: ascending, then descending, then no sort (sheet DataTableComplete, "Tri").
    const next: CwSortDirection | null =
      current === null ? 'asc' : current === 'asc' ? 'desc' : null;
    let sort: CwSort[];
    if (additive) {
      sort = this.sort().filter((criterion) => criterion.key !== column.key || next !== null);
      if (current === null) sort.push({ key: column.key, dir: 'asc' });
      else if (next) sort = sort.map((c) => (c.key === column.key ? { key: c.key, dir: next } : c));
    } else {
      sort = next === null ? [] : [{ key: column.key, dir: next }];
    }
    this.sort.set(sort);
    const byKey: Map<string, ResolvedColumn<T>> = this.columnByKey();
    this.announce(
      this.copy().sorted(
        sort.map((criterion) => ({
          header: byKey.get(criterion.key)?.header ?? criterion.key,
          dir: criterion.dir,
        })),
      ),
    );
  }

  /**
   * Method onSortClick
   *
   * @description
   * Handles a sort button click.
   *
   * @param {MouseEvent} event - Browser event from the interaction.
   * @param {ResolvedColumn<T>} column - Column involved in the operation.
   */
  protected onSortClick(event: MouseEvent, column: ResolvedColumn<T>): void {
    this.toggleSort(column, event.shiftKey);
  }

  /**
   * Method onSortKeydown
   *
   * @description
   * Handles keyboard sorting and column movement.
   *
   * @param {KeyboardEvent} event - Browser event from the interaction.
   * @param {ResolvedColumn<T>} column - Column involved in the operation.
   */
  protected onSortKeydown(event: KeyboardEvent, column: ResolvedColumn<T>): void {
    // Shift + Enter adds a criterion: browsers do not all pass Shift to the click of a key press.
    if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault();
      event.stopPropagation();
      this.toggleSort(column, true);
    }
  }

  /**
   * Method setSelection
   *
   * @description
   * Updates the selection and announces it.
   *
   * @param {CwDataTableSelection} next - New selection.
   */
  private setSelection(next: CwDataTableSelection): void {
    this.selection.set(next);
    this.announce(this.copy().selected(next === 'all' ? this.totalCount() : next.length));
  }

  /**
   * Method currentIds
   *
   * @description
   * Returns selected identifiers for the current selection.
   * @returns {string[]} Identifiers in the current selection.
   */
  private currentIds(): string[] {
    const selection: CwDataTableSelection = this.selection();
    return selection === 'all' ? [...this.pageIds()] : [...selection];
  }

  /**
   * Method toggleRow
   *
   * @description
   * Updates selection of one row.
   *
   * @param {string} id - Row identifier.
   * @param {boolean} checked - Whether the row or page should be selected.
   */
  protected toggleRow(id: string, checked: boolean): void {
    const ids: string[] = this.currentIds().filter((existing) => existing !== id);
    if (checked) ids.push(id);
    this.anchor.set(id);
    this.setSelection(ids);
  }

  /**
   * Method selectRange
   *
   * @description
   * Selects rows between the anchor and a target.
   *
   * @param {string} toId - Identifier of the range endpoint.
   */
  private selectRange(toId: string): void {
    const order: string[] = this.renderedRows().map((entry) => entry.id);
    const from: number = order.indexOf(this.anchor() ?? toId);
    const to: number = order.indexOf(toId);
    if (to < 0) return;
    const [start, end]: [number, number] =
      from < 0 ? [to, to] : [Math.min(from, to), Math.max(from, to)];
    const ids: Set<string> = new Set<string>(this.currentIds());
    for (const id of order.slice(start, end + 1)) ids.add(id);
    if (this.anchor() === null) this.anchor.set(toId);
    this.setSelection([...ids]);
  }

  /**
   * Method toggleAll
   *
   * @description
   * Updates selection of all rows on the page.
   *
   * @param {boolean} checked - Whether the row or page should be selected.
   */
  protected toggleAll(checked: boolean): void {
    if (!checked) {
      this.setSelection([]);
      return;
    }
    const ids: Set<string> = new Set<string>(this.currentIds());
    for (const id of this.pageIds()) ids.add(id);
    this.setSelection([...ids]);
  }

  /**
   * Method selectAllMatching
   *
   * @description
   * Selects every matching row.
   */
  protected selectAllMatching(): void {
    this.setSelection('all');
  }

  /**
   * Method clearSelection
   *
   * @description
   * Empties the selection and moves the focus back into the grid.
   */
  public clearSelection(): void {
    this.setSelection([]);
    this.anchor.set(null);
    this.focusCell(this.active() ?? this.firstBodyCell());
  }

  /**
   * Method runBulkAction
   *
   * @description
   * Emits `bulkAction` for the current selection.
   *
   * @param {CwBulkAction} action - Bulk action to run.
   * @param {HTMLElement} trigger - Button that triggered the action, if present.
   */
  public runBulkAction(action: CwBulkAction, trigger?: HTMLElement): void {
    this.bulkAction.emit({ action: action.id, ids: this.selection(), trigger });
  }

  /**
   * Method onRowClick
   *
   * @description
   * Handles row selection or opening on click.
   *
   * @param {MouseEvent} event - Browser event from the interaction.
   * @param {RowEntry<T>} entry - Rendered row entry.
   */
  protected onRowClick(event: MouseEvent, entry: RowEntry<T>): void {
    const target: Element = event.target as Element;
    const cell: HTMLElement | null = target.closest<HTMLElement>('[data-cw-cell]');
    const interactive: Element | null = target.closest(INTERACTIVE);
    // A click on a control of the row (checkbox, link, « … ») belongs to that control.
    if (interactive && interactive !== cell && cell?.contains(interactive)) return;
    if (event.shiftKey && this.selectable()) {
      this.selectRange(entry.id);
      return;
    }
    if ((event.ctrlKey || event.metaKey) && this.selectable()) {
      this.toggleRow(entry.id, !this.isSelected(entry.id));
      return;
    }
    if (cell?.dataset['cwCol'] === this.visibleColumns()[0]?.key) {
      this.rowOpen.emit(entry.row);
    }
  }

  /**
   * Method toggleGroup
   *
   * @description
   * Folds or unfolds a row group.
   *
   * @param {GroupEntry<T>} group - Rendered row group.
   * @param {boolean} collapse - Requested collapsed state, if specified.
   */
  protected toggleGroup(group: GroupEntry<T>, collapse?: boolean): void {
    if (group.key === null) return;
    const folded: boolean = collapse ?? !group.collapsed;
    if (folded === group.collapsed) return;
    const others: string[] = this.collapsed().filter((key) => key !== group.key);
    this.collapsed.set(folded ? [...others, group.key] : others);
    this.announce(this.copy().groupToggled(group.label, folded));
  }

  /**
   * Method setPage
   *
   * @description
   * Goes to a page (clamped) and scrolls the grid back to its top.
   *
   * @param {number} page - One-based page to display.
   */
  public setPage(page: number): void {
    const next: number = Math.min(Math.max(1, page), this.pageCount());
    if (next === this.page()) return;
    this.page.set(next);
    this.scroller().nativeElement.scrollTop = 0;
  }

  /**
   * Method setPageSize
   *
   * @description
   * Changes the page size and goes back to page 1.
   *
   * @param {number} size - Number of rows per page.
   */
  public setPageSize(size: number): void {
    if (size === this.pageSize()) return;
    this.pageSize.set(size);
    if (this.page() !== null) this.page.set(1);
    this.scroller().nativeElement.scrollTop = 0;
  }

  /**
   * Method startEdit
   *
   * @description
   * Opens an editor for an editable cell.
   *
   * @param {RowEntry<T>} entry - Rendered row entry.
   * @param {ResolvedColumn<T>} column - Column involved in the operation.
   * @returns {boolean} Whether an editor was opened.
   */
  private startEdit(entry: RowEntry<T>, column: ResolvedColumn<T>): boolean {
    if (!column.editable || this.loading()) return false;
    this.session += 1;
    this.editing.set({ rowId: entry.id, key: column.key, session: this.session });
    this.active.set({ row: entry.key, col: column.key });
    afterNextRender(
      () => {
        const cell: HTMLElement | null = this.cellElement({ row: entry.key, col: column.key });
        cell?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
      },
      { injector: this.injector },
    );
    return true;
  }

  /**
   * Method closeEditor
   *
   * @description
   * Closes a cell editor and returns focus.
   *
   * @param {RowEntry<T>} entry - Rendered row entry.
   * @param {ResolvedColumn<T>} column - Column involved in the operation.
   */
  private closeEditor(entry: RowEntry<T>, column: ResolvedColumn<T>): void {
    this.editing.set(null);
    const cell: { row: string; col: string } = { row: entry.key, col: column.key };
    afterNextRender(
      () => {
        // Only when the focus was in the editor: a click elsewhere keeps its own target.
        const focused: Element | null = this.host.ownerDocument.activeElement;
        if (!focused || focused === this.host.ownerDocument.body || this.host.contains(focused)) {
          this.focusCell(cell);
        }
      },
      { injector: this.injector },
    );
  }

  /**
   * Method editNext
   *
   * @description
   * Moves editing to an adjacent editable cell.
   *
   * @param {RowEntry<T>} entry - Rendered row entry.
   * @param {ResolvedColumn<T>} column - Column involved in the operation.
   * @param {boolean} backwards - Whether to move to the previous editor.
   */
  private editNext(entry: RowEntry<T>, column: ResolvedColumn<T>, backwards: boolean): void {
    const rows: RowEntry<T>[] = this.renderedRows();
    const columns: ResolvedColumn<T>[] = this.visibleColumns();
    const cells: { entry: RowEntry<T>; column: ResolvedColumn<T> }[] = [];
    for (const row of rows)
      for (const c of columns) if (c.editable) cells.push({ entry: row, column: c });
    const index: number = cells.findIndex(
      (cell) => cell.entry.id === entry.id && cell.column.key === column.key,
    );
    const next: { entry: RowEntry<T>; column: ResolvedColumn<T> } | undefined =
      index < 0 ? undefined : cells.at(index + (backwards ? -1 : 1));
    if (next) this.startEdit(next.entry, next.column);
  }

  /**
   * Method onCellDblclick
   *
   * @description
   * Starts editing a cell on double click.
   *
   * @param {RowEntry<T>} entry - Rendered row entry.
   * @param {ResolvedColumn<T>} column - Column involved in the operation.
   */
  protected onCellDblclick(entry: RowEntry<T>, column: ResolvedColumn<T>): void {
    if (!this.isEditing(entry, column)) this.startEdit(entry, column);
  }

  /**
   * Method clampWidth
   *
   * @description
   * Constrains a column width to its limits.
   *
   * @param {ResolvedColumn<T>} column - Column involved in the operation.
   * @param {number} width - Column width in pixels.
   * @returns {number} Width constrained to column limits.
   */
  private clampWidth(column: ResolvedColumn<T>, width: number): number {
    return Math.round(Math.min(column.maxWidth, Math.max(column.minWidth, width)));
  }

  /**
   * Method setWidth
   *
   * @description
   * Updates and reports a column width.
   *
   * @param {ResolvedColumn<T>} column - Column involved in the operation.
   * @param {number} width - Column width in pixels.
   */
  private setWidth(column: ResolvedColumn<T>, width: number): void {
    const clamped: number = this.clampWidth(column, width);
    this.columnWidths.update((widths) => ({ ...widths, [column.key]: clamped }));
    this.columnResize.emit({ key: column.key, width: clamped });
    this.announce(this.copy().columnResized(column.header, clamped));
  }

  /**
   * Method currentWidth
   *
   * @description
   * Reads the configured or rendered column width.
   *
   * @param {ResolvedColumn<T>} column - Column involved in the operation.
   * @param {HTMLElement} handle - Resize handle element.
   * @returns {number} Current column width in pixels.
   */
  protected currentWidth(column: ResolvedColumn<T>, handle: HTMLElement): number {
    return (
      this.widthOf(column) ?? Math.round(handle.parentElement?.getBoundingClientRect().width ?? 0)
    );
  }

  /**
   * Method onResizeStart
   *
   * @description
   * Starts a pointer column resize.
   *
   * @param {PointerEvent} event - Browser event from the interaction.
   * @param {ResolvedColumn<T>} column - Column involved in the operation.
   */
  protected onResizeStart(event: PointerEvent, column: ResolvedColumn<T>): void {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const handle: HTMLElement = event.currentTarget as HTMLElement;
    const th: HTMLElement | null = handle.parentElement;
    if (!th) return;
    const width: number = this.currentWidth(column, handle);
    // jsdom and old engines lack pointer capture; the drag still works while the pointer stays on the handle.
    if ('setPointerCapture' in handle) handle.setPointerCapture(event.pointerId);
    this.resizing.set({
      key: column.key,
      width,
      startX: event.clientX,
      startWidth: width,
      guide: th.offsetLeft + width,
    });
  }

  /**
   * Method onResizeMove
   *
   * @description
   * Updates the resize guide during a drag.
   *
   * @param {PointerEvent} event - Browser event from the interaction.
   * @param {ResolvedColumn<T>} column - Column involved in the operation.
   */
  protected onResizeMove(event: PointerEvent, column: ResolvedColumn<T>): void {
    const resizing: ResizeState | null = this.resizing();
    if (resizing?.key !== column.key) return;
    const th: HTMLElement | null = (event.currentTarget as HTMLElement).parentElement;
    if (!th) return;
    const width: number = this.clampWidth(
      column,
      resizing.startWidth + event.clientX - resizing.startX,
    );
    this.resizing.set({ ...resizing, width, guide: th.offsetLeft + width });
  }

  /**
   * Method onResizeEnd
   *
   * @description
   * Commits the column width after dragging.
   *
   * @param {ResolvedColumn<T>} column - Column involved in the operation.
   */
  protected onResizeEnd(column: ResolvedColumn<T>): void {
    const resizing: ResizeState | null = this.resizing();
    if (resizing?.key !== column.key) return;
    this.resizing.set(null);
    if (resizing.width !== resizing.startWidth) this.setWidth(column, resizing.width);
  }

  /**
   * Method onResizeKeydown
   *
   * @description
   * Resizes or fits a column using the keyboard.
   *
   * @param {KeyboardEvent} event - Browser event from the interaction.
   * @param {ResolvedColumn<T>} column - Column involved in the operation.
   */
  protected onResizeKeydown(event: KeyboardEvent, column: ResolvedColumn<T>): void {
    const handle: HTMLElement = event.currentTarget as HTMLElement;
    const width: number = this.currentWidth(column, handle);
    const step: 8 | 32 = event.shiftKey ? RESIZE_STEP_LARGE : RESIZE_STEP;
    let next: number;
    switch (event.key) {
      case 'ArrowLeft':
        next = width - step;
        break;
      case 'ArrowRight':
        next = width + step;
        break;
      case 'Home':
        next = column.minWidth;
        break;
      case 'End':
        next = column.maxWidth;
        break;
      case 'Enter':
        next = this.contentWidth(column);
        break;
      default:
        return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.setWidth(column, next);
  }

  /**
   * Method fitColumn
   *
   * @description
   * Width of the widest loaded cell and of the header (double click or Enter on the handle).
   *
   * @param {ResolvedColumn<T>} column - Column involved in the operation.
   */
  protected fitColumn(column: ResolvedColumn<T>): void {
    this.setWidth(column, this.contentWidth(column));
  }

  /**
   * Method contentWidth
   *
   * @description
   * Measures the width needed for a column.
   *
   * @param {ResolvedColumn<T>} column - Column involved in the operation.
   * @returns {number} Measured content width in pixels.
   */
  private contentWidth(column: ResolvedColumn<T>): number {
    let widest: number = column.minWidth;
    for (const cell of Array.from(
      this.tableRef().nativeElement.querySelectorAll<HTMLElement>('[data-cw-cell]'),
    )) {
      if (cell.dataset['cwCol'] === column.key) widest = Math.max(widest, cell.scrollWidth);
    }
    return widest;
  }

  /**
   * Method stopDrag
   *
   * @description
   * Prevents column dragging from an interactive control.
   *
   * @param {Event} event - Browser event from the interaction.
   */
  protected stopDrag(event: Event): void {
    // The handle sits on the draggable header: a press on it resizes, it never moves the column.
    event.stopPropagation();
  }
  // #endregion

  // #region Properties
  /**
   * Property firstFixed
   *
   * @description
   * Drop predicate of the header list: nothing goes before the first column.
   *
   * @type {(index: number) => boolean}
   * @readonly
   */
  protected readonly firstFixed: (index: number) => boolean = (index: number): boolean => index > 0;
  // #endregion

  // #region Methods
  /**
   * Method onColumnDrop
   *
   * @description
   * Moves a column after a drag.
   *
   * @param {CdkDragDrop<unknown>} event - Browser event from the interaction.
   */
  protected onColumnDrop(event: CdkDragDrop<unknown>): void {
    if (event.previousIndex === event.currentIndex) return;
    const key: string = this.visibleColumns()[event.previousIndex]?.key;
    if (key) this.moveColumn(key, event.currentIndex);
  }

  /**
   * Method moveColumn
   *
   * @description
   * Updates the order of a column.
   *
   * @param {string} key - Column or row key.
   * @param {number} to - Destination column index.
   */
  private moveColumn(key: string, to: number): void {
    const visible: string[] = this.visibleColumns().map((column) => column.key);
    const from: number = visible.indexOf(key);
    const target: number = Math.min(Math.max(1, to), visible.length - 1);
    if (from <= 0 || from === target) return;
    moveItemInArray(visible, from, target);
    const shown: Set<string> = new Set<string>(visible);
    let next: number = 0;
    this.columnOrder.set(
      this.allOrderedKeys().map((existing) => (shown.has(existing) ? visible[next++] : existing)),
    );
  }

  /**
   * Method onFocusin
   *
   * @description
   * Records the grid cell receiving focus.
   *
   * @param {FocusEvent} event - Browser event from the interaction.
   */
  protected onFocusin(event: FocusEvent): void {
    const cell: HTMLElement | null = (event.target as Element).closest<HTMLElement>(
      '[data-cw-cell]',
    );
    const row: string | undefined = cell?.closest<HTMLElement>('[data-cw-row]')?.dataset['cwRow'];
    const col: string | undefined = cell?.dataset['cwCol'];
    if (!cell || row === undefined || col === undefined) return;
    const active: ActiveCell | null = this.active();
    if (active?.row !== row || active.col !== col) this.active.set({ row, col });
  }

  /**
   * Method onKeydown
   *
   * @description
   * Handles keyboard navigation and shortcuts in the grid.
   *
   * @param {KeyboardEvent} event - Browser event from the interaction.
   */
  protected onKeydown(event: KeyboardEvent): void {
    const target: HTMLElement = event.target as HTMLElement;
    const cell: HTMLElement | null = target.closest<HTMLElement>('[data-cw-cell]');
    if (!cell) return;
    const rowEl: HTMLElement | null = cell.closest<HTMLElement>('[data-cw-row]');
    const rowKey: string = rowEl?.dataset['cwRow'] ?? '';
    const colKey: string = cell.dataset['cwCol'] ?? '';

    if (cell.hasAttribute('data-editing')) {
      this.onEditorKeydown(event, rowKey, colKey);
      return;
    }
    if (target !== cell && target.closest(OWNS_KEYS)) return;

    const onCell: boolean = target === cell;
    const entry: RowEntry<T> | undefined = this.rowByKey().get(rowKey);
    const column: ResolvedColumn<T> | undefined = this.columnByKey().get(colKey);
    const group: GroupEntry<T> | undefined = rowKey.startsWith('g:')
      ? this.groups().find((g) => g.rowKey === rowKey)
      : undefined;
    const ctrl: boolean = event.ctrlKey || event.metaKey;

    if (
      rowKey === HEADER &&
      ctrl &&
      event.shiftKey &&
      column &&
      (event.key === 'ArrowLeft' || event.key === 'ArrowRight')
    ) {
      event.preventDefault();
      const visible: string[] = this.visibleColumns().map((c) => c.key);
      const position: number = visible.indexOf(colKey) + (event.key === 'ArrowLeft' ? -1 : 1);
      if (position < 1 || position >= visible.length || visible.indexOf(colKey) === 0) return;
      this.moveColumn(colKey, position);
      this.announce(this.copy().columnMoved(column.header, position + 1));
      afterNextRender(
        () => {
          this.focusCell({ row: HEADER, col: colKey });
        },
        {
          injector: this.injector,
        },
      );
      return;
    }

    if (group && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      event.preventDefault();
      this.toggleGroup(group, event.key === 'ArrowLeft');
      return;
    }

    if (this.navigate(event, rowKey, colKey)) {
      event.preventDefault();
      return;
    }

    switch (event.key) {
      case ' ':
        if (!onCell) return;
        event.preventDefault();
        if (group) this.toggleGroup(group);
        else if (rowKey === HEADER && colKey === SELECT)
          this.toggleAll(this.headerState() !== 'checked');
        else if (rowKey === HEADER && column) this.toggleSort(column, event.shiftKey);
        else if (entry && this.selectable()) {
          if (event.shiftKey) this.selectRange(entry.id);
          else this.toggleRow(entry.id, !this.isSelected(entry.id));
        }
        return;
      case 'Enter':
        if (!onCell) return;
        event.preventDefault();
        if (group) this.toggleGroup(group);
        else if (rowKey === HEADER && column) this.toggleSort(column, event.shiftKey);
        else if (entry && column) {
          const first: boolean = this.visibleColumns()[0]?.key === column.key;
          if (first || !this.startEdit(entry, column)) this.rowOpen.emit(entry.row);
        }
        return;
      case 'F2':
        if (entry && column) {
          event.preventDefault();
          this.startEdit(entry, column);
        }
        return;
      case 'Escape':
        if (this.selectedCount() > 0) {
          event.preventDefault();
          this.setSelection([]);
          this.anchor.set(null);
        }
        return;
      case 'a':
      case 'A':
        if (ctrl && this.selectable() && !event.altKey) {
          event.preventDefault();
          this.toggleAll(true);
          return;
        }
        break;
    }

    if (!ctrl && !event.altKey && this.selectedCount() > 0) {
      const action: CwBulkAction | undefined = this.bulkActions().find(
        (candidate) => candidate.shortcut?.toLowerCase() === event.key.toLowerCase(),
      );
      if (action) {
        event.preventDefault();
        const trigger: HTMLElement | null = this.host.querySelector<HTMLElement>(
          `[data-cw-bulk-action="${action.id.replace(/"/g, '')}"]`,
        );
        this.runBulkAction(action, trigger ?? undefined);
      }
    }
  }

  /**
   * Method onEditorKeydown
   *
   * @description
   * Handles keyboard actions while editing a cell.
   *
   * @param {KeyboardEvent} event - Browser event from the interaction.
   * @param {string} rowKey - Grid row key.
   * @param {string} colKey - Grid column key.
   */
  private onEditorKeydown(event: KeyboardEvent, rowKey: string, colKey: string): void {
    const entry: RowEntry<T> | undefined = this.rowByKey().get(rowKey);
    const column: ResolvedColumn<T> | undefined = this.columnByKey().get(colKey);
    if (!entry || !column) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.closeEditor(entry, column);
      return;
    }
    if (event.key === 'Tab') {
      event.preventDefault();
      const session: number | undefined = this.editing()?.session;
      // The editor validates on blur (its contract): blur first, then open the next cell.
      (this.host.ownerDocument.activeElement as HTMLElement | null)?.blur();
      if (this.editing()?.session === session) this.editing.set(null);
      this.editNext(entry, column, event.shiftKey);
    }
  }

  /**
   * Method navigate
   *
   * @description
   * Arrow, Home, End and Page keys between the cells. Returns whether the key moved the focus.
   *
   * @param {KeyboardEvent} event - Browser event from the interaction.
   * @param {string} rowKey - Grid row key.
   * @param {string} colKey - Grid column key.
   * @returns {boolean} Whether the keyboard event was handled.
   */
  private navigate(event: KeyboardEvent, rowKey: string, colKey: string): boolean {
    const rows: HTMLElement[] = this.navRows();
    const rowIndex: number = rows.findIndex((row) => row.dataset['cwRow'] === rowKey);
    if (rowIndex < 0) return false;
    const ctrl: boolean = event.ctrlKey || event.metaKey;
    const cellsOf: (row: HTMLElement) => HTMLElement[] = (row: HTMLElement): HTMLElement[] =>
      Array.from(row.children).filter((child): child is HTMLElement =>
        child.hasAttribute('data-cw-cell'),
      );
    const cells: HTMLElement[] = cellsOf(rows[rowIndex]);
    const colIndex: number = Math.max(
      0,
      cells.findIndex((cell) => cell.dataset['cwCol'] === colKey),
    );
    const rtl: boolean =
      this.host.ownerDocument.dir === 'rtl' || getComputedStyle(this.host).direction === 'rtl';
    let nextRow: number = rowIndex;
    let nextCol: number | 'first' | 'last' | null = null;
    switch (event.key) {
      case 'ArrowDown':
        nextRow = rowIndex + 1;
        break;
      case 'ArrowUp':
        nextRow = rowIndex - 1;
        break;
      case 'ArrowRight':
        if (event.shiftKey) return false;
        nextCol = colIndex + (rtl ? -1 : 1);
        break;
      case 'ArrowLeft':
        if (event.shiftKey) return false;
        nextCol = colIndex + (rtl ? 1 : -1);
        break;
      case 'Home':
        if (ctrl) nextRow = 0;
        nextCol = 'first';
        break;
      case 'End':
        if (ctrl) nextRow = rows.length - 1;
        nextCol = 'last';
        break;
      case 'PageDown':
        nextRow = rowIndex + PAGE_STEP;
        break;
      case 'PageUp':
        nextRow = rowIndex - PAGE_STEP;
        break;
      default:
        return false;
    }
    if (event.altKey || (ctrl && event.key.startsWith('Arrow'))) return false;
    nextRow = Math.min(rows.length - 1, Math.max(0, nextRow));
    const targetCells: HTMLElement[] = cellsOf(rows[nextRow]);
    if (targetCells.length === 0) return true;
    let target: HTMLElement | undefined;
    if (nextCol === 'first') target = targetCells[0];
    else if (nextCol === 'last') target = targetCells[targetCells.length - 1];
    else if (nextCol !== null)
      target = targetCells[Math.min(targetCells.length - 1, Math.max(0, nextCol))];
    else {
      // Same column when the row has it (a group row has a single cell); the column is remembered.
      target =
        targetCells.find((cell) => cell.dataset['cwCol'] === colKey) ??
        targetCells[Math.min(colIndex, targetCells.length - 1)];
    }
    const nextKey: string = rows[nextRow].dataset['cwRow'] ?? '';
    const keepCol: string =
      targetCells.length === 1 && cells.length > 1 ? colKey : (target.dataset['cwCol'] ?? colKey);

    // Shift + ↑ ↓ extends the selection to the next row.
    if (
      event.shiftKey &&
      (event.key === 'ArrowDown' || event.key === 'ArrowUp') &&
      this.selectable()
    ) {
      const from: RowEntry<T> | undefined = this.rowByKey().get(rowKey);
      const to: RowEntry<T> | undefined = this.rowByKey().get(nextKey);
      if (from && to) {
        const ids: Set<string> = new Set<string>(this.currentIds());
        ids.add(from.id);
        ids.add(to.id);
        this.anchor.set(this.anchor() ?? from.id);
        this.setSelection([...ids]);
      }
    }
    this.active.set({ row: nextKey, col: keepCol });
    target.focus();
    if ('scrollIntoView' in target) target.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    return true;
  }

  /**
   * Method navRows
   *
   * @description
   * Returns grid rows available for navigation.
   * @returns {HTMLElement[]} Navigable grid row elements.
   */
  private navRows(): HTMLElement[] {
    return Array.from(
      this.tableRef().nativeElement.querySelectorAll<HTMLElement>('tr[data-cw-row]'),
    );
  }

  /**
   * Method cellElement
   *
   * @description
   * Finds the DOM element for an active cell.
   *
   * @param {ActiveCell | null} active - Current active cell, if any.
   * @returns {HTMLElement | null} Matching cell element, or null.
   */
  private cellElement(active: ActiveCell | null): HTMLElement | null {
    if (!active) return null;
    const row: HTMLElement | undefined = this.navRows().find(
      (candidate) => candidate.dataset['cwRow'] === active.row,
    );
    if (!row) return null;
    const cells: HTMLElement[] = Array.from(row.children).filter((child): child is HTMLElement =>
      child.hasAttribute('data-cw-cell'),
    );
    return (
      cells.find((cell) => cell.dataset['cwCol'] === active.col) ??
      (cells.length === 1 ? cells[0] : null)
    );
  }

  /**
   * Method firstBodyCell
   *
   * @description
   * Finds the first navigable body cell.
   * @returns {ActiveCell | null} First body cell, or null.
   */
  private firstBodyCell(): ActiveCell | null {
    const first: HTMLElement | undefined = this.navRows().find(
      (row) => row.dataset['cwRow'] !== HEADER,
    );
    const cell: Element | null | undefined = first
      ? Array.from(first.children).find((child) => child.hasAttribute('data-cw-cell'))
      : null;
    const row: string | undefined = first?.dataset['cwRow'];
    const col: string | undefined = (cell as HTMLElement | null)?.dataset['cwCol'];
    return row !== undefined && col !== undefined ? { row, col } : null;
  }

  /**
   * Method defaultCell
   *
   * @description
   * Finds the default grid focus target.
   * @returns {HTMLElement | null} Default focus target, or null.
   */
  private defaultCell(): HTMLElement | null {
    return (
      this.cellElement(this.firstBodyCell()) ??
      this.cellElement({ row: HEADER, col: this.firstHeaderKey() })
    );
  }

  /**
   * Method firstHeaderKey
   *
   * @description
   * Finds the first navigable header key.
   * @returns {string} First navigable header key.
   */
  private firstHeaderKey(): string {
    return this.selectable() ? SELECT : (this.visibleColumns()[0]?.key ?? '');
  }

  /**
   * Method focusCell
   *
   * @description
   * Moves focus to a grid cell.
   *
   * @param {ActiveCell | null} cell - Grid cell to focus, if any.
   */
  private focusCell(cell: ActiveCell | null): void {
    if (!cell) return;
    this.active.set(cell);
    this.cellElement(cell)?.focus();
  }

  /**
   * Method announce
   *
   * @description
   * Announces a message politely.
   *
   * @param {string} message - Message to announce.
   */
  private announce(message: string): void {
    void this.announcer.announce(message, 'polite');
  }
  // #endregion
}
