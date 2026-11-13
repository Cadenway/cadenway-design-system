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
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { CdkDrag, type CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { CwAlert, CwAlertActions, CwAlertTitle } from '@cadenway/ui/alert';
import { CwButton } from '@cadenway/ui/button';
import { CwCheckbox } from '@cadenway/ui/checkbox';
import { CwRipple, ɵFOCUS, ɵFOCUS_INSET } from '@cadenway/ui/core';
import { CwEmpty, CwEmptyHeader, CwEmptyTitle } from '@cadenway/ui/empty';
import { CwSkeleton } from '@cadenway/ui/skeleton';
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

/** A column with every field settled and its templates. */
interface ResolvedColumn<T> {
  readonly key: string;
  readonly header: string;
  readonly headerHidden: boolean;
  readonly width: number | undefined;
  readonly minWidth: number;
  readonly maxWidth: number;
  readonly align: CwColumnAlign;
  readonly sortable: boolean;
  readonly resizable: boolean;
  readonly hideable: boolean;
  readonly editable: boolean;
  readonly value: (row: T) => unknown;
  readonly cell: TemplateRef<CwCellContext<T>> | undefined;
  readonly editor: TemplateRef<CwCellEditorContext<T>> | undefined;
}

/** A rendered row: the data, its id and its position in the grid (`aria-rowindex`). */
interface RowEntry<T> {
  readonly row: T;
  readonly id: string;
  readonly key: string;
  readonly rowIndex: number;
}

/** A rendered group: its row, then its rows unless folded. Without `groupBy`, one headless group. */
interface GroupEntry<T> {
  readonly key: string | null;
  readonly rowKey: string;
  readonly label: string;
  readonly count: number;
  readonly collapsed: boolean;
  readonly rowIndex: number;
  readonly rows: readonly RowEntry<T>[];
}

/** The open editor; `session` invalidates a late `commit` from an editor already closed. */
interface EditState {
  readonly rowId: string;
  readonly key: string;
  readonly session: number;
}

/** The handle being dragged; `guide` is the x position of the full-height line. */
interface ResizeState {
  readonly key: string;
  readonly width: number;
  readonly startX: number;
  readonly startWidth: number;
  readonly guide: number;
}

/** Where the roving tab stop is: a row key (`h`, `g:…`, `r:…`, `banner`, `state`) and a column key. */
interface ActiveCell {
  readonly row: string;
  readonly col: string;
}

/** Key of the selection column, in `data-cw-col`. */
const SELECT = '__select';
const HEADER = 'h';
const DEFAULT_MIN_WIDTH = 64;
const DEFAULT_MAX_WIDTH = 480;
/* Sheet DataTableComplete, "Colonnes": ← → by 8 px, Shift + arrow by 32 px. */
const RESIZE_STEP = 8;
const RESIZE_STEP_LARGE = 32;
/* Pg préc. / Pg suiv. move "one view height"; ten rows of 36 px are about one. */
const PAGE_STEP = 10;
/* Sheet DataTableComplete, "Chargement": eight rows. */
const SKELETON_ROWS = [0, 1, 2, 3, 4, 5, 6, 7];

const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex], [contenteditable="true"]';
/* Targets that own their arrow keys: the grid leaves them alone. */
const OWNS_KEYS =
  'input, textarea, select, [contenteditable="true"], [role="combobox"], [role="listbox"], [role="menu"], [role="slider"], [role="spinbutton"], [role="separator"]';
const INTERACTIVE = 'a, button, input, select, textarea, label, [role="checkbox"], [tabindex]';

const COLLATOR = new Intl.Collator('fr', { numeric: true, sensitivity: 'base' });

/* Literal class strings (DataTable and DataTableComplete sheets and previews of the Design System
   artifact), so Tailwind finds them in the compiled package. */
const ROW_HEIGHTS: Record<CwDataTableDensity, string> = {
  compact: 'h-8',
  default: 'h-9',
  comfortable: 'h-11',
};

const GROUP_HEIGHTS: Record<CwDataTableDensity, string> = {
  compact: 'h-7',
  default: 'h-8',
  comfortable: 'h-9',
};

/* Under 768 px the table becomes cards (mockup `styles/app.css`, `.cw-cards`): the header row
   hides, each row wraps its cells, the first data cell takes the whole line, the last one goes to
   the right. */
const ROW =
  'group/row border-b transition-colors hover:bg-accent aria-selected:bg-selected motion-reduce:transition-none ' +
  'max-md:flex max-md:h-auto max-md:flex-wrap max-md:items-center max-md:gap-x-3 max-md:gap-y-1.5 max-md:p-3';

const CELL = `align-middle overflow-hidden whitespace-nowrap ${ɵFOCUS_INSET} max-md:p-0 max-md:overflow-visible`;

const CELL_ALIGN: Record<CwColumnAlign, string> = {
  start: 'px-3 text-left',
  end: 'px-3 text-right tabular-nums',
};

const HEAD = `relative px-3 align-middle text-xs font-medium whitespace-nowrap text-muted-foreground ${ɵFOCUS_INSET}`;

const HEAD_ALIGN: Record<CwColumnAlign, string> = {
  start: 'text-left',
  end: 'text-right',
};

const SORT_BUTTON =
  'relative isolate inline-flex h-6 items-center gap-1 overflow-hidden rounded-md px-1.5 text-xs font-medium transition-colors hover:bg-accent hover:text-foreground motion-reduce:transition-none ' +
  `${ɵFOCUS} [&_ng-icon]:[--ng-icon__size:0.875rem]`;

const SORT_BUTTON_ALIGN: Record<CwColumnAlign, string> = {
  start: '-ml-1.5',
  end: '-mr-1.5 flex-row-reverse',
};

