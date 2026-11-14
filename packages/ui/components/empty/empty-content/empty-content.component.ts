import { Component } from '@angular/core';

/**
 * Class CwEmptyContent
 * @class CwEmptyContent
 *
 * @description
 * Groups the empty state's centered, wrapping actions; the composition has at most one main action.
 */
@Component({
  selector: 'cw-empty-content',
  host: { class: 'flex flex-wrap justify-center gap-2' },
  templateUrl: './empty-content.component.html',
})
export class CwEmptyContent {}
