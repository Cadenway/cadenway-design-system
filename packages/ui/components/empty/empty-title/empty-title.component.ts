import { Component } from '@angular/core';

/**
 * Class CwEmptyTitle
 * @class CwEmptyTitle
 *
 * @description
 * Names what is missing in an empty state, such as tasks in a list.
 */
@Component({
  selector: 'cw-empty-title',
  host: { class: 'block text-sm font-medium' },
  templateUrl: './empty-title.component.html',
})
export class CwEmptyTitle {}
