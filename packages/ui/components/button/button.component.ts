import {
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  HostAttributeToken,
  inject,
  input,
  type InputSignal,
  type InputSignalWithTransform,
  type Signal,
} from '@angular/core';
import { CwRipple } from '@cadenway/ui/core';
import { CwSpinner } from '@cadenway/ui/components/spinner';

import type { CwButtonSize, CwButtonVariant } from './button.types';

/**
 * Constant BASE
 *
 * @description
 * Shared button classes from the Button sheet, kept literal so Tailwind finds them in the package.
 * The icon size is passed to `ng-icon` through `--ng-icon__size`.
 *
 * @type {string}
 */
const BASE: string =
  'relative isolate inline-flex shrink-0 items-center justify-center overflow-hidden whitespace-nowrap font-medium transition-all outline-hidden ' +
  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ' +
  'disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 ' +
  'aria-busy:pointer-events-none aria-busy:cursor-progress ' +
  '[&_ng-icon]:pointer-events-none [&_ng-icon]:shrink-0 [&_ng-icon]:[--ng-icon__size:1rem] ' +
  '[&>[cwSpinner]+ng-icon]:hidden';

/**
 * Constant VARIANTS
 *
 * @description
 * Literal classes for each supported button appearance.
 *
 * @type {Record<CwButtonVariant, string>}
 */
const VARIANTS: Record<CwButtonVariant, string> = {
  default: 'bg-foreground text-background hover:bg-foreground/90',
  destructive:
    'bg-destructive text-destructive-foreground hover:bg-grenat-text dark:bg-grenat-soft dark:text-grenat-text dark:hover:bg-grenat-soft/70',
  outline: 'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-linear-to-b hover:from-hover hover:to-hover',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  link: 'text-primary underline-offset-4 hover:underline',
};

/**
 * Constant SIZES
 *
 * @description
 * Literal height, spacing and icon-size classes for each button size.
 *
 * @type {Record<CwButtonSize, string>}
 */
const SIZES: Record<CwButtonSize, string> = {
  xs: 'h-6 gap-1 rounded-md px-2 text-xs has-[>ng-icon]:px-1.5 [&_ng-icon]:[--ng-icon__size:0.875rem]',
  sm: 'h-7 gap-1.5 rounded-md px-2.5 text-sm has-[>ng-icon]:px-2',
  default: 'h-8 gap-1.5 rounded-lg px-3 text-sm has-[>ng-icon]:px-2.5',
  lg: 'h-9 gap-2 rounded-lg px-4 text-sm has-[>ng-icon]:px-3',
  'icon-xs': 'size-6 rounded-md text-sm [&_ng-icon]:[--ng-icon__size:0.875rem]',
  'icon-sm': 'size-7 rounded-md text-sm',
  icon: 'size-8 rounded-lg text-sm',
  'icon-lg': 'size-9 rounded-lg text-sm',
};

/**
 * Class CwButton
 * @class CwButton
 *
 * @description
 * Triggers an action: one `default` button (ink fill) per view, the others `outline`, `secondary` or
 * `ghost`; never a colored fill (Button sheet of the Design System artifact).
 *
 * Put it on a native `<button>` or `<a>`, never on a `div`. On `<button>` it sets `type="button"`
 * when no type is given. `loading` shows the shared spinner in place of the leading icon, sets
 * `aria-busy` and ignores clicks while keeping the focus. `disabled` on `<a>` sets `aria-disabled`
 * and removes it from the tab order. An icon-only button needs an `aria-label`. Every press draws the
 * ripple (`CwRipple`), except under reduced motion. Listen to the native `(click)`.
 */
@Component({
  selector: 'button[cwButton], a[cwButton]',
  imports: [CwSpinner],
  hostDirectives: [CwRipple],
  host: {
    '[class]': 'classes()',
    '[attr.type]': 'type()',
    '[attr.disabled]': 'isButton && disabled() ? "" : null',
    '[attr.aria-disabled]': '!isButton && disabled() ? "true" : null',
    '[attr.tabindex]': '!isButton && disabled() ? -1 : null',
    '[attr.aria-busy]': 'loading() ? "true" : null',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
  },
  templateUrl: './button.component.html',
})
export class CwButton {
  // #region Properties
  /**
   * Property variant
   * @readonly
   *
   * @description
   * Input selecting the button's appearance.
   *
   * @type {InputSignal<CwButtonVariant>}
   * @default 'default'
   */
  public readonly variant: InputSignal<CwButtonVariant> = input<CwButtonVariant>('default');

  /**
   * Property size
   * @readonly
   *
   * @description
   * Input selecting the button's height, padding, radius and icon size.
   *
   * @type {InputSignal<CwButtonSize>}
   * @default 'default'
   */
  public readonly size: InputSignal<CwButtonSize> = input<CwButtonSize>('default');

  /**
   * Property loading
   * @readonly
   *
   * @description
   * Input that shows the spinner, sets `aria-busy` and ignores clicks while retaining focus.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @default false
   */
  public readonly loading: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property disabled
   * @readonly
   *
   * @description
   * Input that disables the native button, or applies `aria-disabled` to a link.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @default false
   */
  public readonly disabled: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property element
   * @readonly
   *
   * @description
   * Native host used to distinguish buttons from links and intercept clicks.
   *
   * @type {HTMLElement}
   */
  private readonly element: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /**
   * Property isButton
   * @readonly
   *
   * @description
   * Whether the host is a native button rather than a link.
   *
   * @type {boolean}
   */
  protected readonly isButton: boolean = this.element.tagName === 'BUTTON';

  /**
   * Property declaredType
   * @readonly
   *
   * @description
   * Native type attribute supplied by the consumer, or null when it is absent.
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
   * Computed classes combining the shared, selected variant and selected size styles.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(
    () => `${BASE} ${VARIANTS[this.variant()]} ${SIZES[this.size()]}`,
  );

  /**
   * Property spinnerSize
   * @readonly
   *
   * @description
   * Spinner size matched to extra-small buttons; other button sizes use the default spinner.
   *
   * @type {Signal<'sm' | 'default'>}
   */
  protected readonly spinnerSize: Signal<'sm' | 'default'> = computed(() =>
    this.size() === 'xs' || this.size() === 'icon-xs' ? 'sm' : 'default',
  );
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Installs the capture-phase click guard before consumer click listeners run.
   */
  public constructor() {
    // Capture phase: the guard runs before the consumer's own (click) listener on the same element.
    this.element.addEventListener(
      'click',
      (event) => {
        this.guard(event);
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
   * Uses the declared button type or defaults to `button` to prevent accidental form submission.
   *
   * @returns {string | null} Button type, or null for a link host.
   */
  protected type(): string | null {
    // A button without a type would submit its form by accident.
    return this.isButton ? (this.declaredType ?? 'button') : null;
  }

  /**
   * Method guard
   * @method guard
   *
   * @description
   * Suppresses the click and subsequent listeners while loading or while a link is disabled.
   *
   * @param {Event} event - Click event intercepted in the capture phase.
   */
  private guard(event: Event): void {
    if (this.loading() || (!this.isButton && this.disabled())) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
  // #endregion
}
