import { Component } from '@angular/core';

/**
 * Component CwItemActions
 *
 * @description
 * The trailing part of an item: one visible action at most (an `outline` `sm` button, a `ghost`
 * icon button named by `aria-label`) or a time. Reveal an action on hover with `group-hover/item:`.
 */
@Component({
  selector: 'cw-item-actions',
  host: { class: 'flex shrink-0 items-center gap-2' },
  templateUrl: './item-actions.component.html',
})
export class CwItemActions {}
