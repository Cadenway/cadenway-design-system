import {
  Component,
  ElementRef,
  HostAttributeToken,
  booleanAttribute,
  computed,
  inject,
  input,
  type InputSignal,
  type InputSignalWithTransform,
  type Signal,
} from '@angular/core';
import { CwRipple } from '@cadenway/ui/core';

import type { CwPaginationSize } from '../pagination.types';

/**
 * Constant BASE
 *
 * @description
 * Literal button classes shared by current and other pages.
 *
 * @type {string}
 */
const BASE: string =
  'relative isolate inline-flex shrink-0 items-center justify-center overflow-hidden whitespace-nowrap text-sm tabular-nums transition-all motion-reduce:transition-none outline-hidden ' +
  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ' +
  'disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 ' +
  '[&_ng-icon]:pointer-events-none [&_ng-icon]:shrink-0 [&_ng-icon]:[--ng-icon__size:1rem]';

/**
 * Constant SIZES
 *
 * @description
 * Square dimensions and radius for each pagination size.
 *
 * @type {Record<CwPaginationSize, string>}
 */
const SIZES: Record<CwPaginationSize, string> = {
  default: 'size-8 rounded-lg',
  sm: 'size-7 rounded-md',
};

/**
 * Constant CURRENT
 *
 * @description
 * Visual classes of the current page.
 *
 * @type {string}
 */
const CURRENT: string = 'bg-selected font-semibold text-foreground';

/**
 * Constant REST
 *
 * @description
 * Visual and hover classes of other pages.
 *
 * @type {string}
 */
const REST: string = 'font-medium hover:bg-accent hover:text-accent-foreground';

/**
 * Class CwPaginationLink
 * @class CwPaginationLink
 *
 * @description
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
  // #region Properties
  /**
   * Property size
   * @readonly
   *
   * @description
   * Square height, 32 or 28 pixels.
   *
   * @type {InputSignal<CwPaginationSize>}
   */
  public readonly size: InputSignal<CwPaginationSize> = input<CwPaginationSize>('default');

  /**
   * Property current
   * @readonly
   *
   * @description
   * Whether the link represents the current page.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly current: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property disabled
   * @readonly
   *
   * @description
   * Disables activation when navigation is unavailable.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly disabled: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property element
   * @readonly
   *
   * @description
   * Native link or button host.
   *
   * @type {HTMLElement}
   */
  private readonly element: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /**
   * Property isButton
   * @readonly
   *
   * @description
   * Whether the host uses native button behavior.
   *
   * @type {boolean}
   */
  protected readonly isButton: boolean = this.element.tagName === 'BUTTON';

  /**
   * Property declaredType
   * @readonly
   *
   * @description
   * Type attribute supplied on the host, if any.
   *
   * @type {string | null}
   */
  private readonly declaredType: string | null = inject(new HostAttributeToken('type'), {
    optional: true,
  });

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Classes selected for size and current-page state.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(
    () => `${BASE} ${SIZES[this.size()]} ${this.current() ? CURRENT : REST}`,
  );
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Installs a capture guard for disabled anchor activation.
   */
  public constructor() {
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
  // #endregion

  // #region Methods
  /**
   * Method type
   * @method type
   *
   * @description
   * Uses the declared button type or defaults to button; anchors have no type.
   *
   * @returns {string | null} The button type, or null for an anchor.
   */
  protected type(): string | null {
    // A button without a type would submit its form by accident.
    return this.isButton ? (this.declaredType ?? 'button') : null;
  }
  // #endregion
}
