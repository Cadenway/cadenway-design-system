import { Directive, computed, inject, type Signal } from '@angular/core';

import { CwTableFooter } from '../table-footer/table-footer.directive';
import { CwTableHeader } from '../table-header/table-header.directive';
import { CwTable } from '../table.directive';
import type { CwTableSize } from '../table.types';

/**
 * Constant BODY_ROWS
 *
 * @description
 * Literal body-row height, separator and hover classes for each table size.
 *
 * @type {Record<CwTableSize, string>}
 */
const BODY_ROWS: Record<CwTableSize, string> = {
  default: 'h-10 border-b transition-colors hover:bg-accent motion-reduce:transition-none',
  sm: 'h-8 border-b transition-colors hover:bg-accent motion-reduce:transition-none',
};

/**
 * Constant HEADER_ROWS
 *
 * @description
 * Header-row height classes for each table size.
 *
 * @type {Record<CwTableSize, string>}
 */
const HEADER_ROWS: Record<CwTableSize, string> = {
  default: 'h-9',
  sm: 'h-8',
};

/**
 * Constant FOOTER_ROWS
 *
 * @description
 * Footer-row height classes for each table size.
 *
 * @type {Record<CwTableSize, string>}
 */
const FOOTER_ROWS: Record<CwTableSize, string> = {
  default: 'h-10',
  sm: 'h-8',
};

/**
 * Class CwTableRow
 * @class CwTableRow
 *
 * @description
 * A row: in the body, a 40 px (32 px in `sm`) row with a rule and the hover veil; in the header and
 * the footer, the row height only.
 */
@Directive({
  selector: 'tr[cwTableRow]',
  host: { '[class]': 'classes()' },
})
export class CwTableRow {
  // #region Properties
  /**
   * Property table
   * @readonly
   *
   * @description
   * Parent table supplying row size, or null outside a styled table.
   *
   * @type {CwTable | null}
   */
  private readonly table: CwTable | null = inject(CwTable, { optional: true });

  /**
   * Property header
   * @readonly
   *
   * @description
   * Parent header marker, or null when the row is outside a header.
   *
   * @type {CwTableHeader | null}
   */
  private readonly header: CwTableHeader | null = inject(CwTableHeader, { optional: true });

  /**
   * Property footer
   * @readonly
   *
   * @description
   * Parent footer marker, or null when the row is outside a footer.
   *
   * @type {CwTableFooter | null}
   */
  private readonly footer: CwTableFooter | null = inject(CwTableFooter, { optional: true });

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Row classes selected by the parent section and table size.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(() => {
    const size: CwTableSize = this.table?.size() ?? 'default';
    if (this.header) return HEADER_ROWS[size];
    if (this.footer) return FOOTER_ROWS[size];
    return BODY_ROWS[size];
  });
  // #endregion
}
