import { Component, computed, inject, type Signal } from '@angular/core';

import { CwAccordionItem } from '../accordion-item/accordion-item.component';
import type { CwAccordionVariant } from '../accordion.types';

/**
 * Constant CONTENT
 *
 * @description
 * Grid and fade classes for the Accordion sheet's 300 ms transition. The content uses its own state
 * so nested blocks do not inherit an ancestor's state.
 *
 * @type {string}
 */
const CONTENT: string =
  'grid transition-[grid-template-rows,opacity] duration-300 ease-snap motion-reduce:transition-none ' +
  'data-[state=closed]:grid-rows-[0fr] data-[state=closed]:opacity-0 data-[state=open]:grid-rows-[1fr]';

/**
 * Constant REGIONS
 *
 * @description
 * Region spacing for each variant, aligning content text with the trigger title.
 *
 * @type {Record<CwAccordionVariant, string>}
 */
const REGIONS: Record<CwAccordionVariant, string> = {
  default: 'px-2 pt-0.5 pb-3 text-sm',
  card: 'px-3 pt-0.5 pb-3 text-sm',
};

/**
 * Class CwAccordionContent
 * @class CwAccordionContent
 *
 * @description
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
  // #region Properties
  /**
   * Property item
   * @readonly
   *
   * @description
   * Parent section providing expansion state and accessible identifiers.
   *
   * @type {CwAccordionItem}
   */
  protected readonly item: CwAccordionItem = inject(CwAccordionItem);

  /**
   * Property regionClasses
   * @readonly
   *
   * @description
   * Content spacing classes for the parent accordion's variant.
   *
   * @type {Signal<string>}
   */
  protected readonly regionClasses: Signal<string> = computed(
    () => REGIONS[this.item.accordion.variant()],
  );
  // #endregion
}
