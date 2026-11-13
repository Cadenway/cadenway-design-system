import { Component, computed, inject, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCaretDownBold, phosphorCaretRightBold } from '@ng-icons/phosphor-icons/bold';

import { CwCollapsible } from '../collapsible.component';
import type { CwCollapsibleChevronDirection } from '../collapsible.types';

/* Collapsible sheet, "Variantes" and "Mouvement": `caret-down` turns 180° (block header, « Afficher
   plus »), `caret-right` 90° (group row), in the same 300 ms as the content. */
const ICONS: Record<CwCollapsibleChevronDirection, string> = {
  down: 'phosphorCaretDownBold',
  right: 'phosphorCaretRightBold',
};

const BASE =
  'inline-flex shrink-0 transition-transform duration-300 ease-snap motion-reduce:transition-none';

const DIRECTIONS: Record<CwCollapsibleChevronDirection, string> = {
  down: '[--ng-icon__size:1rem] data-[state=open]:rotate-180',
  right: 'text-muted-foreground [--ng-icon__size:0.875rem] data-[state=open]:rotate-90',
};

/**
 * The arrow of a collapsible trigger, which turns with the state of its `cw-collapsible`
 * (Collapsible sheet of the Design System artifact).
 *
 * `down` (default) points down and turns 180° when open; `right` points right and turns 90°, the
 * group row's chevron, placed before the row's label. Decorative: `aria-hidden`, the trigger's
 * `aria-expanded` carries the state.
 */
@Component({
  selector: 'cw-collapsible-chevron',
  imports: [NgIcon],
  providers: [provideIcons({ phosphorCaretDownBold, phosphorCaretRightBold })],
  host: {
    'aria-hidden': 'true',
    '[class]': 'classes()',
    '[attr.data-state]': 'collapsible.state()',
  },
  templateUrl: './collapsible-chevron.component.html',
})
export class CwCollapsibleChevron {
  /** Which way the arrow points while closed. */
  readonly direction = input<CwCollapsibleChevronDirection>('down');

  protected readonly collapsible = inject(CwCollapsible);
  protected readonly icon = computed(() => ICONS[this.direction()]);
  protected readonly classes = computed(() => `${BASE} ${DIRECTIONS[this.direction()]}`);
}
