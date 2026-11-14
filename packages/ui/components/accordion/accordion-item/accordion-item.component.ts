import { _IdGenerator } from '@angular/cdk/a11y';
import {
  Component,
  booleanAttribute,
  computed,
  inject,
  input,
  type InputSignal,
  type InputSignalWithTransform,
  type Signal,
} from '@angular/core';

import { CwAccordion } from '../accordion.component';
import type { CwAccordionState } from '../accordion.types';

/**
 * Class CwAccordionItem
 * @class CwAccordionItem
 *
 * @description
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
  // #region Properties
  /**
   * Property value
   * @readonly
   *
   * @description
   * Required identifier of this section in the parent accordion's open-value model.
   *
   * @type {InputSignal<string>}
   */
  public readonly value: InputSignal<string> = input.required<string>();

  /**
   * Property disabled
   * @readonly
   *
   * @description
   * Input disabling the section's trigger and preventing it from toggling.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @default false
   */
  public readonly disabled: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property accordion
   * @readonly
   *
   * @description
   * Parent accordion controlling this section's open value and navigation.
   *
   * @type {CwAccordion}
   */
  public readonly accordion: CwAccordion = inject(CwAccordion);

  /**
   * Property ids
   * @readonly
   *
   * @description
   * Generator used to give the trigger and content region distinct identifiers.
   *
   * @type {_IdGenerator}
   */
  private readonly ids: _IdGenerator = inject(_IdGenerator);

  /**
   * Property triggerId
   * @readonly
   *
   * @description
   * Identifier of the trigger that names the content region.
   *
   * @type {string}
   */
  public readonly triggerId: string = this.ids.getId('cw-accordion-trigger-');

  /**
   * Property contentId
   * @readonly
   *
   * @description
   * Identifier of the content region referenced by the trigger's `aria-controls`.
   *
   * @type {string}
   */
  public readonly contentId: string = this.ids.getId('cw-accordion-content-');

  /**
   * Property expanded
   * @readonly
   *
   * @description
   * Whether the parent accordion currently considers this section open.
   *
   * @type {Signal<boolean>}
   */
  public readonly expanded: Signal<boolean> = computed(() => this.accordion.isOpen(this.value()));

  /**
   * Property state
   * @readonly
   *
   * @description
   * Open or closed state shared by the section's `data-state` hooks.
   *
   * @type {Signal<CwAccordionState>}
   */
  public readonly state: Signal<CwAccordionState> = computed<CwAccordionState>(() =>
    this.expanded() ? 'open' : 'closed',
  );
  // #endregion

  // #region Methods
  /**
   * Method toggle
   * @method toggle
   *
   * @description
   * Asks the parent accordion to open or close this section unless it is disabled.
   */
  public toggle(): void {
    if (!this.disabled()) this.accordion.toggle(this.value());
  }
  // #endregion
}