/* Rows enter one by one, 60 ms then +30 ms, twelve at most (cw-motion-tokens); sorting reorders
   without animation because the rows are tracked by id. */
const BODY_MOTION =
  '*:animate-item-in *:motion-reduce:animate-none [&>*:nth-child(1)]:[animation-delay:60ms] [&>*:nth-child(2)]:[animation-delay:90ms] [&>*:nth-child(3)]:[animation-delay:120ms] [&>*:nth-child(4)]:[animation-delay:150ms] [&>*:nth-child(5)]:[animation-delay:180ms] [&>*:nth-child(6)]:[animation-delay:210ms] [&>*:nth-child(7)]:[animation-delay:240ms] [&>*:nth-child(8)]:[animation-delay:270ms] [&>*:nth-child(9)]:[animation-delay:300ms] [&>*:nth-child(10)]:[animation-delay:330ms] [&>*:nth-child(11)]:[animation-delay:360ms] [&>*:nth-child(12)]:[animation-delay:390ms]';

const SKELETON_WIDTHS = [
  'w-[62%]',
  'w-[44%]',
  'w-[54%]',
  'w-[70%]',
  'w-[38%]',
  'w-[58%]',
  'w-[48%]',
  'w-[66%]',
];

function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || value === '';
}

function compareValues(a: unknown, b: unknown): number {
  const left = a instanceof Date ? a.getTime() : a;
  const right = b instanceof Date ? b.getTime() : b;
  if (typeof left === 'number' && typeof right === 'number') return left - right;
  if (typeof left === 'boolean' && typeof right === 'boolean') return Number(left) - Number(right);
  return COLLATOR.compare(String(left), String(right));
}

function toText(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value);
  }
  if (value instanceof Date) return value.toLocaleDateString('fr-FR');
  return JSON.stringify(value);
}

function defaultTrackBy(row: unknown): string {
  return String((row as { id?: unknown } | null)?.id);
}

