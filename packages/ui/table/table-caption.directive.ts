import { Directive } from '@angular/core';

/** The caption under the table: what it holds and its period. */
@Directive({
  selector: 'caption[cwTableCaption]',
  host: { class: 'mt-3 text-left text-xs text-muted-foreground' },
})
export class CwTableCaption {}
