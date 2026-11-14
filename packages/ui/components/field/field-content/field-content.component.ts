import { Component } from '@angular/core';

/**
 * Component CwFieldContent
 *
 * @description
 * The label + description column of a horizontal field, next to its switch or checkbox.
 */
@Component({
  selector: 'cw-field-content',
  host: { class: 'flex min-w-0 flex-1 flex-col gap-1' },
  templateUrl: './field-content.component.html',
})
export class CwFieldContent {}