/**
 * The list of a view: a grid that sorts, groups, selects, edits and pages generic rows of 32, 36
 * or 44 px (DataTable and DataTableComplete sheets of the Design System artifact; mockup
 * `App.dc.html` list view, `Organisation.dc.html` members).
 *
 * Columns come from `columns` (`CwColumnDef<T>[]`) or from `cw-data-table-column` children, which
 * also bring the `ng-template[cwCell]` and `ng-template[cwCellEditor]` templates. Rows are identified
 * by `trackBy` (`row.id` by default); `sort`, `selection`, `collapsed`, `density`, `page`,
 * `pageSize`, `columnWidths`, `columnOrder` and `columnVisibility` are models. Without `manual` the
 * table sorts (`value(row)` or `row[key]`, French collation, empty values last) and pages `data`
 * itself; with `manual` the consumer sorts and pages on the server, passes the page in `data` and
 * the count in `total`. `groupBy` folds rows by `String(row[groupBy])`, groups in `groupOrder` then
 * in order of appearance; `ng-template[cwDataTableGroup]` draws the group label. Bulk actions,
 * statuses and labels belong to the consumer: the selection bar appears with `bulkActions` (or a
 * projected `cw-data-table-bulk-bar`) and emits `bulkAction`.
 *
 * Keyboard (one tab stop, roving over the cells): arrows, Home / End, Ctrl + Home / End, Page Up /
 * Down; Space ticks the row, Shift + Space or Shift + click selects a range from the anchor, Shift +
 * ↑ ↓ extends, Ctrl + A ticks the page, Escape empties the selection; Enter opens the row or the
 * editor of an editable cell, F2 the editor; in an editor Escape cancels and Tab moves to the next
 * editable cell; ← → fold a group row; Enter / Space on a header sorts, Shift adds a criterion;
 * Ctrl + Shift + ← → moves a column. The controls of the active cell are reached with Tab. A
 * resize handle takes ← → (8 px, Shift 32 px), Home / End and Enter (fit to content).
 * Announcements go through the CDK `LiveAnnouncer`. Under 768 px the rows become cards.
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
  /** The loaded rows: the page with `manual`, every row otherwise. */
  readonly data = input.required<readonly T[]>();
  /** Column definitions; `cw-data-table-column` children add their templates by `key`. */
  readonly columns = input<readonly CwColumnDef<T>[] | null>(null);
  /** Identity of a row (`row.id` by default), the value kept in `selection`. */
  readonly trackBy = input<(row: T) => string>(defaultTrackBy);
  /** Short name of a row for the checkbox label (« Sélectionner CAD-482 »); the id by default. */
  readonly rowLabel = input<((row: T) => string) | null>(null);
  /** Key of the row field that groups the rows; `null` for a flat list. */
  readonly groupBy = input<string | null>(null);
  /** Label of a group value (« En cours » for `progress`); the value itself by default. */
  readonly groupLabel = input<(key: string) => string>((key) => key);
  /** Order of the groups (the order of the statuses flow); other values follow. */
  readonly groupOrder = input<readonly string[]>([]);
  /** Shows the « + » of each group row (`groupAdd`), when the table is editable. */
  readonly groupAddable = input(false, { transform: booleanAttribute });
  /** Sort criteria by priority, `[(sort)]`; empty for none. */
  readonly sort = model<readonly CwSort[]>([]);
  /** Selected row ids or `'all'`, `[(selection)]`. */
  readonly selection = model<CwDataTableSelection>([]);
  /** Folded group values, `[(collapsed)]`. */
  readonly collapsed = model<readonly string[]>([]);
  /** Row height. */
  readonly density = model<CwDataTableDensity>('default');
  /** Shows eight skeleton rows and sets `aria-busy`. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Message of the error state (« Impossible de charger les tâches »); `null` when none. */
  readonly error = input<string | null>(null);
  /** Current page (1-based), `[(page)]`; `null` without pagination (the list view scrolls). */
  readonly page = model<number | null>(1);
  /** Rows per page, `[(pageSize)]`. */
  readonly pageSize = model(50);
  /** Choices of « Lignes par page ». */
  readonly pageSizes = input<readonly number[]>(CW_DATA_TABLE_PAGE_SIZES);
  /** Rows after the consumer's filters, for the range and `aria-rowcount`; `data.length` by default. */
  readonly total = input<number | undefined>(undefined);
  /** The consumer sorts and pages: `data` is the current page, already sorted. */
  readonly manual = input(false, { transform: booleanAttribute });
  /** Shows the checkbox column and enables the selection keys. */
  readonly selectable = input(true, { transform: booleanAttribute });
  /** Allows the inline editors and the « + » of the groups (`false`: read only). */
  readonly editable = input(true, { transform: booleanAttribute });
  /** Shows the resize handles. */
  readonly resizableColumns = input(true, { transform: booleanAttribute });
  /** Allows dragging the headers to reorder the columns (the first column stays first). */
  readonly reorderableColumns = input(true, { transform: booleanAttribute });
  /** Widths in px by column key, `[(columnWidths)]`. */
  readonly columnWidths = model<Readonly<Record<string, number>>>({});
  /** Order of the column keys, `[(columnOrder)]`; empty for the order of the definitions. */
  readonly columnOrder = model<readonly string[]>([]);
  /** `false` hides a column, `[(columnVisibility)]`; the first column never hides. */
  readonly columnVisibility = model<Readonly<Record<string, boolean>>>({});
  /** Actions of the selection bar; none by default (they belong to the consumer). */
  readonly bulkActions = input<readonly CwBulkAction[]>([]);
  /** Text of the empty state when no `[cwDataTableEmpty]` content is projected. */
  readonly emptyText = input('Aucune tâche ne correspond');
  /** Overrides of the French texts (`CW_DATA_TABLE_TEXTS`). */
  readonly texts = input<Partial<CwDataTableTexts>>({});
  /** Accessible name of the grid (« Tâches de Produit »). */
  readonly ariaLabel = input.required<string>();

  /** A row asks to open: click on the first column, Enter on a cell, or `open()` from a template. */
  readonly rowOpen = output<T>();
  /** An editor validated a value. */
  readonly cellEdit = output<CwCellEditEvent<T>>();
  /** A column width was set: end of a drag, double click, or a handle key. */
  readonly columnResize = output<CwColumnResizeEvent>();
  /** A bulk action ran, from the bar or its shortcut. */
  readonly bulkAction = output<CwBulkActionEvent>();
  /** The « + » of a group row was pressed; the payload is the group value. */
  readonly groupAdd = output<string>();
  /** « Réessayer » of the error state was pressed. */
  readonly retry = output();

  private readonly columnChildren = contentChildren(CwDataTableColumn);
  private readonly groupTemplate = contentChild(CwDataTableGroup);
  private readonly projectedEmpty = contentChild(CwDataTableEmpty);
  protected readonly projectedBulkBar = contentChild(CwDataTableBulkBar);
  private readonly tableRef = viewChild.required<ElementRef<HTMLTableElement>>('table');
  private readonly scroller = viewChild.required<ElementRef<HTMLElement>>('scroller');

  private readonly announcer = inject(LiveAnnouncer);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  private readonly active = signal<ActiveCell | null>(null);
  private readonly anchor = signal<string | null>(null);
  protected readonly editing = signal<EditState | null>(null);
  protected readonly resizing = signal<ResizeState | null>(null);
  private session = 0;

  protected readonly rowHeight = computed(() => ROW_HEIGHTS[this.density()]);
  protected readonly groupHeight = computed(() => GROUP_HEIGHTS[this.density()]);
  protected readonly rowClasses = computed(() => `${ROW} ${ROW_HEIGHTS[this.density()]}`);
  protected readonly bodyMotion = BODY_MOTION;
  protected readonly skeletonRows = SKELETON_ROWS;
  protected readonly skeletonWidths = SKELETON_WIDTHS;
  protected readonly selectKey = SELECT;
  protected readonly headerKey = HEADER;
  protected readonly selectCellClasses = `${CELL} w-9 pr-1 pl-3 max-md:order-first`;
  protected readonly selectHeadClasses = `w-9 pr-1 pl-3 align-middle ${ɵFOCUS_INSET}`;
  protected readonly groupCellClasses = `px-2 align-middle ${ɵFOCUS_INSET} max-md:block max-md:py-1`;
  protected readonly groupButtonClasses = `relative isolate flex h-6 min-w-0 items-center gap-2 overflow-hidden rounded-md px-1.5 text-sm transition-colors hover:bg-accent motion-reduce:transition-none ${ɵFOCUS} [&_ng-icon]:[--ng-icon__size:0.875rem]`;
  protected readonly bannerCellClasses = `px-3 text-center align-middle text-sm ${ɵFOCUS_INSET} max-md:block max-md:py-2`;
  protected readonly stateCellClasses = `p-3 ${ɵFOCUS_INSET} max-md:block`;
  protected readonly linkClasses = `rounded-sm font-medium text-primary underline-offset-4 hover:underline ${ɵFOCUS}`;

  /** The French texts, defaults merged with `texts`. */
  readonly copy = computed<CwDataTableTexts>(() => ({ ...CW_DATA_TABLE_TEXTS, ...this.texts() }));

  private readonly resolvedColumns = computed<readonly ResolvedColumn<T>[]>(() => {
    const children = this.columnChildren();
    const byKey = new Map(children.map((child) => [child.key(), child]));
    const base: readonly Partial<CwColumnDef<T>>[] =
      this.columns() ?? children.map((child) => child.definition() as Partial<CwColumnDef<T>>);
    const editable = this.editable();
    return base.map((given) => {
      const child = given.key === undefined ? undefined : byKey.get(given.key);
      const def = { ...given, ...(child?.definition() ?? {}) } as CwColumnDef<T>;
      const editor = child?.editor()?.template as TemplateRef<CwCellEditorContext<T>> | undefined;
      const key = def.key;
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

  private readonly columnByKey = computed(
    () => new Map(this.resolvedColumns().map((column) => [column.key, column])),
  );

  /** Columns in `columnOrder`, the first definition pinned first, then the visible ones. */
  protected readonly visibleColumns = computed(() => {
    const columns = this.resolvedColumns();
    if (columns.length === 0) return [];
    const [first, ...rest] = columns;
    const byKey = this.columnByKey();
    const order = this.columnOrder().filter((key) => byKey.has(key) && key !== first.key);
    const ordered = [
      ...order.flatMap((key) => {
        const column = byKey.get(key);
        return column ? [column] : [];
      }),
      ...rest.filter((column) => !order.includes(column.key)),
    ];
    const visibility = this.columnVisibility();
    // A column is visible unless its key is explicitly `false`.
    return [
      first,
      ...ordered.filter(
        (c) => !c.hideable || !Object.hasOwn(visibility, c.key) || visibility[c.key],
      ),
    ];
  });

  /** Every column key in display order, hidden ones included. */
  private readonly allOrderedKeys = computed(() => {
    const columns = this.resolvedColumns();
    if (columns.length === 0) return [];
    const [first, ...rest] = columns;
    const known = new Set(rest.map((column) => column.key));
    const order = this.columnOrder().filter((key) => known.has(key));
    return [first.key, ...order, ...rest.map((c) => c.key).filter((k) => !order.includes(k))];
  });

  protected readonly colCount = computed(
    () => this.visibleColumns().length + (this.selectable() ? 1 : 0),
  );

  readonly totalCount = computed(() => this.total() ?? this.data().length);

  readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.totalCount() / Math.max(1, this.pageSize()))),
  );

  private readonly pageOffset = computed(() => {
    const page = this.page();
    return page === null
      ? 0
      : (Math.min(Math.max(1, page), this.pageCount()) - 1) * this.pageSize();
  });

  private readonly sortedRows = computed<readonly T[]>(() => {
    const data = this.data();
    const byKey = this.columnByKey();
    const criteria = this.sort().flatMap((criterion) => {
      const column = byKey.get(criterion.key);
      return column ? [{ column, sign: criterion.dir === 'asc' ? 1 : -1 }] : [];
    });
    if (this.manual() || criteria.length === 0) return data;
    return [...data].sort((x, y) => {
      for (const { column, sign } of criteria) {
        const a = column.value(x);
        const b = column.value(y);
        // Empty values stay last whatever the direction.
        if (isEmpty(a) || isEmpty(b)) {
          if (isEmpty(a) && isEmpty(b)) continue;
          return isEmpty(a) ? 1 : -1;
        }
        const result = compareValues(a, b) * sign;
        if (result !== 0) return result;
      }
      return 0;
    });
  });

  private groupKeyOf(row: T): string {
    const by = this.groupBy();
    const value = by === null ? undefined : (row as Record<string, unknown> | null)?.[by];
    return toText(value);
  }

  /** Group values in display order with their counts over every loaded row. */
  private readonly groupIndex = computed(() => {
    const counts = new Map<string, number>();
    if (this.groupBy() === null) return counts;
    for (const key of this.groupOrder()) counts.set(key, 0);
    for (const row of this.sortedRows()) {
      const key = this.groupKeyOf(row);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  });

  /** The rows of the page, in group order when grouped. */
  private readonly pageRows = computed<readonly T[]>(() => {
    let rows = this.sortedRows();
    if (this.groupBy() !== null) {
      const order = [...this.groupIndex().keys()];
      const rank = new Map(order.map((key, index) => [key, index]));
      rows = [...rows].sort(
        (a, b) => (rank.get(this.groupKeyOf(a)) ?? 0) - (rank.get(this.groupKeyOf(b)) ?? 0),
      );
    }
    if (this.page() === null || this.manual()) return rows;
    const offset = this.pageOffset();
    return rows.slice(offset, offset + this.pageSize());
  });

  protected readonly groups = computed<readonly GroupEntry<T>[]>(() => {
    const rows = this.pageRows();
    const trackBy = this.trackBy();
    // aria-rowindex: the header is row 1; rows of earlier pages count before this page.
    let index = 1 + this.pageOffset();
    const entry = (row: T): RowEntry<T> => {
      const id = trackBy(row);
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
    const buckets = new Map<string, T[]>();
    for (const row of rows) {
      const key = this.groupKeyOf(row);
      const bucket = buckets.get(key);
      if (bucket) bucket.push(row);
      else buckets.set(key, [row]);
    }
    const collapsed = new Set(this.collapsed());
    const label = this.groupLabel();
    const counts = this.groupIndex();
    return [...buckets.entries()].map(([key, members]) => {
      index += 1;
      const rowIndex = index;
      const folded = collapsed.has(key);
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
  });

  /** Rendered data rows in order: ranges and arrow selection follow it. */
  private readonly renderedRows = computed(() => this.groups().flatMap((group) => group.rows));

  private readonly rowByKey = computed(
    () => new Map(this.renderedRows().map((entry) => [entry.key, entry])),
  );

  /** Ids of the rows of the page, folded groups included: the header checkbox covers them. */
  protected readonly pageIds = computed(() => {
    const trackBy = this.trackBy();
    return this.pageRows().map((row) => trackBy(row));
  });

  private readonly selectedSet = computed(() => {
    const selection = this.selection();
    return new Set(selection === 'all' ? this.pageIds() : selection);
  });

  readonly selectedCount = computed(() => {
    const selection = this.selection();
    return selection === 'all' ? this.totalCount() : selection.length;
  });

  protected readonly headerState = computed(() => {
    const ids = this.pageIds();
    if (this.selection() === 'all') return ids.length ? 'checked' : 'unchecked';
    const selected = this.selectedSet();
    const count = ids.filter((id) => selected.has(id)).length;
    if (count === 0) return 'unchecked';
    return count === ids.length ? 'checked' : 'indeterminate';
  });

  /** « Sélectionner les 128 tâches » once the page is ticked and more rows match. */
  protected readonly bannerState = computed<'offer' | 'all' | null>(() => {
    if (!this.selectable() || this.loading()) return null;
    if (this.selection() === 'all') return 'all';
    const more = this.totalCount() > this.pageIds().length;
    return more && this.headerState() === 'checked' ? 'offer' : null;
  });

  readonly rangeFirst = computed(() => (this.totalCount() === 0 ? 0 : this.pageOffset() + 1));

  readonly rangeLast = computed(() =>
    Math.min(this.totalCount(), this.pageOffset() + this.pageRows().length),
  );

  protected readonly isEmpty = computed(() => this.pageRows().length === 0);
  protected readonly hasProjectedEmpty = computed(() => !!this.projectedEmpty());
  protected readonly groupHeader = computed(() => this.groupTemplate()?.template ?? null);

  protected readonly bulkBarVisible = computed(
    () => this.selectedCount() > 0 && (this.bulkActions().length > 0 || !!this.projectedBulkBar()),
  );

  protected readonly ariaRowCount = computed(() => {
    const groups = this.groupBy() === null ? 0 : this.groups().length;
    return this.totalCount() + 1 + groups;
  });

  constructor() {
    // Shift + click on a row checkbox selects a range: caught in the capture phase, before the
    // checkbox toggles itself, so the box never shows a state the selection does not have.
    this.host.addEventListener(
      'click',
      (event) => {
        const target = event.target as Element | null;
        if (!event.shiftKey || !target?.closest('[data-cw-select]')) return;
        const rowKey = target.closest<HTMLElement>('[data-cw-row]')?.dataset['cwRow'];
        const entry = rowKey ? this.rowByKey().get(rowKey) : undefined;
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
        const active = this.active();
        const table = this.tableRef().nativeElement;
        const target = this.cellElement(active) ?? this.defaultCell();
        // A handle without an explicit width reports the rendered one (aria-valuenow is required).
        for (const handle of Array.from(table.querySelectorAll<HTMLElement>('[data-cw-resize]'))) {
          if (!handle.hasAttribute('aria-valuenow')) {
            const width = handle.parentElement?.getBoundingClientRect().width ?? 0;
            handle.setAttribute('aria-valuenow', String(Math.round(width)));
          }
        }
        for (const cell of Array.from(table.querySelectorAll<HTMLElement>('[data-cw-cell]'))) {
          const isActive = cell === target;
          cell.tabIndex = isActive ? 0 : -1;
          const free = isActive || cell.hasAttribute('data-editing');
          for (const control of Array.from(cell.querySelectorAll<HTMLElement>(FOCUSABLE))) {
            if (!control.hasAttribute('data-cw-tabindex')) {
              control.setAttribute('data-cw-tabindex', control.getAttribute('tabindex') ?? '');
            }
            const original = control.getAttribute('data-cw-tabindex') ?? '';
            if (!free) control.setAttribute('tabindex', '-1');
            else if (original === '') control.removeAttribute('tabindex');
            else control.setAttribute('tabindex', original);
          }
        }
      },
    });
  }

  // Template helpers -------------------------------------------------------------------------

  protected cellClasses(column: ResolvedColumn<T>, first: boolean): string {
    const card = first
      ? 'max-md:min-w-0 max-md:flex-1 max-md:basis-[calc(100%-2.5rem)]'
      : 'max-md:last:ml-auto';
    return `${CELL} ${CELL_ALIGN[column.align]} ${card}`;
  }

  protected headClasses(column: ResolvedColumn<T>): string {
    return `${HEAD} ${HEAD_ALIGN[column.align]}`;
  }

  protected sortButtonClasses(column: ResolvedColumn<T>): string {
    const tone = this.sortRank(column.key) > 0 ? 'text-foreground' : 'text-muted-foreground';
    return `${SORT_BUTTON} ${SORT_BUTTON_ALIGN[column.align]} ${tone}`;
  }

  protected widthOf(column: ResolvedColumn<T>): number | null {
    const resizing = this.resizing();
    if (resizing?.key === column.key) return resizing.width;
    const widths = this.columnWidths();
    if (Object.hasOwn(widths, column.key)) return widths[column.key];
    return column.width ?? null;
  }

  protected sortRank(key: string): number {
    return this.sort().findIndex((criterion) => criterion.key === key) + 1;
  }

  protected sortDir(key: string): CwSortDirection | null {
    return this.sort().find((criterion) => criterion.key === key)?.dir ?? null;
  }

  protected ariaSort(column: ResolvedColumn<T>): string | null {
    if (!column.sortable) return null;
    const primary = this.sort().at(0);
    if (primary?.key !== column.key) return this.sortRank(column.key) > 0 ? null : 'none';
    return primary.dir === 'asc' ? 'ascending' : 'descending';
  }

  protected isSelected(id: string): boolean {
    return this.selectedSet().has(id);
  }

  protected labelOf(entry: RowEntry<T>): string {
    return this.rowLabel()?.(entry.row) ?? entry.id;
  }

  protected display(entry: RowEntry<T>, column: ResolvedColumn<T>): string {
    return toText(column.value(entry.row));
  }

  protected isEditing(entry: RowEntry<T>, column: ResolvedColumn<T>): boolean {
    const editing = this.editing();
    return editing?.rowId === entry.id && editing.key === column.key;
  }

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

  protected editorContext(entry: RowEntry<T>, column: ResolvedColumn<T>): CwCellEditorContext<T> {
    const session = this.editing()?.session ?? -1;
    const previous = column.value(entry.row);
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

  protected groupContext(group: GroupEntry<T>): CwGroupContext {
    const key = group.key ?? '';
    return { $implicit: key, key, label: group.label, count: group.count };
  }

  // Sorting ----------------------------------------------------------------------------------

  protected toggleSort(column: ResolvedColumn<T>, additive: boolean): void {
    if (!column.sortable) return;
    const current = this.sortDir(column.key);
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
    const byKey = this.columnByKey();
    this.announce(
      this.copy().sorted(
        sort.map((criterion) => ({
          header: byKey.get(criterion.key)?.header ?? criterion.key,
          dir: criterion.dir,
        })),
      ),
    );
  }

  protected onSortClick(event: MouseEvent, column: ResolvedColumn<T>): void {
    this.toggleSort(column, event.shiftKey);
  }

  protected onSortKeydown(event: KeyboardEvent, column: ResolvedColumn<T>): void {
    // Shift + Enter adds a criterion: browsers do not all pass Shift to the click of a key press.
    if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault();
      event.stopPropagation();
      this.toggleSort(column, true);
    }
  }

  // Selection --------------------------------------------------------------------------------

  private setSelection(next: CwDataTableSelection): void {
    this.selection.set(next);
    this.announce(this.copy().selected(next === 'all' ? this.totalCount() : next.length));
  }

  private currentIds(): string[] {
    const selection = this.selection();
    return selection === 'all' ? [...this.pageIds()] : [...selection];
  }

  protected toggleRow(id: string, checked: boolean): void {
    const ids = this.currentIds().filter((existing) => existing !== id);
    if (checked) ids.push(id);
    this.anchor.set(id);
    this.setSelection(ids);
  }

  private selectRange(toId: string): void {
    const order = this.renderedRows().map((entry) => entry.id);
    const from = order.indexOf(this.anchor() ?? toId);
    const to = order.indexOf(toId);
    if (to < 0) return;
    const [start, end] = from < 0 ? [to, to] : [Math.min(from, to), Math.max(from, to)];
    const ids = new Set(this.currentIds());
    for (const id of order.slice(start, end + 1)) ids.add(id);
    if (this.anchor() === null) this.anchor.set(toId);
    this.setSelection([...ids]);
  }

  protected toggleAll(checked: boolean): void {
    if (!checked) {
      this.setSelection([]);
      return;
    }
    const ids = new Set(this.currentIds());
    for (const id of this.pageIds()) ids.add(id);
    this.setSelection([...ids]);
  }

  protected selectAllMatching(): void {
    this.setSelection('all');
  }

  /** Empties the selection and moves the focus back into the grid. */
  clearSelection(): void {
    this.setSelection([]);
    this.anchor.set(null);
    this.focusCell(this.active() ?? this.firstBodyCell());
  }

  /** Emits `bulkAction` for the current selection. */
  runBulkAction(action: CwBulkAction, trigger?: HTMLElement): void {
    this.bulkAction.emit({ action: action.id, ids: this.selection(), trigger });
  }

  protected onRowClick(event: MouseEvent, entry: RowEntry<T>): void {
    const target = event.target as Element;
    const cell = target.closest<HTMLElement>('[data-cw-cell]');
    const interactive = target.closest(INTERACTIVE);
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

  // Groups -----------------------------------------------------------------------------------

  protected toggleGroup(group: GroupEntry<T>, collapse?: boolean): void {
    if (group.key === null) return;
    const folded = collapse ?? !group.collapsed;
    if (folded === group.collapsed) return;
    const others = this.collapsed().filter((key) => key !== group.key);
    this.collapsed.set(folded ? [...others, group.key] : others);
    this.announce(this.copy().groupToggled(group.label, folded));
  }

  // Pagination -------------------------------------------------------------------------------

  /** Goes to a page (clamped) and scrolls the grid back to its top. */
  setPage(page: number): void {
    const next = Math.min(Math.max(1, page), this.pageCount());
    if (next === this.page()) return;
    this.page.set(next);
    this.scroller().nativeElement.scrollTop = 0;
  }

  /** Changes the page size and goes back to page 1. */
  setPageSize(size: number): void {
    if (size === this.pageSize()) return;
    this.pageSize.set(size);
    if (this.page() !== null) this.page.set(1);
    this.scroller().nativeElement.scrollTop = 0;
  }

  // Editing ----------------------------------------------------------------------------------

  private startEdit(entry: RowEntry<T>, column: ResolvedColumn<T>): boolean {
    if (!column.editable || this.loading()) return false;
    this.session += 1;
    this.editing.set({ rowId: entry.id, key: column.key, session: this.session });
    this.active.set({ row: entry.key, col: column.key });
    afterNextRender(
      () => {
        const cell = this.cellElement({ row: entry.key, col: column.key });
        cell?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
      },
      { injector: this.injector },
    );
    return true;
  }

  private closeEditor(entry: RowEntry<T>, column: ResolvedColumn<T>): void {
    this.editing.set(null);
    const cell = { row: entry.key, col: column.key };
    afterNextRender(
      () => {
        // Only when the focus was in the editor: a click elsewhere keeps its own target.
        const focused = this.host.ownerDocument.activeElement;
        if (!focused || focused === this.host.ownerDocument.body || this.host.contains(focused)) {
          this.focusCell(cell);
        }
      },
      { injector: this.injector },
    );
  }

  private editNext(entry: RowEntry<T>, column: ResolvedColumn<T>, backwards: boolean): void {
    const rows = this.renderedRows();
    const columns = this.visibleColumns();
    const cells: { entry: RowEntry<T>; column: ResolvedColumn<T> }[] = [];
    for (const row of rows)
      for (const c of columns) if (c.editable) cells.push({ entry: row, column: c });
    const index = cells.findIndex(
      (cell) => cell.entry.id === entry.id && cell.column.key === column.key,
    );
    const next = index < 0 ? undefined : cells.at(index + (backwards ? -1 : 1));
    if (next) this.startEdit(next.entry, next.column);
  }

  protected onCellDblclick(entry: RowEntry<T>, column: ResolvedColumn<T>): void {
    if (!this.isEditing(entry, column)) this.startEdit(entry, column);
  }

  // Columns ----------------------------------------------------------------------------------

  private clampWidth(column: ResolvedColumn<T>, width: number): number {
    return Math.round(Math.min(column.maxWidth, Math.max(column.minWidth, width)));
  }

  private setWidth(column: ResolvedColumn<T>, width: number): void {
    const clamped = this.clampWidth(column, width);
    this.columnWidths.update((widths) => ({ ...widths, [column.key]: clamped }));
    this.columnResize.emit({ key: column.key, width: clamped });
    this.announce(this.copy().columnResized(column.header, clamped));
  }

  protected currentWidth(column: ResolvedColumn<T>, handle: HTMLElement): number {
    return (
      this.widthOf(column) ?? Math.round(handle.parentElement?.getBoundingClientRect().width ?? 0)
    );
  }

  protected onResizeStart(event: PointerEvent, column: ResolvedColumn<T>): void {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const handle = event.currentTarget as HTMLElement;
    const th = handle.parentElement;
    if (!th) return;
    const width = this.currentWidth(column, handle);
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

  protected onResizeMove(event: PointerEvent, column: ResolvedColumn<T>): void {
    const resizing = this.resizing();
    if (resizing?.key !== column.key) return;
    const th = (event.currentTarget as HTMLElement).parentElement;
    if (!th) return;
    const width = this.clampWidth(column, resizing.startWidth + event.clientX - resizing.startX);
    this.resizing.set({ ...resizing, width, guide: th.offsetLeft + width });
  }

  protected onResizeEnd(column: ResolvedColumn<T>): void {
    const resizing = this.resizing();
    if (resizing?.key !== column.key) return;
    this.resizing.set(null);
    if (resizing.width !== resizing.startWidth) this.setWidth(column, resizing.width);
  }

  protected onResizeKeydown(event: KeyboardEvent, column: ResolvedColumn<T>): void {
    const handle = event.currentTarget as HTMLElement;
    const width = this.currentWidth(column, handle);
    const step = event.shiftKey ? RESIZE_STEP_LARGE : RESIZE_STEP;
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

  /** Width of the widest loaded cell and of the header (double click or Enter on the handle). */
  protected fitColumn(column: ResolvedColumn<T>): void {
    this.setWidth(column, this.contentWidth(column));
  }

  private contentWidth(column: ResolvedColumn<T>): number {
    let widest = column.minWidth;
    for (const cell of Array.from(
      this.tableRef().nativeElement.querySelectorAll<HTMLElement>('[data-cw-cell]'),
    )) {
      if (cell.dataset['cwCol'] === column.key) widest = Math.max(widest, cell.scrollWidth);
    }
    return widest;
  }

  protected stopDrag(event: Event): void {
    // The handle sits on the draggable header: a press on it resizes, it never moves the column.
    event.stopPropagation();
  }

  /** Drop predicate of the header list: nothing goes before the first column. */
  protected readonly firstFixed = (index: number): boolean => index > 0;

  protected onColumnDrop(event: CdkDragDrop<unknown>): void {
    if (event.previousIndex === event.currentIndex) return;
    const key = this.visibleColumns()[event.previousIndex]?.key;
    if (key) this.moveColumn(key, event.currentIndex);
  }

  private moveColumn(key: string, to: number): void {
    const visible = this.visibleColumns().map((column) => column.key);
    const from = visible.indexOf(key);
    const target = Math.min(Math.max(1, to), visible.length - 1);
    if (from <= 0 || from === target) return;
    moveItemInArray(visible, from, target);
    const shown = new Set(visible);
    let next = 0;
    this.columnOrder.set(
      this.allOrderedKeys().map((existing) => (shown.has(existing) ? visible[next++] : existing)),
    );
  }

  // Keyboard ---------------------------------------------------------------------------------

  protected onFocusin(event: FocusEvent): void {
    const cell = (event.target as Element).closest<HTMLElement>('[data-cw-cell]');
    const row = cell?.closest<HTMLElement>('[data-cw-row]')?.dataset['cwRow'];
    const col = cell?.dataset['cwCol'];
    if (!cell || row === undefined || col === undefined) return;
    const active = this.active();
    if (active?.row !== row || active.col !== col) this.active.set({ row, col });
  }

  protected onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const cell = target.closest<HTMLElement>('[data-cw-cell]');
    if (!cell) return;
    const rowEl = cell.closest<HTMLElement>('[data-cw-row]');
    const rowKey = rowEl?.dataset['cwRow'] ?? '';
    const colKey = cell.dataset['cwCol'] ?? '';

    if (cell.hasAttribute('data-editing')) {
      this.onEditorKeydown(event, rowKey, colKey);
      return;
    }
    if (target !== cell && target.closest(OWNS_KEYS)) return;

    const onCell = target === cell;
    const entry = this.rowByKey().get(rowKey);
    const column = this.columnByKey().get(colKey);
    const group = rowKey.startsWith('g:')
      ? this.groups().find((g) => g.rowKey === rowKey)
      : undefined;
    const ctrl = event.ctrlKey || event.metaKey;

    if (
      rowKey === HEADER &&
      ctrl &&
      event.shiftKey &&
      column &&
      (event.key === 'ArrowLeft' || event.key === 'ArrowRight')
    ) {
      event.preventDefault();
      const visible = this.visibleColumns().map((c) => c.key);
      const position = visible.indexOf(colKey) + (event.key === 'ArrowLeft' ? -1 : 1);
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
          const first = this.visibleColumns()[0]?.key === column.key;
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
      const action = this.bulkActions().find(
        (candidate) => candidate.shortcut?.toLowerCase() === event.key.toLowerCase(),
      );
      if (action) {
        event.preventDefault();
        const trigger = this.host.querySelector<HTMLElement>(
          `[data-cw-bulk-action="${action.id.replace(/"/g, '')}"]`,
        );
        this.runBulkAction(action, trigger ?? undefined);
      }
    }
  }

  private onEditorKeydown(event: KeyboardEvent, rowKey: string, colKey: string): void {
    const entry = this.rowByKey().get(rowKey);
    const column = this.columnByKey().get(colKey);
    if (!entry || !column) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.closeEditor(entry, column);
      return;
    }
    if (event.key === 'Tab') {
      event.preventDefault();
      const session = this.editing()?.session;
      // The editor validates on blur (its contract): blur first, then open the next cell.
      (this.host.ownerDocument.activeElement as HTMLElement | null)?.blur();
      if (this.editing()?.session === session) this.editing.set(null);
      this.editNext(entry, column, event.shiftKey);
    }
  }

  /** Arrow, Home, End and Page keys between the cells. Returns whether the key moved the focus. */
  private navigate(event: KeyboardEvent, rowKey: string, colKey: string): boolean {
    const rows = this.navRows();
    const rowIndex = rows.findIndex((row) => row.dataset['cwRow'] === rowKey);
    if (rowIndex < 0) return false;
    const ctrl = event.ctrlKey || event.metaKey;
    const cellsOf = (row: HTMLElement): HTMLElement[] =>
      Array.from(row.children).filter((child): child is HTMLElement =>
        child.hasAttribute('data-cw-cell'),
      );
    const cells = cellsOf(rows[rowIndex]);
    const colIndex = Math.max(
      0,
      cells.findIndex((cell) => cell.dataset['cwCol'] === colKey),
    );
    const rtl =
      this.host.ownerDocument.dir === 'rtl' || getComputedStyle(this.host).direction === 'rtl';
    let nextRow = rowIndex;
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
    const targetCells = cellsOf(rows[nextRow]);
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
    const nextKey = rows[nextRow].dataset['cwRow'] ?? '';
    const keepCol =
      targetCells.length === 1 && cells.length > 1 ? colKey : (target.dataset['cwCol'] ?? colKey);

    // Shift + ↑ ↓ extends the selection to the next row.
    if (
      event.shiftKey &&
      (event.key === 'ArrowDown' || event.key === 'ArrowUp') &&
      this.selectable()
    ) {
      const from = this.rowByKey().get(rowKey);
      const to = this.rowByKey().get(nextKey);
      if (from && to) {
        const ids = new Set(this.currentIds());
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

  private navRows(): HTMLElement[] {
    return Array.from(
      this.tableRef().nativeElement.querySelectorAll<HTMLElement>('tr[data-cw-row]'),
    );
  }

  private cellElement(active: ActiveCell | null): HTMLElement | null {
    if (!active) return null;
    const row = this.navRows().find((candidate) => candidate.dataset['cwRow'] === active.row);
    if (!row) return null;
    const cells = Array.from(row.children).filter((child): child is HTMLElement =>
      child.hasAttribute('data-cw-cell'),
    );
    return (
      cells.find((cell) => cell.dataset['cwCol'] === active.col) ??
      (cells.length === 1 ? cells[0] : null)
    );
  }

  private firstBodyCell(): ActiveCell | null {
    const first = this.navRows().find((row) => row.dataset['cwRow'] !== HEADER);
    const cell = first
      ? Array.from(first.children).find((child) => child.hasAttribute('data-cw-cell'))
      : null;
    const row = first?.dataset['cwRow'];
    const col = (cell as HTMLElement | null)?.dataset['cwCol'];
    return row !== undefined && col !== undefined ? { row, col } : null;
  }

  private defaultCell(): HTMLElement | null {
    return (
      this.cellElement(this.firstBodyCell()) ??
      this.cellElement({ row: HEADER, col: this.firstHeaderKey() })
    );
  }

  private firstHeaderKey(): string {
    return this.selectable() ? SELECT : (this.visibleColumns()[0]?.key ?? '');
  }

  private focusCell(cell: ActiveCell | null): void {
    if (!cell) return;
    this.active.set(cell);
    this.cellElement(cell)?.focus();
  }

  private announce(message: string): void {
    void this.announcer.announce(message, 'polite');
  }
}
