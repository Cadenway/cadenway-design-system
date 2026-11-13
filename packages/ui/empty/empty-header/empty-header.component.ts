import { Component } from '@angular/core';

/** The text block of an empty state: media, title and description, centered, `max-w-sm`. */
@Component({
  selector: 'cw-empty-header',
  host: { class: 'flex max-w-sm flex-col items-center gap-2' },
  templateUrl: './empty-header.component.html',
})
export class CwEmptyHeader {}
