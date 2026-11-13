import { _IdGenerator } from '@angular/cdk/a11y';
import { Component, booleanAttribute, computed, inject, input } from '@angular/core';

import { CwAccordion } from '../accordion.component';
import type { CwAccordionState } from '../accordion.types';

/**
 * One section of a `cw-accordion`: a trigger in a heading, then its content (Accordion sheet of the
 * Design System artifact).
 *
 * `value` (required) identifies it in the accordion's `[(value)]`. `disabled` dims the trigger,
 * which cannot be focused nor opened (« Automatisations » without the rights). It wraps the
 * projected `button[cwAccordionTrigger]` in an `h3`. Carries `data-state="open|closed"` and
 * `data-disabled`.
 */
@Component({
  selector: 'cw-accordion-item',
  host: {
    class: 'block border-b last:border-b-0',
    '[attr.data-state]': 'state()',
    '[attr.data-disabled]': 'disabled() ? "" : null',
  },
  templateUrl: './accordion-item.component.html',
})
export class CwAccordionItem {
  /** Identifier of the section in the accordion's value. */
  readonly value = input.required<string>();
  /** Dims the section; its trigger is disabled. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** The accordion the section belongs to. */
  readonly accordion = inject(CwAccordion);
  private readonly ids = inject(_IdGenerator);
  /** Id of the trigger, which names the content region. */
  readonly triggerId = this.ids.getId('cw-accordion-trigger-');
  /** Id of the content region, referenced by the trigger's `aria-controls`. */
  readonly contentId = this.ids.getId('cw-accordion-content-');

  /** Whether the section is open. */
  readonly expanded = computed(() => this.accordion.isOpen(this.value()));
  /** `open` or `closed`, for the `data-state` hook of every part. */
  readonly state = computed<CwAccordionState>(() => (this.expanded() ? 'open' : 'closed'));

  /** Opens or closes the section, unless it is disabled. */
  toggle(): void {
    if (!this.disabled()) this.accordion.toggle(this.value());
  }
}
