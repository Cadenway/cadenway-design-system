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
} from '@angular/core';
import { ɵnavigateList } from '@cadenway/ui/core';

import { ACCORDION_TRIGGER } from './accordion-trigger.token';
import type { CwAccordionType, CwAccordionValue, CwAccordionVariant } from './accordion.types';

/* Accordion sheet, "Variantes": `card` frames the stack, its triggers go full width. */
const VARIANTS: Record<CwAccordionVariant, string> = {
  default: 'flex flex-col',
  card: 'flex flex-col overflow-hidden rounded-lg border',
};

/** The open values, whichever form the model holds. */
function openValues(value: CwAccordionValue): readonly string[] {
  if (value === null) return [];
  return typeof value === 'string' ? [value] : value;
}

/**
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
  /** One open section at a time, or independent sections. */
  readonly type = input<CwAccordionType>('single');
  /** In `single`, whether the open section closes on its trigger; without it one stays open. */
  readonly collapsible = input(true, { transform: booleanAttribute });
  /** The open section(s) by value; `[(value)]`. */
  readonly value = model<CwAccordionValue>(null);
  /** Rules between sections, or one framed card. */
  readonly variant = input<CwAccordionVariant>('default');

  private readonly allTriggers = contentChildren(ACCORDION_TRIGGER, { descendants: true });
  // A nested accordion's triggers belong to it, not to this one's arrow keys.
  private readonly triggers = computed(() =>
    this.allTriggers().filter((trigger) => trigger.accordion === this),
  );
  private readonly keyManager = new FocusKeyManager(this.triggers, inject(Injector))
    .withVerticalOrientation()
    .withHomeAndEnd();

  protected readonly classes = computed(() => VARIANTS[this.variant()]);

  /** Whether the section of this value is open. */
  isOpen(value: string): boolean {
    return openValues(this.value()).includes(value);
  }

  /** Opens or closes the section of this value, following `type` and `collapsible`. */
  toggle(value: string): void {
    const open = openValues(this.value());
    const isOpen = open.includes(value);
    if (this.type() === 'multiple') {
      this.value.set(isOpen ? open.filter((each) => each !== value) : [...open, value]);
    } else if (!isOpen) {
      this.value.set(value);
    } else if (this.collapsible()) {
      this.value.set(null);
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    const trigger = this.triggers().find((each) => each.element === event.target);
    if (!trigger || !['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    this.keyManager.updateActiveItem(trigger);
    if (ɵnavigateList(this.keyManager, event, 'vertical')) event.preventDefault();
  }
}
