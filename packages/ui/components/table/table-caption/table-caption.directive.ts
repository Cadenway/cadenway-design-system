import { Directive } from '@angular/core';

/**
 * Class CwTableCaption
 * @class CwTableCaption
 *
 * @description
 * Styles the native caption below the table to describe its contents and period.
 */
@Directive({
  selector: 'caption[cwTableCaption]',
  host: { class: 'mt-3 text-left text-xs text-muted-foreground' },
})
export class CwTableCaption {}
