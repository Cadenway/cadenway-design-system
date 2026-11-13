import {
  Component,
  ElementRef,
  HostAttributeToken,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import { CwRipple } from '@cadenway/ui/core';

import type { CwPaginationSize } from '../pagination.types';

/* Literal class strings (Pagination sheet and preview of the Design System artifact). The current
   page keeps its veil on hover ("survol sans effet"): only the other pages carry the hover veil. */
const BASE =
  'relative isolate inline-flex shrink-0 items-center justify-center overflow-hidden whitespace-nowrap text-sm tabular-nums transition-all motion-reduce:transition-none outline-hidden ' +
  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ' +
  'disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 ' +
  '[&_ng-icon]:pointer-events-none [&_ng-icon]:shrink-0 [&_ng-icon]:[--ng-icon__size:1rem]';

const SIZES: Record<CwPaginationSize, string> = {
  default: 'size-8 rounded-lg',
  sm: 'size-7 rounded-md',
};

const CURRENT = 'bg-selected font-semibold text-foreground';
const REST = 'font-medium hover:bg-accent hover:text-accent-foreground';

/**
 * A square page button of a pagination: a page number, or the icon of the first, previous, next
 * or last page (Pagination sheet of the Design System artifact, anatomy 2 and 4).
 *
 * `cw-pagination` draws it on `<button>`; on `<a>` (`routerLink` with the page in the query) it
 * builds a routed pagination by hand. `current` marks the page shown (`aria-current="page"`,
 * `bg-selected font-semibold`, no hover effect). `disabled` is native on `<button>`; on `<a>` it
 * sets `aria-disabled`, leaves the tab order and swallows clicks before the consumer's own
 * `(click)`. Name an icon-only link with `aria-label` (« Page suivante »), a number with « Page 6 ».
 * Every press draws the ripple (`CwRipple`), except under reduced motion.
 */
@Component({
  // A component on a native element (attribute selector), as its sheet requires: the element keeps
  // its native role, focus and activation keys. The lint rule only knows element selectors.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'a[cwPaginationLink], button[cwPaginationLink]',
  hostDirectives: [CwRipple],
  host: {
    '[class]': 'classes()',
    '[attr.type]': 'type()',
    '[attr.aria-current]': 'current() ? "page" : null',
    '[attr.disabled]': 'isButton && disabled() ? "" : null',
    '[attr.aria-disabled]': '!isButton && disabled() ? "true" : null',
    '[attr.tabindex]': '!isButton && disabled() ? -1 : null',
    '[attr.data-size]': 'size()',
  },
  templateUrl: './pagination-link.component.html',
})
export class CwPaginationLink {
  /** Height of the square: 32 px or 28 px. */
  readonly size = input<CwPaginationSize>('default');
  /** Marks the page shown. */
  readonly current = input(false, { transform: booleanAttribute });
  /** Disables the link: out of bounds (previous on the first page, next on the last). */
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected readonly isButton = this.element.tagName === 'BUTTON';
  private readonly declaredType = inject(new HostAttributeToken('type'), { optional: true });

  protected readonly classes = computed(
    () => `${BASE} ${SIZES[this.size()]} ${this.current() ? CURRENT : REST}`,
  );

  constructor() {
    // Capture phase: the guard runs before the consumer's own (click) listener on the same element.
    this.element.addEventListener(
      'click',
      (event) => {
        if (!this.isButton && this.disabled()) {
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
