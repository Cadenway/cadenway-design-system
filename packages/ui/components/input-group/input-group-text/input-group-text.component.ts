import { Component } from '@angular/core';

/**
 * A text complement in an addon: prefix (`https://`), suffix, unit (« heures »), counter. A field
 * after a start text prefix sits 2 px from it.
 */
@Component({
  selector: 'cw-input-group-text',
  host: {
    class: 'flex items-center gap-1.5 text-muted-foreground [&_ng-icon]:[--ng-icon__size:1rem]',
  },
  templateUrl: './input-group-text.component.html',
})
export class CwInputGroupText {}
