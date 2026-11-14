import {
  booleanAttribute,
  Component,
  computed,
  contentChild,
  input,
  numberAttribute,
  type InputSignalWithTransform,
  type InputSignal,
  type Signal,
} from '@angular/core';

import { CwCellDef } from '../cell/cell.directive';
import { CwCellEditorDef } from '../cell-editor/cell-editor.directive';
import type { CwColumnAlign, CwColumnDef } from '../data-table.types';

/**
 * Function optionalNumber
 *
 * @description
 * Converts an optional numeric input.
 *
 * @param {unknown} value - Value to inspect or convert.
 * @returns {number | undefined} Converted number, or undefined.
 */
function optionalNumber(value: unknown): number | undefined {
  return value === undefined || value === null || value === '' ? undefined : numberAttribute(value);
}

/**
 * Function optionalBoolean
 *
 * @description
 * Converts an optional boolean input.
 *
 * @param {unknown} value - Value to inspect or convert.
 * @returns {boolean | undefined} Converted boolean, or undefined.
 */
function optionalBoolean(value: unknown): boolean | undefined {
  return value === undefined || value === null ? undefined : booleanAttribute(value);
}

/**
 * Component CwDataTableColumn
 *
 * @description
 * Declares a column of `cw-data-table` in the template, with its cell rendering (`ng-template[cwCell]`) and its editor (`ng-template[cwCellEditor]`) (DataTable sheet of the Design System artifact). It renders nothing itself. Its inputs are those of `CwColumnDef`; when the table also receives a `columns` array, a child column with the same `key` only brings its templates and overrides the fields it sets.
 */
@Component({
  selector: 'cw-data-table-column',
  host: { hidden: '' },
  templateUrl: './data-table-column.component.html',
})
export class CwDataTableColumn {
  // #region Properties
  /**
   * Property key
   *
   * @description
   * Identity of the column.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly key: InputSignal<string> = input.required<string>();

  /**
   * Property header
   *
   * @description
   * Header label.
   *
   * @type {InputSignal<string | undefined>}
   * @readonly
   */
  public readonly header: InputSignal<string | undefined> = input<string | undefined>(undefined);

  /**
   * Property headerHidden
   *
   * @description
   * Keeps the header label for assistive technologies only.
   *
   * @type {InputSignalWithTransform<boolean | undefined, unknown>}
   * @readonly
   */
  public readonly headerHidden: InputSignalWithTransform<boolean | undefined, unknown> = input(
    undefined,
    { transform: optionalBoolean },
  );

  /**
   * Property width
   *
   * @description
   * Initial width in px.
   *
   * @type {InputSignalWithTransform<number | undefined, unknown>}
   * @readonly
   */
  public readonly width: InputSignalWithTransform<number | undefined, unknown> = input(undefined, {
    transform: optionalNumber,
  });

  /**
   * Property minWidth
   *
   * @description
   * Lower bound of the resize in px.
   *
   * @type {InputSignalWithTransform<number | undefined, unknown>}
   * @readonly
   */
  public readonly minWidth: InputSignalWithTransform<number | undefined, unknown> = input(
    undefined,
    { transform: optionalNumber },
  );

  /**
   * Property maxWidth
   *
   * @description
   * Upper bound of the resize in px.
   *
   * @type {InputSignalWithTransform<number | undefined, unknown>}
   * @readonly
   */
  public readonly maxWidth: InputSignalWithTransform<number | undefined, unknown> = input(
    undefined,
    { transform: optionalNumber },
  );

  /**
   * Property align
   *
   * @description
   * `end` for numbers.
   *
   * @type {InputSignal<CwColumnAlign | undefined>}
   * @readonly
   */
  public readonly align: InputSignal<CwColumnAlign | undefined> = input<CwColumnAlign | undefined>(
    undefined,
  );

  /**
   * Property sortable
   *
   * @description
   * Whether the header sorts.
   *
   * @type {InputSignalWithTransform<boolean | undefined, unknown>}
   * @readonly
   */
  public readonly sortable: InputSignalWithTransform<boolean | undefined, unknown> = input(
    undefined,
    { transform: optionalBoolean },
  );

  /**
   * Property resizable
   *
   * @description
   * Whether the column has a resize handle.
   *
   * @type {InputSignalWithTransform<boolean | undefined, unknown>}
   * @readonly
   */
  public readonly resizable: InputSignalWithTransform<boolean | undefined, unknown> = input(
    undefined,
    { transform: optionalBoolean },
  );

  /**
   * Property hideable
   *
   * @description
   * Whether `columnVisibility` may hide it.
   *
   * @type {InputSignalWithTransform<boolean | undefined, unknown>}
   * @readonly
   */
  public readonly hideable: InputSignalWithTransform<boolean | undefined, unknown> = input(
    undefined,
    { transform: optionalBoolean },
  );

  /**
   * Property editable
   *
   * @description
   * Whether its editor opens.
   *
   * @type {InputSignalWithTransform<boolean | undefined, unknown>}
   * @readonly
   */
  public readonly editable: InputSignalWithTransform<boolean | undefined, unknown> = input(
    undefined,
    { transform: optionalBoolean },
  );

  /**
   * Property value
   *
   * @description
   * Value accessor of the cell, for the default rendering, the sort and the editor.
   *
   * @type {InputSignal<((row: never) => unknown) | undefined>}
   * @readonly
   */
  public readonly value: InputSignal<((row: never) => unknown) | undefined> = input<
    ((row: never) => unknown) | undefined
  >(undefined);

  /**
   * Property cell
   *
   * @description
   * The cell template, when given.
   *
   * @type {Signal<CwCellDef<unknown> | undefined>}
   * @readonly
   */
  public readonly cell: Signal<CwCellDef<unknown> | undefined> = contentChild(CwCellDef);

  /**
   * Property editor
   *
   * @description
   * The editor template, when given.
   *
   * @type {Signal<CwCellEditorDef<unknown> | undefined>}
   * @readonly
   */
  public readonly editor: Signal<CwCellEditorDef<unknown> | undefined> =
    contentChild(CwCellEditorDef);

  /**
   * Property definition
   *
   * @description
   * The fields this element sets, as a partial column definition.
   *
   * @type {Signal<Partial<CwColumnDef<unknown>> & { key: string; }>}
   * @readonly
   */
  public readonly definition: Signal<Partial<CwColumnDef<unknown>> & { key: string }> = computed<
    Partial<CwColumnDef<unknown>> & { key: string }
  >(() => {
    const fields: Record<string, unknown> = {
      key: this.key(),
      header: this.header(),
      headerHidden: this.headerHidden(),
      width: this.width(),
      minWidth: this.minWidth(),
      maxWidth: this.maxWidth(),
      align: this.align(),
      sortable: this.sortable(),
      resizable: this.resizable(),
      hideable: this.hideable(),
      editable: this.editable(),
      value: this.value(),
    };
    return Object.fromEntries(
      Object.entries(fields).filter(([, value]: [string, unknown]) => value !== undefined),
    ) as Partial<CwColumnDef<unknown>> & { key: string };
  });
  // #endregion
}
