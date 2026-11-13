import { Component } from '@angular/core';

/** Stacks the fields of a set 20 px apart; a `cw-field-separator` splits two sub-groups. */
@Component({
  selector: 'cw-field-group',
  host: { class: 'flex w-full flex-col gap-5' },
  templateUrl: './field-group.component.html',
})
export class CwFieldGroup {}
