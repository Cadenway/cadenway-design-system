import { InjectionToken, type Signal } from '@angular/core';

import type { CwBulkAction, CwDataTableTexts } from './data-table.types';

/**
 * Interface ɵCwDataTableContext
 *
 * @description
 * What the selection bar and the pagination footer read from their table. A token rather than the `CwDataTable` class: the table imports both components, so they cannot import it back. Internal to the entry point.
 */
export interface ɵCwDataTableContext {
  // #region Properties
  /**
   * Property selectedCount
   *
   * @description
   * Number of selected rows (the matching total when the selection is `'all'`).
   *
   * @type {Signal<number>}
   * @readonly
   */
  readonly selectedCount: Signal<number>;

  /**
   * Property bulkActions
   *
   * @description
   * Actions of the selection bar, from the consumer.
   *
   * @type {Signal<readonly CwBulkAction[]>}
   * @readonly
   */
  readonly bulkActions: Signal<readonly CwBulkAction[]>;

  /**
   * Property copy
   *
   * @description
   * The merged French texts.
   *
   * @type {Signal<CwDataTableTexts>}
   * @readonly
   */
  readonly copy: Signal<CwDataTableTexts>;

  /**
   * Property page
   *
   * @description
   * Current page (1-based); `null` without pagination.
   *
   * @type {Signal<number | null>}
   * @readonly
   */
  readonly page: Signal<number | null>;

  /**
   * Property pageCount
   *
   * @description
   * Number of pages, at least 1.
   *
   * @type {Signal<number>}
   * @readonly
   */
  readonly pageCount: Signal<number>;

  /**
   * Property pageSize
   *
   * @description
   * Rows per page.
   *
   * @type {Signal<number>}
   * @readonly
   */
  readonly pageSize: Signal<number>;

  /**
   * Property pageSizes
   *
   * @description
   * Choices of « Lignes par page ».
   *
   * @type {Signal<readonly number[]>}
   * @readonly
   */
  readonly pageSizes: Signal<readonly number[]>;

  /**
   * Property totalCount
   *
   * @description
   * Rows after the consumer's filters.
   *
   * @type {Signal<number>}
   * @readonly
   */
  readonly totalCount: Signal<number>;

  /**
   * Property rangeFirst
   *
   * @description
   * Position of the first row of the page (1-based, 0 when empty).
   *
   * @type {Signal<number>}
   * @readonly
   */
  readonly rangeFirst: Signal<number>;

  /**
   * Property rangeLast
   *
   * @description
   * Position of the last row of the page.
   *
   * @type {Signal<number>}
   * @readonly
   */
  readonly rangeLast: Signal<number>;
  // #endregion
  // #region Methods
  /**
   * Method runBulkAction
   *
   * @description
   * Emits `bulkAction` for the current selection.
   *
   * @param {CwBulkAction} action - Bulk action to run.
   * @param {HTMLElement} trigger - Button that triggered the action, if present.
   */
  runBulkAction(action: CwBulkAction, trigger?: HTMLElement): void;

  /**
   * Method clearSelection
   *
   * @description
   * Empties the selection and moves the focus back into the grid.
   */
  clearSelection(): void;

  /**
   * Method setPage
   *
   * @description
   * Goes to a page (clamped) and scrolls the grid back to its top.
   *
   * @param {number} page - One-based page to display.
   */
  setPage(page: number): void;

  /**
   * Method setPageSize
   *
   * @description
   * Changes the page size and goes back to page 1.
   *
   * @param {number} size - Number of rows per page.
   */
  setPageSize(size: number): void;
  // #endregion
}

/**
 * Constant ɵCW_DATA_TABLE
 *
 * @description
 * Provided by `cw-data-table` for its selection bar and its pagination footer.
 *
 * @type {InjectionToken<ɵCwDataTableContext>}
 */
export const ɵCW_DATA_TABLE: InjectionToken<ɵCwDataTableContext> =
  new InjectionToken<ɵCwDataTableContext>('CwDataTable');
