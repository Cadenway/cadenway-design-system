import { Component } from '@angular/core';

import { EMPTY } from '../combobox.styles';

/**
 * The message a `cw-combobox` shows when its search matches nothing (« Aucune personne trouvée »),
 * in place of its `emptyText` (Combobox sheet of the Design System artifact).
 *
 * Put it directly inside `cw-combobox`; the combobox shows it only while no option matches.
 */
@Component({
  selector: 'cw-combobox-empty',
  host: { class: EMPTY },
  templateUrl: './combobox-empty.component.html',
})
export class CwComboboxEmpty {}
