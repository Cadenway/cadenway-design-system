import { Component } from '@angular/core';

/**
 * The action of a card header, on the right of the title and description: one `outline` `sm`
 * button (« Inviter »).
 */
@Component({
  selector: 'cw-card-action',
  host: { class: 'col-start-2 row-span-2 row-start-1 flex self-start' },
  templateUrl: './card-action.component.html',
})
export class CwCardAction {}
