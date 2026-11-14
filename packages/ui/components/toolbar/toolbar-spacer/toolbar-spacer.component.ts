import { Component } from '@angular/core';

/**
 * Class CwToolbarSpacer
 * @class CwToolbarSpacer
 *
 * @description
 * The flexible gap of a `cw-toolbar` that pushes what follows to the right: the search field and
 * the primary action (Toolbar sheet of the Design System artifact). It shrinks to nothing first
 * when the width runs short.
 */
@Component({
  selector: 'cw-toolbar-spacer',
  host: { class: 'block flex-1', 'aria-hidden': 'true' },
  templateUrl: './toolbar-spacer.component.html',
})
export class CwToolbarSpacer {}
