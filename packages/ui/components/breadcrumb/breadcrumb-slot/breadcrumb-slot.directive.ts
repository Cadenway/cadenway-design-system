import { Directive, ElementRef, effect, inject, input, type InputSignal } from '@angular/core';

/**
 * Class CwBreadcrumbSlot
 * @class CwBreadcrumbSlot
 *
 * @description
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
  // #region Properties
  /**
   * Property cwBreadcrumbSlot
   * @readonly
   *
   * @description
   * Required projected level element to move into the list item.
   *
   * @type {InputSignal<HTMLElement>}
   */
  public readonly cwBreadcrumbSlot: InputSignal<HTMLElement> = input.required<HTMLElement>();

  /**
   * Property host
   * @readonly
   *
   * @description
   * List item receiving the projected level element.
   *
   * @type {HTMLElement}
   */
  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Observes the level input and moves its element into the host when necessary.
   */
  public constructor() {
    effect(() => {
      const element: HTMLElement = this.cwBreadcrumbSlot();
      if (element.parentNode !== this.host) this.host.appendChild(element);
    });
  }
  // #endregion
}
