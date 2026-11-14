import { FocusKeyManager } from '@angular/cdk/a11y';
import {
  Component,
  Injector,
  booleanAttribute,
  computed,
  contentChildren,
  inject,
  input,
  model,
  type InputSignal,
  type InputSignalWithTransform,
  type ModelSignal,
  type Signal,
} from '@angular/core';
import { ɵnavigateList } from '@cadenway/ui/core';

import { ACCORDION_TRIGGER } from './accordion-trigger.token';
import type { CwAccordionTrigger } from './accordion-trigger/accordion-trigger.component';
import type { CwAccordionType, CwAccordionValue, CwAccordionVariant } from './accordion.types';

/**
 * Constant VARIANTS
 *
 * @description
 * Layout classes for an unframed stack or a bordered accordion card.
 *
 * @type {Record<CwAccordionVariant, string>}
 */
const VARIANTS: Record<CwAccordionVariant, string> = {
  default: 'flex flex-col',
  card: 'flex flex-col overflow-hidden rounded-lg border',
};

/**
 * Function openValues
 *
 * @description
 * Normalizes a single, multiple or empty accordion model into a list of open values.
 *
 * @param {CwAccordionValue} value - Current model value.
 *
 * @returns {readonly string[]} Open section values, or an empty list when none are open.
 */
function openValues(value: CwAccordionValue): readonly string[] {
  if (value === null) return [];
  return typeof value === 'string' ? [value] : value;
}

/**
 * Class CwAccordion
 * @class CwAccordion
 *
 * @description
 * Stacked sections that fold, to lighten a dense panel: the secondary sections of the task detail,
 * a help FAQ, advanced settings (Accordion sheet of the Design System artifact).
 *
 * Holds `cw-accordion-item` sections, each with a `button[cwAccordionTrigger]` and a
 * `cw-accordion-content`. `type="single"` (default) keeps one section open, and `collapsible`
 * (default true) lets it close too; `type="multiple"` opens each one on its own. `[(value)]` holds
 * the open section(s) by their `value`: a string or `null` in `single`, a list in `multiple`. The
 * triggers are one tab stop each; ↓ ↑ move between them, Home and End jump to the first and last,
 * skipping disabled sections (CDK `FocusKeyManager`).
 */
@Component({
  selector: 'cw-accordion',
  host: {
    '[class]': 'classes()',
    'data-orientation': 'vertical',
    '[attr.data-variant]': 'variant()',
    '(keydown)': 'onKeydown($event)',
  },
  templateUrl: './accordion.component.html',
})
export class CwAccordion {
  // #region Properties
  /**
   * Property type
   * @readonly
   *
   * @description
   * Input selecting one open section at a time or independently opened sections.
   *
   * @type {InputSignal<CwAccordionType>}
   * @default 'single'
   */
  public readonly type: InputSignal<CwAccordionType> = input<CwAccordionType>('single');

  /**
   * Property collapsible
   * @readonly
   *
   * @description
   * Input allowing the open section in single mode to be closed by its trigger.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @default true
   */
  public readonly collapsible: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  /**
   * Property value
   * @readonly
   *
   * @description
   * Two-way model of open section values, in single or multiple form.
   *
   * @type {ModelSignal<CwAccordionValue>}
   * @default null
   */
  public readonly value: ModelSignal<CwAccordionValue> = model<CwAccordionValue>(null);

  /**
   * Property variant
   * @readonly
   *
   * @description
   * Input selecting separated sections or a single framed card.
   *
   * @type {InputSignal<CwAccordionVariant>}
   * @default 'default'
   */
  public readonly variant: InputSignal<CwAccordionVariant> = input<CwAccordionVariant>('default');

  /**
   * Property allTriggers
   * @readonly
   *
   * @description
   * Descendant trigger query, including triggers belonging to nested accordions.
   *
   * @type {Signal<readonly CwAccordionTrigger[]>}
   */
  private readonly allTriggers: Signal<readonly CwAccordionTrigger[]> = contentChildren(
    ACCORDION_TRIGGER,
    { descendants: true },
  );

  /**
   * Property triggers
   * @readonly
   *
   * @description
   * Triggers owned by this accordion, excluding nested accordions from its keyboard navigation.
   *
   * @type {Signal<CwAccordionTrigger[]>}
   */
  private readonly triggers: Signal<CwAccordionTrigger[]> = computed(() =>
    this.allTriggers().filter((trigger) => trigger.accordion === this),
  );

  /**
   * Property keyManager
   * @readonly
   *
   * @description
   * CDK focus manager for vertical arrows and Home and End on this accordion's triggers.
   *
   * @type {FocusKeyManager<CwAccordionTrigger>}
   */
  private readonly keyManager: FocusKeyManager<CwAccordionTrigger> =
    new FocusKeyManager<CwAccordionTrigger>(this.triggers, inject(Injector))
      .withVerticalOrientation()
      .withHomeAndEnd();

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Computed layout classes for the selected variant.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(() => VARIANTS[this.variant()]);
  // #endregion

  // #region Methods
  /**
   * Method isOpen
   * @method isOpen
   *
   * @description
   * Checks whether a section value is currently present in the open model.
   *
   * @param {string} value - Section value to check.
   *
   * @returns {boolean} Whether that section is open.
   */
  public isOpen(value: string): boolean {
    return openValues(this.value()).includes(value);
  }

  /**
   * Method toggle
   * @method toggle
   *
   * @description
   * Opens or closes the section according to single or multiple mode and the collapsible setting.
   *
   * @param {string} value - Section value to toggle.
   */
  public toggle(value: string): void {
    const open: readonly string[] = openValues(this.value());
    const isOpen: boolean = open.includes(value);
    if (this.type() === 'multiple') {
      this.value.set(isOpen ? open.filter((each) => each !== value) : [...open, value]);
    } else if (!isOpen) {
      this.value.set(value);
    } else if (this.collapsible()) {
      this.value.set(null);
    }
  }

  /**
   * Method onKeydown
   * @method onKeydown
   *
   * @description
   * Moves focus among this accordion's triggers for vertical arrows, Home and End.
   *
   * @param {KeyboardEvent} event - Key event originating from a trigger.
   */
  protected onKeydown(event: KeyboardEvent): void {
    const trigger: CwAccordionTrigger | undefined = this.triggers().find(
      (each) => each.element === event.target,
    );
    if (!trigger || !['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    this.keyManager.updateActiveItem(trigger);
    if (ɵnavigateList(this.keyManager, event, 'vertical')) event.preventDefault();
  }
  // #endregion
}
