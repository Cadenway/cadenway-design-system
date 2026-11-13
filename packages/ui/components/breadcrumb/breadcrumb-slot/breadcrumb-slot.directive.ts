import { Directive, ElementRef, effect, inject, input } from '@angular/core';

/**
 * Moves a level of the trail into the list item that carries it. The trail projects nothing: its
 * levels (`a[cwBreadcrumbLink]`, `span[cwBreadcrumbPage]`) are written flat by the consumer, as
 * the Breadcrumb sheet's example shows, and an `ol` may only hold `li` children. Angular keeps
 * owning the moved element: it updates it and removes it wherever it sits. Not exported from the
 * entry point.
 */
@Directive({
  selector: '[cwBreadcrumbSlot]',
})
export class CwBreadcrumbSlot {
  /** The level's element to hold. */
  readonly cwBreadcrumbSlot = input.required<HTMLElement>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  constructor() {
    effect(() => {
      const element = this.cwBreadcrumbSlot();
      if (element.parentNode !== this.host) this.host.appendChild(element);
    });
  }
}
