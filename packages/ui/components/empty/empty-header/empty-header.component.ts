import { Component } from '@angular/core';

/**
 * Class CwEmptyHeader
 * @class CwEmptyHeader
 *
 * @description
 * Centers and bounds the empty state's media, title and description.
 */
@Component({
  selector: 'cw-empty-header',
  host: { class: 'flex max-w-sm flex-col items-center gap-2' },
  templateUrl: './empty-header.component.html',
})
export class CwEmptyHeader {}
