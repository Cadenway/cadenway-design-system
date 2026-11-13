import { Directive } from '@angular/core';

/**
 * The empty state of a table: one cell spanning the columns (set `colspan`), 64 px high, centered
 * muted text (« Aucune saisie de temps cette semaine. »).
 */
@Directive({
  selector: 'td[cwTableEmpty]',
  host: { class: 'h-16 px-3 text-center align-middle text-sm text-muted-foreground' },
})
export class CwTableEmpty {}
