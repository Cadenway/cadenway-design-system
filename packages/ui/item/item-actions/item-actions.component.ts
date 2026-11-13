import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * The trailing part of an item: one visible action at most (an `outline` `sm` button, a `ghost`
 * icon button named by `aria-label`) or a time. Reveal an action on hover with `group-hover/item:`.
 */
@Component({
  selector: 'cw-item-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex shrink-0 items-center gap-2' },
  templateUrl: './item-actions.component.html',
})
export class CwItemActions {}
