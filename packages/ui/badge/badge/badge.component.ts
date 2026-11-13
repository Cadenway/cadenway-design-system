import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostAttributeToken,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import { ɵFOCUS } from '@cadenway/ui/core';

import { BADGE_BASE, BADGE_SIZES, BADGE_VARIANTS } from '../badge.constants';
import type { CwBadgeSize, CwBadgeVariant } from '../badge.types';

/**
 * A short label: a tag, a counter, a « Nouveau » mention, a status or a priority (Badge sheet of the
 * Design System artifact). Not interactive by default.
 *
 * Put it on a `<span>`; on an `<a>` or a `<button>` when it leads somewhere or acts, and only then
 * does it take the hover veil and the keyboard focus ring. On `<button>` it sets `type="button"` when
 * no type is given. `disabled` is native on `<button>`; on `<a>` it sets `aria-disabled`, removes the
 * link from the tab order and swallows clicks. A counter doubles its number with a visually hidden
 * text (« 12 commentaires »). Listen to the native `(click)`. No animation (sheet, "Mouvement").
 */
@Component({
  // A component on a native element (attribute selector), as its sheet requires: the element keeps
  // its native role, focus and form behavior. The lint rule only knows element selectors.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'span[cwBadge], a[cwBadge], button[cwBadge]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[attr.type]': 'type()',
    '[attr.disabled]': 'isButton && disabled() ? "" : null',
    '[attr.aria-disabled]': 'isLink && disabled() ? "true" : null',
    '[attr.tabindex]': 'isLink && disabled() ? -1 : null',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
  },
  templateUrl: './badge.component.html',
})
export class CwBadge {
  /** Look of the badge. */
  readonly variant = input<CwBadgeVariant>('default');
  /** Height: 22 px (`default`) or 18 px (`sm`). */
  readonly size = input<CwBadgeSize>('default');
  /** Disables a clickable badge: native on `<button>`, `aria-disabled` on `<a>`. */
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected readonly isButton = this.element.tagName === 'BUTTON';
  protected readonly isLink = this.element.tagName === 'A';
  private readonly declaredType = inject(new HostAttributeToken('type'), { optional: true });

  protected readonly classes = computed(() => {
    const focus = this.isButton || this.isLink ? ` ${ɵFOCUS}` : '';
    return `${BADGE_BASE} ${BADGE_VARIANTS[this.variant()]} ${BADGE_SIZES[this.size()]}${focus}`;
  });

  constructor() {
    // Capture phase: the guard runs before the consumer's own (click) listener on the same element.
    this.element.addEventListener(
      'click',
      (event) => {
        if (this.isLink && this.disabled()) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      },
      { capture: true },
    );
  }

  protected type(): string | null {
    // A button without a type would submit its form by accident.
    return this.isButton ? (this.declaredType ?? 'button') : null;
  }
}
