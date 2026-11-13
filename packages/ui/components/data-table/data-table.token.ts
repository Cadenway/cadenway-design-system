import { InjectionToken, type Signal } from '@angular/core';

import type { CwBulkAction, CwDataTableTexts } from './data-table.types';

/**
 * What the selection bar and the pagination footer read from their table. A token rather than the
 * `CwDataTable` class: the table imports both components, so they cannot import it back.
 * Internal to the entry point.
 */
export interface ɵCwDataTableContext {
  /** Number of selected rows (the matching total when the selection is `'all'`). */
  readonly selectedCount: Signal<number>;
  /** Actions of the selection bar, from the consumer. */
  readonly bulkActions: Signal<readonly CwBulkAction[]>;
  /** The merged French texts. */
  readonly copy: Signal<CwDataTableTexts>;
  /** Current page (1-based); `null` without pagination. */
  readonly page: Signal<number | null>;
  /** Number of pages, at least 1. */
  readonly pageCount: Signal<number>;
  /** Rows per page. */
  readonly pageSize: Signal<number>;
  /** Choices of « Lignes par page ». */
  readonly pageSizes: Signal<readonly number[]>;
  /** Rows after the consumer's filters. */
  readonly totalCount: Signal<number>;
  /** Position of the first row of the page (1-based, 0 when empty). */
  readonly rangeFirst: Signal<number>;
  /** Position of the last row of the page. */
  readonly rangeLast: Signal<number>;
  /** Emits `bulkAction` for the current selection. */
  runBulkAction(action: CwBulkAction, trigger?: HTMLElement): void;
  /** Empties the selection and moves the focus back into the grid. */
  clearSelection(): void;
  /** Goes to a page (clamped) and scrolls the grid back to its top. */
  setPage(page: number): void;
  /** Changes the page size and goes back to page 1. */
  setPageSize(size: number): void;
}

/** Provided by `cw-data-table` for its selection bar and its pagination footer. */
export const ɵCW_DATA_TABLE = new InjectionToken<ɵCwDataTableContext>('CwDataTable');
