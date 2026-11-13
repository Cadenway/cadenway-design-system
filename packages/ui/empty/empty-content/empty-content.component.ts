import { Component } from '@angular/core';

/** The actions of an empty state, centered and wrapping: one main action at most. */
@Component({
  selector: 'cw-empty-content',
  host: { class: 'flex flex-wrap justify-center gap-2' },
  templateUrl: './empty-content.component.html',
})
export class CwEmptyContent {}
