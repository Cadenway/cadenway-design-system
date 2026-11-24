import { Component } from '@angular/core';
import { ɵFOCUS_INSET } from '@cadenway/ui/core';

/**
 * Constant BODY
 *
 * @description
 * Sheet sheet, anatomy 4: the part that scrolls between the header and the footer, with the thin
 * track scrollbar; it is a tab stop so the keyboard can scroll it.
 *
 * @type {string}
 */
const BODY: string = `block min-h-0 flex-1 overflow-y-auto px-4 py-4 [scrollbar-color:var(--color-track)_transparent] [scrollbar-width:thin] ${ɵFOCUS_INSET}`;

/**
 * Component CwSheetBody
 *
 * @description
 * The scrolling content of a `cw-sheet` (properties, description, a list); the header and the
 * footer stay in place around it.
 */
@Component({
  selector: 'cw-sheet-body',
  host: { class: BODY, tabindex: '0' },
  templateUrl: './sheet-body.component.html',
})
export class CwSheetBody {}
