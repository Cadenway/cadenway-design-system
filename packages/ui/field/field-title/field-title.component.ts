import { Component } from '@angular/core';

/** The title of a field that is not a label, in a `cw-field-content` or a choice card. */
@Component({
  selector: 'cw-field-title',
  host: { class: 'flex items-center gap-2 text-sm leading-5 font-medium' },
  templateUrl: './field-title.component.html',
})
export class CwFieldTitle {}
