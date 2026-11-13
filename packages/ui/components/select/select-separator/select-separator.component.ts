import { Component } from '@angular/core';

/**
 * A 1 px line between two groups of a `cw-select`, edge to edge of the panel (Select sheet of the
 * Design System artifact).
 *
 * Decorative (`aria-hidden`): a listbox owns options and groups only, and the groups already carry
 * the structure.
 */
@Component({
  selector: 'cw-select-separator',
  host: { class: '-mx-1 my-1 block h-px bg-border', 'aria-hidden': 'true' },
  templateUrl: './select-separator.component.html',
})
export class CwSelectSeparator {}
