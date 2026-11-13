import type { FocusableOption } from '@angular/cdk/a11y';
import { Component, ElementRef, computed, forwardRef, inject } from '@angular/core';
import { CwRipple, ɵFOCUS_INSET } from '@cadenway/ui/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCaretDownBold } from '@ng-icons/phosphor-icons/bold';

import { CwAccordionItem } from '../accordion-item/accordion-item.component';
import { ACCORDION_TRIGGER } from '../accordion-trigger.token';
import type { CwAccordion } from '../accordion.component';
import type { CwAccordionVariant } from '../accordion.types';

/* Literal class strings (Accordion sheet and preview of the Design System artifact): a 40 px row,
   inset focus ring like every row; a leading icon is muted, 16 px. */
const BASE =
  'relative isolate flex w-full flex-1 items-center gap-2 overflow-hidden py-2.5 text-left text-sm font-medium transition-colors hover:bg-accent ' +
  'disabled:pointer-events-none disabled:opacity-50 [&_ng-icon]:shrink-0 [&_ng-icon]:[--ng-icon__size:1rem] [&>ng-icon]:text-muted-foreground ' +
  ɵFOCUS_INSET;

// `card` triggers span the framed card edge to edge.
const VARIANTS: Record<CwAccordionVariant, string> = {
  default: 'rounded-md px-2',
  card: 'rounded-none px-3',
};

/**
 * The button that opens and closes a `cw-accordion-item` (Accordion sheet of the Design System
 * artifact): title, optional leading icon and count, chevron pushed to the right.
 *
 * Put it on a native `<button>` inside the section; the section wraps it in an `h3`. Click, Enter
 * and Space toggle the section; ↓ ↑ Home End move between the triggers (`cw-accordion`). It carries
 * `aria-expanded`, `aria-controls`, `data-state` and the press ripple; a disabled section disables
 * it. A count reads with the title (« Pièces jointes 3 »); the chevron is `aria-hidden`.
 */
@Component({
  // A component on a native element (attribute selector), as its sheet requires: the button keeps
  // its native role, focus and activation. The lint rule only knows element selectors.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[cwAccordionTrigger]',
  imports: [NgIcon],
  hostDirectives: [CwRipple],
  providers: [
    provideIcons({ phosphorCaretDownBold }),
    { provide: ACCORDION_TRIGGER, useExisting: forwardRef(() => CwAccordionTrigger) },
  ],
  host: {
    type: 'button',
    '[class]': 'classes()',
    '[id]': 'item.triggerId',
    '[disabled]': 'item.disabled()',
    '[attr.aria-expanded]': 'item.expanded()',
    '[attr.aria-controls]': 'item.contentId',
    '[attr.data-state]': 'item.state()',
    '[attr.data-disabled]': 'item.disabled() ? "" : null',
    '(click)': 'item.toggle()',
  },
  templateUrl: './accordion-trigger.component.html',
})
export class CwAccordionTrigger implements FocusableOption {
  protected readonly item = inject(CwAccordionItem);
  /** The accordion the trigger belongs to, for its arrow keys. */
  readonly accordion: CwAccordion = this.item.accordion;
  /** The host button, focused by the arrow keys. */
  readonly element = inject<ElementRef<HTMLButtonElement>>(ElementRef).nativeElement;

  protected readonly classes = computed(() => `${BASE} ${VARIANTS[this.accordion.variant()]}`);

  /** Whether the arrow keys skip the trigger (its section is disabled). */
  get disabled(): boolean {
    return this.item.disabled();
  }

  /** Moves the focus to the trigger (the arrow keys call it). */
  focus(): void {
    this.element.focus();
  }
}
