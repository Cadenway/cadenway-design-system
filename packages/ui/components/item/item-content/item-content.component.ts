import { Component } from '@angular/core';

/**
 * Component CwItemContent
 *
 * @description
 * The text column of an item: title and description, shrinking before the actions.
 */
@Component({
  selector: 'cw-item-content',
  host: { class: 'flex min-w-0 flex-1 flex-col gap-0.5' },
  templateUrl: './item-content.component.html',
})
export class CwItemContent {}
