import {
  booleanAttribute,
  Component,
  computed,
  contentChild,
  input,
  numberAttribute,
} from '@angular/core';

import { CwCellDef } from '../cell/cell.directive';
import { CwCellEditorDef } from '../cell-editor/cell-editor.directive';
import type { CwColumnAlign, CwColumnDef } from '../data-table.types';

function optionalNumber(value: unknown): number | undefined {
  return value === undefined || value === null || value === '' ? undefined : numberAttribute(value);
}

function optionalBoolean(value: unknown): boolean | undefined {
  return value === undefined || value === null ? undefined : booleanAttribute(value);
}

/**
 * Declares a column of `cw-data-table` in the template, with its cell rendering
 * (`ng-template[cwCell]`) and its editor (`ng-template[cwCellEditor]`) (DataTable sheet of the Design
 * System artifact). It renders nothing itself.
 *
 * Its inputs are those of `CwColumnDef`; when the table also receives a `columns` array, a child
 * column with the same `key` only brings its templates and overrides the fields it sets.
 */
@Component({
  selector: 'cw-data-table-column',
  host: { hidden: '' },
  templateUrl: './data-table-column.component.html',
})
export class CwDataTableColumn {
  /** Identity of the column. */
  readonly key = input.required<string>();
  /** Header label. */
  readonly header = input<string | undefined>(undefined);
  /** Keeps the header label for assistive technologies only. */
  readonly headerHidden = input(undefined, { transform: optionalBoolean });
  /** Initial width in px. */
  readonly width = input(undefined, { transform: optionalNumber });
  /** Lower bound of the resize in px. */
  readonly minWidth = input(undefined, { transform: optionalNumber });
  /** Upper bound of the resize in px. */
  readonly maxWidth = input(undefined, { transform: optionalNumber });
  /** `end` for numbers. */
  readonly align = input<CwColumnAlign | undefined>(undefined);
  /** Whether the header sorts. */
  readonly sortable = input(undefined, { transform: optionalBoolean });
  /** Whether the column has a resize handle. */
  readonly resizable = input(undefined, { transform: optionalBoolean });
  /** Whether `columnVisibility` may hide it. */
  readonly hideable = input(undefined, { transform: optionalBoolean });
  /** Whether its editor opens. */
  readonly editable = input(undefined, { transform: optionalBoolean });
  /** Value accessor of the cell, for the default rendering, the sort and the editor. */
  readonly value = input<((row: never) => unknown) | undefined>(undefined);

  /** The cell template, when given. */
  readonly cell = contentChild(CwCellDef);
  /** The editor template, when given. */
  readonly editor = contentChild(CwCellEditorDef);

  /** The fields this element sets, as a partial column definition. */
  readonly definition = computed<Partial<CwColumnDef<unknown>> & { key: string }>(() => {
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
      Object.entries(fields).filter(([, value]) => value !== undefined),
    ) as Partial<CwColumnDef<unknown>> & { key: string };
  });
}
