import type { FocusableOption } from '@angular/cdk/a11y';
import { Component, ElementRef, computed, forwardRef, inject, type Signal } from '@angular/core';
import { CwRipple, ɵFOCUS_INSET } from '@cadenway/ui/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCaretDownBold } from '@ng-icons/phosphor-icons/bold';

import { CwAccordionItem } from '../accordion-item/accordion-item.component';
import { ACCORDION_TRIGGER } from '../accordion-trigger.token';
import type { CwAccordion } from '../accordion.component';
import type { CwAccordionVariant } from '../accordion.types';

/**
 * Constant BASE
 *
 * @description
 * Literal Accordion sheet classes for a 40-pixel trigger row, inset focus ring and leading icon.
 *
 * @type {string}
 */
const BASE: string =
  'relative isolate flex w-full flex-1 items-center gap-2 overflow-hidden py-2.5 text-left text-sm font-medium transition-colors hover:bg-accent ' +
  'disabled:pointer-events-none disabled:opacity-50 [&_ng-icon]:shrink-0 [&_ng-icon]:[--ng-icon__size:1rem] [&>ng-icon]:text-muted-foreground ' +
  ɵFOCUS_INSET;

/**
 * Constant VARIANTS
 *
 * @description
 * Trigger padding and radius by accordion variant; card triggers span the framed card.
 *
 * @type {Record<CwAccordionVariant, string>}
 */
const VARIANTS: Record<CwAccordionVariant, string> = {
  default: 'rounded-md px-2',
  card: 'rounded-none px-3',
};

/**
 * Class CwAccordionTrigger
 * @class CwAccordionTrigger
 *
 * @description
 * The button that opens and closes a `cw-accordion-item` (Accordion sheet of the Design System
 * artifact): title, optional leading icon and count, chevron pushed to the right.
 *
 * Put it on a native `<button>` inside the section; the section wraps it in an `h3`. Click, Enter
 * and Space toggle the section; ↓ ↑ Home End move between the triggers (`cw-accordion`). It carries
 * `aria-expanded`, `aria-controls`, `data-state` and the press ripple; a disabled section disables
 * it. A count reads with the title (« Pièces jointes 3 »); the chevron is `aria-hidden`.
 */
@Component({
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
  // #region Properties
  /**
   * Property item
   * @readonly
   *
   * @description
   * Parent section supplying its state, identifiers and toggle action.
   *
   * @type {CwAccordionItem}
   */
  protected readonly item: CwAccordionItem = inject(CwAccordionItem);

  /**
   * Property accordion
   * @readonly
   *
   * @description
   * Parent accordion used to scope arrow-key navigation and select the variant.
   *
   * @type {CwAccordion}
   */
  public readonly accordion: CwAccordion = this.item.accordion;

  /**
   * Property element
   * @readonly
   *
   * @description
   * Native host button focused by the accordion's keyboard manager.
   *
   * @type {HTMLButtonElement}
   */
  public readonly element: HTMLButtonElement =
    inject<ElementRef<HTMLButtonElement>>(ElementRef).nativeElement;

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Base and variant classes applied to the trigger button.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(
    () => `${BASE} ${VARIANTS[this.accordion.variant()]}`,
  );

  /**
   * Property disabled
   *
   * @description
   * Whether the focus manager should skip the trigger because its section is disabled.
   *
   * @type {boolean}
   * @returns {boolean} Whether the section is disabled.
   */
  public get disabled(): boolean {
    return this.item.disabled();
  }
  // #endregion

  // #region Methods
  /**
   * Method focus
   * @method focus
   *
   * @description
   * Moves focus to the host button when requested by the keyboard manager.
   */
  public focus(): void {
    this.element.focus();
  }
  // #endregion
}
