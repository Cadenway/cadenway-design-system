import { Directive, ElementRef, HostAttributeToken, computed, inject, input } from '@angular/core';
import { ɵFOCUS_INSET } from '@cadenway/ui/core';

import { CwCollapsible } from '../collapsible.component';
import type { CwCollapsibleTriggerVariant } from '../collapsible.types';

/* Group row of the List view (Collapsible sheet, "Anatomie" 2): a full-width 36 px row, inset focus
   ring like every row. `aria-disabled` rather than `disabled`: the trigger often shares its element
   with `cwButton`, which owns the native `disabled` attribute. Literal strings, so Tailwind finds
   them in the compiled package. */
const VARIANTS: Record<CwCollapsibleTriggerVariant, string> = {
  bare: '',
  row:
    'relative isolate flex h-9 w-full items-center gap-2 overflow-hidden rounded-md px-2 text-left text-sm font-medium transition-colors hover:bg-accent ' +
    'aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_ng-icon]:shrink-0 [&_ng-icon]:[--ng-icon__size:1rem] ' +
    ɵFOCUS_INSET,
};

/**
 * Opens and closes the `cw-collapsible` it sits in (Collapsible sheet of the Design System
 * artifact): on click, Enter and Space, since it goes on a native `<button>`.
 *
 * `bare` (default) adds no style: combine it with `cwButton` (`ghost` `icon-sm` for a block header,
 * `ghost` `sm` for « Afficher N de plus »). `row` draws the 36 px group row of the List view. Add a
 * `cw-collapsible-chevron` inside for the arrow. It carries `aria-expanded`, `aria-controls` (the
 * content) and `data-state`; on a disabled block it is `aria-disabled` and ignores clicks. An
 * icon-only trigger needs an `aria-label` (« Replier les sous-tâches »).
 */
@Directive({
  selector: '[cwCollapsibleTrigger]',
  host: {
    '[class]': 'classes()',
    '[attr.type]': 'isButton ? (declaredType ?? "button") : null',
    '[attr.aria-expanded]': 'collapsible.expanded()',
    '[attr.aria-controls]': 'collapsible.contentId',
    '[attr.aria-disabled]': 'collapsible.disabled() ? "true" : null',
    '[attr.data-state]': 'collapsible.state()',
    '[attr.data-disabled]': 'collapsible.disabled() ? "" : null',
    '[attr.data-variant]': 'variant()',
    '(click)': 'collapsible.toggle()',
  },
})
export class CwCollapsibleTrigger {
  /** Look of the trigger: none of its own (`bare`, on a `cwButton`), or the group row. */
  readonly variant = input<CwCollapsibleTriggerVariant>('bare');

  protected readonly collapsible = inject(CwCollapsible);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected readonly isButton = this.element.tagName === 'BUTTON';
  protected readonly declaredType = inject(new HostAttributeToken('type'), { optional: true });

  protected readonly classes = computed(() => VARIANTS[this.variant()]);

  constructor() {
    // Capture phase: a disabled block swallows the click before the consumer's own (click).
    this.element.addEventListener(
      'click',
      (event) => {
        if (this.collapsible.disabled()) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      },
      { capture: true },
    );
  }
}
