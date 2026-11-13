import { ChangeDetectionStrategy, Component } from '@angular/core';

import { EMPTY } from '../select.styles';

/**
 * The message a `cw-select` shows when it has no option (« Aucun sprint planifié. »), in place of
 * its `emptyText` (Select sheet of the Design System artifact).
 *
 * Put it directly inside `cw-select`; the select shows it only while it holds no option.
 */
@Component({
  selector: 'cw-select-empty',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: EMPTY },
  templateUrl: './select-empty.component.html',
})
export class CwSelectEmpty {}
