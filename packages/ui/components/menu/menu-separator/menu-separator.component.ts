import { Component } from '@angular/core';

/**
 * Component CwMenuSeparator
 *
 * @description
 * A 1 px rule between the groups of a `cw-menu`, edge to edge; the destructive item sits after one (DropdownMenu sheet of the Design System artifact). Renders `role="separator"`, 9 px high.
 */
@Component({
  selector: 'cw-menu-separator',
  host: {
    role: 'separator',
    class: '-mx-1 my-1 block h-px bg-border',
  },
  templateUrl: './menu-separator.component.html',
})
export class CwMenuSeparator {}
