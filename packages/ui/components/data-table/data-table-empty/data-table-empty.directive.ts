import { Directive } from '@angular/core';

/**
 * Directive CwDataTableEmpty
 *
 * @description
 * Marks the content of the empty state, projected in the body of the grid when there is no row and nothing loads (DataTable sheets, "Vide" and "Sans résultat de filtre"): usually a `cw-empty` `size="sm"` with its way out (« Effacer les filtres »). Without it the table shows `emptyText`.
 */
@Directive({
  selector: '[cwDataTableEmpty]',
  host: { 'data-slot': 'data-table-empty' },
})
export class CwDataTableEmpty {}
