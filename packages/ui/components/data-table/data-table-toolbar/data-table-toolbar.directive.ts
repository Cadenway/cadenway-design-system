import { Directive } from '@angular/core';

/**
 * Directive CwDataTableToolbar
 *
 * @description
 * Marks the content projected above the grid: the view's toolbar and filter bar (DataTable sheets, "Barre d'outils"). The table only places it; its controls stay 32 px and the consumer's.
 */
@Directive({
  selector: '[cwDataTableToolbar]',
  host: { 'data-slot': 'data-table-toolbar' },
})
export class CwDataTableToolbar {}
