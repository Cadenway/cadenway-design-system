import { Component, computed, inject } from '@angular/core';

import { CwAccordionItem } from '../accordion-item/accordion-item.component';
import type { CwAccordionVariant } from '../accordion.types';

/* Accordion sheet, "Mouvement": grid rows from 0fr to 1fr with a fade, 300 ms `ease-snap`, instant
   under reduced motion. The state is read on the content itself, so a nested block never reads an
   ancestor's state. */
const CONTENT =
  'grid transition-[grid-template-rows,opacity] duration-300 ease-snap motion-reduce:transition-none ' +
  'data-[state=closed]:grid-rows-[0fr] data-[state=closed]:opacity-0 data-[state=open]:grid-rows-[1fr]';

// The text lines up with the trigger's title.
const REGIONS: Record<CwAccordionVariant, string> = {
  default: 'px-2 pt-0.5 pb-3 text-sm',
  card: 'px-3 pt-0.5 pb-3 text-sm',
};

/**
 * The folding content of a `cw-accordion-item` (Accordion sheet of the Design System artifact).
 *
 * Renders a `role="region"` named by its trigger (`aria-labelledby`) and referenced by the
 * trigger's `aria-controls`. Closed, it is `inert` and its rows shrink to zero; its content stays
 * rendered.
 */
@Component({
  selector: 'cw-accordion-content',
  host: {
    class: CONTENT,
    '[attr.data-state]': 'item.state()',
    '[attr.inert]': 'item.expanded() ? null : ""',
  },
  templateUrl: './accordion-content.component.html',
})
export class CwAccordionContent {
  protected readonly item = inject(CwAccordionItem);
  protected readonly regionClasses = computed(() => REGIONS[this.item.accordion.variant()]);
}
